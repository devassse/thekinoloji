import type { Category } from "@prisma/client";

/** Articles embed their primary category, extra categories and a minimal author (no email/role). */
export const articleInclude = {
  category: true,
  author: { select: { id: true, name: true, avatar: true } },
  extraCategories: { include: { category: true } },
} as const;

/** Adds `categories` = [primary, ...extras] and hides the join rows. */
export function shape<T extends { category: Category; extraCategories: { category: Category }[] }>(a: T) {
  const { extraCategories, ...rest } = a;
  return { ...rest, categories: [a.category, ...extraCategories.map((e) => e.category)] };
}
