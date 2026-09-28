# Güvenlik ve Veri Tutarlılığı Notları (SECURITY_NOTES.md)

Bu belgede yapılan güvenlik iyileştirmeleri, gerekli çevre değişkenleri ve veritabanı script'lerinin kullanım adımları açıklanmaktadır.

---

## 🔑 Çevre Değişkenleri (Environment Variables)

Aşağıdaki değişkenlerin `.env` veya `.env.local` dosyasında tanımlı olduğundan emin olun:

```env
# Veritabanı Bağlantıları
DATABASE_URL="postgresql://user:password@host:5432/dbname"
DIRECT_URL="postgresql://user:password@host:5432/dbname"

# Admin Varsayılan Bilgileri (Seed ve İlk Kurulum İçin)
ADMIN_EMAIL="admin@vitrin.com"
ADMIN_PASSWORD="GüvenliBirSifre123!"

# Yönetici oturum çerezini imzalamak için gizli anahtar (en az 32 karakter, ZORUNLU)
# Üretmek için: openssl rand -base64 48
SESSION_SECRET="uzun-rastgele-bir-deger"

# Vercel Blob (Görsel Depolama)
BLOB_READ_WRITE_TOKEN="vercel_blob_token_buraya"
```

---

## 🚀 Seed ve Migration Script'lerinin Çalıştırılması

### 1. Yeni Veritabanı Kurulumunda (Seed)
Veritabanına ilk admin kullanıcısını ve varsayılan ayarları şifrelenmiş (bcrypt hash) olarak eklemek için:

```bash
npx tsx scripts/seed-admin.ts
```

### 2. Mevcut Düz Metin Şifrelerin Dönüştürülmesi (Migration)
Eğer veritabanınızda önceden kalan düz metin şifreler varsa, bunları bcrypt hash'ine dönüştürmek için:

```bash
npx tsx scripts/migrate-hash-password.ts
```

### 3. Negatif Stok Koruması (SQL Check Constraint)
`ProductVariant.quantity` alanına veritabanı seviyesinde `CHECK (quantity >= 0)` kısıtlaması eklemek için Prisma migration çalıştırın:

```bash
npx prisma migrate dev --name add_quantity_check_constraint
```

---

## 🔒 Gerçekleştirilen Güvenlik ve Mimari İyileştirmeler

1. **Şifre Güvenliği (Bcryptjs):**
   - Admin şifreleri veritabanında düz metin olarak tutulmaz, `bcryptjs` ile salt/hash mekanizması kullanılır.
   - Giriş yaparken `bcrypt.compare` ile doğrulama yapılır.
   - `/api/admin/auth` içerisindeki otomatik kayıt oluşturma kaldırılmıştır.
   - Admin oturum cookie'sine production ortamında `secure: true` bayrağı eklenmiştir.

2. **İmzalı Oturum Çerezi:**
   - Eski `admin_auth=1` çerezi herkes tarafından elle eklenebildiği için kaldırıldı.
   - Yerine `admin_session` çerezi geldi: süre ve şifre parmak izi içeren, `SESSION_SECRET` ile HMAC-SHA256 imzalı bir token (`lib/session.ts`).
   - `proxy.ts` /admin sayfalarında imzayı ve süreyi doğrular; API'lerde `checkAuth()` ayrıca veritabanındaki güncel şifreyle eşleşmeyi kontrol eder.
   - Şifre veya giriş e-postası değişince tüm eski oturumlar geçersiz olur; değişikliği yapan kullanıcıya yeni oturum verilir.
   - Oturum süresi 7 gündür. Production'da `SESSION_SECRET` yoksa giriş tamamen kapalıdır.
   - Giriş denemeleri IP başına 15 dakikada 10 hatayla sınırlandırılır.

3. **Hassas Veri Gizleme:**
   - `/api/admin/settings` endpoint'inde `GET` ve `PUT` yanıtlarında `adminPassword` alanı asla istemciye döndürülmez.

4. **Atomik Stok İşlemleri ve Race Condition Koruması:**
   - `sell-variant` route'u `prisma.$transaction` ve `updateMany` (`decrement: 1`, `quantity > 0`) ile yarış durumlarına kapalı hale getirilmiştir.
   - Stok bittiğinde otomatik arşivleme yapılır; stok tükendiğinde `409 Conflict`, varyant bulunamadığında `404 Not Found` dönülür.
   - Arşivleme ve Geri Al işlemleri (`/api/products/[id]/sold`) atomik transaction içine alınmıştır.

5. **Yetkilendirme Kontrolleri (`checkAuth`):**
   - Tüm admin API endpoint'lerinde (`categories`, `products`, `upload`, `admin/settings`, `sell-variant`, `sold`) `checkAuth()` doğrulaması en başta yapılır.

6. **Server-Side Validasyon (Zod):**
   - `lib/validations.ts` üzerinden tüm ürün, kategori ve ayar güncelleme istekleri Türkçe hata mesajlarıyla doğrulanır (`safeParse`).

7. **Vercel Blob Yetim Görsel Temizliği:**
   - Ürün güncellenirken silinen eski görseller Vercel Blob üzerinden `del()` fonksiyonu ile otomatik temizlenir.

8. **WhatsApp Link Normalizasyonu:**
   - `lib/whatsapp.ts` içindeki `buildWhatsAppLink` ile telefon numaraları uluslararası formata dönüştürülür ve mesajlar güvenli bir şekilde encode edilir. Ayar boşsa WhatsApp butonu gizlenir.

---

## 🧪 Manuel Test Senaryoları

### Test 1: Atomik Stok Satışı (`sell-variant`)
1. Stoğu `1` olan bir varyant için `/api/products/[id]/sell-variant` isteği gönderin (`200 OK`, `newQuantity: 0`, `isArchived: true` döner).
2. Hemen ardından aynı varyant için tekrar istek gönderin -> `409 Conflict` (`Bu varyantın stoğu tükenmiştir`) yanıtı alınmalıdır.

### Test 2: Şifre Sızıntısı & Giriş Kontrolü
1. `GET /api/admin/settings` çağrısı yapın -> Dönen JSON objesinde `adminPassword` alanı **bulunmamalıdır**.
2. Giriş endpoint'ine yanlış şifre gönderin -> `401 Unauthorized` alınmalıdır.

### Test 3: Zod Validasyonu
1. `POST /api/products` endpoint'ine `price: -10` veya boş `title` gönderin -> `400 Bad Request` ve Türkçe doğrulama hatası alınmalıdır.
