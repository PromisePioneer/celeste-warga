import {useState, useEffect, useCallback} from 'react';
import {motion} from 'framer-motion';
import {useNavigate} from 'react-router-dom';
import api from '../lib/axios';
import {CelesteLogo} from '../components/logo/CelesteLogo';
import {ZoomableImage} from '../components/ui/ZoomableImage';
import {useDebounce} from '../hooks/useDebounce';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line
} from 'recharts';

interface Statistik {
    total_warga: number;
    warga_per_status: { label: string; value: string; count: number }[];
    warga_per_sub_status: { label: string; value: string; count: number }[];
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
    status_tempat_tinggal: { label: string; value: string };
    sub_status: { label: string; value: string } | null;
    // Milik Sendiri & Kontrak Keluarga
    nama_kepala_keluarga: string | null;
    hp_kepala_keluarga: string | null;
    nama_istri: string | null;
    nama_anak: string | null;
    hubungan_lain: string | null;
    nama_hubungan_lain: string | null;
    // Kontrak fields
    mulai_kontrak: string | null;
    berakhir_kontrak: string | null;
    nama_pemilik_usaha: string | null;
    hp_pemilik_usaha: string | null;
    jenis_usaha: string | null;
    jenis_usaha_lainnya: string | null;
    jumlah_karyawan: number | null;
    karyawan_menginap: boolean;
    jumlah_karyawan_menginap: number | null;
    nama_karyawan_menginap: string | null;
    // PIC & Kost
    nama_pic: string | null;
    hp_pic: string | null;
    nama_penghuni_lain: string | null;
    nama: string | null;
    hp: string | null;
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
    const [searchInput, setSearchInput] = useState('');
    const [filterBlok, setFilterBlok] = useState('');
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [selectedWargaId, setSelectedWarga] = useState<number | null>(null);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const [adminUser, setAdminUser] = useState<any>(null);
    const [wargaPhotos, setWargaPhotos] = useState<Record<string, string>>({});

    // Debounced search - triggers fetch after 300ms of no typing
    const search = useDebounce(searchInput, 300);

    // Reset to page 1 when search changes
    useEffect(() => {
        setPage(1);
    }, [search, filterBlok]);

