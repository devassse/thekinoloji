import { api } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { Notice, PageHeader } from "@/components/admin/ui";
import ArticleForm from "@/components/admin/ArticleForm";

export default async function NewArticle({ searchParams }: { searchParams: { erro?: string } }) {
  const me = await requireUser();
  const canPublish = me.role !== "author";
  const [categories, authors, sms] = await Promise.all([
    api.admin.categories(),
    canPublish ? api.admin.authors() : Promise.resolve([]),
    api.admin.smsInfo(),
  ]);
  return (
    <>
      <PageHeader title="Novo artigo" />
      <Notice code={searchParams.erro} />
      <ArticleForm categories={categories} authors={authors} role={me.role} smsEnabled={sms.enabled} smsCount={sms.recipients} />
    </>
  );
}
