import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Search, Trash2, Users, X } from "lucide-react";
import { listProjects, type Project } from "@/api/project";
import {
  listCharacters, createCharacter, getCharacter, updateCharacter, deleteCharacter,
  type CharacterBrief, type CharacterDetail,
} from "@/api/character";
import { ProjectSelector } from "@/components/shared/ProjectSelector";
import { useProjectStore } from "@/stores/project";

type Section = "basic" | "appearance" | "personality" | "background" | "speech" | "arc" | "meta";

const sectionDefs: { key: Section; label: string }[] = [
  { key: "basic", label: "基本信息" },
  { key: "appearance", label: "外貌" },
  { key: "personality", label: "性格" },
  { key: "background", label: "背景" },
  { key: "speech", label: "语言习惯" },
  { key: "arc", label: "角色弧光" },
  { key: "meta", label: "元数据" },
];

const importanceStars = [1, 2, 3, 4, 5];

function Field({ label, value, onChange, type = "text", placeholder, rows }: {
  label: string; value: string | undefined | null; onChange: (v: string) => void;
  type?: string; placeholder?: string; rows?: number;
}) {
  const cls = "w-full rounded-md px-3 py-1.5 text-xs outline-none";
  const style = { backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" };
  return (
    <div>
      <label className="block text-[11px] font-medium mb-1" style={{ color: "var(--text-secondary)" }}>{label}</label>
      {rows
        ? <textarea value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} className={cls + " resize-none"} style={style} />
        : <input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cls} style={style} />
      }
    </div>
  );
}

function TagInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const tags: string[] = (() => { try { return JSON.parse(value || "[]"); } catch { return []; } })();
  const [input, setInput] = useState("");
  const add = () => {
    if (!input.trim()) return;
    onChange(JSON.stringify([...tags, input.trim()]));
    setInput("");
  };
  return (
    <div>
      <label className="block text-[11px] font-medium mb-1" style={{ color: "var(--text-secondary)" }}>{label}</label>
      <div className="flex flex-wrap gap-1 mb-1">
        {tags.map((t, i) => (
          <span key={i} className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px]"
            style={{ backgroundColor: "var(--accent)" + "22", color: "var(--accent)" }}>
            {t}
            <button onClick={() => onChange(JSON.stringify(tags.filter((_, j) => j !== i)))}><X size={10} /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-1">
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder="添加..." className="flex-1 rounded-md px-2 py-1 text-xs outline-none"
          style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
        />
        <button onClick={add} className="rounded-md px-2 py-1 text-xs" style={{ backgroundColor: "var(--accent)", color: "#fff" }}>+</button>
      </div>
    </div>
  );
}

function CharacterForm({ character, onSave, onCancel }: {
  character: CharacterDetail | null;
  onSave: (data: Partial<CharacterDetail>) => Promise<void>;
  onCancel: () => void;
}) {
  const [data, setData] = useState<Partial<CharacterDetail>>(character || { name: "" });
  const [section, setSection] = useState<Section>("basic");
  const [saving, setSaving] = useState(false);

  useEffect(() => { setData(character || { name: "" }); setSection("basic"); }, [character]);

  const set = (k: string, v: any) => setData((prev) => ({ ...prev, [k]: v }));

  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: "var(--surface)" }}>
      <div className="flex flex-wrap gap-1 p-3" style={{ borderBottom: "1px solid var(--glass-border)" }}>
        {sectionDefs.map((s) => (
          <button key={s.key} onClick={() => setSection(s.key)}
            className="rounded-md px-3 py-1 text-xs transition-colors"
            style={{ backgroundColor: section === s.key ? "var(--accent)" : "transparent", color: section === s.key ? "#fff" : "var(--text-secondary)" }}
          >{s.label}</button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-3">
        {section === "basic" && (
          <div className="flex flex-col gap-3">
            <Field label="角色名 *" value={data.name} onChange={(v) => set("name", v)} placeholder="角色名" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="性别" value={data.gender} onChange={(v) => set("gender", v)} placeholder="男/女/其他" />
              <Field label="表面年龄" value={data.apparentAge?.toString()} onChange={(v) => set("apparentAge", v ? parseInt(v) : null)} type="number" />
              <Field label="实际年龄" value={data.actualAge?.toString()} onChange={(v) => set("actualAge", v ? parseInt(v) : null)} type="number" />
              <Field label="生日" value={data.birthday} onChange={(v) => set("birthday", v)} placeholder="如：春分" />
              <Field label="种族" value={data.species} onChange={(v) => set("species", v)} />
              <Field label="国籍/出身" value={data.nationality} onChange={(v) => set("nationality", v)} />
              <Field label="社会阶层" value={data.socialClass} onChange={(v) => set("socialClass", v)} />
              <div>
                <label className="block text-[11px] font-medium mb-1" style={{ color: "var(--text-secondary)" }}>角色状态</label>
                <select value={data.characterStatus || "ALIVE"} onChange={(e) => set("characterStatus", e.target.value)}
                  className="w-full rounded-md px-3 py-1.5 text-xs outline-none"
                  style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                  <option value="ALIVE">在世</option><option value="DEAD">已故</option>
                  <option value="MISSING">失踪</option><option value="PRESUMED_DEAD">推测已故</option>
                </select>
              </div>
              <Field label="故事角色" value={data.roleInStory} onChange={(v) => set("roleInStory", v)} placeholder="主角/反派/配角..." />
            </div>
            <Field label="职业" value={data.occupations} onChange={(v) => set("occupations", v)} placeholder='JSON数组: ["剑士","药师"]' />
            <TagInput label="标签" value={data.tags || "[]"} onChange={(v) => set("tags", v)} />
            <TagInput label="归属群体" value={data.groups || "[]"} onChange={(v) => set("groups", v)} />
            <Field label="别名" value={data.aliases} onChange={(v) => set("aliases", v)} placeholder='JSON数组' />
          </div>
        )}

        {section === "appearance" && (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="身高" value={data.height} onChange={(v) => set("height", v)} placeholder="如: 175cm" />
              <Field label="体型" value={data.build} onChange={(v) => set("build", v)} />
              <Field label="肤色" value={data.skinTone} onChange={(v) => set("skinTone", v)} />
              <Field label="发色" value={data.hairColor} onChange={(v) => set("hairColor", v)} />
              <Field label="发型" value={data.hairStyle} onChange={(v) => set("hairStyle", v)} />
              <Field label="瞳色" value={data.eyeColor} onChange={(v) => set("eyeColor", v)} />
            </div>
            <Field label="显著特征" value={data.distinguishingFeatures} onChange={(v) => set("distinguishingFeatures", v)} />
            <Field label="外貌描述" value={data.appearanceDesc} onChange={(v) => set("appearanceDesc", v)} rows={4} />
          </div>
        )}

        {section === "personality" && (
          <div className="flex flex-col gap-3">
            <Field label="性格类型" value={data.personalityType} onChange={(v) => set("personalityType", v)} placeholder="如: INTJ / 九型4号..." />
            <Field label="道德倾向" value={data.moralAlignment} onChange={(v) => set("moralAlignment", v)} placeholder="守序善良/混乱中立..." />
            <TagInput label="核心性格特质" value={data.coreTraits || "[]"} onChange={(v) => set("coreTraits", v)} />
            <TagInput label="美德/优点" value={data.virtues || "[]"} onChange={(v) => set("virtues", v)} />
            <TagInput label="缺点/弱点" value={data.flaws || "[]"} onChange={(v) => set("flaws", v)} />
          </div>
        )}

        {section === "background" && (
          <div className="flex flex-col gap-3">
            <Field label="童年经历" value={data.childhood} onChange={(v) => set("childhood", v)} rows={3} />
            <Field label="家庭背景" value={data.familyBackground} onChange={(v) => set("familyBackground", v)} rows={3} />
            <TagInput label="创伤经历" value={data.traumas || "[]"} onChange={(v) => set("traumas", v)} />
            <Field label="秘密" value={data.secrets} onChange={(v) => set("secrets", v)} rows={2} />
          </div>
        )}

        {section === "speech" && (
          <div className="flex flex-col gap-3">
            <Field label="口音/方言" value={data.speechDialect} onChange={(v) => set("speechDialect", v)} />
            <TagInput label="口头禅" value={data.catchphrases || "[]"} onChange={(v) => set("catchphrases", v)} />
            <TagInput label="小习惯/小动作" value={data.nervousHabits || "[]"} onChange={(v) => set("nervousHabits", v)} />
            <TagInput label="兴趣爱好" value={data.hobbies || "[]"} onChange={(v) => set("hobbies", v)} />
          </div>
        )}

        {section === "arc" && (
          <div className="flex flex-col gap-3">
            <Field label="弧光类型" value={data.arcType} onChange={(v) => set("arcType", v)} placeholder="成长/堕落/救赎/平弧..." />
            <Field label="起点状态" value={data.arcStartState} onChange={(v) => set("arcStartState", v)} rows={2} />
            <Field label="中点转折" value={data.arcMidpoint} onChange={(v) => set("arcMidpoint", v)} rows={2} />
            <Field label="终点状态" value={data.arcEndState} onChange={(v) => set("arcEndState", v)} rows={2} />
            <div>
              <label className="block text-[11px] font-medium mb-1" style={{ color: "var(--text-secondary)" }}>发展状态</label>
              <select value={data.developmentStatus || "CONCEPT"} onChange={(e) => set("developmentStatus", e.target.value)}
                className="w-full rounded-md px-3 py-1.5 text-xs outline-none"
                style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                <option value="CONCEPT">概念</option><option value="DEVELOPING">发展中</option>
                <option value="FLESHED_OUT">已丰满</option><option value="REVISING">修订中</option>
              </select>
            </div>
          </div>
        )}

        {section === "meta" && (
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-[11px] font-medium mb-1" style={{ color: "var(--text-secondary)" }}>重要程度</label>
              <div className="flex gap-1">
                {importanceStars.map((n) => (
                  <button key={n} onClick={() => set("importance", n)}
                    className="h-6 w-6 rounded text-xs"
                    style={{ backgroundColor: (data.importance || 3) >= n ? "var(--accent)" : "var(--bg-secondary)", color: (data.importance || 3) >= n ? "#fff" : "var(--text-secondary)" }}
                  >{n}</button>
                ))}
              </div>
            </div>
            <Field label="排序" value={data.sortOrder?.toString()} onChange={(v) => set("sortOrder", parseInt(v) || 0)} type="number" />
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 p-3" style={{ borderTop: "1px solid var(--glass-border)" }}>
        <button onClick={onCancel} className="rounded-md px-4 py-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>取消</button>
        <button onClick={async () => { setSaving(true); await onSave(data); setSaving(false); }}
          disabled={saving || !data.name}
          className="rounded-md px-4 py-1.5 text-xs font-medium"
          style={{ backgroundColor: "var(--accent)", color: "#fff", opacity: saving || !data.name ? 0.6 : 1 }}
        >{saving ? "保存中..." : character ? "保存" : "创建"}</button>
      </div>
    </div>
  );
}

export function Characters() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const globalProjectId = useProjectStore((s) => s.selectedProjectId);
  const projectId = globalProjectId || searchParams.get("project") || "";
  const [characters, setCharacters] = useState<CharacterBrief[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [character, setCharacter] = useState<CharacterDetail | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => { listProjects().then(setProjects).catch(() => {}); }, []);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    listCharacters(projectId).then(setCharacters).finally(() => setLoading(false));
  }, [projectId]);

  const fetchCharacter = async (id: string) => {
    setCreating(false);
    const ch = await getCharacter(id);
    setCharacter(ch);
    setSelectedId(id);
  };

  const refreshList = async () => {
    if (!projectId) return;
    const list = await listCharacters(projectId);
    setCharacters(list);
  };

  const handleCreate = async (data: Partial<CharacterDetail>) => {
    if (!projectId) return;
    // 过滤 null 值，创建接口不允许 null
    const clean = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== null)) as any;
    await createCharacter({ projectId, name: data.name || "未命名", ...clean });
    setCreating(false);
    refreshList();
  };

  const handleUpdate = async (data: Partial<CharacterDetail>) => {
    if (!selectedId) return;
    await updateCharacter(selectedId, data);
    const ch = await getCharacter(selectedId);
    setCharacter(ch);
    refreshList();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除吗？")) return;
    await deleteCharacter(id);
    if (selectedId === id) { setSelectedId(null); setCharacter(null); }
    refreshList();
  };

  const filtered = characters.filter((c) => {
    if (search && !c.name.includes(search) && !(c.roleInStory || "").includes(search)) return false;
    if (filterGroup) {
      const gs: string[] = (() => { try { return JSON.parse(c.groups || "[]"); } catch { return []; } })();
      if (!gs.includes(filterGroup)) return false;
    }
    return true;
  });

  const allGroups = [...new Set(characters.flatMap((c) => {
    try { return JSON.parse(c.groups || "[]") as string[]; } catch { return []; }
  }))];

  if (!projectId) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <Users size={48} style={{ color: "var(--text-secondary)", opacity: 0.4 }} />
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>选择一个作品以查看人物</p>
        <ProjectSelector value="" onChange={(id) => setSearchParams({ project: id })}
          className="rounded-md px-3 py-2 text-sm outline-none"
          style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* 左侧列表 */}
      <div className="flex w-72 flex-shrink-0 flex-col" style={{ borderRight: "1px solid var(--glass-border)" }}>
        <div className="p-4" style={{ borderBottom: "1px solid var(--glass-border)" }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              {projects.find((p) => p.id === projectId)?.title} · 人物
            </h2>
          </div>
          <div className="relative mb-2">
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2" style={{ color: "var(--text-secondary)" }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索..."
              className="w-full rounded-md pl-7 pr-2 py-1.5 text-xs outline-none"
              style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
          </div>
          {allGroups.length > 0 && (
            <select value={filterGroup} onChange={(e) => setFilterGroup(e.target.value)}
              className="w-full rounded-md px-2 py-1.5 text-xs outline-none"
              style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
              <option value="">全部群体</option>
              {allGroups.map((g) => (<option key={g} value={g}>{g}</option>))}
            </select>
          )}
        </div>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" style={{ color: "var(--text-secondary)" }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-4 text-center text-xs" style={{ color: "var(--text-secondary)" }}>暂无角色</div>
          ) : (
            filtered.map((c) => (
              <button key={c.id} onClick={() => fetchCharacter(c.id)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:brightness-95"
                style={{ backgroundColor: selectedId === c.id ? "var(--bg-secondary)" : "transparent", borderLeft: selectedId === c.id ? "2px solid var(--accent)" : "2px solid transparent" }}>
                <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium" style={{ backgroundColor: "var(--accent)", color: "#fff" }}>
                  {c.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="truncate text-sm" style={{ color: "var(--text-primary)" }}>{c.name}</div>
                  <div className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                    {[c.gender, c.roleInStory].filter(Boolean).join(" · ") || c.developmentStatus}
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {importanceStars.slice(0, c.importance || 3).map((_, i) => (
                    <div key={i} className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--accent)" }} />
                  ))}
                </div>
              </button>
            ))
          )}
        </div>

        <div className="p-3" style={{ borderTop: "1px solid var(--glass-border)" }}>
          <button onClick={() => { setCreating(true); setSelectedId(null); setCharacter(null); }}
            className="flex w-full items-center justify-center gap-1 rounded-md py-1.5 text-xs font-medium transition-all hover:scale-105"
            style={{ backgroundColor: "var(--accent)", color: "#fff" }}>
            <Plus size={14} />新建角色
          </button>
        </div>
      </div>

      {/* 右侧详情 */}
      <div className="flex-1 overflow-auto">
        {creating ? (
          <CharacterForm character={null} onSave={handleCreate} onCancel={() => setCreating(false)} />
        ) : character && selectedId ? (
          <div>
            <div className="flex items-center justify-between px-4 py-2" style={{ borderBottom: "1px solid var(--glass-border)" }}>
              <span className="text-xs" style={{ color: "var(--text-secondary)" }}>编辑角色</span>
              <button onClick={() => handleDelete(selectedId)}
                className="flex items-center gap-1 rounded px-2 py-1 text-xs hover:brightness-90" style={{ color: "#c1554b" }}>
                <Trash2 size={12} />删除
              </button>
            </div>
            <CharacterForm character={character} onSave={handleUpdate} onCancel={() => { setSelectedId(null); setCharacter(null); }} />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <Users size={48} style={{ color: "var(--text-secondary)", opacity: 0.2 }} />
              <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>选择一个角色或创建新角色</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
