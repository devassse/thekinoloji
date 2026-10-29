import { requireRole } from "@/lib/auth";
import SettingsTabs from "@/components/admin/SettingsTabs";

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const me = await requireRole("admin", "editor");
  return (<><SettingsTabs role={me.role} />{children}</>);
}
