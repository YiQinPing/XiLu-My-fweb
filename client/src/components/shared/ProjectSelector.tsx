import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { listProjects, createProject, type Project } from "@/api/project";

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

  useEffect(() => {
    listProjects().then(setProjects).catch(() => {});
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
        navigate("/project/" + project.id);
      } catch {
        // ignore
      } finally {
        setCreating(false);
      }
    } else {
      onChange(val);
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
