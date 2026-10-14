import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const settings = await prisma.siteSetting.findUnique({
    where: { id: 'default' },
  });

  if (!settings) {
    console.log('SiteSetting kaydı bulunamadı.');
    return;
  }

  const currentPassword = settings.adminPassword;

  // Zaten bcrypt hash'i formatında mı kontrol et ($2a$, $2b$, $2y$)
  if (currentPassword && (currentPassword.startsWith('$2a$') || currentPassword.startsWith('$2b$') || currentPassword.startsWith('$2y$'))) {
    console.log('Şifre zaten bcrypt ile hash\'lenmiş, işlem atlandı.');
    return;
  }

  if (!currentPassword) {
    console.log('Kayıtlı şifre boş; önce scripts/seed-admin.ts ile şifre belirleyin.');
    return;
  }
  const hashedPassword = await bcrypt.hash(currentPassword, 12);

  await prisma.siteSetting.update({
    where: { id: 'default' },
    data: {
      adminPassword: hashedPassword,
    },
  });

  console.log('Mevcut şifre başarıyla hash\'lendi ve veritabanı güncellendi.');
}

main()
  .catch((e) => {
    console.error('Migration sırasında hata oluştu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
