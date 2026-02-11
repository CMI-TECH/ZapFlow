import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { disconnectInstance, deleteInstance } from '@/lib/uazapi';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    console.log('[DISCONNECT] Iniciando desconexão para:', session.user.email);
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { whatsappInstance: true },
    });

    if (!user || !user.whatsappInstance) {
      console.log('[DISCONNECT] Instância não encontrada');
      return NextResponse.json({ error: 'Instância não encontrada' }, { status: 404 });
    }

    const instance = user.whatsappInstance;
    console.log('[DISCONNECT] Token da instância:', instance.instanceToken.substring(0, 8) + '...');

    // Desconectar na Uazapi
    console.log('[DISCONNECT] Chamando Uazapi...');
    const disconnected = await disconnectInstance(instance.instanceToken);
    console.log('[DISCONNECT] Resultado Uazapi:', disconnected);

    // Atualizar status no banco
    console.log('[DISCONNECT] Atualizando banco de dados...');
    await prisma.whatsAppInstance.update({
      where: { id: instance.id },
      data: {
        status: 'disconnected',
        phoneNumber: null,
      },
    });

    console.log('[DISCONNECT] Desconexão concluída com sucesso');
    return NextResponse.json({
      success: true,
      message: 'WhatsApp desconectado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao desconectar:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE para remover completamente a instância
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { whatsappInstance: true },
    });

    if (!user || !user.whatsappInstance) {
      return NextResponse.json({ error: 'Instância não encontrada' }, { status: 404 });
    }

    const instance = user.whatsappInstance;

    // Deletar na Uazapi
    await deleteInstance(instance.instanceToken);

    // Deletar do banco
    await prisma.whatsAppInstance.delete({
      where: { id: instance.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Instância removida com sucesso',
    });
  } catch (error) {
    console.error('Erro ao remover instância:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
