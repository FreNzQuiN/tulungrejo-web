"use client";

import { Share2 } from "lucide-react";
import { SITE_URL } from "@/lib/constants";

export function SocialShare({ title, slug }: { title: string; slug: string }) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const baseUrl = origin || SITE_URL;
  const url = `${baseUrl}/artikel/${slug}`;
  const text = encodeURIComponent(title);
  const shareUrl = encodeURIComponent(url);

  return (
    <div
      className="flex gap-3 items-center pt-8 mt-8"
      style={{ borderTop: "1px solid rgba(79,112,156,0.2)" }}
    >
      <span className="text-[13px] font-bold text-muted-foreground inline-flex items-center gap-1.5">
        <Share2 size={14} /> Bagikan:
      </span>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-outline btn-sm no-underline"
      >
        Facebook
      </a>
      <a
        href={`https://wa.me/?text=${text}%20${shareUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-outline btn-sm no-underline"
      >
        WhatsApp
      </a>
      <a
        href={`https://twitter.com/intent/tweet?text=${text}&url=${shareUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-outline btn-sm no-underline"
      >
        Twitter
      </a>
    </div>
  );
}
