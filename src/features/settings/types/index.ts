export interface StoreSettings {
  brandName: string;
  brandTagline: string;
  supportPhonePk: string;
  whatsappPk: string;
  primaryColorHex: string;
  secondaryColorHex: string;
  codShippingBasePkr: number;
  freeShippingThresholdPkr: number;
  seoTitle: string;
  seoDescription: string;
  updatedAt?: string;
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  brandName: 'PAKISTANI CLOTHING',
  brandTagline: 'Next-Generation Pakistani Apparel Commerce',
  supportPhonePk: '0300-1234567',
  whatsappPk: '0300-1234567',
  primaryColorHex: '#065f46',
  secondaryColorHex: '#047857',
  codShippingBasePkr: 250,
  freeShippingThresholdPkr: 5000,
  seoTitle: 'Pakistani Clothing Commerce Framework — Edge-First COD Foundation',
  seoDescription:
    'Production-ready, Cloudflare-native e-commerce framework optimized for Pakistani clothing brands and Cash on Delivery (COD).',
};
