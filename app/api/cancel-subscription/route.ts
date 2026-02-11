import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    console.log('[CANCEL] Iniciando cancelamento para:', session.user.email);
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        subscription: {
          include: { plan: true }
        }
      }
    });

    if (!user?.subscription) {
      console.log('[CANCEL] Nenhuma assinatura encontrada para o usuário');
      return NextResponse.json(
        { error: 'Nenhuma assinatura encontrada' },
        { status: 404 }
      );
    }

    console.log('[CANCEL] Subscription ID:', user.subscription.id, 'Stripe:', user.subscription.stripeSubscriptionId, 'Asaas:', user.subscription.asaasSubscriptionId);

    // 1. Cancelar no Stripe se existir ID
    if (user.subscription.stripeSubscriptionId) {
      try {
        const { stripe } = await import('@/lib/stripe');
        await stripe.subscriptions.cancel(user.subscription.stripeSubscriptionId);
      } catch (stripeError) {
        console.error('Erro ao cancelar no Stripe:', stripeError);
        // Continuamos para cancelar no DB mesmo se o Stripe falhar (ex: assinatura já cancelada lá)
      }
    }

    // 3. Atualizar status no Banco de Dados
    // Para planos "Free", apenas este passo é executado
    console.log('[CANCEL] Atualizando status no DB para "canceled"...');
    await prisma.subscription.update({
      where: { id: user.subscription.id },
      data: { status: 'canceled' }
    });

    console.log('[CANCEL] Assinatura cancelada com sucesso!');
    return NextResponse.json({ message: 'Assinatura cancelada com sucesso' });
  } catch (error) {
    console.error('[CANCEL] Cancel subscription error:', error);
    return NextResponse.json(
      { error: 'Erro ao cancelar assinatura' },
      { status: 500 }
    );
  }
}
