export type FaqStatus = 'active' | 'inactive';

export interface Faq {
  id: string;
  question: string;
  answer: string;
  slug: string;
  order: number;
  status: FaqStatus;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  pageKey: string;
  createdAt: string;
}

export interface FaqFormData {
  question: string;
  answer: string;
  slug?: string;
  order?: number;
  status?: FaqStatus;
  pageKey?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}
