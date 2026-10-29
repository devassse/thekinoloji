import sanitizeHtml from "sanitize-html";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Articles created before the WYSIWYG editor are plain text ("## " = subtitle). */
export function toHtml(content: string): string {
  const c = (content ?? "").trim();
  if (!c) return "";
  if (/^<[a-z][\s\S]*>/i.test(c)) return c;
  return c.split(/\n{2,}/).filter(Boolean)
    .map((b) => (b.startsWith("## ") ? `<h2>${esc(b.slice(3))}</h2>` : `<p>${esc(b).replace(/\n/g, "<br>")}</p>`))
    .join("");
}

export function clean(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, "img", "iframe", "h1", "h2"],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "title", "data-width"],
      iframe: ["src", "width", "height", "allowfullscreen", "title"],
      div: ["data-youtube-video"],
    },
    allowedIframeHostnames: ["www.youtube.com", "www.youtube-nocookie.com"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer nofollow", target: "_blank" }),
      img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, "data-width": ["25%", "50%", "75%", "100%"].includes(attribs["data-width"]) ? attribs["data-width"] : "100%" } }),
    },
  });
}

export function stripHtml(html: string): string {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\s+/g, " ").trim();
}
