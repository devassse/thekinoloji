/** Shapes returned by the Express API (backend/). */
export type Role = "admin" | "editor" | "author";

export interface User { id: string; name: string; email: string; role: Role; avatar: string; active: boolean; createdAt: string }
export interface UserWithCount extends User { articleCount: number }
export interface AuthorRef { id: string; name: string; avatar: string }

export interface Category { id: string; name: string; slug: string; color: string }
export interface CategoryWithCount extends Category { articleCount: number }

export interface Article {
  id: string; title: string; slug: string; excerpt: string; content: string; image: string;
  categoryId: string; categories: Category[]; tags: string[]; authorId: string; status: "draft" | "published";
  featured: boolean; views: number; createdAt: string; updatedAt: string;
  notifiedAt?: string | null; notifiedCount?: number | null;
}
export type ArticleView = Article & { category: Category; author: AuthorRef };

export interface PublicSettings {
  siteName: string; tagline: string; city: string; temperature: string; footerText: string;
  newsletterTitle: string; newsletterText: string; popularTags: string[];
  socials: Record<Network, string>;
  shareNetworks: Network[];
}
export interface Settings extends PublicSettings { smsEnabled: boolean; smsTemplate: string }

export const NETWORKS = ["facebook", "x", "instagram", "youtube", "whatsapp", "linkedin", "telegram"] as const;
export type Network = (typeof NETWORKS)[number];

export interface Video { id: string; title: string; youtubeId: string; duration: string; published: boolean; createdAt: string }

export interface Subscriber { id: string; email: string; phone?: string | null; smsConsent: boolean; createdAt: string }

export interface Stats {
  counts: { articles: number; published: number; drafts: number; users: number; activeUsers: number; categories: number; subscribers: number; smsSubscribers: number };
  recent: ArticleView[];
  top: ArticleView[];
}

export interface ArticleInput {
  title: string; slug: string; excerpt: string; content: string; image: string; categoryId: string;
  extraCategoryIds: string[]; tags: string[]; authorId?: string; status: "draft" | "published"; featured: boolean; notifySms: boolean;
}
export interface SmsOutcome { sent: number; failed: number; total: number }
