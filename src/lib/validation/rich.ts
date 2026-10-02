import { z } from "zod";
import type { RichDoc, RichNode, RichMark } from "@/lib/domain/types";

export const EMPTY_RICH_DOC: RichDoc = { type: "doc", content: [] };

export const richMarkSchema: z.ZodType<RichMark> = z
  .object({
    type: z.enum(["bold", "italic", "link"]),
    attrs: z
      .object({
        href: z.string().refine(
          (val) =>
            val.startsWith("https://") ||
            val.startsWith("http://") ||
            val.startsWith("mailto:") ||
            val.startsWith("/"),
          { message: "Link href must start with https://, http://, mailto:, or /" },
        ),
      })
      .passthrough()
      .optional(),
  })
  .superRefine((mark, ctx) => {
    if (mark.type === "link" && (!mark.attrs || !mark.attrs.href)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Link mark must have a valid href",
      });
    }
  });

function countNodes(node: RichNode): number {
  let count = 1;
  if (Array.isArray(node.content)) {
    for (const child of node.content) {
      count += countNodes(child);
    }
  }
  return count;
}

export function richNodeSchema(mediaBase: string): z.ZodType<RichNode> {
  return z.lazy(() =>
    z
      .object({
        type: z.enum([
          "paragraph",
          "heading",
          "bulletList",
          "orderedList",
          "listItem",
          "blockquote",
          "horizontalRule",
          "image",
          "text",
          "hardBreak",
        ]),
        attrs: z.record(z.string(), z.union([z.string(), z.number(), z.null()])).optional(),
        content: z.array(richNodeSchema(mediaBase)).optional(),
        text: z.string().optional(),
        marks: z.array(richMarkSchema).optional(),
      })
      .superRefine((node, ctx) => {
        if (node.type === "heading") {
          const level = node.attrs?.level;
          if (level !== 2 && level !== 3) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Heading level must be 2 or 3",
            });
          }
        } else if (node.type === "image") {
          const src = node.attrs?.src;
          if (typeof src !== "string" || (mediaBase && !src.startsWith(mediaBase))) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Image src must start with ${mediaBase}`,
            });
          }
        }
      }),
  );
}

export function richDocSchema(mediaBase: string): z.ZodType<RichDoc> {
  const nodeSchema = richNodeSchema(mediaBase);
  return z
    .object({
      type: z.literal("doc"),
      content: z.array(nodeSchema).default([]),
    })
    .superRefine((doc, ctx) => {
      let total = 0;
      if (Array.isArray(doc.content)) {
        for (const node of doc.content) {
          total += countNodes(node);
          if (total > 2000) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Document exceeds maximum of 2000 nodes",
            });
            break;
          }
        }
      }
    });
}
