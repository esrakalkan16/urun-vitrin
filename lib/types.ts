export type ProductImage = { id: string; url: string; isCover: boolean };
export type Category = { id: string; name: string };
export type Variant = { id: string; quantity: number; category: Category };

export type Product = {
  id: string;
  title: string;
  description?: string | null;
  price: string;
  isActive: boolean;
  createdAt: string;
  images: ProductImage[];
  variants: Variant[];
};

export type StoreSettings = {
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
};
