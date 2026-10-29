import { requireRole } from "@/lib/auth";
import { Notice, PageHeader } from "@/components/admin/ui";
import UserForm from "@/components/admin/UserForm";

export default async function NewUser({ searchParams }: { searchParams: { erro?: string } }) {
  await requireRole("admin");
  return (<><PageHeader title="Novo utilizador" /><Notice code={searchParams.erro} /><UserForm /></>);
}
