import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { getChapter, updateChapter, type ChapterDetail } from "@/api/chapter";

function countWords(text: string): number {
  // 中文按字符数，英文按空格分词
  const cn = text.replace(/[\x00-\xff]/g, "");
  const en = text.replace(/[^\x00-\xff]/g, " ").trim();
  const enWords = en ? en.split(/\s+/).length : 0;
  return cn.length + enWords;
}

export function Write() {
  const [searchParams] = useSearchParams();
  const chapterId = searchParams.get("chapter");
  const navigate = useNavigate();
  const [chapter, setChapter] = useState<ChapterDetail | null>(null);
  const [loading, setLoading] = useState(!!chapterId);
  const [wordCount, setWordCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: "开始书写你的故事...",
      }),
    ],
    editorProps: {
      attributes: {
        class: "tiptap-editor outline-none max-w-3xl mx-auto py-12 px-6",
        style: "min-height: 60vh; font-size: 1.05rem; line-height: 2;",
      },
    },
    onUpdate: ({ editor: ed }) => {
      const text = ed.getText();
      setWordCount(countWords(text));
      // 自动保存（2秒防抖）
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => handleAutoSave(ed.getHTML()), 2000);
    },
  });

  // 加载章节内容
  useEffect(() => {
    if (!chapterId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getChapter(chapterId)
      .then((ch) => {
        setChapter(ch);
        if (editor && ch.content) {
          editor.commands.setContent(ch.content);
        }
      })
      .finally(() => setLoading(false));
  }, [chapterId]);

  // 当编辑器就绪且章节内容加载后设置内容
  useEffect(() => {
    if (editor && chapter?.content) {
      editor.commands.setContent(chapter.content);
      setWordCount(countWords(editor.getText()));
    }
  }, [editor, chapter]);

  const handleAutoSave = useCallback(
    async (html: string) => {
      if (!chapterId) return;
      setSaving(true);
      try {
        const newCount = countWords(editor?.getText() ?? "");
        await updateChapter(chapterId, {
          content: html,
          actualWordCount: newCount,
          status: "DRAFTING",
        });
        setLastSaved(new Date());
      } catch {
        // 静默处理
      } finally {
        setSaving(false);
      }
    },
    [chapterId, editor],
  );

  // 手动保存 (Ctrl+S)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (editor) handleAutoSave(editor.getHTML());
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editor, handleAutoSave]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center" style={{ backgroundColor: "var(--bg-primary)" }}>
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" style={{ color: "var(--text-secondary)" }} />
      </div>
    );
  }

  if (!chapterId || !chapter) {
    return (
      <div className="flex h-full flex-col items-center justify-center" style={{ backgroundColor: "var(--bg-primary)" }}>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>从左侧选择或创建一个章节开始写作</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: "var(--bg-primary)" }}>
      {/* 顶部工具栏 */}
      <div className="flex items-center gap-4 px-6 py-3" style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--surface)" }}>
        <button
          onClick={() => navigate(-1)}
          className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:brightness-90"
          style={{ backgroundColor: "var(--bg-secondary)" }}
        >
          <ArrowLeft size={16} />
        </button>

        <div className="flex-1">
          <h2 className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
            {chapter.chapterNumber} · {chapter.title}
          </h2>
        </div>

        <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-secondary)" }}>
          <span>{wordCount.toLocaleString()} 字</span>
          {saving ? (
            <span style={{ color: "var(--accent)" }}>保存中...</span>
          ) : lastSaved ? (
            <span>已保存 {lastSaved.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}</span>
          ) : null}
          <span className="rounded px-2 py-0.5" style={{ backgroundColor: "var(--bg-secondary)" }}>
            Ctrl+S 保存
          </span>
        </div>
      </div>

      {/* 编辑器 */}
      <div className="flex-1 overflow-auto" style={{ backgroundColor: "var(--bg-editor)" }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
