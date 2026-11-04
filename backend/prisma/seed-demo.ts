import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedDemo() {
  console.log('Seeding demo transactions for current month...');
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const categories = await prisma.category.findMany();
  const catByName = (name: string) => categories.find((c) => c.name.toLowerCase().includes(name.toLowerCase()));

  const fnb = catByName('Makanan');
  const tagihan = catByName('Tagihan');
  const trans = catByName('Transportasi');
  const belanja = catByName('Belanja');
  const hiburan = catByName('Hiburan');
  const gaji = catByName('Gaji');
  const freelance = catByName('Freelance');

  // Check if transactions already exist
  const count = await prisma.transaction.count();
  if (count > 0) {
    console.log(`Sudah ada ${count} transaksi di database.`);
    return;
  }

  const demoData = [
    // Income
    { type: 'INCOME', amount: 15000000, categoryId: gaji?.id!, desc: 'Gaji Bulanan PT Maju Bersama', source: 'WEB', day: 1 },
    { type: 'INCOME', amount: 3500000, categoryId: freelance?.id!, desc: 'Proyek Desain UI/UX Mobile App', source: 'WEB', day: 10 },

    // Expenses
    { type: 'EXPENSE', amount: 450000, categoryId: tagihan?.id!, desc: 'Internet Indihome Fiber 50Mbps', source: 'WEB', day: 2 },
    { type: 'EXPENSE', amount: 650000, categoryId: tagihan?.id!, desc: 'Token Listrik PLN & Air PAM', source: 'WEB', day: 3 },
    { type: 'EXPENSE', amount: 1250000, categoryId: belanja?.id!, desc: 'Belanja Bulanan Supermarket', source: 'WEB', day: 4 },
    { type: 'EXPENSE', amount: 45000, categoryId: fnb?.id!, desc: 'Makan Siang Nasi Padang Garuda', source: 'TELEGRAM', day: 5 },
    { type: 'EXPENSE', amount: 150000, categoryId: trans?.id!, desc: 'Bensin Pertamax Full Tank', source: 'TELEGRAM', day: 6 },
    { type: 'EXPENSE', amount: 75000, categoryId: fnb?.id!, desc: 'Kopi & Croissant Janji Jiwa', source: 'TELEGRAM', day: 7 },
    { type: 'EXPENSE', amount: 186000, categoryId: hiburan?.id!, desc: 'Langganan Netflix & Spotify Family', source: 'WEB', day: 8 },
    { type: 'EXPENSE', amount: 120000, categoryId: fnb?.id!, desc: 'Dinner Mie Gacoan & Minuman', source: 'TELEGRAM', day: 12 },
    { type: 'EXPENSE', amount: 85000, categoryId: trans?.id!, desc: 'Top-up E-Toll Mandiri', source: 'TELEGRAM', day: 15 },
    { type: 'EXPENSE', amount: 380000, categoryId: fnb?.id!, desc: 'Traktir Makan Malam Keluarga', source: 'TELEGRAM', day: 18 },
    { type: 'EXPENSE', amount: 540000, categoryId: belanja?.id!, desc: 'Beli Keyboard Wireless Logitech', source: 'WEB', day: 20 },
    { type: 'EXPENSE', amount: 60000, categoryId: fnb?.id!, desc: 'Sarapan Bubur Ayam & Teh Hangat', source: 'TELEGRAM', day: 22 },
  ];

  for (const item of demoData) {
    if (!item.categoryId) continue;
    const txDate = new Date(year, month, Math.min(item.day, now.getDate()));
    await prisma.transaction.create({
      data: {
        type: item.type,
        amount: item.amount,
        categoryId: item.categoryId,
        description: item.desc,
        source: item.source,
        date: txDate,
      },
    });
  }

  console.log('Sample demo transactions seeded successfully!');
}

seedDemo()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

