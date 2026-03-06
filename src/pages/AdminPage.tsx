import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, HardDrive, File, Clock, Activity, Settings, Lock, LogOut, Trash2, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FileRecord {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadDate: number;
}

interface AdminStats {
  totalFiles: number;
  totalSize: number;
  recentFiles: FileRecord[];
}

export function AdminPage() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('adminToken'));
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'settings'>('dashboard');
  
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else if (response.status === 401) {
        handleLogout();
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  };

  useEffect(() => {
    if (token) {
      setLoading(true);
      Promise.all([fetchStats(), fetchSettings()]).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.token);
        localStorage.setItem('adminToken', data.token);
      } else {
        setLoginError(data.error || 'Login failed');
      }
    } catch (err) {
      setLoginError('Network error');
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('adminToken');
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        alert('Settings saved successfully! Bot restarted.');
      } else {
        alert('Failed to save settings.');
      }
    } catch (err) {
      alert('Error saving settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFile = async (id: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    try {
      const res = await fetch(`/api/admin/files/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchStats();
      } else {
        alert('Failed to delete file.');
      }
    } catch (err) {
      alert('Error deleting file.');
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="atmosphere-bg"></div>
        <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <div className="atmosphere-bg"></div>
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full glass-panel rounded-3xl p-10 relative z-10"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl mb-4 border border-indigo-500/20">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white">Admin Login / تسجيل دخول الإدارة</h2>
            <p className="text-zinc-400 mt-2">Enter the admin password to continue / أدخل كلمة المرور للمتابعة</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password / كلمة المرور"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
            </div>
            {loginError && <p className="text-red-400 text-sm">{loginError}</p>}
            <button
              type="submit"
              className="w-full py-3 px-4 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-500 transition-colors shadow-[0_0_20px_rgba(99,102,241,0.4)]"
            >
              Login / دخول
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full py-3 px-4 glass-button text-white rounded-xl font-medium"
            >
              Back to Home / عودة للرئيسية
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-4 relative overflow-hidden">
      <div className="atmosphere-bg"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-5xl w-full glass-panel rounded-3xl overflow-hidden relative z-10 my-8"
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center text-zinc-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home / عودة
          </button>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-indigo-500/20 text-indigo-400' : 'text-zinc-400 hover:text-white'}`}
            >
              <Activity className="w-4 h-4 mr-2" />
              Dashboard / لوحة التحكم
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-indigo-500/20 text-indigo-400' : 'text-zinc-400 hover:text-white'}`}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings / الإعدادات
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout / خروج
            </button>
          </div>
        </div>

        <div className="p-8 md:p-12">
          {activeTab === 'dashboard' ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex items-center space-x-6">
                  <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
                    <File className="w-10 h-10" />
                  </div>
                  <div>
                    <p className="text-zinc-400 text-sm uppercase tracking-wider font-medium mb-1">Total Files</p>
                    <h3 className="text-4xl font-bold text-white font-display">{stats?.totalFiles || 0}</h3>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex items-center space-x-6">
                  <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
                    <HardDrive className="w-10 h-10" />
                  </div>
                  <div>
                    <p className="text-zinc-400 text-sm uppercase tracking-wider font-medium mb-1">Total Storage Used</p>
                    <h3 className="text-4xl font-bold text-white font-display">{formatSize(stats?.totalSize || 0)}</h3>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Clock className="w-6 h-6 mr-3 text-indigo-400" />
                  Recent Uploads
                </h3>
                
                <div className="bg-black/40 rounded-2xl border border-white/10 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white/5 border-b border-white/10">
                          <th className="p-4 text-zinc-400 font-medium text-sm">File Name</th>
                          <th className="p-4 text-zinc-400 font-medium text-sm">Size</th>
                          <th className="p-4 text-zinc-400 font-medium text-sm">Type</th>
                          <th className="p-4 text-zinc-400 font-medium text-sm">Date</th>
                          <th className="p-4 text-zinc-400 font-medium text-sm text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats?.recentFiles && stats.recentFiles.length > 0 ? (
                          stats.recentFiles.map((file) => (
                            <tr key={file.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                              <td className="p-4 text-white font-medium max-w-[200px] truncate" title={file.originalName}>
                                {file.originalName}
                              </td>
                              <td className="p-4 text-zinc-300 text-sm font-mono">
                                {formatSize(file.size)}
                              </td>
                              <td className="p-4 text-zinc-300 text-sm">
                                <span className="bg-white/5 px-2 py-1 rounded-md border border-white/10">
                                  {file.mimeType.split('/')[0]}
                                </span>
                              </td>
                              <td className="p-4 text-zinc-400 text-sm">
                                {formatDate(file.uploadDate)}
                              </td>
                              <td className="p-4 text-right space-x-3">
                                <button 
                                  onClick={() => navigate(`/file/${file.id}`)}
                                  className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
                                >
                                  View
                                </button>
                                <button 
                                  onClick={() => handleDeleteFile(file.id)}
                                  className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-zinc-500">
                              No files uploaded yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">System Settings / إعدادات النظام</h3>
                <p className="text-zinc-400">Configure Telegram bot credentials and admin access. / قم بإعداد بيانات البوت وكلمة المرور.</p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div className="bg-black/40 p-6 rounded-2xl border border-white/10 space-y-4">
                  <h4 className="text-lg font-medium text-white mb-4">Telegram Configuration</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">API ID</label>
                    <input
                      type="text"
                      value={settings.telegram_api_id || ''}
                      onChange={(e) => setSettings({...settings, telegram_api_id: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">API Hash</label>
                    <input
                      type="text"
                      value={settings.telegram_api_hash || ''}
                      onChange={(e) => setSettings({...settings, telegram_api_hash: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Bot Token</label>
                    <input
                      type="password"
                      value={settings.telegram_bot_token || ''}
                      onChange={(e) => setSettings({...settings, telegram_bot_token: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Bin Channel ID</label>
                    <input
                      type="text"
                      value={settings.bin_channel_id || ''}
                      onChange={(e) => setSettings({...settings, bin_channel_id: e.target.value})}
                      placeholder="e.g. -1001234567890"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="bg-black/40 p-6 rounded-2xl border border-white/10 space-y-4">
                  <h4 className="text-lg font-medium text-white mb-4">Security</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Admin Password</label>
                    <input
                      type="text"
                      value={settings.admin_password || ''}
                      onChange={(e) => setSettings({...settings, admin_password: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-4 px-6 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-500 transition-colors shadow-[0_0_20px_rgba(99,102,241,0.4)] flex items-center justify-center disabled:opacity-50"
                >
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Save & Restart Bot / حفظ وإعادة تشغيل
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
