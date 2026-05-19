import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Search as SearchIcon, FileText, Users, MapPin, Building2, Package, ListTree } from "lucide-react";
import { search, type SearchResult } from "@/api/search";
import { ProjectSelector } from "@/components/shared/ProjectSelector";

const typeCfg: Record<string, { icon: React.ComponentType<{ size?: number }>; label: string; color: string }> = {
  chapter:    { icon: FileText,   label: "章节", color: "#4a9eff" },
  character:  { icon: Users,      label: "人物", color: "#e8a87c" },
  location:   { icon: MapPin,     label: "地点", color: "#6cc070" },
  faction:    { icon: Building2,  label: "势力", color: "#c1554b" },
  item:       { icon: Package,    label: "物品", color: "#f0c75e" },
  outline:    { icon: ListTree,   label: "大纲", color: "#9b7ec4" },
};

export function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const projectId = searchParams.get("project") || "";
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
const doSearch = useCallback(async (q: string, pid: string) => {
    if (!q.trim() || !pid) { setResults([]); return; }
    setLoading(true);
    try { setResults(await search(pid, q.trim())); }
    catch { setResults([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query, projectId), 300);
    return () => clearTimeout(timer);
  }, [query, projectId, doSearch]);

  if (!projectId) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4" style={{ backgroundColor: "var(--bg-primary)" }}>
        <SearchIcon size={48} style={{ color: "var(--text-secondary)", opacity: 0.4 }} />
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>选择一个作品以搜索</p>
        <ProjectSelector value="" onChange={(id) => setSearchParams({ project: id })}
          className="rounded-md px-3 py-2 text-sm outline-none"
          style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
      </div>
    );
  }

  const grouped = new Map<string, SearchResult[]>();
  for (const r of results) {
    const list = grouped.get(r.type) || [];
    list.push(r);
    grouped.set(r.type, list);
  }

  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: "var(--bg-primary)" }}>
      <div className="px-8 py-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-secondary)" }} />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索章节、人物、地点、势力、物品、大纲..."
              className="w-full rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none"
              style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            />
          </div>
          <ProjectSelector value={projectId} onChange={(id) => setSearchParams({ project: id })}
            className="rounded-md px-3 py-2 text-xs outline-none"
            style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
        </div>
      </div>

      <div className="flex-1 overflow-auto px-8 pb-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" style={{ color: "var(--text-secondary)" }} />
          </div>
        ) : !query.trim() ? (
          <div className="flex flex-col items-center justify-center py-20">
            <SearchIcon size={48} style={{ color: "var(--text-secondary)", opacity: 0.3 }} />
            <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>输入关键词开始搜索</p>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <SearchIcon size={48} style={{ color: "var(--text-secondary)", opacity: 0.3 }} />
            <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>没有找到相关结果</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Array.from(grouped.entries()).map(([type, items]) => {
              const cfg = typeCfg[type] || typeCfg.chapter;
              const Icon = cfg.icon;
              return (
                <div key={type}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={14} style={{ color: cfg.color }} />
                    <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{cfg.label}</span>
                    <span className="text-[10px] rounded px-1.5 py-0.5" style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)" }}>{items.length}</span>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {items.map((r) => (
                      <div key={r.id} className="rounded-lg p-3 hover:brightness-95 transition-all"
                        style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium flex-1" style={{ color: "var(--text-primary)" }}>{r.title}</h3>
                          {r.subtitle && <span className="text-[10px] rounded px-1.5 py-0.5" style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)" }}>{r.subtitle}</span>}
                        </div>
                        {r.excerpt && <p className="text-xs mt-1.5 leading-relaxed" style={{ color: "var(--text-secondary)", opacity: 0.7 }}>{r.excerpt}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
