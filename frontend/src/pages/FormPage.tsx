import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import api from '../lib/axios';
import imageCompression from 'browser-image-compression';
import { CelesteLogo } from '../components/logo/CelesteLogo';

// Validation schemas
const step1Schema = z.object({
  blok: z.string().min(1, 'Pilih blok rumah'),
  unit: z.string().min(1, 'Pilih unit rumah'),
  status_tempat_tinggal: z.enum(['milik_sendiri', 'kontrak', 'kontrak_keluarga', 'kontrak_mahasiswa', 'kost', 'istri', 'anak']),
  nama_kepala_keluarga: z.string().min(2, 'Nama minimal 2 karakter'),
});

const step2Schema = z.object({
  nama_lengkap: z.string().min(2, 'Nama lengkap minimal 2 karakter'),
  no_kk: z.string().length(16, 'No KK harus 16 digit').regex(/^\d+$/, 'Hanya boleh angka'),
  no_ktp: z.string().length(16, 'No KTP harus 16 digit').regex(/^\d+$/, 'Hanya boleh angka'),
  no_hp: z.string().min(10, 'No HP minimal 10 digit').regex(/^[\d+\s]+$/, 'Format tidak valid'),
});

const step3Schema = z.object({
  status_pernikahan: z.enum(['belum_kawin', 'kawin', 'cerai_hidup', 'cerai_mati']),
  pekerjaan: z.string().optional(),
  agama: z.enum(['islam', 'kristen', 'katolik', 'hindu', 'buddha', 'konghucu', 'lainnya']),
  no_kontak_darurat: z.string().optional(),
});

const step4Schema = z.object({
  foto_kk: z.any().optional(),
  foto_ktp: z.any().optional(),
  foto_keluarga: z.any().optional(),
  foto_selfie: z.any().optional(),
});

const combinedSchema = step1Schema.merge(step2Schema).merge(step3Schema).merge(step4Schema);
type FormData = z.infer<typeof combinedSchema>;

