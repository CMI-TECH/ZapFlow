import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

const DEFAULT_STAGES = [
    { name: 'Novo', color: '#06b6d4', order: 0 },
    { name: 'Contato', color: '#3b82f6', order: 1 },
    { name: 'Qualificado', color: '#10b981', order: 2 },
    { name: 'Proposta', color: '#f59e0b', order: 3 },
    { name: 'Negociação', color: '#d946ef', order: 4 },
    { name: 'Ganho', color: '#22c55e', order: 5 },
    { name: 'Perdido', color: '#f43f5e', order: 6 },
];

/**
 * GET: Listar pipelines do usuário (com stages)
 */
export async function GET(request: NextRequest) {
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

        let pipelines = await prisma.pipeline.findMany({
            where: { userId: user.id },
            include: {
                stages: { orderBy: { order: 'asc' } },
                _count: { select: { leads: true } }
            },
            orderBy: { createdAt: 'asc' }
        });

        // Se não tem nenhum pipeline, cria o default
        if (pipelines.length === 0) {
            const defaultPipeline = await prisma.pipeline.create({
                data: {
                    name: 'Vendas',
                    userId: user.id,
                    isDefault: true,
                    stages: {
                        create: DEFAULT_STAGES
                    }
                },
                include: {
                    stages: { orderBy: { order: 'asc' } },
                    _count: { select: { leads: true } }
                }
            });

            // Migrar leads existentes para o pipeline default
            await prisma.lead.updateMany({
                where: { userId: user.id, pipelineId: null },
                data: { pipelineId: defaultPipeline.id }
            });

            pipelines = [defaultPipeline];
        }

        return NextResponse.json({ pipelines });
    } catch (error) {
        console.error('[PIPELINES] Erro:', error);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}

/**
 * POST: Criar novo pipeline com stages
 */
export async function POST(request: NextRequest) {
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

        const body = await request.json();
        const { name, stages } = body;

        if (!name) {
            return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
        }

        const stagesToCreate = stages && stages.length > 0
            ? stages.map((s: any, i: number) => ({
                name: s.name,
                color: s.color || '#10b981',
                order: i
            }))
            : DEFAULT_STAGES;

        const pipeline = await prisma.pipeline.create({
            data: {
                name,
                userId: user.id,
                stages: { create: stagesToCreate }
            },
            include: {
                stages: { orderBy: { order: 'asc' } },
                _count: { select: { leads: true } }
            }
        });

        return NextResponse.json({ pipeline }, { status: 201 });
    } catch (error) {
        console.error('[PIPELINES] Erro ao criar:', error);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}
