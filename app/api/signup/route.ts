import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, password } = body;

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email já está cadastrado' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Buscar plano Free
    const freePlan = await prisma.plan.findUnique({
      where: { name: 'Free' }
    });

    if (!freePlan) {
      return NextResponse.json(
        { error: 'Plano Free não encontrado. Execute o seed do banco de dados.' },
        { status: 500 }
      );
    }

    // Criar usuário com assinatura Free automaticamente
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        subscription: {
          create: {
            planId: freePlan.id,
            status: 'active',
            messageLimit: 200, // Limite de 200 mensagens para plano Free
            messagesUsed: 0
          }
        }
      }
    });

    return NextResponse.json(
      {
        message: 'Usuário criado com sucesso! Você ganhou 200 mensagens gratuitas para testar.',
        userId: user.id
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Erro ao criar usuário' },
      { status: 500 }
    );
  }
}
