import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState,
  type Node, type Edge, MarkerType, BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Plus, Trash2, Users, X } from "lucide-react";
import { listRelationships, createRelationship, deleteRelationship, type RelationData } from "@/api/relationship";
import { listCharacters, type CharacterBrief } from "@/api/character";
import { ProjectSelector } from "@/components/shared/ProjectSelector";

const RELATION_TYPES = [
  { value: "家人", label: "家人", color: "#4ecdc4" },
  { value: "爱情", label: "爱情", color: "#ff6b6b" },
  { value: "友情", label: "友情", color: "#4a9eff" },
  { value: "敌对", label: "敌对", color: "#c1554b" },
  { value: "师徒", label: "师徒", color: "#f0c75e" },
  { value: "上下级", label: "上下级", color: "#9b7ec4" },
  { value: "其他", label: "其他", color: "#999" },
];

function buildGraph(rels: RelationData[], onDelete: (id: string, label: string) => void) {
  const charMap = new Map<string, { id: string; name: string }>();
  for (const r of rels) {
    if (!charMap.has(r.characterA.id)) charMap.set(r.characterA.id, r.characterA);
    if (!charMap.has(r.characterB.id)) charMap.set(r.characterB.id, r.characterB);
  }

  const nodes: Node[] = [];
  let x = 0, y = 0;
  for (const [id, ch] of charMap) {
    nodes.push({
      id,
      position: { x, y },
      data: { label: ch.name },
      style: {
        background: "var(--surface)",
        color: "var(--text-primary)",
        border: "2px solid var(--accent)",
        borderRadius: "50%",
        width: 72,
        height: 72,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
      },
    });
    y += 120;
    if (y > 400) { y = 0; x += 160; }
  }

  const edges: Edge[] = rels.map((r, i) => {
    const cfg = RELATION_TYPES.find((t) => t.value === r.type) || RELATION_TYPES[6];
    return {
      id: r.id,
      source: r.characterAId,
      target: r.characterBId,
      label: r.type + (r.subType ? `·${r.subType}` : ""),
      type: "smoothstep",
      animated: r.status === "CURRENT",
      style: { stroke: cfg.color, strokeWidth: 1.5 + r.intensity * 0.3 },
      labelStyle: { fill: "var(--text-secondary)", fontSize: 10, fontWeight: 500 },
      labelBgStyle: { fill: "var(--bg-primary)", fillOpacity: 0.85 },
      labelBgPadding: [6, 3] as [number, number],
      markerEnd: { type: MarkerType.ArrowClosed, color: cfg.color, width: 14, height: 14 },
      data: { relationId: r.id, label: r.characterA.name + " → " + r.characterB.name },
    };
  });

  return { nodes, edges };
}

