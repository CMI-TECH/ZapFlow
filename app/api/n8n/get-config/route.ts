import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Prompt padrão caso o usuário não tenha configurado
const DEFAULT_PROMPT = `# Personalidade e Objetivo

* Você é um assistente virtual profissional e amigável
* Seu papel é atender clientes via WhatsApp com cordialidade e eficiência
* Você conversa como um profissional humano digitando manualmente no WhatsApp
* Você nunca soa como um sistema automatizado ou IA
* As mensagens devem ser curtas e naturais

# Comportamento

* Seja sempre educado, cordial e acessível
* Utilize linguagem clara, simples e direta
* Não utilize emojis excessivos
* Responda de forma objetiva e útil

# Regras

* Nunca compartilhe informações sensíveis
* Se não souber algo, diga que vai verificar
* Encerre a conversa de forma educada quando necessário`;

// API para N8N buscar configurações do cliente
// Aceita tanto query param quanto body
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: 'Token não fornecido' 
      }, { status: 400 });
    }

    const instance = await prisma.whatsAppInstance.findFirst({
      where: { instanceToken: token },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    });

    if (!instance) {
      return NextResponse.json({ 
        success: false, 
        error: 'Instância não encontrada' 
      }, { status: 404 });
    }

    // Se IA está desabilitada, retorna flag
    if (!instance.aiEnabled) {
      return NextResponse.json({
        success: true,
        aiEnabled: false,
        message: 'IA desabilitada para esta instância'
      });
    }

    return NextResponse.json({
      success: true,
      aiEnabled: instance.aiEnabled,
      agentName: instance.agentName || 'Assistente',
      systemPrompt: instance.aiPrompt || DEFAULT_PROMPT,
      instanceName: instance.instanceName,
      userName: instance.user.name,
      userEmail: instance.user.email,
    });
  } catch (error) {
    console.error('[N8N API] Erro ao buscar config:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}

// POST também aceita para flexibilidade
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = body.token || body.instanceToken;
    
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: 'Token não fornecido' 
      }, { status: 400 });
    }

    const instance = await prisma.whatsAppInstance.findFirst({
      where: { instanceToken: token },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    });

    if (!instance) {
      return NextResponse.json({ 
        success: false, 
        error: 'Instância não encontrada' 
      }, { status: 404 });
    }

    if (!instance.aiEnabled) {
      return NextResponse.json({
        success: true,
        aiEnabled: false,
        message: 'IA desabilitada para esta instância'
      });
    }

    return NextResponse.json({
      success: true,
      aiEnabled: instance.aiEnabled,
      agentName: instance.agentName || 'Assistente',
      systemPrompt: instance.aiPrompt || DEFAULT_PROMPT,
      instanceName: instance.instanceName,
      userName: instance.user.name,
      userEmail: instance.user.email,
    });
  } catch (error) {
    console.error('[N8N API] Erro ao buscar config:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
