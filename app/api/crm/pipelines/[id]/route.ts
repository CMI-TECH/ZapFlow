import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * PATCH: Atualizar pipeline (nome e/ou stages)
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }

        // Verificar que o pipeline pertence ao usuário
        const existing = await prisma.pipeline.findFirst({
            where: { id: params.id, userId: user.id }
        });

        if (!existing) {
            return NextResponse.json({ error: 'Pipeline não encontrado' }, { status: 404 });
        }

        const body = await request.json();
        const { name, stages } = body;

        // Atualizar nome
        if (name) {
            await prisma.pipeline.update({
                where: { id: params.id },
                data: { name }
            });
        }

        // Recriar stages se fornecidas
        if (stages && Array.isArray(stages)) {
            // Deletar stages existentes
            await prisma.pipelineStage.deleteMany({
                where: { pipelineId: params.id }
            });

            // Criar novas stages
            await prisma.pipelineStage.createMany({
                data: stages.map((s: any, i: number) => ({
                    name: s.name,
                    color: s.color || '#10b981',
                    order: i,
                    pipelineId: params.id
                }))
            });
        }

        const pipeline = await prisma.pipeline.findUnique({
            where: { id: params.id },
            include: {
                stages: { orderBy: { order: 'asc' } },
                _count: { select: { leads: true } }
            }
        });

        return NextResponse.json({ pipeline });
    } catch (error) {
        console.error('[PIPELINES] Erro ao atualizar:', error);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}

/**
 * DELETE: Remover pipeline (move leads para o default)
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }

        const pipeline = await prisma.pipeline.findFirst({
            where: { id: params.id, userId: user.id }
        });

        if (!pipeline) {
            return NextResponse.json({ error: 'Pipeline não encontrado' }, { status: 404 });
        }

        if (pipeline.isDefault) {
            return NextResponse.json({ error: 'Não é possível excluir o pipeline padrão' }, { status: 400 });
        }

        // Buscar pipeline default para mover leads
        const defaultPipeline = await prisma.pipeline.findFirst({
            where: { userId: user.id, isDefault: true }
        });

        if (defaultPipeline) {
            await prisma.lead.updateMany({
                where: { pipelineId: params.id },
                data: { pipelineId: defaultPipeline.id, stage: 'Novo' }
            });
        }

        await prisma.pipeline.delete({ where: { id: params.id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[PIPELINES] Erro ao excluir:', error);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}
