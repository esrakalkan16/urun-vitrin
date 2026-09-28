import { z } from 'zod';

export const categorySchema = z.object({
  name: z
    .string({ message: 'Kategori adı zorunludur' })
    .trim()
    .min(1, 'Kategori adı boş bırakılamaz'),
});

export const productVariantSchema = z.object({
  categoryId: z
    .string({ message: 'Kategori/Beden seçilmelidir' })
    .min(1, 'Kategori seçilmelidir'),
  quantity: z
    .number({ message: 'Stok adedi girilmelidir' })
    .int('Stok tam sayı olmalıdır')
    .min(0, 'Stok adedi negatif olamaz'),
});

export const productImageSchema = z.object({
  url: z.string().url('Geçerli bir görsel URL adresi girilmelidir'),
  isCover: z.boolean().optional(),
});

export const productSchema = z.object({
  title: z
    .string({ message: 'Ürün başlığı zorunludur' })
    .trim()
    .min(1, 'Ürün başlığı boş bırakılamaz'),
  description: z.string().nullable().optional(),
  price: z.preprocess(
    (val) => (typeof val === 'string' ? parseFloat(val) : val),
    z
      .number({ message: 'Fiyat zorunludur' })
      .gt(0, 'Fiyat 0\'dan büyük olmalıdır')
  ),
  images: z.array(productImageSchema).optional(),
  variants: z
    .array(productVariantSchema, {
      message: 'En az bir beden/stok bilgisi eklenmelidir',
    })
    .min(1, 'En az bir beden/stok bilgisi eklenmelidir'),
});

export const productUpdateSchema = productSchema.partial();

export const settingsSchema = z.object({
  adminEmail: z.string().email('Geçersiz e-posta adresi').optional(),
  adminPassword: z.string().min(6, 'Şifre en az 6 karakter olmalıdır').optional().or(z.literal('')),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email('Geçersiz e-posta adresi').optional().or(z.literal('')),
  address: z.string().optional(),
});