export function Relationships() {
  const [searchParams, setSearchParams] = useSearchParams();
  const projectId = searchParams.get("project") || "";
const [rels, setRels] = useState<RelationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Create modal state
  const [showCreate, setShowCreate] = useState(false);
  const [characters, setCharacters] = useState<CharacterBrief[]>([]);
  const [form, setForm] = useState({ characterAId: "", characterBId: "", type: "友情", subType: "", intensity: 5, description: "" });

const refresh = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const data = await listRelationships(projectId);
      setRels(data);
      const { nodes: n, edges: e } = buildGraph(data, (id, label) => {
        if (confirm(`确定删除关系「${label}」？`)) {
          deleteRelationship(id).then(refresh);
        }
      });
      setNodes(n);
      setEdges(e);
    } catch { setRels([]); }
    finally { setLoading(false); }
  }, [projectId]);

  useEffect(() => { refresh(); }, [refresh]);

  const loadCharacters = async () => {
    if (!projectId) return;
    const chars = await listCharacters(projectId);
    setCharacters(chars);
  };

  const handleCreate = async () => {
    if (!form.characterAId || !form.characterBId || !projectId) return;
    await createRelationship(projectId, {
      characterAId: form.characterAId,
      characterBId: form.characterBId,
      type: form.type,
      subType: form.subType || undefined,
      intensity: form.intensity,
      description: form.description || undefined,
    });
    setShowCreate(false);
    setForm({ characterAId: "", characterBId: "", type: "友情", subType: "", intensity: 5, description: "" });
    refresh();
  };

  const handleDeleteEdge = useCallback(async (edgeId: string, label: string) => {
    if (confirm(`确定删除关系「${label}」？`)) {
      await deleteRelationship(edgeId);
      refresh();
    }
  }, [refresh]);

  // Handle edge click to delete
  const onEdgeClick = useCallback((_event: React.MouseEvent, edge: Edge) => {
    handleDeleteEdge(edge.id, edge.data?.label || "");
  }, [handleDeleteEdge]);

  if (!projectId) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4" style={{ backgroundColor: "var(--bg-primary)" }}>
        <Users size={48} style={{ color: "var(--text-secondary)", opacity: 0.4 }} />
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>选择一个作品以查看人物关系</p>
        <ProjectSelector value="" onChange={(id) => setSearchParams({ project: id })}
          className="rounded-md px-3 py-2 text-sm outline-none"
          style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
      </div>
    );
  }

  return (
    <div className="flex h-full" style={{ backgroundColor: "var(--bg-primary)" }}>
      {/* 图区域 */}
      <div className="flex-1 relative">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" style={{ color: "var(--text-secondary)" }} />
          </div>
        ) : rels.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <Users size={48} style={{ color: "var(--text-secondary)", opacity: 0.3 }} />
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>还没有人物关系</p>
            <button onClick={async () => { await loadCharacters(); setShowCreate(true); }}
              className="flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-medium transition-all hover:scale-105"
              style={{ backgroundColor: "var(--accent)", color: "#fff" }}>
              <Plus size={14} />添加第一条关系
            </button>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onEdgeClick={onEdgeClick}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            proOptions={{ hideAttribution: true }}
            deleteKeyCode={null}
          >
            <MiniMap
              style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
              maskColor="var(--bg-primary)"
              nodeColor="var(--accent)"
            />
            <Controls style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8 }} />
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--border)" />
          </ReactFlow>
        )}

        {/* 顶部栏 */}
        <div className="absolute top-4 left-4 right-4 flex items-center gap-3 z-10">
          <h1 className="text-lg font-light" style={{ color: "var(--text-primary)" }}>人物关系图</h1>
          <div className="flex-1" />
          <ProjectSelector value={projectId} onChange={(id) => setSearchParams({ project: id })}
            className="rounded-md px-3 py-1.5 text-xs outline-none"
            style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
          {rels.length > 0 && (
            <button onClick={async () => { await loadCharacters(); setShowCreate(true); }}
              className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all hover:scale-105"
              style={{ backgroundColor: "var(--accent)", color: "#fff" }}>
              <Plus size={14} />添加关系
            </button>
          )}
        </div>

        {/* 图例 */}
        {rels.length > 0 && (
          <div className="absolute bottom-4 left-4 flex gap-3 z-10">
            <div className="rounded-lg px-3 py-2 text-[10px]" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {RELATION_TYPES.map((t) => (
                  <span key={t.value} className="flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                    <span style={{ color: "var(--text-secondary)" }}>{t.label}</span>
                  </span>
                ))}
              </div>
              <p className="mt-1.5" style={{ color: "var(--text-secondary)", opacity: 0.5 }}>
                点击连线可删除关系 · 拖拽节点调整位置 · 滚轮缩放
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 新建关系弹窗 */}
      {showCreate && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setShowCreate(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="w-full max-w-md rounded-lg p-6 animate-fade-in" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-light" style={{ color: "var(--text-primary)" }}>添加人物关系</h2>
                <button onClick={() => setShowCreate(false)} className="p-1"><X size={16} style={{ color: "var(--text-secondary)" }} /></button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] block mb-1" style={{ color: "var(--text-secondary)" }}>人物 A</label>
                    <select value={form.characterAId} onChange={(e) => setForm({ ...form, characterAId: e.target.value })}
                      className="w-full rounded-md px-2 py-1.5 text-xs outline-none"
                      style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                      <option value="">选择...</option>
                      {characters.filter((c) => c.id !== form.characterBId).map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] block mb-1" style={{ color: "var(--text-secondary)" }}>人物 B</label>
                    <select value={form.characterBId} onChange={(e) => setForm({ ...form, characterBId: e.target.value })}
                      className="w-full rounded-md px-2 py-1.5 text-xs outline-none"
                      style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                      <option value="">选择...</option>
                      {characters.filter((c) => c.id !== form.characterAId).map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] block mb-1" style={{ color: "var(--text-secondary)" }}>关系类型</label>
                  <div className="flex flex-wrap gap-1.5">
                    {RELATION_TYPES.map((t) => (
                      <button key={t.value} onClick={() => setForm({ ...form, type: t.value })}
                        className="rounded-md px-2.5 py-1 text-[10px] transition-all"
                        style={{
                          backgroundColor: form.type === t.value ? t.color : "var(--bg-primary)",
                          color: form.type === t.value ? "#fff" : "var(--text-secondary)",
                          border: `1px solid ${form.type === t.value ? t.color : "var(--border)"}`,
                        }}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] block mb-1" style={{ color: "var(--text-secondary)" }}>子类型（可选）</label>
                    <input type="text" value={form.subType} onChange={(e) => setForm({ ...form, subType: e.target.value })}
                      placeholder="如：父子、恋人..."
                      className="w-full rounded-md px-2 py-1.5 text-xs outline-none"
                      style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                  </div>
                  <div>
                    <label className="text-[10px] block mb-1" style={{ color: "var(--text-secondary)" }}>亲密度 ({form.intensity})</label>
                    <input type="range" min="1" max="10" value={form.intensity} onChange={(e) => setForm({ ...form, intensity: +e.target.value })}
                      className="w-full" style={{ accentColor: "var(--accent)" }} />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] block mb-1" style={{ color: "var(--text-secondary)" }}>描述（可选）</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={2} placeholder="如：两人青梅竹马，但因家族恩怨而决裂..."
                    className="w-full rounded-md px-2 py-1.5 text-xs outline-none resize-none"
                    style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setShowCreate(false)} className="rounded-md px-4 py-2 text-xs" style={{ color: "var(--text-secondary)" }}>取消</button>
                <button onClick={handleCreate} disabled={!form.characterAId || !form.characterBId}
                  className="rounded-md px-4 py-2 text-xs font-medium"
                  style={{ backgroundColor: "var(--accent)", color: "#fff", opacity: !form.characterAId || !form.characterBId ? 0.6 : 1 }}>创建关系</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