    // Initial load + fetch when page/search/filter changes
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
                    params: {page, search, blok: filterBlok, per_page: 10}
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
                return `${parts[1]} ${['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'][parseInt(parts[2]) - 1]} ${parts[3]}`;
            }
            return dateStr;
        }
        return date.toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'});
    };

    // Get relevant detail based on status
    const toggleExpand = (id: number) => {
        setExpandedRows(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const getDetailInfo = (w: Warga) => {
        if (w.status_tempat_tinggal.value === 'milik_sendiri') {
            return w.nama_kepala_keluarga || '-';
        }
        if (w.status_tempat_tinggal.value === 'kontrak') {
            if (w.sub_status?.value === 'usaha') {
                return `${w.nama_pemilik_usaha || '-'} • ${w.jenis_usaha || '-'}${w.jenis_usaha_lainnya ? ` (${w.jenis_usaha_lainnya})` : ''}`;
            }
            if (w.sub_status?.value === 'keluarga') {
                return w.nama_kepala_keluarga || '-';
            }
            if (w.sub_status?.value === 'mahasiswa') {
                return `PIC: ${w.nama_pic || '-'}`;
            }
        }
        if (w.status_tempat_tinggal.value === 'kost') {
            return w.nama || '-';
        }
        return '-';
    };

    const getContactInfo = (w: Warga) => {
        if (w.status_tempat_tinggal.value === 'kontrak') {
            if (w.sub_status?.value === 'usaha') return w.hp_pemilik_usaha || '-';
            if (w.sub_status?.value === 'mahasiswa') return w.hp_pic || '-';
        }
        return w.no_hp;
    };

    const getKontrakPeriod = (w: Warga) => {
        if (w.mulai_kontrak && w.berakhir_kontrak) {
            return `${w.mulai_kontrak} - ${w.berakhir_kontrak}`;
        }
        return null;
    };

    const handleExport = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            const response = await api.get(
                `/api/admin/warga/export${filterBlok ? `?blok=${filterBlok}` : ''}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/pdf',
                    },
                }
            );
            window.open(url, '_blank');
        } catch (error) {
            console.error('Export error:', error);
            alert('Gagal export data');
        }
    };

    return (
        <div className="min-h-screen bg-cream-50">
            {/* Header */}
            <header className="bg-white shadow-soft sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <CelesteLogo size="md" animated={false}/>
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
                        <div
                            className="w-12 h-12 border-4 border-maroon-200 border-t-maroon-600 rounded-full animate-spin"></div>
                    </div>
                ) : statistik ? (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <motion.div
                                initial={{opacity: 0, y: 20}}
                                animate={{opacity: 1, y: 0}}
                                transition={{delay: 0}}
                                className="card"
                            >
                                <p className="text-sm text-gray-500 mb-1">Total Warga</p>
                                <p className="text-3xl font-display text-maroon-700">{statistik.total_warga}</p>
                            </motion.div>

                            <motion.div
                                initial={{opacity: 0, y: 20}}
                                animate={{opacity: 1, y: 0}}
                                transition={{delay: 0.1}}
                                className="card"
                            >
                                <p className="text-sm text-gray-500 mb-1">Hari Ini</p>
                                <p className="text-3xl font-display text-gold-600">{statistik.pengisian_hari_ini}</p>
                            </motion.div>

                            <motion.div
                                initial={{opacity: 0, y: 20}}
                                animate={{opacity: 1, y: 0}}
                                transition={{delay: 0.2}}
                                className="card"
                            >
                                <p className="text-sm text-gray-500 mb-1">Dengan Foto</p>
                                <p className="text-3xl font-display text-maroon-700">{statistik.warga_dengan_foto}</p>
                            </motion.div>

                            <motion.div
                                initial={{opacity: 0, y: 20}}
                                animate={{opacity: 1, y: 0}}
                                transition={{delay: 0.3}}
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
                                initial={{opacity: 0, y: 20}}
                                animate={{opacity: 1, y: 0}}
                                transition={{delay: 0.4}}
                                className="card"
                            >
                                <h3 className="font-display text-lg text-maroon-700 mb-4">Warga per Blok</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={statistik.warga_per_blok}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#eee"/>
                                            <XAxis dataKey="blok" tick={{fontSize: 12}}/>
                                            <YAxis tick={{fontSize: 12}}/>
                                            <Tooltip/>
                                            <Bar dataKey="count" fill="#7B1B36" radius={[4, 4, 0, 0]}/>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>

                            {/* Chart Status */}
                            <motion.div
                                initial={{opacity: 0, y: 20}}
                                animate={{opacity: 1, y: 0}}
                                transition={{delay: 0.5}}
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
                                                label={({
                                                            name,
                                                            percent
                                                        }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                                            >
                                                {statistik.warga_per_status.map((_, index) => (
                                                    <Cell key={`cell-${index}`}
                                                          fill={STATUS_COLORS[index % STATUS_COLORS.length]}/>
                                                ))}
                                            </Pie>
                                            <Tooltip/>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>

                            {/* Chart Tren */}
                            <motion.div
                                initial={{opacity: 0, y: 20}}
                                animate={{opacity: 1, y: 0}}
                                transition={{delay: 0.6}}
                                className="card md:col-span-2"
                            >
                                <h3 className="font-display text-lg text-maroon-700 mb-4">Tren Pengisian (30 Hari)</h3>
                                <div className="h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={statistik.tren_pengisian}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#eee"/>
                                            <XAxis
                                                dataKey="date"
                                                tick={{fontSize: 10}}
                                                tickFormatter={(val) => new Date(val).getDate().toString()}
                                            />
                                            <YAxis tick={{fontSize: 12}}/>
                                            <Tooltip/>
                                            <Line type="monotone" dataKey="count" stroke="#D5A526" strokeWidth={2}
                                                  dot={{fill: '#D5A526'}}/>
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>
                        </div>

                        {/* Table */}
                        <motion.div
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            transition={{delay: 0.7}}
                            className="card"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                <h3 className="font-display text-lg text-maroon-700">Data Warga</h3>
                                <div className="flex gap-2">
                                    <input
                                        type="search"
                                        placeholder="Cari nama..."
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        className="input w-48"
                                    />
                                    <select
                                        value={filterBlok}
                                        onChange={(e) => {
                                            setFilterBlok(e.target.value);
                                            setPage(1);
                                        }}
                                        className="input w-32"
                                    >
                                        <option value="">Semua Blok</option>
                                        {statistik.warga_per_blok.map((b) => (
                                            <option key={b.blok} value={b.blok}>{b.blok}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={handleExport}
                                        className="btn btn-secondary"
                                    >
                                        Export
                                    </button>
                                </div>
                            </div>

                            {/* Mobile Cards */}
                            <div className="md:hidden space-y-3">
                                {loading ? (
                                    // Skeleton loading for mobile
                                    Array.from({length: 3}).map((_, i) => (
                                        <div key={i} className="border border-gray-200 rounded-xl p-4 animate-pulse">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="space-y-2">
                                                    <div className="h-4 bg-gray-200 rounded w-32"/>
                                                    <div className="h-3 bg-gray-200 rounded w-24"/>
                                                </div>
                                                <div className="h-6 w-6 bg-gray-200 rounded-full"/>
                                            </div>
                                            <div className="space-y-2 mt-3">
                                                <div className="h-3 bg-gray-200 rounded w-full"/>
                                                <div className="h-3 bg-gray-200 rounded w-3/4"/>
                                                <div className="h-3 bg-gray-200 rounded w-1/2"/>
                                            </div>
                                        </div>
                                    ))
                                ) : warga.length === 0 ? (
                                    <p className="text-center text-gray-500 py-8">Tidak ada data warga</p>
                                ) : (
                                    warga.map((w) => (
                                        <div key={w.id} className="border border-gray-200 rounded-xl p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-medium text-maroon-700">{w.nama_lengkap}</h4>
                                                    <p className="text-sm text-gray-500">{w.alamat}</p>
                                                </div>
                                                {w.has_photo && (
                                                    <span
                                                        onClick={() => {
                                                            setSelectedWarga(w.id);
                                                            setShowPhotoModal(true);
                                                        }}
                                                        className="badge badge-gold cursor-pointer hover:bg-gold-200"
                                                    >
                          📷
                        </span>
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                <p className="font-medium">
                        <span className="bg-maroon-100 text-maroon-700 px-2 py-0.5 rounded-full text-xs">
                          {w.status_tempat_tinggal.label}
                        </span>
                                                    {w.sub_status && (
                                                        <span
                                                            className="ml-1 bg-gold-100 text-gold-700 px-2 py-0.5 rounded-full text-xs">
                            {w.sub_status.label}
                          </span>
                                                    )}
                                                </p>
                                                <p className="mt-1">
                                                    <span className="text-gray-400">Detail:</span> {getDetailInfo(w)}
                                                </p>
                                                <p>
                                                    <span className="text-gray-400">HP:</span> {getContactInfo(w)}
                                                </p>
                                                {getKontrakPeriod(w) && (
                                                    <p>
                                                        <span
                                                            className="text-gray-400">Kontrak:</span> {getKontrakPeriod(w)}
                                                    </p>
                                                )}
                                                {w.status_tempat_tinggal.value === 'kontrak' && w.sub_status?.value === 'usaha' && w.jumlah_karyawan != null && w.jumlah_karyawan > 0 && (
                                                    <p>
                                                        <span
                                                            className="text-gray-400">Karyawan:</span> {w.jumlah_karyawan} orang
                                                        {w.karyawan_menginap && (
                                                            <span
                                                                className="ml-1 text-red-600">(menginap: {w.jumlah_karyawan_menginap})</span>
                                                        )}
                                                    </p>
                                                )}
                                                <p className="mt-1">{w.agama.label} • {w.status_pernikahan.label}</p>
                                                <p className="text-xs mt-1">{formatDate(w.created_at)}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Desktop Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="w-10 py-3 px-2"></th>
                                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Nama</th>
                                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Alamat</th>
                                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Status</th>
                                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Kontak</th>
                                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Tanggal</th>
                                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Foto</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {loading ? (
                                        // Skeleton loading for desktop
                                        Array.from({length: 5}).map((_, i) => (
                                            <tr key={i} className="border-b border-gray-100 animate-pulse">
                                                <td className="py-3 px-2">
                                                    <div className="h-4 w-4 bg-gray-200 rounded"/>
                                                </td>
                                                <td className="py-3 px-2">
                                                    <div className="h-4 bg-gray-200 rounded w-28"/>
                                                </td>
                                                <td className="py-3 px-2">
                                                    <div className="h-4 bg-gray-200 rounded w-40"/>
                                                </td>
                                                <td className="py-3 px-2">
                                                    <div className="h-5 bg-gray-200 rounded w-24"/>
                                                </td>
                                                <td className="py-3 px-2">
                                                    <div className="space-y-1">
                                                        <div className="h-3 bg-gray-200 rounded w-20"/>
                                                        <div className="h-2 bg-gray-200 rounded w-16"/>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-2">
                                                    <div className="h-3 bg-gray-200 rounded w-20"/>
                                                </td>
                                                <td className="py-3 px-2">
                                                    <div className="h-4 bg-gray-200 rounded w-12"/>
                                                </td>
                                            </tr>
                                        ))
                                    ) : warga.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="text-center text-gray-500 py-12">Tidak ada data
                                                warga
                                            </td>
                                        </tr>
                                    ) : (
                                        warga.map((w) => (
                                            <>
                                                <tr key={w.id} className="border-b border-gray-100 hover:bg-cream-50">
                                                    <td className="py-3 px-2">
                                                        <button
                                                            onClick={() => toggleExpand(w.id)}
                                                            className="text-gray-400 hover:text-maroon-700 transition-colors"
                                                        >
                                                            {expandedRows.has(w.id) ? '▼' : '▶'}
                                                        </button>
                                                    </td>
                                                    <td className="py-3 px-2 font-medium text-maroon-700">{w.nama_lengkap}</td>
                                                    <td className="py-3 px-2">{w.alamat}</td>
                                                    <td className="py-3 px-2">
                              <span className="text-xs bg-maroon-100 text-maroon-700 px-2 py-1 rounded-full">
                                {w.status_tempat_tinggal.label}
                              </span>
                                                        {w.sub_status && (
                                                            <span
                                                                className="ml-1 text-xs bg-gold-100 text-gold-700 px-2 py-1 rounded-full">
                                  {w.sub_status.label}
                                </span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-2 text-sm">
                                                        <div>{getContactInfo(w)}</div>
                                                        <div
                                                            className="text-gray-400 text-xs">{w.agama.label} • {w.status_pernikahan.label}</div>
                                                    </td>
                                                    <td className="py-3 px-2 text-sm text-gray-500">{formatDate(w.created_at)}</td>
                                                    <td className="py-3 px-2">
                                                        {w.has_photo ? (
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedWarga(w.id);
                                                                    setShowPhotoModal(true);
                                                                }}
                                                                className="text-green-600 hover:text-green-700 font-medium"
                                                            >
                                                                📷 Lihat
                                                            </button>
                                                        ) : '—'}
                                                    </td>
                                                </tr>
                                                {expandedRows.has(w.id) && (
                                                    <tr key={`${w.id}-detail`} className="bg-cream-50">
                                                        <td colSpan={7} className="p-4">
                                                            <div className="grid grid-cols-4 gap-4 text-sm">
                                                                {/* Kolom 1: Identitas */}
                                                                <div className="space-y-1">
                                                                    <h4 className="font-semibold text-maroon-700 mb-2">Identitas</h4>
                                                                    <p><span
                                                                        className="text-gray-500">Nama Lengkap:</span> {w.nama_lengkap}
                                                                    </p>
                                                                    <p><span
                                                                        className="text-gray-500">Alamat:</span> {w.alamat}
                                                                    </p>
                                                                    <p><span
                                                                        className="text-gray-500">Status:</span> {w.status_tempat_tinggal.label}{w.sub_status ? ` / ${w.sub_status.label}` : ''}
                                                                    </p>
                                                                    <p><span
                                                                        className="text-gray-500">Agama:</span> {w.agama.label}
                                                                    </p>
                                                                    <p><span
                                                                        className="text-gray-500">Status Nikah:</span> {w.status_pernikahan.label}
                                                                    </p>
                                                                </div>

                                                                {/* Kolom 2: Kontak */}
                                                                <div className="space-y-1">
                                                                    <h4 className="font-semibold text-maroon-700 mb-2">Kontak</h4>
                                                                    <p><span
                                                                        className="text-gray-500">No. HP:</span> {w.no_hp}
                                                                    </p>
                                                                    {w.nama_kepala_keluarga && <p><span
                                                                        className="text-gray-500">HP Keluarga:</span> {w.hp_kepala_keluarga || '-'}
                                                                    </p>}
                                                                    {w.hp_pemilik_usaha && <p><span
                                                                        className="text-gray-500">HP Pemilik:</span> {w.hp_pemilik_usaha}
                                                                    </p>}
                                                                    {w.hp_pic && <p><span className="text-gray-500">HP PIC:</span> {w.hp_pic}
                                                                    </p>}
                                                                    {w.hp && w.status_tempat_tinggal.value === 'kost' &&
                                                                        <p><span
                                                                            className="text-gray-500">HP:</span> {w.hp}
                                                                        </p>}
                                                                </div>

                                                                {/* Kolom 3: Detail berdasarkan status */}
                                                                <div className="space-y-1">
                                                                    <h4 className="font-semibold text-maroon-700 mb-2">Detail</h4>
                                                                    {w.status_tempat_tinggal.value === 'milik_sendiri' && (
                                                                        <>
                                                                            <p><span className="text-gray-500">Nama Keluarga:</span> {w.nama_kepala_keluarga || '-'}
                                                                            </p>
                                                                            {w.nama_istri && <p><span
                                                                                className="text-gray-500">Istri:</span> {w.nama_istri}
                                                                            </p>}
                                                                            {w.nama_anak && <p><span
                                                                                className="text-gray-500">Anak:</span> {w.nama_anak}
                                                                            </p>}
                                                                            {w.hubungan_lain && <p><span
                                                                                className="text-gray-500">{w.hubungan_lain}:</span> {w.nama_hubungan_lain || '-'}
                                                                            </p>}
                                                                        </>
                                                                    )}
                                                                    {w.status_tempat_tinggal.value === 'kontrak' && w.sub_status?.value === 'usaha' && (
                                                                        <>
                                                                            <p><span className="text-gray-500">Pemilik Usaha:</span> {w.nama_pemilik_usaha || '-'}
                                                                            </p>
                                                                            <p><span className="text-gray-500">Jenis Usaha:</span> {w.jenis_usaha === 'jasa' ? `Jasa${w.jenis_usaha_lainnya ? ` (${w.jenis_usaha_lainnya})` : ''}` : w.jenis_usaha || '-'}
                                                                            </p>
                                                                            <p><span
                                                                                className="text-gray-500">Karyawan:</span> {w.jumlah_karyawan || 0} orang
                                                                            </p>
                                                                            {w.karyawan_menginap && <p><span
                                                                                className="text-red-500">Menginap:</span> {w.jumlah_karyawan_menginap} ({w.nama_karyawan_menginap || '-'})
                                                                            </p>}
                                                                        </>
                                                                    )}
                                                                    {w.status_tempat_tinggal.value === 'kontrak' && w.sub_status?.value === 'keluarga' && (
                                                                        <>
                                                                            <p><span className="text-gray-500">Nama Keluarga:</span> {w.nama_kepala_keluarga || '-'}
                                                                            </p>
                                                                            {w.nama_istri && <p><span
                                                                                className="text-gray-500">Istri:</span> {w.nama_istri}
                                                                            </p>}
                                                                            {w.nama_anak && <p><span
                                                                                className="text-gray-500">Anak:</span> {w.nama_anak}
                                                                            </p>}
                                                                        </>
                                                                    )}
                                                                    {w.status_tempat_tinggal.value === 'kontrak' && w.sub_status?.value === 'mahasiswa' && (
                                                                        <>
                                                                            <p><span
                                                                                className="text-gray-500">PIC:</span> {w.nama_pic || '-'}
                                                                            </p>
                                                                            {w.nama_penghuni_lain &&
                                                                                <p><span className="text-gray-500">Penghuni Lain:</span> {w.nama_penghuni_lain}
                                                                                </p>}
                                                                        </>
                                                                    )}
                                                                    {w.status_tempat_tinggal.value === 'kost' && (
                                                                        <>
                                                                            <p><span
                                                                                className="text-gray-500">Nama:</span> {w.nama || '-'}
                                                                            </p>
                                                                            <p><span
                                                                                className="text-gray-500">HP:</span> {w.hp || '-'}
                                                                            </p>
                                                                            {w.nama_penghuni_lain &&
                                                                                <p><span className="text-gray-500">Penghuni Lain:</span> {w.nama_penghuni_lain}
                                                                                </p>}
                                                                        </>
                                                                    )}
                                                                </div>

                                                                {/* Kolom 4: Kontrak */}
                                                                <div className="space-y-1">
                                                                    <h4 className="font-semibold text-maroon-700 mb-2">Kontrak</h4>
                                                                    {(w.status_tempat_tinggal.value === 'kontrak' || w.status_tempat_tinggal.value === 'kost') ? (
                                                                        <>
                                                                            <p><span
                                                                                className="text-gray-500">Mulai:</span> {w.mulai_kontrak || '-'}
                                                                            </p>
                                                                            <p><span
                                                                                className="text-gray-500">Berakhir:</span> {w.berakhir_kontrak || '-'}
                                                                            </p>
                                                                        </>
                                                                    ) : (
                                                                        <p className="text-gray-400">-</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </>
                                        ))
                                    )}
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
                         onClick={() => setShowPhotoModal(false)}>
                        <motion.div
                            initial={{scale: 0.9, opacity: 0}}
                            animate={{scale: 1, opacity: 1}}
                            className="bg-white rounded-2xl p-6 max-w-lg w-full"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-display text-maroon-700">Foto Warga</h3>
                                <button onClick={() => setShowPhotoModal(false)}
                                        className="text-gray-500 hover:text-gray-700 text-xl">✕
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {wargaPhotos.keluarga && (
                                    <div>
                                        <p className="text-sm text-gray-500 mb-2">Keluarga</p>
                                        <ZoomableImage src={wargaPhotos.keluarga} alt="Keluarga" label="Keluarga"/>
                                    </div>
                                )}
                                {wargaPhotos.selfie && (
                                    <div>
                                        <p className="text-sm text-gray-500 mb-2">Selfie</p>
                                        <ZoomableImage src={wargaPhotos.selfie} alt="Selfie" label="Selfie"/>
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
