/* [client-review] Draft content. */
import type { RichDoc, RichNode } from "../../../src/lib/domain/types";

export function doc(...nodes: RichNode[]): RichDoc {
  return {
    type: "doc",
    content: nodes,
  };
}

export function p(textOrParts: string | (string | RichNode)[]): RichNode {
  if (typeof textOrParts === "string") {
    return {
      type: "paragraph",
      content: textOrParts ? [{ type: "text", text: textOrParts }] : [],
    };
  }
  const content: RichNode[] = textOrParts.map((part) => {
    if (typeof part === "string") {
      return { type: "text", text: part };
    }
    return part;
  });
  return {
    type: "paragraph",
    content,
  };
}

export function h2(text: string): RichNode {
  return {
    type: "heading",
    attrs: { level: 2 },
    content: [{ type: "text", text }],
  };
}

export function h3(text: string): RichNode {
  return {
    type: "heading",
    attrs: { level: 3 },
    content: [{ type: "text", text }],
  };
}

export function b(text: string): RichNode {
  return {
    type: "text",
    text,
    marks: [{ type: "bold" }],
  };
}

export function i(text: string): RichNode {
  return {
    type: "text",
    text,
    marks: [{ type: "italic" }],
  };
}

export function a(text: string, href: string): RichNode {
  return {
    type: "text",
    text,
    marks: [{ type: "link", attrs: { href } }],
  };
}

export function ul(items: (string | RichNode | (string | RichNode)[])[]): RichNode {
  return {
    type: "bulletList",
    content: items.map((item) => ({
      type: "listItem",
      content: [
        typeof item === "object" && !Array.isArray(item) && item.type === "paragraph"
          ? item
          : p(item as string | (string | RichNode)[]),
      ],
    })),
  };
}

export function ol(items: (string | RichNode | (string | RichNode)[])[]): RichNode {
  return {
    type: "orderedList",
    content: items.map((item) => ({
      type: "listItem",
      content: [
        typeof item === "object" && !Array.isArray(item) && item.type === "paragraph"
          ? item
          : p(item as string | (string | RichNode)[]),
      ],
    })),
  };
}

export function quote(text: string | (string | RichNode)[]): RichNode {
  return {
    type: "blockquote",
    content: [p(text)],
  };
}

export function getNodeText(node: RichNode): string {
  if (node.text) return node.text;
  if (Array.isArray(node.content)) {
    return node.content.map(getNodeText).join(" ");
  }
  return "";
}

export function countDocWords(document: RichDoc): number {
  if (!document || !Array.isArray(document.content)) return 0;
  const fullText = document.content.map(getNodeText).join(" ");
  return fullText.trim().split(/\s+/).filter(Boolean).length;
}
