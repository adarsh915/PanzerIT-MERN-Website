export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function generateSlug(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

/**
 * Parses an HTML string to extract <h2> and <h3> headings.
 * Injects an `id` attribute into each heading based on its text content.
 * 
 * @param html The raw HTML string from the database.
 * @returns An object containing the modified HTML string and an array of TOC items.
 */
export function generateToc(html: string): { html: string; toc: TocItem[] } {
  if (!html) return { html: '', toc: [] };

  const toc: TocItem[] = [];

  // Regex to match <h2> and <h3> tags, including attributes and content (multiline support)
  const headingRegex = /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi;

  const modifiedHtml = html.replace(headingRegex, (match, levelStr, attrs, content) => {
    // 1. Extract pure text by stripping inner HTML tags
    const text = content.replace(/<[^>]+>/g, '').trim();
    
    // Skip empty headings
    if (!text) {
      return match;
    }

    // 2. Generate a URL-friendly slug (id)
    let id = generateSlug(text);
    
    // Ensure uniqueness if multiple headings have the same text
    let suffix = 1;
    let originalId = id;
    while (toc.some(item => item.id === id)) {
      id = `${originalId}-${suffix}`;
      suffix++;
    }

    // 3. Add to TOC array
    toc.push({
      id,
      text,
      level: parseInt(levelStr, 10),
    });

    // 4. Inject id into attributes
    // If an id already exists, we could replace it, but for simplicity we'll just append it.
    // (In reality, editors rarely add ids unless specified)
    const newAttrs = attrs.includes('id=') ? attrs : ` id="${id}" ${attrs}`;

    return `<h${levelStr}${newAttrs}>${content}</h${levelStr}>`;
  });

  return { html: modifiedHtml, toc };
}
