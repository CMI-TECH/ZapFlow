import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getInstanceStatus, setWebhook, getWebhook } from '@/lib/uazapi';

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

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    if (!user.whatsappInstance) {
      return NextResponse.json({
        success: true,
        hasInstance: false,
        status: 'no_instance',
      });
    }

    const instance = user.whatsappInstance;
    const statusResult = await getInstanceStatus(instance.instanceToken);
    
    // Atualizar status no banco
    const newStatus = statusResult.connected ? 'connected' : 'disconnected';
    
    // Se acabou de conectar, configurar webhook
    if (statusResult.connected && instance.status !== 'connected') {
      console.log('[STATUS] Instância conectada! Configurando webhook...');
      const webhookConfigured = await setWebhook(instance.instanceToken);
      console.log('[STATUS] Webhook configurado:', webhookConfigured);
    }
    
    // Verificar status do webhook
    const webhookStatus = await getWebhook(instance.instanceToken);
    
    if (instance.status !== newStatus) {
      await prisma.whatsAppInstance.update({
        where: { id: instance.id },
        data: { 
          status: newStatus,
          phoneNumber: statusResult.phoneNumber || instance.phoneNumber,
        },
      });
    }

    return NextResponse.json({
      success: true,
      hasInstance: true,
      instanceName: instance.instanceName,
      status: newStatus,
      connected: statusResult.connected,
      phoneNumber: statusResult.phoneNumber || instance.phoneNumber,
      qrcode: statusResult.qrcode || null,
      webhook: {
        configured: webhookStatus.configured,
        enabled: webhookStatus.enabled,
        url: webhookStatus.url,
      },
    });
  } catch (error) {
    console.error('Erro ao verificar status:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
