import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    // Criar usuário admin
    const hashedPassword = await hash('admin123', 10);
    await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@exemplo.com',
        password: hashedPassword,
        accessLevel: 'admin'
      }
    });

    console.log('✅ Usuário admin criado com sucesso');

    // Criar serviços de exemplo
    const servico = await prisma.service.create({
      data: {
        code: 'SERV001',
        description: 'Consultoria Técnica',
        unitPrice: 0,
        subServices: {
          create: [
            {
              code: 'SUB001',
              description: 'Análise Técnica',
              unit: 'Hora',
              unitPrice: 150.00
            },
            {
              code: 'SUB002',
              description: 'Consultoria Especializada',
              unit: 'Hora',
              unitPrice: 200.00
            }
          ]
        }
      }
    });

    console.log('✅ Serviços criados com sucesso');

    // Criar cliente de exemplo
    const cliente = await prisma.client.create({
      data: {
        name: 'Empresa ABC Ltda',
        document: '12.345.678/0001-90',
        email: 'contato@abc.com.br',
        phone: '(11) 1234-5678',
        street: 'Rua Exemplo',
        number: '123',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        observations: 'Cliente VIP'
      }
    });

    console.log('✅ Cliente criado com sucesso');

    // Criar orçamento de exemplo
    await prisma.order.create({
      data: {
        clientId: cliente.id,
        date: new Date(),
        total: 1500.00,
        status: 'pending',
        observations: 'Orçamento inicial',
        items: {
          create: [
            {
              serviceId: servico.id,
              subServiceId: servico.subServices[0].id,
              quantity: 10,
              unitPrice: 150.00,
              total: 1500.00
            }
          ]
        }
      }
    });

    console.log('✅ Orçamento criado com sucesso');

  } catch (error) {
    console.error('❌ Erro ao criar dados iniciais:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });