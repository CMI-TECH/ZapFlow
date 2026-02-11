import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createInstance, setWebhook } from '@/lib/uazapi';

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

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Verificar se já tem instância
    if (user.whatsappInstance) {
      return NextResponse.json({
        success: true,
        instanceName: user.whatsappInstance.instanceName,
        status: user.whatsappInstance.status,
        alreadyExists: true,
      });
    }

    // Criar nome único para instância
    const instanceName = `robo_${user.id}_${Date.now()}`;

    // Criar instância na Uazapi
    const result = await createInstance(instanceName);

    if (!result.success || !result.instanceToken) {
      return NextResponse.json({ error: result.error || 'Falha ao criar instância' }, { status: 500 });
    }

    // Salvar no banco de dados
    const whatsappInstance = await prisma.whatsAppInstance.create({
      data: {
        userId: user.id,
        instanceName: result.instanceName || instanceName,
        instanceToken: result.instanceToken,
        status: 'disconnected',
        webhookUrl: process.env.N8N_WEBHOOK_URL || '',
        aiEnabled: false,
      },
    });

    // Configurar webhook
    await setWebhook(result.instanceToken);

    return NextResponse.json({
      success: true,
      instanceName: whatsappInstance.instanceName,
      status: whatsappInstance.status,
    });
  } catch (error) {
    console.error('Erro ao criar instância:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
