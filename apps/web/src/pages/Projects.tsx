import React, { useState, useEffect } from "react";
import { api } from "../api/services";
import type { Project } from "../types";
import { Plus, Search, Edit2, Trash2, Loader, Eye } from "lucide-react";
import { Modal } from "../components/Modal";
import { Link } from "react-router-dom";

export const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ name: "", description: "", status: "NOT_STARTED", startDate: "", endDate: "" });

  const loadProjects = async () => {
    try {
      setLoading(true);
      const res = await api.projects.getAll({ search, status: statusFilter });
      setProjects(res.data);
    } catch (err) {
      setError("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [search, statusFilter]);

  const handleOpenModal = (project?: Project) => {
    if (project) {
      setEditingId(project.id);
      setFormData({
        name: project.name,
        description: project.description || "",
        status: project.status,
        startDate: project.startDate ? project.startDate.split("T")[0] : "",
        endDate: project.endDate ? project.endDate.split("T")[0] : ""
      });
    } else {
      setEditingId(null);
      setFormData({ name: "", description: "", status: "NOT_STARTED", startDate: "", endDate: "" });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.projects.update(editingId, formData as Partial<Project>);
      } else {
        await api.projects.create(formData as Partial<Project>);
      }
      setIsModalOpen(false);
      loadProjects();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || err.response?.data?.message || "Failed to save project");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project? All tasks will be deleted.")) return;
    try {
      await api.projects.delete(id);
      loadProjects();
    } catch (err) {
      alert("Failed to delete project");
    }
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">Projects</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={16} /> New Project
        </button>
      </div>

      <div className="card mb-4 flex gap-4 flex-wrap">
        <div className="form-group" style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="input" 
              placeholder="Search projects..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
        </div>
        <div className="form-group" style={{ minWidth: '200px', marginBottom: 0 }}>
          <select className="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="NOT_STARTED">Not Started</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center" style={{ height: '200px' }}>
          <Loader className="icon animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div className="card text-center" style={{ padding: '3rem 1rem' }}>
          <div className="text-muted mb-4">No projects found.</div>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>Create your first project</button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 sm:grid-cols-2 gap-4">
          {projects.map(p => (
            <div key={p.id} className="card flex" style={{ flexDirection: 'column' }}>
              <div className="flex justify-between items-start mb-2">
                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{p.name}</h3>
                <span className={`badge ${p.status}`}>{p.status.replace('_', ' ')}</span>
              </div>
              <p className="text-sm text-muted" style={{ flex: 1, marginBottom: '1rem' }}>{p.description || "No description"}</p>
              <div className="text-sm text-muted mb-4">
                {p.startDate ? new Date(p.startDate).toLocaleDateString() : 'N/A'} - {p.endDate ? new Date(p.endDate).toLocaleDateString() : 'N/A'}
              </div>
              <div className="flex justify-between border-t" style={{ paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <Link to={`/projects/${p.id}`} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem' }}>
                  <Eye size={16} /> View
                </Link>
                <div className="flex gap-2">
                  <button className="btn-icon" onClick={() => handleOpenModal(p)}><Edit2 size={16} /></button>
                  <button className="btn-icon" onClick={() => handleDelete(p.id)} style={{ color: 'var(--danger)' }}><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Project" : "New Project"}>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input className="input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="textarea" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Status *</label>
            <select className="select" required value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
              <option value="NOT_STARTED">Not Started</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Start Date *</label>
              <input type="date" className="input" required value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">End Date *</label>
              <input type="date" className="input" required value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
            </div>
          </div>
          {formData.startDate && formData.endDate && formData.endDate < formData.startDate && (
            <div className="error-text">End date cannot be earlier than start date</div>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={!!(formData.startDate && formData.endDate && formData.endDate < formData.startDate)}>
              Save Project
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
