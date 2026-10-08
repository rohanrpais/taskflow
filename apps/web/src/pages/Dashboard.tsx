import React, { useEffect, useState } from "react";
import { api } from "../api/services";
import type { DashboardStats } from "../types";
import { Briefcase, CheckSquare, Activity, Loader, CheckCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.dashboard.getStats();
        setStats(res.data);
      } catch (err: any) {
        setError("Failed to load dashboard statistics.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center" style={{ height: '50vh' }}>
      <Loader className="icon animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
      <span className="text-muted" style={{ marginLeft: '0.5rem' }}>Loading dashboard...</span>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error) return (
    <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}>
      {error}
    </div>
  );

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </div>

      <div className="grid lg:grid-cols-3 sm:grid-cols-2">
        <StatCard 
          title="Total Projects" 
          value={stats?.totalProjects} 
          icon={<Briefcase size={24} color="var(--primary)" />} 
        />
        <StatCard 
          title="Projects In Progress" 
          value={stats?.projectsInProgress} 
          icon={<Activity size={24} color="var(--warning)" />} 
        />
        <StatCard 
          title="Total Tasks" 
          value={stats?.totalTasks} 
          icon={<CheckSquare size={24} color="var(--primary)" />} 
        />
        <StatCard 
          title="Completed Tasks" 
          value={stats?.completedTasks} 
          icon={<CheckCircle size={24} color="var(--success)" />} 
        />
        <StatCard 
          title="Pending Tasks" 
          value={stats?.pendingTasks} 
          icon={<Clock size={24} color="var(--text-muted)" />} 
        />
      </div>

      <div className="mt-4 flex gap-4">
        <Link to="/projects" className="btn btn-primary">
          <Briefcase size={16} /> Manage Projects
        </Link>
        <Link to="/tasks" className="btn btn-outline">
          <CheckSquare size={16} /> View Tasks
        </Link>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon }: { title: string, value?: number, icon: React.ReactNode }) => (
  <div className="card flex items-center justify-between">
    <div>
      <div className="text-sm text-muted font-bold" style={{ marginBottom: '0.5rem' }}>{title}</div>
      <div style={{ fontSize: '2rem', fontWeight: 800 }}>{value ?? 0}</div>
    </div>
    <div style={{ padding: '1rem', background: 'var(--bg)', borderRadius: '50%' }}>
      {icon}
    </div>
  </div>
);
