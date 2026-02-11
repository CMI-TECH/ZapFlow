import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

type RouteContext = {
  params: {
    id: string;
  };
};

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    const { id } = context.params;

    const lead = await prisma.lead.findFirst({
      where: {
        id,
        userId: user.id
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead não encontrado' },
        { status: 404 }
      );
    }

    const hasMessages = lead.messages && lead.messages.length > 0;
    const hasNotes = lead.notes && lead.notes.trim().length > 0;

    if (!hasMessages && !hasNotes) {
      return NextResponse.json(
        { error: 'Não há mensagens nem observações para resumir' },
        { status: 400 }
      );
    }

    let conversationText = '';

    if (hasMessages) {
      conversationText = lead.messages.map((msg: any, idx: number) => {
        const sender = msg.fromLead ? lead.name : 'Atendente';
        const date = new Date(msg.createdAt).toLocaleString('pt-BR');
        return `[${idx + 1}] ${sender} (${date}): ${msg.content}`;
      }).join('\n\n');
    }

    const contextText = hasNotes ? `\nOBSERVAÇÕES DO LEAD:\n${lead.notes}\n` : '';
    const fullSource = hasMessages ? `CONVERSA:\n${conversationText}\n${contextText}` : `FONTE (Apenas Observações):\n${lead.notes}`;

    const llmResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Você é um assistente especializado em análise de conversas comerciaais. Analise a seguinte fonte (que pode conter histórico de mensagens e/ou observações manuais) e crie um resumo executivo estruturado com:\n- **Contexto**: Breve histórico do que foi tratado.\n- **Status**: Em que ponto a negociação está.\n- **Próximos Passos**: O que precisa ser feito a seguir.\n- **Tom**: Como está o clima da conversa (interessado, urgente, etc).\n\n${fullSource}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        }
      })
    });

    if (!llmResponse.ok) {
      const errorText = await llmResponse.text();
      console.error('[GEMINI-API] Erro detalhado:', errorText);
      throw new Error('Erro ao gerar resumo com Gemini');
    }

    const llmData = await llmResponse.json();
    const summary = llmData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!summary) {
      throw new Error('Resumo vazio retornado pela IA');
    }

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: { summary },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    return NextResponse.json({
      success: true,
      summary,
      lead: updatedLead
    });

  } catch (error) {
    console.error('[SUMMARY-API] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar resumo' },
      { status: 500 }
    );
  }
}
