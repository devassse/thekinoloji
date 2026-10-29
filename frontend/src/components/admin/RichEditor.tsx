"use client";
import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold, Italic, Underline as UnderlineIcon, Heading2, Heading3, List, ListOrdered, Quote, Link as LinkIcon,
  ImagePlus, Image as ImageIcon, Youtube as YoutubeIcon, Minus, Undo2, Redo2, Loader2,
} from "lucide-react";
import { uploadImage } from "./upload";

const SIZES = ["25%", "50%", "75%", "100%"] as const;

/** Image with a width preset stored as data-width (rendered via CSS, sanitised by the API). */
const SizedImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: "100%",
        parseHTML: (el: HTMLElement) => el.getAttribute("data-width") || "100%",
        renderHTML: (attrs: { width?: string }) => ({ "data-width": attrs.width || "100%" }),
      },
    };
  },
});

function Btn({ label, onClick, active, children }: { label: string; onClick: () => void; active?: boolean; children: React.ReactNode }) {
  return (
    <button type="button" title={label} aria-label={label} aria-pressed={active}
      onMouseDown={(e) => e.preventDefault()} /* keep the caret in the editor */
      onClick={onClick}
      className={`grid h-8 w-8 place-items-center rounded-md transition-colors ${active ? "bg-brand text-white" : "text-slate-600 hover:bg-slate-200"}`}>
      {children}
    </button>
  );
}
const Sep = () => <span className="mx-1 h-5 w-px bg-slate-300" />;

export default function RichEditor({ name, initial }: { name: string; initial: string }) {
  const [html, setHtml] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const file = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    editable: true,
    autofocus: false,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      SizedImage,
      Youtube.configure({ nocookie: true, controls: true }),
      Placeholder.configure({ placeholder: "Escreva o artigo aqui… use a barra acima para imagens, links e vídeos do YouTube." }),
    ],
    content: initial,
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
    editorProps: { attributes: { class: "prose-article min-h-[380px] px-4 py-3 focus:outline-none", spellcheck: "true" } },
  });

  // If the rich editor can't start for any reason, fall back to a plain textarea so writing is never blocked
  useEffect(() => {
    if (editor) return;
    const t = setTimeout(() => setFailed(true), 4000);
    return () => clearTimeout(t);
  }, [editor]);

  if (failed && !editor) {
    return (
      <div>
        <input type="hidden" name={name} value={html} />
        <textarea value={html} onChange={(e) => setHtml(e.target.value)} rows={16} className="field font-mono text-[13px]"
          placeholder="O editor visual não carregou. Pode escrever HTML simples aqui (<p>, <h2>, <img>…)." />
      </div>
    );
  }

  const setLink = (ed: Editor) => {
    const prev = ed.getAttributes("link").href as string | undefined;
    const url = window.prompt("Endereço do link (deixe vazio para remover)", prev ?? "https://");
    if (url === null) return;
    const c = ed.chain().focus().extendMarkRange("link");
    if (!url || url === "https://") c.unsetLink().run(); else c.setLink({ href: url }).run();
  };
  const addYoutube = (ed: Editor) => {
    const url = window.prompt("Link do vídeo do YouTube");
    if (!url) return;
    if (!ed.commands.setYoutubeVideo({ src: url.trim(), width: 640, height: 360 })) alert("Link do YouTube inválido.");
  };
  const addImageUrl = (ed: Editor) => {
    const src = window.prompt("URL da imagem", "https://");
    if (src && src !== "https://") ed.chain().focus().setImage({ src }).run();
  };
  const onFile = async (ed: Editor, f?: File) => {
    if (!f) return;
    setBusy(true);
    const url = await uploadImage(f);
    setBusy(false);
    if (url) ed.chain().focus().setImage({ src: url, alt: f.name }).run();
    if (file.current) file.current.value = "";
  };

  return (
    <div className="rounded-lg border border-slate-300 bg-surface focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/30">
      <input type="hidden" name={name} value={html} />
      {editor && (
        <div className="rounded-t-lg border-b border-slate-200 bg-slate-50">
          <div className="flex flex-wrap items-center gap-0.5 p-1.5">
            <Btn label="Negrito" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={16} /></Btn>
            <Btn label="Itálico" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={16} /></Btn>
            <Btn label="Sublinhado" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon size={16} /></Btn>
            <Sep />
            <Btn label="Título" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 size={16} /></Btn>
            <Btn label="Subtítulo" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 size={16} /></Btn>
            <Btn label="Lista" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={16} /></Btn>
            <Btn label="Lista numerada" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={16} /></Btn>
            <Btn label="Citação" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote size={16} /></Btn>
            <Btn label="Linha separadora" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus size={16} /></Btn>
            <Sep />
            <Btn label="Link" active={editor.isActive("link")} onClick={() => setLink(editor)}><LinkIcon size={16} /></Btn>
            <Btn label="Carregar imagem do dispositivo" onClick={() => file.current?.click()}>{busy ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}</Btn>
            <Btn label="Imagem por URL" onClick={() => addImageUrl(editor)}><ImageIcon size={16} /></Btn>
            <Btn label="Vídeo do YouTube" onClick={() => addYoutube(editor)}><YoutubeIcon size={16} /></Btn>
            <Sep />
            <Btn label="Anular" onClick={() => editor.chain().focus().undo().run()}><Undo2 size={16} /></Btn>
            <Btn label="Refazer" onClick={() => editor.chain().focus().redo().run()}><Redo2 size={16} /></Btn>
            <input ref={file} type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={(e) => onFile(editor, e.target.files?.[0])} />
          </div>
          {editor.isActive("image") && (
            <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 px-3 py-1.5 text-xs text-slate-600">
              <span className="font-semibold">Tamanho da imagem</span>
              {SIZES.map((w) => {
                const on = (editor.getAttributes("image").width ?? "100%") === w;
                return (
                  <button key={w} type="button" aria-pressed={on} onMouseDown={(e) => e.preventDefault()}
                    onClick={() => editor.chain().focus().updateAttributes("image", { width: w }).run()}
                    className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${on ? "bg-brand text-white" : "bg-surface text-slate-700 ring-1 ring-slate-300 hover:ring-brand"}`}>{w}</button>
                );
              })}
            </div>
          )}
        </div>
      )}
      {editor ? (
        <div className="cursor-text" onClick={() => { if (!editor.isFocused) editor.commands.focus("end"); }}>
          <EditorContent editor={editor} />
        </div>
      ) : (
        <p className="px-4 py-10 text-center text-sm text-slate-500">A carregar o editor…</p>
      )}
    </div>
  );
}
