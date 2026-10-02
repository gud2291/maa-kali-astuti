import React from "react";
import type { RichDoc, RichNode, RichMark } from "@/lib/domain/types";
import { cn } from "@/lib/utils/cn";

export function slugifyText(text: string): string {
  const slug = text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "section";
}

export function getNodeText(node: RichNode): string {
  if (node.text) return node.text;
  if (Array.isArray(node.content)) {
    return node.content.map(getNodeText).join("");
  }
  return "";
}

export type HeadingItem = {
  id: string;
  text: string;
  level: number;
};

export function extractHeadings(doc: RichDoc | null | undefined): HeadingItem[] {
  const headings: HeadingItem[] = [];
  if (!doc || !Array.isArray(doc.content)) return headings;
  const seen = new Map<string, number>();

  for (const node of doc.content) {
    if (node.type === "heading") {
      const level = typeof node.attrs?.level === "number" ? node.attrs.level : 2;
      const text = getNodeText(node).trim();
      if (!text) continue;
      const baseId = slugifyText(text);
      let id = baseId;
      const count = seen.get(baseId) ?? 0;
      if (count > 0) {
        id = `${baseId}-${count}`;
      }
      seen.set(baseId, count + 1);
      headings.push({ id, text, level });
    }
  }
  return headings;
}

function renderMarks(text: string, marks?: RichMark[]): React.ReactNode {
  if (!marks || marks.length === 0) return text;

  let current: React.ReactNode = text;

  for (const mark of marks) {
    if (mark.type === "bold") {
      current = <strong>{current}</strong>;
    } else if (mark.type === "italic") {
      current = <em className="italic hi:not-italic">{current}</em>;
    } else if (mark.type === "link" && mark.attrs?.href) {
      const href = mark.attrs.href;
      const isExternal = href.startsWith("http://") || href.startsWith("https://");
      current = (
        <a
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="text-em5 underline decoration-em5/40 underline-offset-2 transition-colors hover:text-em7 hover:decoration-em7"
        >
          {current}
        </a>
      );
    }
  }

  return current;
}

type RenderContext = {
  headingIndex: { current: number };
  headingMap: HeadingItem[];
};

function renderNode(node: RichNode, index: number, ctx: RenderContext): React.ReactNode {
  switch (node.type) {
    case "text":
      return (
        <React.Fragment key={index}>
          {renderMarks(node.text || "", node.marks)}
        </React.Fragment>
      );

    case "paragraph": {
      const children = node.content?.map((child, i) => renderNode(child, i, ctx));
      return (
        <p key={index} className="mb-4 text-[16.5px] leading-[1.8] text-ink/90 font-sans">
          {children}
        </p>
      );
    }

    case "heading": {
      const level = typeof node.attrs?.level === "number" ? node.attrs.level : 2;
      const headingItem = ctx.headingMap[ctx.headingIndex.current];
      ctx.headingIndex.current += 1;
      const id = headingItem ? headingItem.id : undefined;
      const children = node.content?.map((child, i) => renderNode(child, i, ctx));

      if (level === 3) {
        return (
          <h3
            key={index}
            id={id}
            className="mt-8 mb-3 font-display text-[20px] md:text-[23px] font-normal leading-snug text-em9 scroll-mt-24"
          >
            {children}
          </h3>
        );
      }

      return (
        <h2
          key={index}
          id={id}
          className="mt-10 mb-4 font-display text-[25px] md:text-[29px] font-normal leading-tight text-em9 scroll-mt-24"
        >
          {children}
        </h2>
      );
    }

    case "bulletList":
      return (
        <ul key={index} className="mb-6 list-disc pl-6 space-y-2 text-[16px] leading-[1.75] text-ink/90">
          {node.content?.map((child, i) => renderNode(child, i, ctx))}
        </ul>
      );

    case "orderedList":
      return (
        <ol key={index} className="mb-6 list-decimal pl-6 space-y-2 text-[16px] leading-[1.75] text-ink/90">
          {node.content?.map((child, i) => renderNode(child, i, ctx))}
        </ol>
      );

    case "listItem":
      return (
        <li key={index} className="pl-1">
          {node.content?.map((child, i) => renderNode(child, i, ctx))}
        </li>
      );

    case "blockquote":
      return (
        <blockquote
          key={index}
          className="my-6 border-l-2 border-em5 pl-5 py-2 italic hi:not-italic font-display text-[18px] leading-relaxed text-em9/90 bg-cream/40 rounded-r"
        >
          {node.content?.map((child, i) => renderNode(child, i, ctx))}
        </blockquote>
      );

    case "horizontalRule":
      return <hr key={index} className="my-8 border-0 border-t border-s2" />;

    case "hardBreak":
      return <br key={index} />;

    case "image": {
      const src = typeof node.attrs?.src === "string" ? node.attrs.src : "";
      const alt = typeof node.attrs?.alt === "string" ? node.attrs.alt : "";
      const title = typeof node.attrs?.title === "string" ? node.attrs.title : undefined;
      if (!src) return null;
      return (
        <figure key={index} className="my-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            title={title}
            loading="lazy"
            className="w-full h-auto rounded-field border border-s2/60 object-cover max-h-[500px]"
          />
          {alt ? (
            <figcaption className="mt-2 text-center font-sans text-[13px] text-ink6">
              {alt}
            </figcaption>
          ) : null}
        </figure>
      );
    }

    default:
      return null;
  }
}

export type RichTextProps = {
  doc: RichDoc | null | undefined;
  className?: string;
};

export function RichText({ doc, className }: RichTextProps): React.JSX.Element {
  if (!doc || !Array.isArray(doc.content) || doc.content.length === 0) {
    return <div className={cn("max-w-[680px] w-full text-ink", className)} />;
  }

  const headingMap = extractHeadings(doc);
  const ctx: RenderContext = {
    headingIndex: { current: 0 },
    headingMap,
  };

  return (
    <article
      className={cn(
        "max-w-[680px] w-full text-ink font-sans leading-relaxed text-pretty",
        className,
      )}
    >
      {doc.content.map((node, i) => renderNode(node, i, ctx))}
    </article>
  );
}
