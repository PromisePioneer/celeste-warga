import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { CelesteLogo } from '../components/logo/CelesteLogo';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface Statistik {
  total_warga: number;
  warga_per_status: { label: string; value: string; count: number }[];
  warga_per_blok: { blok: string; count: number }[];
  warga_per_agama: { label: string; count: number }[];
  warga_per_status_pernikahan: { label: string; count: number }[];
  warga_dengan_foto: number;
  pengisian_hari_ini: number;
  tren_pengisian: { date: string; count: number }[];
}

interface Warga {
  id: number;
  nama_lengkap: string;
  blok: string;
  unit: string;
  alamat: string;
  no_hp: string;
  agama: { label: string };
  status_pernikahan: { label: string };
  has_photo: boolean;
  created_at: string;
}

const STATUS_COLORS = ['#7B1B36', '#D5A526', '#C13A4C', '#B08A1E', '#E896A4', '#8C6B17', '#5F1428'];

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [statistik, setStatistik] = useState<Statistik | null>(null);
  const [warga, setWarga] = useState<Warga[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filterBlok, setFilterBlok] = useState('');
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedWargaId, setSelectedWarga] = useState<number | null>(null);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [wargaPhotos, setWargaPhotos] = useState<Record<string, string>>({});

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const userStr = localStorage.getItem('admin_user');
    if (!token || !userStr) {
      navigate('/admin/login');
      return;
    }
    setAdminUser(JSON.parse(userStr));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    fetchData();
  }, [navigate, page, search, filterBlok]);

  useEffect(() => {
    if (selectedWargaId) {
      api.get(`/admin/warga/${selectedWargaId}`).then(res => {
        if (res.data.success) {
          setWargaPhotos(res.data.data.foto);
        }
      }).catch(() => setWargaPhotos({}));
    }
  }, [selectedWargaId]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, wargaRes] = await Promise.all([
        api.get('/admin/statistik'),
        api.get('/admin/warga', {
          params: { page, search, blok: filterBlok, per_page: 10 }
        })
      ]);

      if (statsRes.data.success) {
        setStatistik(statsRes.data.data);
      }
      if (wargaRes.data.success) {
        setWarga(wargaRes.data.data.data);
        setTotalPages(wargaRes.data.meta.last_page);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      const error = err as { response?: { status?: number } };
      if (error.response?.status === 401) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, page, search, filterBlok]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      // Fallback: try to parse "dd/mm/yyyy HH:mm" format
      const parts = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/);
      if (parts) {
        return `${parts[1]} ${['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][parseInt(parts[2])-1]} ${parts[3]}`;
      }
      return dateStr;
    }
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <header className="bg-white shadow-soft sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CelesteLogo size="md" animated={false} />
            <div>
              <h1 className="text-lg font-display text-maroon-700">Dashboard Admin</h1>
              <p className="text-sm text-gray-500">{adminUser?.name}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost text-sm">
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading && !statistik ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-maroon-200 border-t-maroon-600 rounded-full animate-spin"></div>
          </div>
        ) : statistik ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0 }}
                className="card"
              >
                <p className="text-sm text-gray-500 mb-1">Total Warga</p>
                <p className="text-3xl font-display text-maroon-700">{statistik.total_warga}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card"
              >
                <p className="text-sm text-gray-500 mb-1">Hari Ini</p>
                <p className="text-3xl font-display text-gold-600">{statistik.pengisian_hari_ini}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card"
              >
                <p className="text-sm text-gray-500 mb-1">Dengan Foto</p>
                <p className="text-3xl font-display text-maroon-700">{statistik.warga_dengan_foto}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card"
              >
                <p className="text-sm text-gray-500 mb-1">Blok Aktif</p>
                <p className="text-3xl font-display text-gold-600">{statistik.warga_per_blok.length}</p>
              </motion.div>
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Chart Per Blok */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="card"
              >
                <h3 className="font-display text-lg text-maroon-700 mb-4">Warga per Blok</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statistik.warga_per_blok}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                      <XAxis dataKey="blok" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#7B1B36" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Chart Status */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="card"
              >
                <h3 className="font-display text-lg text-maroon-700 mb-4">Status Tempat Tinggal</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statistik.warga_per_status}
                        dataKey="count"
                        nameKey="label"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                      >
                        {statistik.warga_per_status.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Chart Tren */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="card md:col-span-2"
              >
                <h3 className="font-display text-lg text-maroon-700 mb-4">Tren Pengisian (30 Hari)</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={statistik.tren_pengisian}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10 }}
                        tickFormatter={(val) => new Date(val).getDate().toString()}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#D5A526" strokeWidth={2} dot={{ fill: '#D5A526' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>

            {/* Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="card"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h3 className="font-display text-lg text-maroon-700">Data Warga</h3>
                <div className="flex gap-2">
                  <input
                    type="search"
                    placeholder="Cari nama..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="input w-48"
                  />
                  <select
                    value={filterBlok}
                    onChange={(e) => { setFilterBlok(e.target.value); setPage(1); }}
                    className="input w-32"
                  >
                    <option value="">Semua Blok</option>
                    {statistik.warga_per_blok.map((b) => (
                      <option key={b.blok} value={b.blok}>{b.blok}</option>
                    ))}
                  </select>
                  <a href={`http://localhost:8000/api/admin/warga/export${filterBlok ? `?blok=${filterBlok}` : ''}`} className="btn btn-secondary">
                    Export
                  </a>
                </div>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {warga.map((w) => (
                  <div key={w.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-maroon-700">{w.nama_lengkap}</h4>
                        <p className="text-sm text-gray-500">{w.alamat}</p>
                      </div>
              {w.has_photo && (
                        <span
                          onClick={() => { setSelectedWarga(w.id); setShowPhotoModal(true); }}
                          className="badge badge-gold cursor-pointer hover:bg-gold-200"
                        >
                          📷
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      <p>{w.no_hp}</p>
                      <p>{w.agama.label} • {w.status_pernikahan.label}</p>
                      <p className="text-xs mt-1">{formatDate(w.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Nama</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Alamat</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">HP</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Agama</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Foto</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {warga.map((w) => (
                      <tr key={w.id} className="border-b border-gray-100 hover:bg-cream-50">
                        <td className="py-3 px-2">{w.nama_lengkap}</td>
                        <td className="py-3 px-2">{w.alamat}</td>
                        <td className="py-3 px-2">{w.no_hp}</td>
                        <td className="py-3 px-2">{w.agama.label}</td>
                        <td className="py-3 px-2">{w.has_photo ? '✅' : '❌'}</td>
                        <td className="py-3 px-2 text-sm text-gray-500">{formatDate(w.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn btn-ghost"
                  >
                    ←
                  </button>
                  <span className="px-4 py-2 text-sm">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="btn btn-ghost"
                  >
                    →
                  </button>
                </div>
              )}
            </motion.div>
          </>
        ) : null}

        {/* Photo Modal */}
        {showPhotoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setShowPhotoModal(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-6 max-w-lg w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-display text-maroon-700">Foto Warga</h3>
                <button onClick={() => setShowPhotoModal(false)} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {wargaPhotos.kk && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Kartu Keluarga</p>
                    <img src={wargaPhotos.kk} alt="KK" className="w-full rounded-lg border" />
                  </div>
                )}
                {wargaPhotos.ktp && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">KTP</p>
                    <img src={wargaPhotos.ktp} alt="KTP" className="w-full rounded-lg border" />
                  </div>
                )}
                {wargaPhotos.keluarga && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Keluarga</p>
                    <img src={wargaPhotos.keluarga} alt="Keluarga" className="w-full rounded-lg border" />
                  </div>
                )}
                {wargaPhotos.selfie && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Selfie</p>
                    <img src={wargaPhotos.selfie} alt="Selfie" className="w-full rounded-lg border" />
                  </div>
                )}
              </div>
              {Object.keys(wargaPhotos).length === 0 && (
                <p className="text-center text-gray-500 py-8">Memuat foto...</p>
              )}
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
