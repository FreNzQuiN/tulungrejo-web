"use client";

import { useState, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  List,
  ListOrdered,
  Quote,
  Link,
  Code,
} from "lucide-react";
import { wrapWith, insertLinePrefix } from "@/lib/markdown-utils";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

type Mode = "edit" | "preview";

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const [mode, setMode] = useState<Mode>("edit");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyStyle = useCallback(
    (
      fn: (
        text: string,
        start: number,
        end: number,
      ) => { newText: string; cursorPos: number },
    ) => {
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const result = fn(value, start, end);
      onChange(result.newText);
      requestAnimationFrame(() => {
        ta.focus();
        ta.setSelectionRange(result.cursorPos, result.cursorPos);
      });
    },
    [value, onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === "b") {
        e.preventDefault();
        applyStyle((t, s, e) => wrapWith(t, s, e, "**", "**"));
      } else if (ctrl && e.key === "i") {
        e.preventDefault();
        applyStyle((t, s, e) => wrapWith(t, s, e, "*", "*"));
      } else if (ctrl && e.key === "k") {
        e.preventDefault();
        applyStyle((t, s, e) => {
          const sel = t.slice(s, e);
          if (s === e)
            return {
              newText: t.slice(0, s) + "[](url)" + t.slice(e),
              cursorPos: s + 1,
            };
          return {
            newText: t.slice(0, s) + `[${sel}](url)` + t.slice(e),
            cursorPos: s + sel.length + 3,
          };
        });
      } else if (ctrl && e.shiftKey && e.key === "`") {
        e.preventDefault();
        applyStyle((t, s, e) => wrapWith(t, s, e, "`", "`"));
      }
    },
    [applyStyle],
  );

  return (
    <div className="md-editor">
      <div className="md-editor-tab-bar">
        <button
          className={`md-editor-tab${mode === "edit" ? " md-editor-tab-active" : ""}`}
          onClick={() => setMode("edit")}
          type="button"
        >
          Edit
        </button>
        <button
          className={`md-editor-tab${mode === "preview" ? " md-editor-tab-active" : ""}`}
          onClick={() => setMode("preview")}
          type="button"
        >
          Preview
        </button>
      </div>

      {mode === "edit" && (
        <>
          <div className="md-editor-toolbar">
            <ToolbarButton
              icon={<Bold size={14} />}
              label="Bold"
              shortcut="Ctrl+B"
              onClick={() =>
                applyStyle((t, s, e) => wrapWith(t, s, e, "**", "**"))
              }
            />
            <ToolbarButton
              icon={<Italic size={14} />}
              label="Italic"
              shortcut="Ctrl+I"
              onClick={() =>
                applyStyle((t, s, e) => wrapWith(t, s, e, "*", "*"))
              }
            />
            <div className="md-editor-divider" />
            <ToolbarButton
              icon={<Heading1 size={14} />}
              label="Heading 1"
              onClick={() =>
                applyStyle((t, s, e) => insertLinePrefix(t, s, e, "# "))
              }
            />
            <ToolbarButton
              icon={<Heading2 size={14} />}
              label="Heading 2"
              onClick={() =>
                applyStyle((t, s, e) => insertLinePrefix(t, s, e, "## "))
              }
            />
            <ToolbarButton
              icon={<Heading3 size={14} />}
              label="Heading 3"
              onClick={() =>
                applyStyle((t, s, e) => insertLinePrefix(t, s, e, "### "))
              }
            />
            <ToolbarButton
              icon={<Heading4 size={14} />}
              label="Heading 4"
              onClick={() =>
                applyStyle((t, s, e) => insertLinePrefix(t, s, e, "#### "))
              }
            />
            <ToolbarButton
              icon={<Heading5 size={14} />}
              label="Heading 5"
              onClick={() =>
                applyStyle((t, s, e) => insertLinePrefix(t, s, e, "##### "))
              }
            />
            <ToolbarButton
              icon={<Heading6 size={14} />}
              label="Heading 6"
              onClick={() =>
                applyStyle((t, s, e) => insertLinePrefix(t, s, e, "###### "))
              }
            />
            <div className="md-editor-divider" />
            <ToolbarButton
              icon={<List size={14} />}
              label="Bullet list"
              onClick={() =>
                applyStyle((t, s, e) => insertLinePrefix(t, s, e, "- "))
              }
            />
            <ToolbarButton
              icon={<ListOrdered size={14} />}
              label="Numbered list"
              onClick={() =>
                applyStyle((t, s, e) => insertLinePrefix(t, s, e, "1. "))
              }
            />
            <ToolbarButton
              icon={<Quote size={14} />}
              label="Blockquote"
              onClick={() =>
                applyStyle((t, s, e) => insertLinePrefix(t, s, e, "> "))
              }
            />
            <div className="md-editor-divider" />
            <ToolbarButton
              icon={<Link size={14} />}
              label="Link"
              shortcut="Ctrl+K"
              onClick={() =>
                applyStyle((t, s, e) => {
                  const sel = t.slice(s, e);
                  if (s === e)
                    return {
                      newText: t.slice(0, s) + "[](url)" + t.slice(e),
                      cursorPos: s + 1,
                    };
                  return {
                    newText: t.slice(0, s) + `[${sel}](url)` + t.slice(e),
                    cursorPos: s + sel.length + 3,
                  };
                })
              }
            />
            <ToolbarButton
              icon={<Code size={14} />}
              label="Code"
              shortcut="Ctrl+Shift+`"
              onClick={() =>
                applyStyle((t, s, e) => wrapWith(t, s, e, "`", "`"))
              }
            />
          </div>

          <textarea
            ref={textareaRef}
            className="form-textarea md-editor-textarea"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tulis konten artikel dalam format Markdown..."
            rows={12}
          />
        </>
      )}

      {mode === "preview" && (
        <div className="md-editor-preview prose max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {value || "*Belum ada konten*"}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}

function ToolbarButton({
  icon,
  label,
  shortcut,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  onClick: () => void;
}) {
  return (
    <button
      className="md-editor-toolbar-btn"
      onClick={onClick}
      title={shortcut ? `${label} (${shortcut})` : label}
      type="button"
    >
      {icon}
    </button>
  );
}
