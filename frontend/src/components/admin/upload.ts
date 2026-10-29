export async function uploadImage(file: File): Promise<string | null> {
  const fd = new FormData();
  fd.append("file", file);
  try {
    const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const j = await r.json();
    if (!r.ok) { alert(j.error || "Falha no carregamento."); return null; }
    return j.url as string;
  } catch {
    alert("Falha no carregamento.");
    return null;
  }
}
