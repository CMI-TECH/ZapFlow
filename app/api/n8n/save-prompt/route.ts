import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Salvar prompt do agente de IA
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { agentName, aiPrompt, aiEnabled } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { whatsappInstance: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    if (!user.whatsappInstance) {
      return NextResponse.json({ 
        error: 'Conecte seu WhatsApp primeiro' 
      }, { status: 400 });
    }

    // Atualizar configurações do agente
    const updated = await prisma.whatsAppInstance.update({
      where: { id: user.whatsappInstance.id },
      data: {
        agentName: agentName !== undefined ? agentName : user.whatsappInstance.agentName,
        aiPrompt: aiPrompt !== undefined ? aiPrompt : user.whatsappInstance.aiPrompt,
        aiEnabled: aiEnabled !== undefined ? aiEnabled : user.whatsappInstance.aiEnabled,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Configurações salvas com sucesso',
      data: {
        agentName: updated.agentName,
        aiPrompt: updated.aiPrompt,
        aiEnabled: updated.aiEnabled,
      }
    });
  } catch (error) {
    console.error('Erro ao salvar prompt:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// Buscar configurações atuais
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { whatsappInstance: true },
    });

    if (!user?.whatsappInstance) {
      return NextResponse.json({ 
        success: true,
        hasInstance: false,
      });
    }

    return NextResponse.json({
      success: true,
      hasInstance: true,
      data: {
        agentName: user.whatsappInstance.agentName,
        aiPrompt: user.whatsappInstance.aiPrompt,
        aiEnabled: user.whatsappInstance.aiEnabled,
      }
    });
  } catch (error) {
    console.error('Erro ao buscar prompt:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
