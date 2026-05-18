import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Trash2, Globe, MapPin, Building2, Package, ChevronDown, ChevronRight } from "lucide-react";
import { listProjects, type Project } from "@/api/project";
import {
  listLocations, createLocation, updateLocation, deleteLocation, type LocationNode,
  listFactions, createFaction, updateFaction, deleteFaction, type FactionItem,
  listItems, createItem, updateItem, deleteItem, type ItemData,
} from "@/api/world";

type Tab = "locations" | "factions" | "items";

function LocNode({ node, depth, onDelete, onAdd, onEdit }: {
  node: LocationNode; depth: number;
  onDelete: (id: string) => void;
  onAdd: (parentId: string | null) => void;
  onEdit: (id: string, name: string) => void;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <div className="group flex items-center gap-1 rounded px-2 py-1 hover:brightness-95"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}>
        {node.children.length > 0 ? (
          <button onClick={() => setOpen(!open)} className="p-0.5">{open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}</button>
        ) : <span className="w-4" />}
        <span className="flex-1 text-sm" style={{ color: "var(--text-primary)" }}>{node.name}</span>
        {node.type && <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)" }}>{node.type}</span>}
        <div className="opacity-0 group-hover:opacity-100 flex gap-0.5">
          <button onClick={() => onAdd(node.id)} className="p-0.5"><Plus size={12} style={{ color: "var(--text-secondary)" }} /></button>
          <button onClick={() => onDelete(node.id)} className="p-0.5"><Trash2 size={12} style={{ color: "#c1554b" }} /></button>
        </div>
      </div>
      {open && node.children.map((ch) => (
        <LocNode key={ch.id} node={ch} depth={depth + 1} onDelete={onDelete} onAdd={onAdd} onEdit={onEdit} />
      ))}
    </div>
  );
}

