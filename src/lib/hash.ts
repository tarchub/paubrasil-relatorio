import { createHash } from "crypto";

/** Canonicaliza URL removendo parâmetros de rastreamento e barra final. */
export function canonicalUrl(raw: string): string {
  try {
    const u = new URL(raw);
    const strip = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "ref", "fbclid", "gclid"];
    strip.forEach((p) => u.searchParams.delete(p));
    u.hash = "";
    let s = u.toString();
    if (s.endsWith("/")) s = s.slice(0, -1);
    return s;
  } catch {
    return raw.trim();
  }
}

export function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export function urlHash(url: string): string {
  return sha256(canonicalUrl(url));
}

/** Normaliza título para hash de deduplicação. */
export function titleHash(title: string): string {
  const norm = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  return sha256(norm);
}
