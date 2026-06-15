import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listProjects, createProject, type Project } from "@/api/project";
import { useProjectStore } from "@/stores/project";

interface Props {
  value: string;
  onChange: (projectId: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function ProjectSelector({ value, onChange, className, style }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();
  const globalProjectId = useProjectStore((s) => s.selectedProjectId);
  const setGlobalProject = useProjectStore((s) => s.setSelectedProject);

  useEffect(() => {
    listProjects().then((list) => {
      setProjects(list);
      // Auto-select: if no project is selected and user has projects, pick first
      if (!value && list.length > 0) {
        if (globalProjectId && list.some((p) => p.id === globalProjectId)) {
          onChange(globalProjectId);
        } else if (list.length > 0) {
          const first = list[0];
          onChange(first.id);
          setGlobalProject(first.id);
        }
      }
    }).catch(() => {});
  }, []);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "__create__") {
      setCreating(true);
      try {
        const name = prompt("新作品名称：");
        if (!name?.trim()) return;
        const project = await createProject({ title: name.trim() });
        setProjects((prev) => [...prev, project]);
        onChange(project.id);
        setGlobalProject(project.id);
        navigate("/project/" + project.id);
      } catch {
        // ignore
      } finally {
        setCreating(false);
      }
    } else {
      onChange(val);
      setGlobalProject(val);
    }
  };

  return (
    <select
      value={value}
      onChange={handleChange}
      disabled={creating}
      className={className}
      style={style}
    >
      <option value="" disabled>选择作品...</option>
      {projects.map((p) => (
        <option key={p.id} value={p.id}>{p.title}</option>
      ))}
      <option value="" disabled>──</option>
      <option value="__create__" style={{ color: "var(--accent)" }}>
        {creating ? "创建中..." : "+ 新建作品"}
      </option>
    </select>
  );
}
