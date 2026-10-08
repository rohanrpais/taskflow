import React, { useState, useEffect } from "react";
import { api } from "../api/services";
import type { Task } from "../types";
import { Plus, Search, Edit2, Trash2, Loader, CheckCircle } from "lucide-react";
import { Modal } from "./Modal";

export const TaskList: React.FC<{ projectId?: string }> = ({ projectId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ 
    projectId: projectId || "", 
    name: "", 
    description: "", 
    status: "PENDING", 
    priority: "MEDIUM", 
    dueDate: "" 
  });

  const loadTasks = async () => {
    try {
      setLoading(true);
      const res = await api.tasks.getAll({ 
        projectId, 
        search, 
        status: statusFilter, 
        priority: priorityFilter 
      });
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [projectId, search, statusFilter, priorityFilter]);

  const handleOpenModal = (task?: Task) => {
    if (task) {
      setEditingId(task.id);
      setFormData({
        projectId: task.projectId,
        name: task.name,
        description: task.description || "",
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.split("T")[0] : ""
      });
    } else {
      setEditingId(null);
      setFormData({ 
        projectId: projectId || "", 
        name: "", 
        description: "", 
        status: "PENDING", 
        priority: "MEDIUM", 
        dueDate: "" 
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectId) {
      alert("Project ID is required.");
      return;
    }
    try {
      if (editingId) {
        await api.tasks.update(editingId, formData as Partial<Task>);
      } else {
        await api.tasks.create(formData as Partial<Task>);
      }
      setIsModalOpen(false);
      loadTasks();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || err.response?.data?.message || "Failed to save task");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await api.tasks.delete(id);
      loadTasks();
    } catch (err) {
      alert("Failed to delete task");
    }
  };

  const toggleStatus = async (task: Task) => {
    const newStatus = task.status === "COMPLETED" ? "PENDING" : "COMPLETED";
    try {
      await api.tasks.update(task.id, { status: newStatus });
      loadTasks();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h2 style={{ margin: 0 }}>Tasks</h2>
        {projectId && (
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={16} /> New Task
          </button>
        )}
      </div>

      <div className="flex gap-4 flex-wrap mb-4">
        <div className="form-group" style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="input" 
              placeholder="Search tasks..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
        </div>
        <select className="select" style={{ width: 'auto' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
        <select className="select" style={{ width: 'auto' }} value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-4"><Loader className="animate-spin" /></div>
      ) : tasks.length === 0 ? (
        <div className="text-center text-muted py-4">No tasks found.</div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th style={{ width: '40px' }}></th>
                <th>Task</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(t => (
                <tr key={t.id} style={{ opacity: t.status === "COMPLETED" ? 0.6 : 1 }}>
                  <td className="text-center">
                    <button className="btn-icon" onClick={() => toggleStatus(t)}>
                      <CheckCircle size={20} color={t.status === "COMPLETED" ? "var(--success)" : "var(--text-muted)"} />
                    </button>
                  </td>
                  <td>
                    <div className="font-bold" style={{ textDecoration: t.status === "COMPLETED" ? "line-through" : "none" }}>{t.name}</div>
                    <div className="text-sm text-muted">{t.description}</div>
                  </td>
                  <td><span className={`badge ${t.status}`}>{t.status.replace('_', ' ')}</span></td>
                  <td><span className={`badge ${t.priority}`}>{t.priority}</span></td>
                  <td className="text-sm">{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn-icon" onClick={() => handleOpenModal(t)}><Edit2 size={16} /></button>
                      <button className="btn-icon" onClick={() => handleDelete(t.id)} style={{ color: 'var(--danger)' }}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Task" : "New Task"}>
        <form onSubmit={handleSave}>
          {!projectId && !editingId && (
            <div className="form-group">
              <label className="form-label">Project ID *</label>
              <input className="input" required value={formData.projectId} onChange={e => setFormData({...formData, projectId: e.target.value})} placeholder="Must provide a project ID to create a task" />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input className="input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="textarea" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Status *</label>
              <select className="select" required value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority *</label>
              <select className="select" required value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Due Date *</label>
            <input type="date" className="input" required value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Task</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
