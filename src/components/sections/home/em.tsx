import type { ReactNode } from "react";

/**
 * Converts `<em>...</em>` tags in a string into React `<em>` elements without HTML parsing or dangerouslySetInnerHTML.
 */
export function renderEm(text: string, emClassName?: string): ReactNode {
  if (!text) return "";
  const parts = text.split(/(<em>.*?<\/em>)/g);
  return parts.map((part, i) => {
    if (part.startsWith("<em>") && part.endsWith("</em>")) {
      const inner = part.slice(4, -5);
      return (
        <em key={i} className={emClassName}>
          {inner}
        </em>
      );
    }
    return part;
  });
}
