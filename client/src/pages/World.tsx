import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Trash2, Globe, MapPin, Building2, Package, ChevronDown, ChevronRight, X } from "lucide-react";
import { listProjects, type Project } from "@/api/project";
import {
  listLocations, createLocation, updateLocation, deleteLocation, type LocationNode,
  listFactions, createFaction, updateFaction, deleteFaction, type FactionItem,
  listItems, createItem, updateItem, deleteItem, type ItemData,
} from "@/api/world";
import { ProjectSelector } from "@/components/shared/ProjectSelector";

type Tab = "locations" | "factions" | "items";

function LocNode({ node, depth, onDelete, onAdd, onEdit }: {
  node: LocationNode; depth: number;
  onDelete: (id: string) => void;
  onAdd: (parentId: string | null) => void;
  onEdit: (node: LocationNode) => void;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <div className="group flex items-center gap-1 rounded px-2 py-1 hover:brightness-95"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}>
        {node.children.length > 0 ? (
          <button onClick={() => setOpen(!open)} className="p-0.5">{open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}</button>
        ) : <span className="w-4" />}
        <button onClick={() => onEdit(node)} className="flex-1 text-left text-sm hover:underline" style={{ color: "var(--text-primary)" }}>
          {node.name}
        </button>
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

  const [locations, setLocations] = useState<LocationNode[]>([]);
  const [factions, setFactions] = useState<FactionItem[]>([]);
  const [items, setItems] = useState<ItemData[]>([]);

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createExtra, setCreateExtra] = useState("");

  // Edit modal
  const [editTarget, setEditTarget] = useState<{ id: string; name: string; type?: string | null; description?: string | null } | null>(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("");
  const [editDesc, setEditDesc] = useState("");

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

  const openEdit = (entity: { id: string; name: string; type?: string | null; description?: string | null }) => {
    setEditTarget(entity);
    setEditName(entity.name);
    setEditType(entity.type || "");
    setEditDesc(entity.description || "");
  };

  const handleEdit = async () => {
    if (!editTarget || !editName.trim()) return;
    const data: Record<string, any> = { name: editName.trim() };
    if (tab !== "locations") data.type = editType || null;
    data.description = editDesc || null;

    if (tab === "locations") await updateLocation(editTarget.id, data);
    else if (tab === "factions") await updateFaction(editTarget.id, data);
    else await updateItem(editTarget.id, data);

    setEditTarget(null);
    refresh();
  };

  const stats = { locations: countLocNodes(locations), factions: factions.length, items: items.length };

  if (!projectId) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4" style={{ backgroundColor: "var(--bg-primary)" }}>
        <Globe size={48} style={{ color: "var(--text-secondary)", opacity: 0.4 }} />
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>选择一个作品以查看世界观</p>
        <ProjectSelector value="" onChange={(id) => setSearchParams({ project: id })}
          className="rounded-md px-3 py-2 text-sm outline-none"
          style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
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
        <ProjectSelector value={projectId} onChange={(id) => setSearchParams({ project: id })}
          className="rounded-md px-3 py-1.5 text-xs outline-none"
          style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all hover:scale-105"
          style={{ backgroundColor: "var(--accent)", color: "#fff" }}>
          <Plus size={14} />新建
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="flex gap-4 px-8 mb-4">
        {[
          { icon: MapPin, label: "地点", count: stats.locations, color: "#6cc070" },
          { icon: Building2, label: "势力", count: stats.factions, color: "#c1554b" },
          { icon: Package, label: "物品", count: stats.items, color: "#f0c75e" },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-2 rounded-lg px-4 py-2" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
            <s.icon size={16} style={{ color: s.color }} />
            <span className="text-lg font-medium" style={{ color: "var(--text-primary)" }}>{s.count}</span>
            <span className="text-[10px]" style={{ color: "var(--text-secondary)" }}>{s.label}</span>
          </div>
        ))}
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
                <LocNode key={loc.id} node={loc} depth={0} onDelete={handleDeleteLoc} onAdd={handleAddLoc} onEdit={(n) => openEdit(n)} />
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
                <div key={f.id} onClick={() => openEdit(f)}
                  className="rounded-lg p-4 animate-fade-in cursor-pointer hover:brightness-95 transition-all"
                  style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
                  <div className="flex items-start justify-between">
                    <h3 className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{f.name}</h3>
                    <button onClick={async (e) => { e.stopPropagation(); if (confirm("确定删除？")) { await deleteFaction(f.id); refresh(); } }}
                      className="p-1 rounded hover:brightness-90"><Trash2 size={12} style={{ color: "#c1554b" }} /></button>
                  </div>
                  {f.fullName && <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{f.fullName}</p>}
                  {f.type && <span className="inline-block mt-2 text-[10px] rounded px-1.5 py-0.5" style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)" }}>{f.type}</span>}
                  {f.description && <p className="text-xs mt-2" style={{ color: "var(--text-secondary)", opacity: 0.7 }}>{f.description.length > 60 ? f.description.slice(0, 60) + "..." : f.description}</p>}
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
                <div key={it.id} onClick={() => openEdit(it)}
                  className="rounded-lg p-4 animate-fade-in cursor-pointer hover:brightness-95 transition-all"
                  style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
                  <div className="flex items-start justify-between">
                    <h3 className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{it.name}</h3>
                    <button onClick={async (e) => { e.stopPropagation(); if (confirm("确定删除？")) { await deleteItem(it.id); refresh(); } }}
                      className="p-1 rounded hover:brightness-90"><Trash2 size={12} style={{ color: "#c1554b" }} /></button>
                  </div>
                  {it.type && <span className="inline-block mt-2 text-[10px] rounded px-1.5 py-0.5" style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)" }}>{it.type}</span>}
                  {it.powerLevel && it.powerLevel !== "COMMON" && (
                    <span className="inline-block mt-2 ml-1 text-[10px] rounded px-1.5 py-0.5" style={{ backgroundColor: "var(--accent)" + "22", color: "var(--accent)" }}>{it.powerLevel}</span>
                  )}
                  {it.description && <p className="text-xs mt-2" style={{ color: "var(--text-secondary)", opacity: 0.7 }}>{it.description.length > 60 ? it.description.slice(0, 60) + "..." : it.description}</p>}
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

      {/* 编辑弹窗 */}
      {editTarget && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setEditTarget(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="w-full max-w-md rounded-lg p-6 animate-fade-in" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-light" style={{ color: "var(--text-primary)" }}>
                  编辑{tab === "locations" ? "地点" : tab === "factions" ? "势力" : "物品"}
                </h2>
                <button onClick={() => setEditTarget(null)} className="p-1"><X size={16} style={{ color: "var(--text-secondary)" }} /></button>
              </div>

              <div className="space-y-3">
                <input autoFocus type="text" placeholder="名称" value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleEdit()}
                  className="w-full rounded-md px-3 py-2 text-sm outline-none"
                  style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />

                {tab !== "locations" && (
                  <input type="text" placeholder="类型" value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className="w-full rounded-md px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                )}

                {tab === "locations" && (
                  <input type="text" placeholder="类型（如：城市、森林...）" value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className="w-full rounded-md px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                )}

                <textarea placeholder="描述" value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={3} className="w-full rounded-md px-3 py-2 text-sm outline-none resize-none"
                  style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setEditTarget(null)} className="rounded-md px-4 py-2 text-xs" style={{ color: "var(--text-secondary)" }}>取消</button>
                <button onClick={handleEdit} disabled={!editName.trim()}
                  className="rounded-md px-4 py-2 text-xs font-medium"
                  style={{ backgroundColor: "var(--accent)", color: "#fff", opacity: !editName.trim() ? 0.6 : 1 }}>保存</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function countLocNodes(nodes: LocationNode[]): number {
  let count = nodes.length;
  for (const n of nodes) count += countLocNodes(n.children);
  return count;
}
