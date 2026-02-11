import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { setWebhook, getWebhook } from '@/lib/uazapi';

// GET - Verificar status do webhook
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
      return NextResponse.json({ error: 'Instância não encontrada' }, { status: 404 });
    }

    const webhookStatus = await getWebhook(user.whatsappInstance.instanceToken);
    
    return NextResponse.json({
      success: true,
      ...webhookStatus,
    });
  } catch (error) {
    console.error('Erro ao verificar webhook:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Configurar webhook
export async function POST() {
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
      return NextResponse.json({ error: 'Instância não encontrada' }, { status: 404 });
    }

    const success = await setWebhook(user.whatsappInstance.instanceToken);
    
    if (success) {
      const webhookStatus = await getWebhook(user.whatsappInstance.instanceToken);
      return NextResponse.json({
        success: true,
        message: 'Webhook configurado com sucesso',
        ...webhookStatus,
      });
    }
    
    return NextResponse.json({ 
      success: false, 
      error: 'Falha ao configurar webhook' 
    }, { status: 500 });
  } catch (error) {
    console.error('Erro ao configurar webhook:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