export function World() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const projectId = searchParams.get("project");
  const [tab, setTab] = useState<Tab>("locations");
  const [loading, setLoading] = useState(false);

  // 数据
  const [locations, setLocations] = useState<LocationNode[]>([]);
  const [factions, setFactions] = useState<FactionItem[]>([]);
  const [items, setItems] = useState<ItemData[]>([]);

  // 新建
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createExtra, setCreateExtra] = useState(""); // type or parent placeholder

  useEffect(() => { listProjects().then(setProjects).catch(() => {}); }, []);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    Promise.all([
      listLocations(projectId).then(setLocations).catch(() => {}),
      listFactions(projectId).then(setFactions).catch(() => {}),
      listItems(projectId).then(setItems).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [projectId]);

  const refresh = async () => {
    if (!projectId) return;
    if (tab === "locations") listLocations(projectId).then(setLocations);
    else if (tab === "factions") listFactions(projectId).then(setFactions);
    else listItems(projectId).then(setItems);
  };

  const handleCreate = async () => {
    if (!createName.trim() || !projectId) return;
    if (tab === "locations") {
      await createLocation(projectId, { name: createName.trim() });
    } else if (tab === "factions") {
      await createFaction(projectId, { name: createName.trim(), type: createExtra || undefined });
    } else {
      await createItem(projectId, { name: createName.trim(), type: createExtra || undefined });
    }
    setCreateName(""); setCreateExtra(""); setShowCreate(false);
    refresh();
  };

  const handleDeleteLoc = async (id: string) => {
    if (!confirm("确定删除？子地点也会被删除。")) return;
    await deleteLocation(id); refresh();
  };

  const handleAddLoc = async (parentId: string) => {
    const name = prompt("子地点名称：");
    if (!name?.trim() || !projectId) return;
    await createLocation(projectId, { name: name.trim(), parentId });
    refresh();
  };

  if (!projectId) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4" style={{ backgroundColor: "var(--bg-primary)" }}>
        <Globe size={48} style={{ color: "var(--text-secondary)", opacity: 0.4 }} />
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>选择一个作品以查看世界观</p>
        <select value="" onChange={(e) => setSearchParams({ project: e.target.value })}
          className="rounded-md px-3 py-2 text-sm outline-none"
          style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
          <option value="" disabled>选择作品...</option>
          {projects.map((p) => (<option key={p.id} value={p.id}>{p.title}</option>))}
        </select>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: "var(--bg-primary)" }}>
      {/* 顶部 */}
      <div className="flex items-center gap-4 px-8 py-6">
        <h1 className="text-2xl font-light flex-1" style={{ color: "var(--text-primary)" }}>
          {projects.find((p) => p.id === projectId)?.title} · 世界观
        </h1>
        <select value={projectId} onChange={(e) => setSearchParams({ project: e.target.value })}
          className="rounded-md px-3 py-1.5 text-xs outline-none"
          style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
          {projects.map((p) => (<option key={p.id} value={p.id}>{p.title}</option>))}
        </select>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all hover:scale-105"
          style={{ backgroundColor: "var(--accent)", color: "#fff" }}>
          <Plus size={14} />新建
        </button>
      </div>

      {/* Tab 切换 */}
      <div className="flex gap-1 px-8 mb-4">
        {[
          { k: "locations" as Tab, icon: MapPin, label: "地点" },
          { k: "factions" as Tab, icon: Building2, label: "势力" },
          { k: "items" as Tab, icon: Package, label: "物品" },
        ].map(({ k, icon: Icon, label }) => (
          <button key={k} onClick={() => setTab(k)}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs transition-colors"
            style={{ backgroundColor: tab === k ? "var(--accent)" : "var(--surface)", color: tab === k ? "#fff" : "var(--text-secondary)" }}>
            <Icon size={14} />{label}
          </button>
        ))}
      </div>

      {/* 列表 */}
      <div className="flex-1 overflow-auto px-8 pb-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" style={{ color: "var(--text-secondary)" }} />
          </div>
        ) : tab === "locations" ? (
          locations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <MapPin size={48} style={{ color: "var(--text-secondary)", opacity: 0.3 }} />
              <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>还没有地点</p>
            </div>
          ) : (
            <div className="rounded-lg p-4" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
              {locations.map((loc) => (
                <LocNode key={loc.id} node={loc} depth={0} onDelete={handleDeleteLoc} onAdd={handleAddLoc} onEdit={() => {}} />
              ))}
            </div>
          )
        ) : tab === "factions" ? (
          factions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Building2 size={48} style={{ color: "var(--text-secondary)", opacity: 0.3 }} />
              <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>还没有势力</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {factions.map((f) => (
                <div key={f.id} className="rounded-lg p-4 animate-fade-in" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
                  <div className="flex items-start justify-between">
                    <h3 className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{f.name}</h3>
                    <button onClick={async () => { if (confirm("确定删除？")) { await deleteFaction(f.id); refresh(); } }}
                      className="p-1 rounded hover:brightness-90"><Trash2 size={12} style={{ color: "#c1554b" }} /></button>
                  </div>
                  {f.fullName && <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{f.fullName}</p>}
                  {f.type && <span className="inline-block mt-2 text-[10px] rounded px-1.5 py-0.5" style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)" }}>{f.type}</span>}
                  {f.description && <p className="text-xs mt-2" style={{ color: "var(--text-secondary)", opacity: 0.7 }}>{f.description}</p>}
                  {f.members && f.members.length > 0 && (
                    <p className="text-[10px] mt-2" style={{ color: "var(--accent)" }}>{f.members.length} 位成员</p>
                  )}
                </div>
              ))}
            </div>
          )
        ) : (
          items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Package size={48} style={{ color: "var(--text-secondary)", opacity: 0.3 }} />
              <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>还没有物品</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((it) => (
                <div key={it.id} className="rounded-lg p-4 animate-fade-in" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
                  <div className="flex items-start justify-between">
                    <h3 className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{it.name}</h3>
                    <button onClick={async () => { if (confirm("确定删除？")) { await deleteItem(it.id); refresh(); } }}
                      className="p-1 rounded hover:brightness-90"><Trash2 size={12} style={{ color: "#c1554b" }} /></button>
                  </div>
                  {it.type && <span className="inline-block mt-2 text-[10px] rounded px-1.5 py-0.5" style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)" }}>{it.type}</span>}
                  {it.powerLevel && it.powerLevel !== "COMMON" && (
                    <span className="inline-block mt-2 ml-1 text-[10px] rounded px-1.5 py-0.5" style={{ backgroundColor: "var(--accent)" + "22", color: "var(--accent)" }}>{it.powerLevel}</span>
                  )}
                  {it.description && <p className="text-xs mt-2" style={{ color: "var(--text-secondary)", opacity: 0.7 }}>{it.description}</p>}
                  {it.currentOwner && <p className="text-[10px] mt-2" style={{ color: "var(--accent)" }}>持有者：{it.currentOwner.name}</p>}
                  {it.isKeyItem && <span className="text-[10px]" style={{ color: "#c1554b" }}>关键物品</span>}
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* 新建弹窗 */}
      {showCreate && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setShowCreate(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="w-full max-w-sm rounded-lg p-6 animate-fade-in" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
              <h2 className="text-lg font-light" style={{ color: "var(--text-primary)" }}>
                新建{tab === "locations" ? "地点" : tab === "factions" ? "势力" : "物品"}
              </h2>
              <input autoFocus type="text" placeholder="名称" value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                className="mt-4 w-full rounded-md px-3 py-2 text-sm outline-none"
                style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              {tab !== "locations" && (
                <input type="text" placeholder="类型（可选）" value={createExtra}
                  onChange={(e) => setCreateExtra(e.target.value)}
                  className="mt-2 w-full rounded-md px-3 py-2 text-sm outline-none"
                  style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              )}
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setShowCreate(false)} className="rounded-md px-4 py-2 text-xs" style={{ color: "var(--text-secondary)" }}>取消</button>
                <button onClick={handleCreate} disabled={!createName.trim()}
                  className="rounded-md px-4 py-2 text-xs font-medium"
                  style={{ backgroundColor: "var(--accent)", color: "#fff", opacity: !createName.trim() ? 0.6 : 1 }}>创建</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
