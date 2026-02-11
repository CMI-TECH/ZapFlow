import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { connectInstance, createInstance, setWebhook } from '@/lib/uazapi';

async function createNewInstance(userId: string) {
  const instanceName = `robo_${userId}_${Date.now()}`;
  const result = await createInstance(instanceName);
  
  if (!result.success || !result.instanceToken) {
    return { success: false, error: result.error || 'Falha ao criar instância' };
  }

  const instance = await prisma.whatsAppInstance.create({
    data: {
      userId: userId,
      instanceName: result.instanceName || instanceName,
      instanceToken: result.instanceToken,
      status: 'disconnected',
      webhookUrl: process.env.N8N_WEBHOOK_URL || '',
    },
  });

  await setWebhook(result.instanceToken);
  
  return { success: true, instance };
}

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

    let instance = user.whatsappInstance;

    // Se não tiver instância, criar uma nova
    if (!instance) {
      const result = await createNewInstance(user.id);
      if (!result.success || !result.instance) {
        return NextResponse.json({ error: result.error || 'Falha ao criar instância' }, { status: 500 });
      }
      instance = result.instance;
    }

    // Conectar e obter QR Code
    let connectResult = await connectInstance(instance.instanceToken);
    
    // Se token inválido, deletar instância antiga e criar nova
    if (!connectResult.success && connectResult.error === 'TOKEN_INVALID') {
      console.log('[QRCODE] Token inválido, recriando instância...');
      
      // Deletar instância antiga do banco
      await prisma.whatsAppInstance.delete({
        where: { id: instance.id },
      });
      
      // Criar nova instância
      const result = await createNewInstance(user.id);
      if (!result.success || !result.instance) {
        return NextResponse.json({ error: result.error || 'Falha ao recriar instância' }, { status: 500 });
      }
      instance = result.instance;
      
      // Tentar conectar novamente
      connectResult = await connectInstance(instance.instanceToken);
    }
    
    if (!connectResult.success) {
      return NextResponse.json({ error: connectResult.error || 'Falha ao obter QR Code' }, { status: 500 });
    }

    // Se já está conectado
    if (connectResult.connected) {
      await prisma.whatsAppInstance.update({
        where: { id: instance.id },
        data: { status: 'connected' },
      });

      return NextResponse.json({
        success: true,
        connected: true,
        instanceName: instance.instanceName,
      });
    }

    // Atualizar status para conectando
    await prisma.whatsAppInstance.update({
      where: { id: instance.id },
      data: { status: 'connecting' },
    });

    console.log('[QRCODE] Retornando QR Code, tamanho:', connectResult.qrcode?.length || 0);

    return NextResponse.json({
      success: true,
      qrcode: connectResult.qrcode,
      status: 'connecting',
      instanceName: instance.instanceName,
    });
  } catch (error) {
    console.error('Erro ao obter QR Code:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
