"use client";
import { useEffect } from "react";

const TTL = 6 * 60 * 60 * 1000; // 6 h
const DELAY = 3000;             // só conta se o leitor ficar 3 s com a página visível

export default function ViewTracker({ slug }: { slug: string }) {
    useEffect(() => {
        const key = `tk-view:${slug}`;
        try { if (Date.now() - Number(localStorage.getItem(key) || 0) < TTL) return; } catch { }

        let timer: ReturnType<typeof setTimeout> | undefined;
        const send = () => {
            let vid = "";
            try {
                vid = localStorage.getItem("tk-vid") || "";
                if (!vid) { vid = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem("tk-vid", vid); }
                localStorage.setItem(key, String(Date.now()));
            } catch { }
            fetch("/api/view", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug, vid }), keepalive: true }).catch(() => { });
        };
        const start = () => { timer = setTimeout(send, DELAY); };
        const onVisible = () => { if (document.visibilityState === "visible") { document.removeEventListener("visibilitychange", onVisible); start(); } };

        if (document.visibilityState === "visible") start();
        else document.addEventListener("visibilitychange", onVisible);
        return () => { clearTimeout(timer); document.removeEventListener("visibilitychange", onVisible); };
    }, [slug]);
    return null;
}