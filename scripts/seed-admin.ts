import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const plainPassword = process.env.ADMIN_PASSWORD || '123456E';
  const hashedPassword = await bcrypt.hash(plainPassword, 12);
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@vitrin.com';

  const settings = await prisma.siteSetting.upsert({
    where: { id: 'default' },
    update: {
      adminEmail,
      adminPassword: hashedPassword,
    },
    create: {
      id: 'default',
      adminEmail,
      adminPassword: hashedPassword,
      phone: '0555 555 55 55',
      whatsapp: '905555555555',
      email: 'info@vitrin.com',
      address: 'İstanbul, Türkiye',
    },
  });

  console.log('Admin hesabı ve ayarları başarıyla seed edildi:', settings.adminEmail);
}

main()
  .catch((e) => {
    console.error('Seed sırasında hata oluştu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
