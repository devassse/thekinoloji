import { notFound } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { Notice, PageHeader } from "@/components/admin/ui";
import UserForm from "@/components/admin/UserForm";

export default async function EditUser({ params, searchParams }: { params: { id: string }; searchParams: { erro?: string } }) {
  await requireRole("admin");
  let user;
  try { user = await api.admin.user(params.id); }
  catch (e) { if (e instanceof ApiError && e.status === 404) notFound(); throw e; }
  return (<><PageHeader title="Editar utilizador" subtitle={user.email} /><Notice code={searchParams.erro} /><UserForm user={user} /></>);
}
