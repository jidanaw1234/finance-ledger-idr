import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultCategories = [
  // EXPENSE
  { name: 'Makanan & Minuman', type: 'EXPENSE', color: '#f59e0b', monthlyBudget: 3500000 },
  { name: 'Tagihan & Utilitas', type: 'EXPENSE', color: '#ef4444', monthlyBudget: 2000000 },
  { name: 'Transportasi', type: 'EXPENSE', color: '#3b82f6', monthlyBudget: 1500000 },
  { name: 'Belanja & Kebutuhan', type: 'EXPENSE', color: '#10b981', monthlyBudget: 2500000 },
  { name: 'Hiburan & Langganan', type: 'EXPENSE', color: '#8b5cf6', monthlyBudget: 1000000 },
  { name: 'Kesehatan & Pribadi', type: 'EXPENSE', color: '#ec4899', monthlyBudget: 800000 },
  { name: 'Lain-lain', type: 'EXPENSE', color: '#64748b', monthlyBudget: 500000 },
  
  // INCOME
  { name: 'Gaji Pokok', type: 'INCOME', color: '#059669', monthlyBudget: null },
  { name: 'Freelance & Side Project', type: 'INCOME', color: '#0284c7', monthlyBudget: null },
  { name: 'Investasi & Bunga', type: 'INCOME', color: '#d97706', monthlyBudget: null },
  { name: 'Pemasukan Lainnya', type: 'INCOME', color: '#6b7280', monthlyBudget: null },
];

async function main() {
  console.log('Seeding categories...');
  for (const cat of defaultCategories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }
  console.log('Categories seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

