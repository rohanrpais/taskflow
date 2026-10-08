import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { LogIn, AlertCircle } from "lucide-react";
import { api } from "../api/services";
import { useAuth } from "../context/AuthContext";

export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.auth.login({ email, password });
      login(res.data.token, res.data.user);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div className="glass-panel animate-in" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
        <div className="text-center mb-4">
          <div style={{ display: 'inline-flex', background: 'var(--primary)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
            <LogIn size={32} color="white" />
          </div>
          <h1 className="page-title" style={{ fontSize: '1.5rem' }}>Welcome Back</h1>
          <p className="text-muted">Sign in to manage your projects</p>
        </div>

        {searchParams.get("expired") && (
          <div className="glass-panel" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'var(--danger)', padding: '0.75rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--danger)' }}>
            <AlertCircle size={20} />
            <span className="text-sm">Your session has expired. Please log in again.</span>
          </div>
        )}

        {error && (
          <div className="glass-panel" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'var(--danger)', padding: '0.75rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--danger)' }}>
            <AlertCircle size={20} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="input" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="input" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn btn-primary w-100 mt-4" style={{ width: '100%', padding: '0.75rem' }} disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="text-center mt-4 text-sm text-muted">
          Don't have an account? <Link to="/register">Register here</Link>
        </div>
      </div>
    </div>
  );
};
