import { Facebook, Instagram, Linkedin, MessageCircle, Send, Youtube } from "lucide-react";
import type { Network } from "@/lib/types";

const XIcon = ({ size = 16 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
);

export const NETWORK_META: Record<Network, { label: string; color: string; canShare: boolean }> = {
  facebook: { label: "Facebook", color: "#1877f2", canShare: true },
  x: { label: "X", color: "#000000", canShare: true },
  instagram: { label: "Instagram", color: "#c13584", canShare: false },
  youtube: { label: "YouTube", color: "#ff0000", canShare: false },
  whatsapp: { label: "WhatsApp", color: "#25d366", canShare: true },
  linkedin: { label: "LinkedIn", color: "#0a66c2", canShare: true },
  telegram: { label: "Telegram", color: "#229ed9", canShare: true },
};

export default function SocialIcon({ network, size = 16 }: { network: Network; size?: number }) {
  switch (network) {
    case "facebook": return <Facebook size={size} />;
    case "x": return <XIcon size={size} />;
    case "instagram": return <Instagram size={size} />;
    case "youtube": return <Youtube size={size} />;
    case "whatsapp": return <MessageCircle size={size} />;
    case "linkedin": return <Linkedin size={size} />;
    case "telegram": return <Send size={size} />;
  }
}

export const isRealUrl = (u?: string) => !!u && u !== "#";
