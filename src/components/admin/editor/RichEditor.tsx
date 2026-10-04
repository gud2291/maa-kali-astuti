"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { LinkDialog } from "./LinkDialog";
import { useUpload } from "@/components/media/useUpload";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { toast } from "@/components/admin/ui/toast";
import { cn } from "@/lib/utils/cn";
import type { RichDoc } from "@/lib/domain/types";

export type RichEditorProps = {
  value: RichDoc | null | undefined;
  onChange: (value: RichDoc) => void;
  mediaBase?: string;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
};

export function RichEditor({
  value,
  onChange,
  mediaBase,
  disabled = false,
  className,
  placeholder,
}: RichEditorProps): React.JSX.Element {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { state: uploadState, upload } = useUpload("article");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        strike: false,
        underline: false,
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
      }),
    ],
    immediatelyRender: false,
    content: value || { type: "doc", content: [] },
    editable: !disabled,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getJSON() as RichDoc);
    },
  });

  // Keep editor content in sync when value changes externally (e.g. form reset or tab change)
  useEffect(() => {
    if (!editor || !value) return;
    if (!editor.isFocused) {
      const currentJson = JSON.stringify(editor.getJSON());
      const nextJson = JSON.stringify(value);
      if (currentJson !== nextJson) {
        editor.commands.setContent(value);
      }
    }
  }, [editor, value]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [editor, disabled]);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
      const file = e.target.files?.[0];
      if (!file || !editor) return;

      try {
        const res = await upload(file);
        if (res && res.media?.src) {
          const src = res.media.src;
          editor.chain().focus().setImage({ src, alt: file.name.replace(/\.[^/.]+$/, "") }).run();
          toast.ok("Image inserted into editor");
        } else {
          toast.err("Failed to upload image");
        }
      } catch {
        toast.err("Image upload failed");
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [editor, upload],
  );

  const openLinkDialog = useCallback((): void => {
    if (!editor) return;
    setLinkDialogOpen(true);
  }, [editor]);

  const handleSaveLink = useCallback(
    (href: string): void => {
      if (!editor) return;
      if (href) {
        editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
      } else {
        editor.chain().focus().extendMarkRange("link").unsetLink().run();
      }
    },
    [editor],
  );

  const handleRemoveLink = useCallback((): void => {
    if (!editor) return;
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
  }, [editor]);

  if (!editor) {
    return (
      <div className="min-h-[280px] rounded-btn border border-s2 bg-iv p-4 animate-pulse" />
    );
  }

  const currentLinkHref = (editor.getAttributes("link").href as string) || "";

  return (
    <div
      className={cn(
        "rounded-btn border border-s2 bg-iv shadow-xs focus-within:border-em5 transition-colors overflow-hidden",
        disabled && "opacity-60 pointer-events-none",
        className,
      )}
    >
      {/* Sticky Toolbar on mobile */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b border-s2 bg-cream/90 px-2 py-1.5 backdrop-blur-xs">
        {/* H2 */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn(
            "grid size-11 min-w-[44px] min-h-[44px] place-items-center rounded-btn font-sans text-[14px] font-bold transition-colors",
            editor.isActive("heading", { level: 2 })
              ? "bg-em1 text-em9 shadow-xs"
              : "text-ink6 hover:bg-em1/50 hover:text-ink",
          )}
          aria-label="Heading 2"
          title="Heading 2"
        >
          H2
        </button>

        {/* H3 */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={cn(
            "grid size-11 min-w-[44px] min-h-[44px] place-items-center rounded-btn font-sans text-[13px] font-semibold transition-colors",
            editor.isActive("heading", { level: 3 })
              ? "bg-em1 text-em9 shadow-xs"
              : "text-ink6 hover:bg-em1/50 hover:text-ink",
          )}
          aria-label="Heading 3"
          title="Heading 3"
        >
          H3
        </button>

        <span className="mx-0.5 h-6 w-px bg-s2" aria-hidden="true" />

        {/* Bold */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            "grid size-11 min-w-[44px] min-h-[44px] place-items-center rounded-btn font-sans text-[15px] font-bold transition-colors",
            editor.isActive("bold")
              ? "bg-em1 text-em9 shadow-xs"
              : "text-ink6 hover:bg-em1/50 hover:text-ink",
          )}
          aria-label="Bold"
          title="Bold"
        >
          B
        </button>

        {/* Italic */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            "grid size-11 min-w-[44px] min-h-[44px] place-items-center rounded-btn font-sans text-[15px] italic font-serif transition-colors",
            editor.isActive("italic")
              ? "bg-em1 text-em9 shadow-xs"
              : "text-ink6 hover:bg-em1/50 hover:text-ink",
          )}
          aria-label="Italic"
          title="Italic"
        >
          I
        </button>

        {/* Link */}
        <button
          type="button"
          onClick={openLinkDialog}
          className={cn(
            "grid size-11 min-w-[44px] min-h-[44px] place-items-center rounded-btn transition-colors",
            editor.isActive("link")
              ? "bg-em1 text-em9 shadow-xs"
              : "text-ink6 hover:bg-em1/50 hover:text-ink",
          )}
          aria-label="Insert link"
          title="Insert link"
        >
          <AdminIcon name="link" className="size-4" />
        </button>

        <span className="mx-0.5 h-6 w-px bg-s2" aria-hidden="true" />

        {/* Bullets */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(
            "grid size-11 min-w-[44px] min-h-[44px] place-items-center rounded-btn transition-colors",
            editor.isActive("bulletList")
              ? "bg-em1 text-em9 shadow-xs"
              : "text-ink6 hover:bg-em1/50 hover:text-ink",
          )}
          aria-label="Bullet list"
          title="Bullet list"
        >
          <span className="text-[16px] leading-none">•—</span>
        </button>

        {/* Numbers */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(
            "grid size-11 min-w-[44px] min-h-[44px] place-items-center rounded-btn font-sans text-[13px] font-medium transition-colors",
            editor.isActive("orderedList")
              ? "bg-em1 text-em9 shadow-xs"
              : "text-ink6 hover:bg-em1/50 hover:text-ink",
          )}
          aria-label="Numbered list"
          title="Numbered list"
        >
          1.
        </button>

        {/* Quote */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn(
            "grid size-11 min-w-[44px] min-h-[44px] place-items-center rounded-btn font-serif text-[18px] transition-colors",
            editor.isActive("blockquote")
              ? "bg-em1 text-em9 shadow-xs"
              : "text-ink6 hover:bg-em1/50 hover:text-ink",
          )}
          aria-label="Blockquote"
          title="Blockquote"
        >
          “
        </button>

        {/* Divider */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="grid size-11 min-w-[44px] min-h-[44px] place-items-center rounded-btn text-ink6 hover:bg-em1/50 hover:text-ink transition-colors font-mono text-[14px]"
          aria-label="Divider"
          title="Divider"
        >
          —
        </button>

        <span className="mx-0.5 h-6 w-px bg-s2" aria-hidden="true" />

        {/* Image upload */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadState.status === "uploading" || uploadState.status === "preparing"}
          className="grid size-11 min-w-[44px] min-h-[44px] place-items-center rounded-btn text-ink6 hover:bg-em1/50 hover:text-ink transition-colors disabled:opacity-50"
          aria-label="Insert image"
          title="Insert image"
        >
          <AdminIcon name="camera" className="size-4" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <span className="mx-0.5 h-6 w-px bg-s2" aria-hidden="true" />

        {/* Undo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="grid size-11 min-w-[44px] min-h-[44px] place-items-center rounded-btn text-ink6 hover:bg-em1/50 hover:text-ink transition-colors disabled:opacity-30"
          aria-label="Undo"
          title="Undo"
        >
          <AdminIcon name="arrowL" className="size-4" />
        </button>

        {/* Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="grid size-11 min-w-[44px] min-h-[44px] place-items-center rounded-btn text-ink6 hover:bg-em1/50 hover:text-ink transition-colors disabled:opacity-30"
          aria-label="Redo"
          title="Redo"
        >
          <AdminIcon name="arrowR" className="size-4" />
        </button>

        {uploadState.status === "uploading" && (
          <span className="ml-auto font-sans text-[12px] text-em5 font-medium animate-pulse">
            Uploading ({uploadState.progress}%)…
          </span>
        )}
      </div>

      {/* Editor Content Area */}
      <div className="p-4 min-h-[280px] bg-iv">
        <EditorContent
          editor={editor}
          className="tiptap-content focus:outline-none min-h-[250px] font-sans text-[15px] leading-relaxed text-ink [&_.ProseMirror]:outline-none [&_h2]:font-display [&_h2]:text-[22px] [&_h2]:font-semibold [&_h2]:text-em9 [&_h2]:mt-5 [&_h2]:mb-2 [&_h3]:font-display [&_h3]:text-[18px] [&_h3]:font-semibold [&_h3]:text-em9 [&_h3]:mt-4 [&_h3]:mb-1.5 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_li]:mb-1 [&_blockquote]:border-l-2 [&_blockquote]:border-em5 [&_blockquote]:pl-4 [&_blockquote]:py-1 [&_blockquote]:italic [&_blockquote]:my-3 [&_blockquote]:text-em9 [&_blockquote]:bg-cream/40 [&_hr]:border-0 [&_hr]:border-t [&_hr]:border-s2 [&_hr]:my-4 [&_img]:rounded-field [&_img]:border [&_img]:border-s2 [&_img]:my-3 [&_img]:max-h-[300px] [&_img]:w-auto [&_a]:text-em5 [&_a]:underline"
        />
      </div>

      {/* Link Dialog */}
      <LinkDialog
        open={linkDialogOpen}
        onOpenChange={setLinkDialogOpen}
        initialHref={currentLinkHref}
        onSave={handleSaveLink}
        onRemove={handleRemoveLink}
      />
    </div>
  );
}
