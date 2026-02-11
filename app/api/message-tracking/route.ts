import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * Endpoint para rastrear uso de mensagens
 * Chamado pelo N8N toda vez que uma mensagem é processada
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { instanceToken, phoneNumber, senderName, message, fromMe } = body;

    // CORREÇÃO: N8N pode enviar com "=" no início se a sintaxe estiver errada
    if (instanceToken && typeof instanceToken === 'string' && instanceToken.startsWith('=')) {
      instanceToken = instanceToken.substring(1);
      console.log('[MESSAGE-TRACKING] Removido "=" do instanceToken');
    }
    if (phoneNumber && typeof phoneNumber === 'string' && phoneNumber.startsWith('=')) {
      phoneNumber = phoneNumber.substring(1);
      console.log('[MESSAGE-TRACKING] Removido "=" do phoneNumber');
    }

    // LOG PARA DEBUG
    console.log('[MESSAGE-TRACKING] Recebido:', { instanceToken, phoneNumber });

    if (!instanceToken && !phoneNumber) {
      return NextResponse.json(
        { error: 'instanceToken ou phoneNumber é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar instância do WhatsApp
    const whatsappInstance = await prisma.whatsAppInstance.findFirst({
      where: instanceToken
        ? { instanceToken }
        : { phoneNumber },
      include: {
        user: {
          include: {
            subscription: {
              include: {
                plan: true
              }
            }
          }
        }
      }
    });

    if (!whatsappInstance) {
      // LOG: Mostrar todas as instâncias para debug
      const allInstances = await prisma.whatsAppInstance.findMany({
        select: { id: true, instanceToken: true, phoneNumber: true, instanceName: true, status: true }
      });
      console.log('[MESSAGE-TRACKING] Instância não encontrada!');
      console.log('[MESSAGE-TRACKING] Buscando por:', { instanceToken, phoneNumber });
      console.log('[MESSAGE-TRACKING] Instâncias no banco:', JSON.stringify(allInstances, null, 2));
      
      return NextResponse.json(
        { error: 'Instância não encontrada' },
        { status: 404 }
      );
    }

    const subscription = whatsappInstance.user.subscription;

    if (!subscription) {
      return NextResponse.json(
        { error: 'Usuário sem assinatura ativa' },
        { status: 403 }
      );
    }

    // Verificar se tem limite de mensagens (null = ilimitado)
    const messageLimit = subscription.messageLimit;
    const messagesUsed = subscription.messagesUsed;

    // Se tem limite e já atingiu, bloquear
    if (messageLimit !== null && messagesUsed >= messageLimit) {
      return NextResponse.json({
        allowed: false,
        messagesUsed,
        messageLimit,
        remaining: 0,
        message: 'Limite de mensagens atingido. Faça upgrade do seu plano para continuar.'
      });
    }

    // Incrementar contador de mensagens
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        messagesUsed: {
          increment: 1
        }
      }
    });

    const remaining = messageLimit !== null 
      ? messageLimit - updatedSubscription.messagesUsed 
      : null; // null = ilimitado

    // Verificar se está próximo do limite (80%)
    let warning = null;
    if (messageLimit !== null && remaining !== null && remaining <= messageLimit * 0.2) {
      warning = `Atenção! Você tem apenas ${remaining} mensagens restantes.`;
    }

    // ==========================================
    // CRIAR/ATUALIZAR LEAD NO CRM AUTOMATICAMENTE
    // ==========================================
    try {
      // Limpar número de telefone (remover @s.whatsapp.net se vier)
      const cleanPhone = phoneNumber.replace('@s.whatsapp.net', '');

      // Buscar ou criar lead - SOMENTE SE A MENSAGEM NÃO FOR DO BOT
      if (!fromMe && cleanPhone) {
        let lead = await prisma.lead.findFirst({
          where: {
            userId: whatsappInstance.userId,
            phone: cleanPhone
          }
        });

        if (!lead) {
          // Criar novo lead - tentar obter nome válido
          const leadName = (senderName && senderName !== cleanPhone && senderName.trim() !== '') 
            ? senderName.trim() 
            : `Contato ${cleanPhone.slice(-4)}`;
          
          lead = await prisma.lead.create({
            data: {
              userId: whatsappInstance.userId,
              phone: cleanPhone,
              name: leadName,
              stage: 'NEW',
              lastMessage: message || 'Mensagem recebida',
              lastMessageAt: new Date()
            }
          });
          console.log('[MESSAGE-TRACKING] Novo lead criado no CRM:', lead.id, 'Nome:', leadName);
        } else {
          // Atualizar último contato
          lead = await prisma.lead.update({
            where: { id: lead.id },
            data: {
              lastMessage: message || 'Mensagem recebida',
              lastMessageAt: new Date()
            }
          });
          console.log('[MESSAGE-TRACKING] Lead atualizado no CRM:', lead.id);
        }

        // Salvar mensagem no histórico (se houver conteúdo)
        if (message) {
          await prisma.leadMessage.create({
            data: {
              leadId: lead.id,
              content: message,
              fromLead: true // É do lead (cliente)
            }
          });
        }
      }
    } catch (crmError) {
      // Erro no CRM não deve afetar o tracking de mensagens
      console.error('[MESSAGE-TRACKING] Erro ao criar/atualizar lead no CRM:', crmError);
    }
    // ==========================================

    return NextResponse.json({
      allowed: true,
      messagesUsed: updatedSubscription.messagesUsed,
      messageLimit,
      remaining,
      warning,
      planName: subscription.plan.name,
      userId: whatsappInstance.userId
    });

  } catch (error) {
    console.error('[MESSAGE-TRACKING] Erro:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * GET: Consultar status sem incrementar contador
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const instanceToken = searchParams.get('instanceToken');
    const phoneNumber = searchParams.get('phoneNumber');

    if (!instanceToken && !phoneNumber) {
      return NextResponse.json(
        { error: 'instanceToken ou phoneNumber é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar instância do WhatsApp
    const whatsappInstance = await prisma.whatsAppInstance.findFirst({
      where: instanceToken
        ? { instanceToken }
        : { phoneNumber },
      include: {
        user: {
          include: {
            subscription: {
              include: {
                plan: true
              }
            }
          }
        }
      }
    });

    if (!whatsappInstance) {
      return NextResponse.json(
        { error: 'Instância não encontrada' },
        { status: 404 }
      );
    }

    const subscription = whatsappInstance.user.subscription;

    if (!subscription) {
      return NextResponse.json(
        { error: 'Usuário sem assinatura ativa' },
        { status: 403 }
      );
    }

    const messageLimit = subscription.messageLimit;
    const messagesUsed = subscription.messagesUsed;
    const remaining = messageLimit !== null ? messageLimit - messagesUsed : null;

    let warning = null;
    if (messageLimit !== null && remaining !== null && remaining <= messageLimit * 0.2) {
      warning = `Atenção! Você tem apenas ${remaining} mensagens restantes.`;
    }

    return NextResponse.json({
      allowed: messageLimit === null || messagesUsed < messageLimit,
      messagesUsed,
      messageLimit,
      remaining,
      warning,
      planName: subscription.plan.name,
      userId: whatsappInstance.userId
    });

  } catch (error) {
    console.error('[MESSAGE-TRACKING] Erro:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
