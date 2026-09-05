import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitizes an HTML string to prevent Cross-Site Scripting (XSS) attacks.
 * This ensures that rendering user-generated content via dangerouslySetInnerHTML is safe.
 * 
 * @param html The raw HTML string to sanitize.
 * @returns A safe, sanitized HTML string.
 */
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ['iframe', 'video', 'source', 'audio'],
    ADD_ATTR: [
      'allow', 'allowfullscreen', 'frameborder', 'scrolling', 'target', 'style', 'class',
      'src', 'controls', 'autoplay', 'loop', 'muted', 'poster', 'width', 'height'
    ],
    ADD_DATA_URI_TAGS: ['img'],
  });
}

export function stripHtml(html: string | null | undefined): string {
  if (!html) return '';
  let s = html.replace(/<img[\s\S]*?(>|$)/ig, '');
  s = s.replace(/<[^>]*>/g, '');
  s = s.replace(/&amp;/g, '&');
  s = s.replace(/&lt;/g, '<');
  s = s.replace(/&gt;/g, '>');
  s = s.replace(/&quot;/g, '"');
  s = s.replace(/&#39;/g, "'");
  s = s.replace(/&nbsp;/g, ' ');
  return s.trim();
}
