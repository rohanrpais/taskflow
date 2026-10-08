import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/services";
import type { Project } from "../types";
import { Loader, ArrowLeft } from "lucide-react";
import { TaskList } from "../components/TaskList";

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    const fetchProject = async () => {
      try {
        const res = await api.projects.getById(id);
        setProject(res.data);
      } catch (err: any) {
        setError("Failed to load project details");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  if (loading) return <div className="flex justify-center p-4"><Loader className="animate-spin" /></div>;
  if (error || !project) return <div className="text-danger p-4">{error || "Project not found"}</div>;

  return (
    <div className="animate-in">
      <div className="mb-4">
        <Link to="/projects" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={16} /> Back to Projects
        </Link>
      </div>
      
      <div className="page-header" style={{ marginBottom: '1rem' }}>
        <h1 className="page-title">{project.name}</h1>
        <span className={`badge ${project.status}`} style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>{project.status.replace('_', ' ')}</span>
      </div>

      <div className="card mb-4">
        <p className="text-muted">{project.description || "No description provided."}</p>
        <div className="text-sm mt-4 font-bold">
          Timeline: {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'} - {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}
        </div>
      </div>

      <TaskList projectId={project.id} />
    </div>
  );
};
