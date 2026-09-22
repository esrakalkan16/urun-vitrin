import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  '6-9 Aylık',
  '9-12 Aylık',
  '12-18 Aylık',
  '18-24 Aylık',
  '2-3 Yaş',
  '3-4 Yaş',
  '4-5 Yaş',
  '5-6 Yaş',
  '6-7 Yaş',
  '7-8 Yaş',
  '8-9 Yaş',
  '9-10 Yaş',
];

async function main() {
  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log('Kategoriler eklendi.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });