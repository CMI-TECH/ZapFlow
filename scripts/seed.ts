import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Plans
  const plans = [
    {
      name: 'Free',
      description: 'Teste gratuito para conhecer a plataforma',
      price: 0, // R$ 0,00 - GRATUITO
      features: [
        '200 mensagens de teste',
        'Respostas com IA básica',
        '1 número de WhatsApp',
        'Acesso a todas as funcionalidades',
        'Sem cartão de crédito'
      ],
      isPopular: false
    },
    {
      name: 'Básico',
      description: 'Ideal para pequenos negócios que estão começando',
      price: 9900, // R$ 99,00
      features: [
        '500 atendimentos/mês',
        'Respostas com IA básica',
        'Suporte por email',
        '1 número de WhatsApp',
        'Histórico de 30 dias'
      ],
      isPopular: false
    },
    {
      name: 'Profissional',
      description: 'Para empresas em crescimento que precisam de mais recursos',
      price: 19900, // R$ 199,00
      features: [
        '2.000 atendimentos/mês',
        'IA avançada com GPT-4',
        'Transcrição de áudio',
        'Processamento de imagens',
        '3 números de WhatsApp',
        'Suporte prioritário',
        'Histórico ilimitado',
        'Relatórios mensais'
      ],
      isPopular: true
    },
    {
      name: 'Empresarial',
      description: 'Solução completa para grandes operações',
      price: 49900, // R$ 499,00
      features: [
        'Atendimentos ilimitados',
        'IA premium com modelos personalizados',
        'Todas as integrações',
        'Números ilimitados',
        'Suporte 24/7 dedicado',
        'Treinamento personalizado',
        'API dedicada',
        'SLA garantido',
        'Relatórios avançados'
      ],
      isPopular: false
    }
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan
    });
  }

  console.log('Plans created successfully');

  // Create test user
  const hashedPassword = await bcrypt.hash('johndoe123', 12);
  await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'john@doe.com',
      password: hashedPassword
    }
  });

  console.log('Test user created successfully');
  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
