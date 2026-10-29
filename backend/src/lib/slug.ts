import { prisma } from "../db";

export const slugify = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export async function uniqueArticleSlug(base: string, excludeId?: string) {
  const root = base || "artigo";
  let slug = root, n = 2;
  while (await prisma.article.findFirst({ where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) }, select: { id: true } })) slug = `${root}-${n++}`;
  return slug;
}

export async function uniqueCategorySlug(base: string, excludeId?: string) {
  const root = base || "categoria";
  let slug = root, n = 2;
  while (await prisma.category.findFirst({ where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) }, select: { id: true } })) slug = `${root}-${n++}`;
  return slug;
}
