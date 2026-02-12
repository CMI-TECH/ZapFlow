import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * Webhook para receber mensagens do N8N e criar/atualizar leads no CRM
 * Deve ser chamado pelo N8N após processar a mensagem
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      instanceToken,
      phoneNumber,
      senderName,
      message,
      fromMe
    } = body;

    console.log('[CRM-WEBHOOK] Recebido:', { instanceToken, phoneNumber, senderName, fromMe });

    if (!instanceToken || !phoneNumber) {
      return NextResponse.json(
        { error: 'instanceToken e phoneNumber são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar instância do WhatsApp
    const whatsappInstance = await prisma.whatsAppInstance.findFirst({
      where: { instanceToken },
      include: { user: true }
    });

    if (!whatsappInstance) {
      return NextResponse.json(
        { error: 'Instância não encontrada' },
        { status: 404 }
      );
    }

    // Limpar número de telefone (remover @s.whatsapp.net se vier)
    const cleanPhone = phoneNumber.replace('@s.whatsapp.net', '');

    // Buscar ou criar lead
    let lead = await prisma.lead.findFirst({
      where: {
        userId: whatsappInstance.userId,
        phone: cleanPhone
      }
    });

    if (!lead) {
      // Criar novo lead
      lead = await prisma.lead.create({
        data: {
          userId: whatsappInstance.userId,
          phone: cleanPhone,
          name: senderName || cleanPhone,
          stage: 'NEW',
          lastMessage: message,
          lastMessageAt: new Date()
        }
      });
      console.log('[CRM-WEBHOOK] Novo lead criado:', lead.id);
    } else {
      // Atualizar último contato
      lead = await prisma.lead.update({
        where: { id: lead.id },
        data: {
          lastMessage: message,
          lastMessageAt: new Date()
        }
      });
      console.log('[CRM-WEBHOOK] Lead atualizado:', lead.id);
    }

    // Salvar mensagem no histórico
    if (message) {
      await prisma.leadMessage.create({
        data: {
          leadId: lead.id,
          content: message,
          fromLead: !fromMe // Se não é do bot, é do lead
        }
      });
    }

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      created: lead.createdAt === lead.updatedAt
    });

  } catch (error) {
    console.error('[CRM-WEBHOOK] Erro:', error);
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: message },
      { status: 500 }
    );
  }
}