// Block and unit configuration
const BLOK_CONFIG = {
  '89.A-P': { units: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'] },
  '18.A-V': { units: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V'] },
  '19.A-V': { units: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V'] },
  '99.A-S': { units: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S'] },
  '8.A-K': { units: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'] },
  '9.A-W': { units: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W'] },
  '9.AA-AC': { units: ['AA', 'AB', 'AC'] },
};

const STATUS_TEMPAT_TINGGAL = {
  Hunian: [
    { value: 'milik_sendiri', label: 'Milik Sendiri', icon: '🏠' },
    { value: 'kontrak', label: 'Kontrak', icon: '📝' },
    { value: 'kontrak_keluarga', label: 'Kontrak Keluarga', icon: '👨‍👩‍👧‍👦' },
    { value: 'kontrak_mahasiswa', label: 'Kontrak Mahasiswa', icon: '🎓' },
    { value: 'kost', label: 'Kost', icon: '🛏️' },
  ],
  'Anggota Keluarga': [
    { value: 'istri', label: 'Istri', icon: '💍' },
    { value: 'anak', label: 'Anak', icon: '👶' },
  ],
};

const AGAMA_OPTIONS = [
  { value: 'islam', label: 'Islam' },
  { value: 'kristen', label: 'Kristen' },
  { value: 'katolik', label: 'Katolik' },
  { value: 'hindu', label: 'Hindu' },
  { value: 'buddha', label: 'Buddha' },
  { value: 'konghucu', label: 'Konghucu' },
  { value: 'lainnya', label: 'Lainnya' },
];

const STATUS_NIKAH_OPTIONS = [
  { value: 'belum_kawin', label: 'Belum Kawin' },
  { value: 'kawin', label: 'Kawin' },
  { value: 'cerai_hidup', label: 'Cerai Hidup' },
  { value: 'cerai_mati', label: 'Cerai Mati' },
];

const STEPS = [
  { id: 1, title: 'Tempat Tinggal' },
  { id: 2, title: 'Identitas' },
  { id: 3, title: 'Data Diri' },
  { id: 4, title: 'Foto' },
  { id: 5, title: 'Tinjau' },
];

const STORAGE_KEY = 'celeste_form_draft';

// Image compression helper
async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
  };
  return imageCompression(file, options);
}

// Phone number normalizer
function normalizePhone(phone: string): string {
  return phone.replace(/\s/g, '').replace(/^0/, '+62');
}

export default function FormPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [ktpExists, setKtpExists] = useState(false);
  const [photoPreviews, setPhotoPreviews] = useState<Record<string, string>>({});

  // Form setup
  const methods = useForm<FormData>({
    resolver: zodResolver(combinedSchema),
    mode: 'onBlur',
    defaultValues: {
      blok: '',
      unit: '',
      status_tempat_tinggal: undefined,
      nama_kepala_keluarga: '',
      nama_lengkap: '',
      no_kk: '',
      no_ktp: '',
      no_hp: '',
      status_pernikahan: undefined,
      pekerjaan: '',
      agama: undefined,
      no_kontak_darurat: '',
    },
  });

  const { watch, setValue, handleSubmit, trigger, formState: { errors } } = methods;
  const watchedValues = watch();

  // Auto-save to localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        Object.keys(parsed).forEach(key => {
          if (parsed[key] !== undefined && parsed[key] !== null) {
            setValue(key as keyof FormData, parsed[key]);
          }
        });
      } catch {
        // Ignore parse errors
      }
    }
  }, [setValue]);

  useEffect(() => {
    const subscription = watch((value) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // Check KTP existence
  const checkKtpExists = async (noKtp: string) => {
    if (noKtp.length !== 16) return;
    try {
      const response = await api.post('/warga/cek-ktp', { no_ktp: noKtp });
      setKtpExists(response.data.terdaftar);
    } catch {
      // Ignore errors
    }
  };

  // Watch for KTP changes
  useEffect(() => {
    if (watchedValues.no_ktp?.length === 16) {
      checkKtpExists(watchedValues.no_ktp);
    }
  }, [watchedValues.no_ktp]);

  // Navigation
  const goNext = async () => {
    let isValid = false;

    switch (currentStep) {
      case 1:
        isValid = await trigger(['blok', 'unit', 'status_tempat_tinggal', 'nama_kepala_keluarga']);
        break;
      case 2:
        isValid = await trigger(['nama_lengkap', 'no_kk', 'no_ktp', 'no_hp']);
        break;
      case 3:
        isValid = await trigger(['status_pernikahan', 'agama']);
        break;
      default:
        isValid = true;
    }

    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goPrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Photo handlers
  const handlePhotoChange = async (field: string, file: File | null) => {
    if (!file) {
      setPhotoPreviews(prev => ({ ...prev, [field]: '' }));
      setValue(field as keyof FormData, undefined);
      return;
    }

    try {
      const compressed = await compressImage(file);
      const preview = URL.createObjectURL(compressed);
      setPhotoPreviews(prev => ({ ...prev, [field]: preview }));
      setValue(field as keyof FormData, compressed as any);
    } catch {
      setPhotoPreviews(prev => ({ ...prev, [field]: URL.createObjectURL(file) }));
      setValue(field as keyof FormData, file as any);
    }
  };

  // Form submission
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key.startsWith('foto_')) {
          if (value instanceof File) {
            formData.append(key, value);
          }
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      // Normalize phone numbers
      formData.set('no_hp', normalizePhone(data.no_hp || ''));
      if (data.no_kontak_darurat) {
        formData.set('no_kontak_darurat', normalizePhone(data.no_kontak_darurat));
      }

      await api.post('/warga', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Clear draft
      localStorage.removeItem(STORAGE_KEY);
      navigate('/sukses');
    } catch (error: any) {
      if (error.response?.status === 422 && error.response?.data?.kode === 'ktp_sudah_terdaftar') {
        setKtpExists(true);
        setCurrentStep(2);
        setSubmitError('No. KTP ini sudah terdaftar di sistem.');
      } else {
        setSubmitError('Terjadi kesalahan. Silakan coba lagi.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableUnits = watchedValues.blok ? BLOK_CONFIG[watchedValues.blok as keyof typeof BLOK_CONFIG]?.units || [] : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-cream-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-soft">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center">
            <CelesteLogo size="lg" animated={false} />
          </div>

          {/* Progress bar */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-3">
              {STEPS.map((step) => (
                <div key={step.id} className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                      currentStep > step.id
                        ? 'bg-gold-500 text-white'
                        : currentStep === step.id
                        ? 'bg-maroon-700 text-white shadow-lg'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      step.id
                    )}
                  </div>
                  <span className={`text-xs mt-2 font-medium ${
                    currentStep >= step.id ? 'text-maroon-700' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Form Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              {/* Step 1: Tempat Tinggal */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-display text-maroon-700 mb-6">Tempat Tinggal</h2>

                  {/* Blok */}
                  <div>
                    <label className="label">Blok Rumah</label>
                    <select
                      {...methods.register('blok')}
                      className={`input ${errors.blok ? 'input-error' : ''}`}
                    >
                      <option value="">Pilih Blok</option>
                      {Object.keys(BLOK_CONFIG).map((blok) => (
                        <option key={blok} value={blok}>{blok}</option>
                      ))}
                    </select>
                    {errors.blok && <p className="text-red-500 text-sm mt-1">{errors.blok.message}</p>}
                  </div>

                  {/* Unit */}
                  {watchedValues.blok && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                    >
                      <label className="label">Unit/Kavling</label>
                      <select
                        {...methods.register('unit')}
                        className={`input ${errors.unit ? 'input-error' : ''}`}
                      >
                        <option value="">Pilih Unit</option>
                        {availableUnits.map((unit) => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                      {errors.unit && <p className="text-red-500 text-sm mt-1">{errors.unit.message}</p>}
                      {watchedValues.blok && watchedValues.unit && (
                        <p className="text-gold-600 font-medium mt-2">
                          Alamat: Blok {watchedValues.blok.replace('89.A-P', '89').replace('.A-P', '').replace('.A-V', '').replace('.A-S', '').replace('.A-K', '').replace('.A-W', '').replace('.AA-AC', '')}, Unit {watchedValues.unit}
                        </p>
                      )}
                    </motion.div>
                  )}

                  {/* Status Tempat Tinggal */}
                  <div>
                    <label className="label">Status Tempat Tinggal</label>
                    {Object.entries(STATUS_TEMPAT_TINGGAL).map(([group, options]) => (
                      <div key={group} className="mb-4">
                        <p className="text-sm text-gray-500 mb-2">{group}</p>
                        <div className="grid grid-cols-2 gap-3">
                          {options.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => setValue('status_tempat_tinggal', option.value as any)}
                              className={`selection-card text-left ${
                                watchedValues.status_tempat_tinggal === option.value ? 'selection-card-selected' : ''
                              }`}
                            >
                              <span className="text-xl mr-2">{option.icon}</span>
                              <span className="text-sm font-medium">{option.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    {errors.status_tempat_tinggal && (
                      <p className="text-red-500 text-sm mt-1">{errors.status_tempat_tinggal.message}</p>
                    )}
                  </div>

                  {/* Nama Kepala Keluarga */}
                  <div>
                    <label className="label">Nama Kepala Keluarga / Penanggung Jawab</label>
                    <input
                      {...methods.register('nama_kepala_keluarga')}
                      type="text"
                      className={`input ${errors.nama_kepala_keluarga ? 'input-error' : ''}`}
                      placeholder="Masukkan nama"
                    />
                    {errors.nama_kepala_keluarga && (
                      <p className="text-red-500 text-sm mt-1">{errors.nama_kepala_keluarga.message}</p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Identitas */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-display text-maroon-700 mb-6">Identitas</h2>

                  {ktpExists && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-yellow-50 border border-yellow-200 rounded-xl p-4"
                    >
                      <p className="text-yellow-800 text-sm">
                        Data dengan No. KTP ini sudah tercatat. Terima kasih, Anda tidak perlu mengisi lagi 😊
                      </p>
                    </motion.div>
                  )}

                  <div>
                    <label className="label">Nama Lengkap (sesuai KK)</label>
                    <input
                      {...methods.register('nama_lengkap')}
                      type="text"
                      className={`input ${errors.nama_lengkap ? 'input-error' : ''}`}
                      placeholder="Masukkan nama lengkap"
                    />
                    {errors.nama_lengkap && (
                      <p className="text-red-500 text-sm mt-1">{errors.nama_lengkap.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="label">No. Kartu Keluarga (16 digit)</label>
                    <input
                      {...methods.register('no_kk')}
                      type="text"
                      maxLength={16}
                      className={`input ${errors.no_kk ? 'input-error' : ''}`}
                      placeholder="Masukkan 16 digit No. KK"
                    />
                    {errors.no_kk && (
                      <p className="text-red-500 text-sm mt-1">{errors.no_kk.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="label">No. KTP / NIK (16 digit)</label>
                    <input
                      {...methods.register('no_ktp')}
                      type="text"
                      maxLength={16}
                      className={`input ${errors.no_ktp || ktpExists ? 'input-error' : ''}`}
                      placeholder="Masukkan 16 digit No. KTP"
                    />
                    {ktpExists && (
                      <p className="text-red-500 text-sm mt-1">No. KTP sudah terdaftar</p>
                    )}
                    {errors.no_ktp && !ktpExists && (
                      <p className="text-red-500 text-sm mt-1">{errors.no_ktp.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="label">No. HP</label>
                    <input
                      {...methods.register('no_hp')}
                      type="tel"
                      className={`input ${errors.no_hp ? 'input-error' : ''}`}
                      placeholder="08xxxxxxxxxx"
                    />
                    {errors.no_hp && (
                      <p className="text-red-500 text-sm mt-1">{errors.no_hp.message}</p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 3: Data Diri */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-display text-maroon-700 mb-6">Data Diri</h2>

                  <div>
                    <label className="label">Status Pernikahan</label>
                    <div className="grid grid-cols-2 gap-3">
                      {STATUS_NIKAH_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setValue('status_pernikahan', option.value as any)}
                          className={`selection-card ${
                            watchedValues.status_pernikahan === option.value ? 'selection-card-selected' : ''
                          }`}
                        >
                          <span className="text-sm font-medium">{option.label}</span>
                        </button>
                      ))}
                    </div>
                    {errors.status_pernikahan && (
                      <p className="text-red-500 text-sm mt-1">{errors.status_pernikahan.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="label">Pekerjaan</label>
                    <input
                      {...methods.register('pekerjaan')}
                      type="text"
                      className="input"
                      placeholder="Contoh: Pegawai Swasta, Wiraswasta, Guru, dll"
                    />
                  </div>

                  <div>
                    <label className="label">Agama</label>
                    <select
                      {...methods.register('agama')}
                      className={`input ${errors.agama ? 'input-error' : ''}`}
                    >
                      <option value="">Pilih Agama</option>
                      {AGAMA_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    {errors.agama && (
                      <p className="text-red-500 text-sm mt-1">{errors.agama.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="label">No. Kontak Darurat (opsional)</label>
                    <input
                      {...methods.register('no_kontak_darurat')}
                      type="tel"
                      className="input"
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 4: Foto */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-display text-maroon-700 mb-2">Foto</h2>
                  <p className="text-gray-500 text-sm mb-6">Semua foto bersifat opsional. Anda dapat melewati langkah ini.</p>

                  <div className="space-y-4">
                    {['foto_kk', 'foto_ktp', 'foto_keluarga', 'foto_selfie'].map((field) => {
                      const labels: Record<string, string> = {
                        foto_kk: 'Foto Kartu Keluarga',
                        foto_ktp: 'Foto KTP',
                        foto_keluarga: 'Foto Keluarga',
                        foto_selfie: 'Foto Selfie ( Anak Kost-Kostan)',
                      };
                      const showField = field === 'foto_selfie'
                        ? watchedValues.status_tempat_tinggal === 'kost' || watchedValues.status_tempat_tinggal === 'kontrak_mahasiswa'
                        : field === 'foto_keluarga'
                        ? watchedValues.status_tempat_tinggal !== 'kost' && watchedValues.status_tempat_tinggal !== 'kontrak_mahasiswa'
                        : true;

                      if (!showField) return null;

                      return (
                        <div key={field} className="card">
                          <label className="label">{labels[field]}</label>
                          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-maroon-300 transition-colors">
                            {photoPreviews[field] ? (
                              <div className="relative">
                                <img
                                  src={photoPreviews[field]}
                                  alt={labels[field]}
                                  className="max-h-48 mx-auto rounded-lg object-contain"
                                />
                                <button
                                  type="button"
                                  onClick={() => handlePhotoChange(field, null)}
                                  className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            ) : (
                              <>
                                <input
                                  type="file"
                                  accept="image/*"
                                  capture={field === 'foto_selfie' ? 'user' : undefined}
                                  onChange={(e) => handlePhotoChange(field, e.target.files?.[0] || null)}
                                  className="hidden"
                                  id={field}
                                />
                                <label htmlFor={field} className="cursor-pointer">
                                  <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <p className="text-sm text-gray-500">Klik untuk upload</p>
                                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP (maks 2MB)</p>
                                </label>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Step 5: Tinjau */}
              {currentStep === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-display text-maroon-700 mb-6">Tinjau & Kirim</h2>

                  <div className="space-y-4">
                    <div className="card">
                      <h3 className="font-display text-maroon-700 mb-3">Tempat Tinggal</h3>
                      <div className="text-sm space-y-1 text-gray-600">
                        <p><span className="font-medium">Blok:</span> {watchedValues.blok}</p>
                        <p><span className="font-medium">Unit:</span> {watchedValues.unit}</p>
                        <p><span className="font-medium">Status:</span> {STATUS_TEMPAT_TINGGAL.Hunian.concat(STATUS_TEMPAT_TINGGAL['Anggota Keluarga']).find(o => o.value === watchedValues.status_tempat_tinggal)?.label}</p>
                        <p><span className="font-medium">Kepala Keluarga:</span> {watchedValues.nama_kepala_keluarga}</p>
                      </div>
                      <button type="button" onClick={() => setCurrentStep(1)} className="text-sm text-maroon-600 mt-2 hover:underline">
                        Edit
                      </button>
                    </div>

                    <div className="card">
                      <h3 className="font-display text-maroon-700 mb-3">Identitas</h3>
                      <div className="text-sm space-y-1 text-gray-600">
                        <p><span className="font-medium">Nama:</span> {watchedValues.nama_lengkap}</p>
                        <p><span className="font-medium">No. KK:</span> {watchedValues.no_kk}</p>
                        <p><span className="font-medium">No. KTP:</span> {watchedValues.no_ktp}</p>
                        <p><span className="font-medium">No. HP:</span> {watchedValues.no_hp}</p>
                      </div>
                      <button type="button" onClick={() => setCurrentStep(2)} className="text-sm text-maroon-600 mt-2 hover:underline">
                        Edit
                      </button>
                    </div>

                    <div className="card">
                      <h3 className="font-display text-maroon-700 mb-3">Data Diri</h3>
                      <div className="text-sm space-y-1 text-gray-600">
                        <p><span className="font-medium">Status Pernikahan:</span> {STATUS_NIKAH_OPTIONS.find(o => o.value === watchedValues.status_pernikahan)?.label}</p>
                        <p><span className="font-medium">Pekerjaan:</span> {watchedValues.pekerjaan || '-'}</p>
                        <p><span className="font-medium">Agama:</span> {AGAMA_OPTIONS.find(o => o.value === watchedValues.agama)?.label}</p>
                        <p><span className="font-medium">Kontak Darurat:</span> {watchedValues.no_kontak_darurat || '-'}</p>
                      </div>
                      <button type="button" onClick={() => setCurrentStep(3)} className="text-sm text-maroon-600 mt-2 hover:underline">
                        Edit
                      </button>
                    </div>

                    <div className="card">
                      <h3 className="font-display text-maroon-700 mb-3">Persetujuan</h3>
                      <p className="text-sm text-gray-600">
                        Data yang saya berikan adalah benar dan akurat. Saya menyetujui bahwa data ini hanya用于 keperluan administrasi pengurus komplek Celeste.
                      </p>
                    </div>
                  </div>

                  {submitError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 border border-red-200 rounded-xl p-4"
                    >
                      <p className="text-red-700 text-sm">{submitError}</p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="flex justify-between mt-8">
              {currentStep > 1 ? (
                <button type="button" onClick={goPrev} className="btn btn-secondary">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Kembali
                </button>
              ) : (
                <div />
              )}

              {currentStep < 5 ? (
                <button type="button" onClick={goNext} className="btn btn-primary">
                  Lanjut
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting || ktpExists}
                  className="btn btn-gold"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Mengirim...
                    </>
                  ) : (
                    <>
                      Kirim Data
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </FormProvider>
      </main>
    </div>
  );
}
