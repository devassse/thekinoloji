export function timeAgo(iso: string): string {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${Math.max(1, m)}min atrás`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h atrás`;
  const d = Math.floor(h / 24);
  return `${d} ${d === 1 ? "dia" : "dias"} atrás`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-PT", {
    day: "2-digit", month: "short", year: "numeric", timeZone: "Africa/Maputo",
  });
}

export function longToday(): string {
  const s = new Date().toLocaleDateString("pt-PT", {
    weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Maputo",
  });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export const MESSAGES: Record<string, string> = {
  "em-uso": "Não é possível eliminar: ainda existem artigos associados.",
  "email-existente": "Já existe um utilizador com este email.",
  "senha-curta": "A palavra-passe deve ter pelo menos 6 caracteres.",
  "ultimo-admin": "Tem de existir pelo menos um administrador activo.",
  "proprio": "Não pode eliminar a sua própria conta.",
  "com-artigos": "Este utilizador tem artigos. Reatribua ou elimine os artigos primeiro.",
  "dados": "Preencha os campos obrigatórios.",
  "youtube-invalido": "Link do YouTube inválido.",
  "senha-actual-invalida": "A palavra-passe actual está incorrecta.",
  "sem-permissao": "Não tem permissão para esta acção.",
  "categoria-invalida": "Escolha uma categoria válida.",
  "servidor-indisponivel": "Não foi possível contactar o servidor da API.",
  "duplicado": "Já existe um registo com estes dados.",
  "guardado": "Alterações guardadas.",
  "sms-ok": "Artigo guardado e SMS enviado aos subscritores.",
  "sms-falhou": "Artigo guardado, mas o envio de SMS falhou. Verifique o fornecedor de SMS.",
};
