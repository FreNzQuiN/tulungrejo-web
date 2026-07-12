import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "s",
  "u",
  "a",
  "img",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "blockquote",
  "pre",
  "code",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "figure",
  "figcaption",
  "hr",
  "div",
  "span",
];

const ALLOWED_ATTR = [
  "href",
  "target",
  "rel",
  "src",
  "alt",
  "width",
  "height",
  "class",
  "id",
  "title",
  "style",
];

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Detect if content is HTML (from TipTap editor) or plain markdown.
 * Uses specific tag detection to avoid false positives from
 * markdown's angle bracket usage (e.g., <3, <tag> in code blocks).
 */
export function isHtmlContent(content: string): boolean {
  if (!content || content.trim().length === 0) return false;
  return /<(p|h[1-6]|div|span|img|ul|ol|li|table|blockquote|pre|strong|em|br|hr)[\s>]/i.test(
    content.trim(),
  );
}

export function renderArticleContent(content: string): {
  type: "html" | "markdown";
  sanitized: string;
} {
  if (isHtmlContent(content)) {
    return { type: "html", sanitized: sanitizeHtml(content) };
  }
  return { type: "markdown", sanitized: content };
}
