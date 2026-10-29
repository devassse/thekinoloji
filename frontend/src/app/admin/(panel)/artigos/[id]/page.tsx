import { notFound, redirect } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { Notice, PageHeader } from "@/components/admin/ui";
import ArticleForm from "@/components/admin/ArticleForm";

export default async function EditArticle({ params, searchParams }: { params: { id: string }; searchParams: { erro?: string } }) {
  const me = await requireUser();
  const canPublish = me.role !== "author";
  let article;
  try { article = await api.admin.article(params.id); }
  catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    if (e instanceof ApiError && e.status === 403) redirect("/admin/artigos");
    throw e;
  }
  const [categories, authors, sms] = await Promise.all([
    api.admin.categories(),
    canPublish ? api.admin.authors() : Promise.resolve([]),
    api.admin.smsInfo(),
  ]);
  return (
    <>
      <PageHeader title="Editar artigo" subtitle={article.title} />
      <Notice code={searchParams.erro} />
      <ArticleForm article={article} categories={categories} authors={authors} role={me.role} smsEnabled={sms.enabled} smsCount={sms.recipients} />
    </>
  );
}
