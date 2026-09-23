import {useState, useEffect} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import {useForm, FormProvider} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {useNavigate} from 'react-router-dom';
import {z} from 'zod';
import api from '../lib/axios';
import imageCompression from 'browser-image-compression';
import {CelesteLogo} from '../components/logo/CelesteLogo';

// Validation schemas
const step1Schema = z.object({
    blok: z.string().min(1, 'Pilih blok rumah'),
    unit: z.string().min(1, 'Pilih unit rumah'),
    status_tempat_tinggal: z.enum(['milik_sendiri', 'kontrak', 'kost']),
    sub_status: z.enum(['milik_sendiri', 'usaha', 'keluarga', 'mahasiswa']).optional(),

    // Milik Sendiri
    nama_kepala_keluarga: z.string().optional(),
    hp_kepala_keluarga: z.string().optional(),
    nama_istri: z.string().optional(),
    nama_anak: z.string().optional(),
    hubungan_lain: z.string().optional(),
    nama_hubungan_lain: z.string().optional(),

    // Kontrak Usaha
    mulai_kontrak: z.string().optional(),
    berakhir_kontrak: z.string().optional(),
    nama_pemilik_usaha: z.string().optional(),
    hp_pemilik_usaha: z.string().optional(),
    jenis_usaha: z.enum(['jasa', 'kebutuhan_harian', 'laundry', 'catering', 'online_shop']).optional(),
    jenis_usaha_lainnya: z.string().optional(),
    jumlah_karyawan: z.string().optional(),
    karyawan_menginap: z.boolean().optional(),
    jumlah_karyawan_menginap: z.string().optional(),
    nama_karyawan_menginap: z.string().optional(),

    // Kontrak Mahasiswa
    nama_pic: z.string().optional(),
    hp_pic: z.string().optional(),

    // Kost (individu)
    nama: z.string().optional(),
    hp: z.string().optional(),
    nama_penghuni_lain: z.string().optional(),
});

const step2Schema = z.object({
    nama_lengkap: z.string().min(2, 'Nama lengkap minimal 2 karakter'),
    no_kk: z.string().optional(),
    no_ktp: z.string().optional(),
    no_hp: z.string().min(10, 'No HP minimal 10 digit').regex(/^[\d+\s]+$/, 'Format tidak valid'),
});

const step3Schema = z.object({
    status_pernikahan: z.enum(['belum_kawin', 'kawin', 'cerai_hidup', 'cerai_mati']),
    pekerjaan: z.enum(['pegawai_negeri', 'pegawai_swasta', 'wiraswasta', 'guru', 'dokter', 'tentara', 'pensiunan', 'irt', 'pelajar', 'lainnya']),
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
    '89': {units: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P']},
    '18': {units: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V']},
    '19': {units: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V']},
    '99': {units: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S']},
    '8': {units: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K']},
    '9': {units: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'AA', 'AB', 'AC']},
};

const STATUS_TEMPAT_TINGGAL = [
    {value: 'milik_sendiri', label: 'Milik Sendiri', icon: '🏠'},
    {value: 'kontrak', label: 'Kontrak', icon: '📝'},
    {value: 'kost', label: 'Kost', icon: '🛏️'},
];

const SUB_STATUS_KONTRAK = [
    {value: 'usaha', label: 'Usaha', icon: '🏪'},
    {value: 'keluarga', label: 'Keluarga', icon: '👨‍👩‍👧‍👦'},
    {value: 'mahasiswa', label: 'Mahasiswa', icon: '🎓'},
];

const AGAMA_OPTIONS = [
    {value: 'islam', label: 'Islam'},
    {value: 'kristen', label: 'Kristen'},
    {value: 'katolik', label: 'Katolik'},
    {value: 'hindu', label: 'Hindu'},
    {value: 'buddha', label: 'Buddha'},
    {value: 'konghucu', label: 'Konghucu'},
    {value: 'lainnya', label: 'Lainnya'},
];

const STATUS_NIKAH_OPTIONS = [
    {value: 'belum_kawin', label: 'Belum Kawin'},
    {value: 'kawin', label: 'Kawin'},
    {value: 'cerai_hidup', label: 'Cerai Hidup'},
    {value: 'cerai_mati', label: 'Cerai Mati'},
];

const PEKERJAAN_OPTIONS = [
    {value: 'pegawai_negeri', label: 'Pegawai Negeri'},
    {value: 'pegawai_swasta', label: 'Pegawai Swasta'},
    {value: 'wiraswasta', label: 'Wiraswasta'},
    {value: 'guru', label: 'Guru'},
    {value: 'dokter', label: 'Dokter'},
    {value: 'tentara', label: 'TNI/Polri'},
    {value: 'pensiunan', label: 'Pensiunan'},
    {value: 'irt', label: 'Ibu Rumah Tangga'},
    {value: 'pelajar', label: 'Pelajar/Mahasiswa'},
    {value: 'lainnya', label: 'Lainnya'},
];

const JENIS_USAHA_OPTIONS = [
    {value: 'jasa', label: 'Jasa'},
    {value: 'kebutuhan_harian', label: 'Kebutuhan Harian'},
    {value: 'laundry', label: 'Laundry'},
    {value: 'catering', label: 'Catering'},
    {value: 'online_shop', label: 'Online Shop'},
];

const HUBUNGAN_LAIN_OPTIONS = [
    {value: 'art', label: 'ART (Asisten Rumah Tangga)'},
    {value: 'saudara', label: 'Saudara'},
    {value: 'orang_tua', label: 'Orang Tua'},
    {value: 'mertua', label: 'Mertua'},
];

const STEPS = [
    {id: 1, title: 'Tempat Tinggal'},
    {id: 2, title: 'Identitas'},
    {id: 3, title: 'Status Pernikahan'},
    {id: 4, title: 'Foto'},
    {id: 5, title: 'Tinjau'},
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

// Scroll to first error helper
function scrollToFirstError(errors: Record<string, string>) {
    const firstKey = Object.keys(errors)[0];
    if (!firstKey) return;

    setTimeout(() => {
        const el = document.querySelector(`[name="${firstKey}"]`) as HTMLElement | null;
        if (el) {
            el.scrollIntoView({behavior: 'smooth', block: 'center'});
            el.focus({preventScroll: true});
        }
    }, 50);
}

// Helper untuk flatten nested backend errors
function flattenBackendErrors(rawErrors: unknown): Record<string, string> {
    const flatErrors: Record<string, string> = {};

    const toMessage = (val: unknown): string => {
        if (Array.isArray(val)) return String(val[0] ?? '');
        if (val === null || val === undefined) return '';
        return String(val);
    };

    if (!rawErrors || typeof rawErrors !== 'object') return flatErrors;

    const entries = Object.entries(rawErrors as Record<string, unknown>);

    for (const [key, entry] of entries) {
        if (
            key === 'fieldErrors' &&
            entry &&
            typeof entry === 'object' &&
            !Array.isArray(entry)
        ) {
            // Nested: { fieldErrors: { nama_lengkap: ['msg'], ... } }
            const nested = entry as Record<string, unknown>;
            for (const [fieldKey, val] of Object.entries(nested)) {
                flatErrors[fieldKey] = toMessage(val);
            }
        } else {
            flatErrors[key] = toMessage(entry);
        }
    }

    return flatErrors;
}

export default function FormPage() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [ktpExists, setKtpExists] = useState(false);
    const [photoPreviews, setPhotoPreviews] = useState<Record<string, string>>({});
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    // Form setup
    const methods = useForm<FormData>({
        resolver: zodResolver(combinedSchema),
        mode: 'onBlur',
        defaultValues: {
            blok: '',
            unit: '',
            status_tempat_tinggal: undefined,
            sub_status: undefined,
            nama_kepala_keluarga: '',
            hp_kepala_keluarga: '',
            nama_istri: '',
            nama_anak: '',
            hubungan_lain: undefined,
            nama_hubungan_lain: '',
            mulai_kontrak: '',
            berakhir_kontrak: '',
            nama_pemilik_usaha: '',
            hp_pemilik_usaha: '',
            jenis_usaha: undefined,
            jenis_usaha_lainnya: '',
            jumlah_karyawan: undefined,
            karyawan_menginap: false,
            jumlah_karyawan_menginap: undefined,
            nama_karyawan_menginap: '',
            nama_pic: '',
            hp_pic: '',
            nama_penghuni_lain: '',
            // Kost
            nama: '',
            hp: '',
            nama_lengkap: '',
            no_kk: '',
            no_ktp: '',
            no_hp: '',
            status_pernikahan: undefined,
            pekerjaan: undefined,
            agama: undefined,
            no_kontak_darurat: '',
        },
    });

    const {watch, setValue, handleSubmit} = methods;
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
            const response = await api.post('/warga/cek-ktp', {no_ktp: noKtp});
            setKtpExists(response.data.terdaftar);
        } catch {
            // Ignore errors
        }
    };

    // Watch for KTP changes
    useEffect(() => {
        if (watchedValues.no_ktp?.length === 16) {
            checkKtpExists(watchedValues.no_ktp);
        } else {
            // Clear the ktpExists flag when no_ktp is cleared or not filled
            setKtpExists(false);
        }
    }, [watchedValues.no_ktp]);

    // Navigation
    const goNext = async () => {
        let isValid = false;

        switch (currentStep) {
            case 1: {
                // Clear all errors first
                methods.clearErrors();
                setFieldErrors({});

                // Validate blok and unit first
                const newErrors: Record<string, string> = {};
                if (!watchedValues.blok) {
                    newErrors['blok'] = 'Pilih blok rumah';
                }
                if (!watchedValues.unit) {
                    newErrors['unit'] = 'Pilih unit rumah';
                }
                if (!watchedValues.status_tempat_tinggal) {
                    newErrors['status_tempat_tinggal'] = 'Pilih status tempat tinggal';
                }

                // Conditional validation based on status
                const status = watchedValues.status_tempat_tinggal;
                let stepValid = true;

                if (status === 'milik_sendiri') {
                    if (!watchedValues.nama_kepala_keluarga || watchedValues.nama_kepala_keluarga.length < 2) {
                        newErrors['nama_kepala_keluarga'] = 'Nama kepala keluarga wajib diisi';
                        stepValid = false;
                    }
                    if (!watchedValues.hp_kepala_keluarga || watchedValues.hp_kepala_keluarga.length < 10) {
                        newErrors['hp_kepala_keluarga'] = 'No. HP kepala keluarga wajib diisi (min. 10 digit)';
                        stepValid = false;
                    }
                } else if (status === 'kontrak') {
                    if (!watchedValues.sub_status) {
                        newErrors['sub_status'] = 'Pilih tipe kontrak';
                        stepValid = false;
                    } else if (watchedValues.sub_status === 'usaha') {
                        // Kontrak Usaha
                        if (!watchedValues.mulai_kontrak) {
                            newErrors['mulai_kontrak'] = 'Tanggal mulai kontrak wajib diisi';
                            stepValid = false;
                        }
                        if (!watchedValues.berakhir_kontrak) {
                            newErrors['berakhir_kontrak'] = 'Tanggal berakhir kontrak wajib diisi';
                            stepValid = false;
                        }
                        if (!watchedValues.nama_pemilik_usaha || watchedValues.nama_pemilik_usaha.length < 2) {
                            newErrors['nama_pemilik_usaha'] = 'Nama pemilik usaha wajib diisi';
                            stepValid = false;
                        }
                        if (!watchedValues.hp_pemilik_usaha || watchedValues.hp_pemilik_usaha.length < 10) {
                            newErrors['hp_pemilik_usaha'] = 'No. HP pemilik usaha wajib diisi (min. 10 digit)';
                            stepValid = false;
                        }
                        if (!watchedValues.jenis_usaha) {
                            newErrors['jenis_usaha'] = 'Pilih jenis usaha';
                            stepValid = false;
                        }
                        // Karyawan menginap conditional
                        if (watchedValues.karyawan_menginap === true) {
                            if (!watchedValues.jumlah_karyawan_menginap) {
                                newErrors['jumlah_karyawan_menginap'] = 'Jumlah karyawan menginap wajib diisi';
                                stepValid = false;
                            }
                            if (!watchedValues.nama_karyawan_menginap) {
                                newErrors['nama_karyawan_menginap'] = 'Nama karyawan menginap wajib diisi';
                                stepValid = false;
                            }
                        }
                    } else if (watchedValues.sub_status === 'keluarga') {
                        // Kontrak Keluarga
                        if (!watchedValues.mulai_kontrak) {
                            newErrors['mulai_kontrak'] = 'Tanggal mulai kontrak wajib diisi';
                            stepValid = false;
                        }
                        if (!watchedValues.berakhir_kontrak) {
                            newErrors['berakhir_kontrak'] = 'Tanggal berakhir kontrak wajib diisi';
                            stepValid = false;
                        }
                        if (!watchedValues.nama_kepala_keluarga || watchedValues.nama_kepala_keluarga.length < 2) {
                            newErrors['nama_kepala_keluarga'] = 'Nama kepala keluarga wajib diisi';
                            stepValid = false;
                        }
                        if (!watchedValues.hp_kepala_keluarga || watchedValues.hp_kepala_keluarga.length < 10) {
                            newErrors['hp_kepala_keluarga'] = 'No. HP kepala keluarga wajib diisi (min. 10 digit)';
                            stepValid = false;
                        }
                    } else if (watchedValues.sub_status === 'mahasiswa') {
                        // Kontrak Mahasiswa
                        if (!watchedValues.nama_pic || watchedValues.nama_pic.length < 2) {
                            newErrors['nama_pic'] = 'Nama PIC wajib diisi';
                            stepValid = false;
                        }
                        if (!watchedValues.hp_pic || watchedValues.hp_pic.length < 10) {
                            newErrors['hp_pic'] = 'No. HP PIC wajib diisi (min. 10 digit)';
                            stepValid = false;
                        }
                    }
                } else if (status === 'kost') {
                    // Kost
                    if (!watchedValues.mulai_kontrak) {
                        newErrors['mulai_kontrak'] = 'Tanggal mulai kontrak wajib diisi';
                        stepValid = false;
                    }
                    if (!watchedValues.berakhir_kontrak) {
                        newErrors['berakhir_kontrak'] = 'Tanggal berakhir kontrak wajib diisi';
                        stepValid = false;
                    }
                    if (!watchedValues.nama || watchedValues.nama.length < 2) {
                        newErrors['nama'] = 'Nama wajib diisi';
                        stepValid = false;
                    }
                    if (!watchedValues.hp || watchedValues.hp.length < 10) {
                        newErrors['hp'] = 'No. HP wajib diisi (min. 10 digit)';
                        stepValid = false;
                    }
                }

                isValid = stepValid && Object.keys(newErrors).length === 0;
                if (!isValid) {
                    setFieldErrors(newErrors);
                    scrollToFirstError(newErrors);
                }
                break;
            }
            case 2: {
                const step2Errors: Record<string, string> = {};
                let step2Valid = true;
                if (!watchedValues.nama_lengkap || watchedValues.nama_lengkap.length < 2) {
                    step2Errors['nama_lengkap'] = 'Nama lengkap wajib diisi';
                    step2Valid = false;
                }
                // no_kk and no_ktp are optional
                if (!watchedValues.no_hp || watchedValues.no_hp.length < 10) {
                    step2Errors['no_hp'] = 'No. HP wajib diisi';
                    step2Valid = false;
                }
                isValid = step2Valid;
                if (!isValid) {
                    setFieldErrors(step2Errors);
                    scrollToFirstError(step2Errors);
                }
                break;
            }
            case 3: {
                const step3Errors: Record<string, string> = {};
                let step3Valid = true;
                if (!watchedValues.status_pernikahan) {
                    step3Errors['status_pernikahan'] = 'Pilih status pernikahan';
                    step3Valid = false;
                }
                if (!watchedValues.pekerjaan) {
                    step3Errors['pekerjaan'] = 'Pilih pekerjaan';
                    step3Valid = false;
                }
                if (!watchedValues.agama) {
                    step3Errors['agama'] = 'Pilih agama';
                    step3Valid = false;
                }
                isValid = step3Valid;
                if (!isValid) {
                    setFieldErrors(step3Errors);
                    scrollToFirstError(step3Errors);
                }
                break;
            }
            default:
                isValid = true;
        }

        if (isValid) {
            setFieldErrors({});
            setCurrentStep(prev => Math.min(prev + 1, 5));
            window.scrollTo({top: 0, behavior: 'smooth'});
        }
    };

    const goPrev = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
        window.scrollTo({top: 0, behavior: 'smooth'});
    };

    // Photo handlers
    const handlePhotoChange = async (field: string, file: File | null) => {
        if (!file) {
            setPhotoPreviews(prev => ({...prev, [field]: ''}));
            setValue(field as keyof FormData, undefined);
            return;
        }

        try {
            const compressed = await compressImage(file);
            const preview = URL.createObjectURL(compressed);
            setPhotoPreviews(prev => ({...prev, [field]: preview}));
            setValue(field as keyof FormData, compressed as any);
        } catch {
            setPhotoPreviews(prev => ({...prev, [field]: URL.createObjectURL(file)}));
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
                headers: {'Content-Type': 'multipart/form-data'},
            });

            // Clear draft
            localStorage.removeItem(STORAGE_KEY);
            navigate('/sukses');
        } catch (error: any) {
            if (error.response?.status === 422 && error.response?.data?.kode === 'ktp_sudah_terdaftar') {
                setKtpExists(true);
                setCurrentStep(2);
                setSubmitError('No. KTP ini sudah terdaftar di sistem.');
            } else if (error.response?.status === 422 && error.response?.data?.errors) {
                // Backend validation errors - flatten nested fieldErrors
                const flatErrors = flattenBackendErrors(error.response.data.errors);

                setFieldErrors(flatErrors);
                setSubmitError('Mohon perbaiki isian Anda.');

                // Navigate to the step with errors
                const errorFields = Object.keys(flatErrors);
                if (errorFields.some(f => ['nama_kepala_keluarga', 'hp_kepala_keluarga', 'mulai_kontrak', 'berakhir_kontrak', 'nama_pemilik_usaha', 'hp_pemilik_usaha', 'jenis_usaha', 'nama', 'hp', 'nama_pic', 'hp_pic', 'sub_status'].includes(f))) {
                    setCurrentStep(1);
                } else if (errorFields.some(f => ['nama_lengkap', 'no_kk', 'no_ktp', 'no_hp'].includes(f))) {
                    setCurrentStep(2);
                } else if (errorFields.some(f => ['status_pernikahan', 'pekerjaan', 'agama', 'no_kontak_darurat'].includes(f))) {
                    setCurrentStep(3);
                }
                scrollToFirstError(flatErrors);
            } else {
                setSubmitError('Terjadi kesalahan. Silakan coba lagi.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const availableUnits = watchedValues.blok ? BLOK_CONFIG[watchedValues.blok as keyof typeof BLOK_CONFIG]?.units || [] : [];

    return (
        <div className="min-h-screen bg-linear-to-b from-cream-50 to-cream-100">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-soft">
                <div className="max-w-2xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-center">
                        <CelesteLogo size="lg" animated={false}/>
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
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                                                 stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                      d="M5 13l4 4L19 7"/>
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
                                style={{width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`}}
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
                                    initial={{opacity: 0, x: 20}}
                                    animate={{opacity: 1, x: 0}}
                                    exit={{opacity: 0, x: -20}}
                                    className="space-y-6"
                                >
                                    <h2 className="text-2xl font-display text-maroon-700 mb-6">Tempat Tinggal</h2>

                                    {/* Blok */}
                                    <div>
                                        <label className="label label-required">Blok Rumah</label>
                                        <select
                                            {...methods.register('blok')}
                                            className={`input ${fieldErrors.blok ? 'input-error' : ''}`}
                                        >
                                            <option value="">Pilih Blok</option>
                                            {Object.keys(BLOK_CONFIG).map((blok) => (
                                                <option key={blok} value={blok}>{blok}</option>
                                            ))}
                                        </select>
                                        {fieldErrors.blok && (
                                            <p className="text-red-500 text-sm mt-1">{fieldErrors.blok}</p>
                                        )}
                                    </div>

                                    {/* Unit */}
                                    {watchedValues.blok && (
                                        <motion.div
                                            initial={{opacity: 0, height: 0}}
                                            animate={{opacity: 1, height: 'auto'}}
                                        >
                                            <label className="label label-required">Unit/Kavling</label>
                                            <select
                                                {...methods.register('unit')}
                                                className={`input ${fieldErrors.unit ? 'input-error' : ''}`}
                                            >
                                                <option value="">Pilih Unit</option>
                                                {availableUnits.map((unit) => (
                                                    <option key={unit} value={unit}>{unit}</option>
                                                ))}
                                            </select>
                                            {fieldErrors.unit &&
                                                <p className="text-red-500 text-sm mt-1">{fieldErrors.unit}</p>}
                                            {watchedValues.blok && watchedValues.unit && (
                                                <p className="text-gold-600 font-medium mt-2">
                                                    Alamat:
                                                    Blok {watchedValues.blok.replace('89.A-P', '89').replace('.A-P', '').replace('.A-V', '').replace('.A-S', '').replace('.A-K', '').replace('.A-W', '').replace('.AA-AC', '')},
                                                    Unit {watchedValues.unit}
                                                </p>
                                            )}
                                        </motion.div>
                                    )}

                                    {/* Status Tempat Tinggal */}
                                    <div>
                                        <label className="label label-required">Status Tempat Tinggal</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {STATUS_TEMPAT_TINGGAL.map((option) => (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    onClick={() => {
                                                        setValue('status_tempat_tinggal', option.value as any);
                                                        setValue('sub_status', undefined);
                                                        setFieldErrors(prev => {
                                                            const {status_tempat_tinggal, ...rest} = prev;
                                                            return rest;
                                                        });
                                                    }}
                                                    className={`selection-card text-left ${
                                                        watchedValues.status_tempat_tinggal === option.value ? 'selection-card-selected' : ''
                                                    }`}
                                                >
                                                    <span className="text-xl mr-2">{option.icon}</span>
                                                    <span className="text-sm font-medium">{option.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                        {fieldErrors.status_tempat_tinggal && (
                                            <p className="text-red-500 text-sm mt-1">{fieldErrors.status_tempat_tinggal}</p>
                                        )}
                                    </div>

                                    {/* ==================== MILIK SENDIRI ==================== */}
                                    {watchedValues.status_tempat_tinggal === 'milik_sendiri' && (
                                        <motion.div
                                            initial={{opacity: 0, height: 0}}
                                            animate={{opacity: 1, height: 'auto'}}
                                            className="space-y-4"
                                        >
                                            <h3 className="text-lg font-display text-maroon-700 pt-4">Data
                                                Kepemilikan</h3>

                                            <div>
                                                <label className="label label-required">Nama Kepala Keluarga</label>
                                                <input
                                                    {...methods.register('nama_kepala_keluarga')}
                                                    type="text"
                                                    className={`input ${fieldErrors.nama_kepala_keluarga ? 'input-error' : ''}`}
                                                    placeholder="Masukkan nama kepala keluarga"
                                                />
                                                {fieldErrors.nama_kepala_keluarga && (
                                                    <p className="text-red-500 text-sm mt-1">{fieldErrors.nama_kepala_keluarga}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="label label-required">No. HP Kepala Keluarga</label>
                                                <input
                                                    {...methods.register('hp_kepala_keluarga')}
                                                    type="tel"
                                                    className={`input ${fieldErrors.hp_kepala_keluarga ? 'input-error' : ''}`}
                                                    placeholder="08xxxxxxxxxx"
                                                />
                                                {fieldErrors.hp_kepala_keluarga && (
                                                    <p className="text-red-500 text-sm mt-1">{fieldErrors.hp_kepala_keluarga}</p>
                                                )}
                                            </div>

                                            <h3 className="text-lg font-display text-maroon-700 pt-4">Anggota
                                                Keluarga</h3>

                                            <div>
                                                <label className="label">Nama Istri (jika ada)</label>
                                                <input
                                                    {...methods.register('nama_istri')}
                                                    type="text"
                                                    className="input"
                                                    placeholder="Masukkan nama istri"
                                                />
                                            </div>

                                            <div>
                                                <label className="label">Nama Anak (jika ada)</label>
                                                <input
                                                    {...methods.register('nama_anak')}
                                                    type="text"
                                                    className="input"
                                                    placeholder="Masukkan nama anak (pisahkan dengan koma jika lebih dari satu)"
                                                />
                                            </div>

                                            <div>
                                                <label className="label">Saudara / ART Serumah (jika ada)</label>
                                                <select
                                                    {...methods.register('hubungan_lain')}
                                                    className="input"
                                                >
                                                    <option value="">Pilih Hubungan</option>
                                                    {HUBUNGAN_LAIN_OPTIONS.map((option) => (
                                                        <option key={option.value}
                                                                value={option.value}>{option.label}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {watchedValues.hubungan_lain && (
                                                <motion.div
                                                    initial={{opacity: 0, height: 0}}
                                                    animate={{opacity: 1, height: 'auto'}}
                                                >
                                                    <label
                                                        className="label">Nama {HUBUNGAN_LAIN_OPTIONS.find(o => o.value === watchedValues.hubungan_lain)?.label}</label>
                                                    <input
                                                        {...methods.register('nama_hubungan_lain')}
                                                        type="text"
                                                        className="input"
                                                        placeholder="Masukkan nama"
                                                    />
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    )}

                                    {/* ==================== KONTRAK ==================== */}
                                    {watchedValues.status_tempat_tinggal === 'kontrak' && (
                                        <motion.div
                                            initial={{opacity: 0, height: 0}}
                                            animate={{opacity: 1, height: 'auto'}}
                                            className="space-y-4"
                                        >
                                            {/* Sub Status Kontrak */}
                                            <div>
                                                <label className="label label-required">Tipe Kontrak</label>
                                                <div className="grid grid-cols-3 gap-3">
                                                    {SUB_STATUS_KONTRAK.map((option) => (
                                                        <button
                                                            key={option.value}
                                                            type="button"
                                                            onClick={() => {
                                                                setValue('sub_status', option.value as any);
                                                                setFieldErrors(prev => {
                                                                    const {sub_status, ...rest} = prev;
                                                                    return rest;
                                                                });
                                                            }}
                                                            className={`selection-card text-left ${
                                                                watchedValues.sub_status === option.value ? 'selection-card-selected' : ''
                                                            }`}
                                                        >
                                                            <span className="text-xl mr-2">{option.icon}</span>
                                                            <span className="text-sm font-medium">{option.label}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                                {fieldErrors.sub_status && (
                                                    <p className="text-red-500 text-sm mt-1">{fieldErrors.sub_status}</p>
                                                )}
                                            </div>

                                            {/* ==================== KONTRAK USAHA ==================== */}
                                            {watchedValues.sub_status === 'usaha' && (
                                                <motion.div
                                                    initial={{opacity: 0, height: 0}}
                                                    animate={{opacity: 1, height: 'auto'}}
                                                    className="space-y-4"
                                                >
                                                    <h3 className="text-lg font-display text-maroon-700 pt-4">Data
                                                        Kontrak</h3>

                                                    <div>
                                                        <label className="label label-required">Mulai Kontrak</label>
                                                        <input
                                                            {...methods.register('mulai_kontrak')}
                                                            type="date"
                                                            className={`input ${fieldErrors.mulai_kontrak ? 'input-error' : ''}`}
                                                        />
                                                        {fieldErrors.mulai_kontrak && (
                                                            <p className="text-red-500 text-sm mt-1">{fieldErrors.mulai_kontrak}</p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label className="label label-required">Berakhir Kontrak</label>
                                                        <input
                                                            {...methods.register('berakhir_kontrak')}
                                                            type="date"
                                                            className={`input ${fieldErrors.berakhir_kontrak ? 'input-error' : ''}`}
                                                        />
                                                        {fieldErrors.berakhir_kontrak && (
                                                            <p className="text-red-500 text-sm mt-1">{fieldErrors.berakhir_kontrak}</p>
                                                        )}
                                                    </div>

                                                    <h3 className="text-lg font-display text-maroon-700 pt-4">Data
                                                        Pemilik Usaha</h3>

                                                    <div>
                                                        <label className="label label-required">Nama Pemilik Usaha</label>
                                                        <input
                                                            {...methods.register('nama_pemilik_usaha')}
                                                            type="text"
                                                            className={`input ${fieldErrors.nama_pemilik_usaha ? 'input-error' : ''}`}
                                                            placeholder="Masukkan nama pemilik usaha"
                                                        />
                                                        {fieldErrors.nama_pemilik_usaha && (
                                                            <p className="text-red-500 text-sm mt-1">{fieldErrors.nama_pemilik_usaha}</p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label className="label label-required">No. HP Pemilik Usaha</label>
                                                        <input
                                                            {...methods.register('hp_pemilik_usaha')}
                                                            type="tel"
                                                            className={`input ${fieldErrors.hp_pemilik_usaha ? 'input-error' : ''}`}
                                                            placeholder="08xxxxxxxxxx"
                                                        />
                                                        {fieldErrors.hp_pemilik_usaha && (
                                                            <p className="text-red-500 text-sm mt-1">{fieldErrors.hp_pemilik_usaha}</p>
                                                        )}
                                                    </div>

                                                    <h3 className="text-lg font-display text-maroon-700 pt-4">Data
                                                        Usaha</h3>

                                                    <div>
                                                        <label className="label label-required">Jenis Usaha</label>
                                                        <select
                                                            {...methods.register('jenis_usaha')}
                                                            className={`input ${fieldErrors.jenis_usaha ? 'input-error' : ''}`}
                                                        >
                                                            <option value="">Pilih Jenis Usaha</option>
                                                            {JENIS_USAHA_OPTIONS.map((option) => (
                                                                <option key={option.value}
                                                                        value={option.value}>{option.label}</option>
                                                            ))}
                                                        </select>
                                                        {fieldErrors.jenis_usaha && (
                                                            <p className="text-red-500 text-sm mt-1">{fieldErrors.jenis_usaha}</p>
                                                        )}
                                                    </div>

                                                    {watchedValues.jenis_usaha === 'jasa' && (
                                                        <motion.div
                                                            initial={{opacity: 0, height: 0}}
                                                            animate={{opacity: 1, height: 'auto'}}
                                                        >
                                                            <label className="label">Jelaskan Jenis Jasa</label>
                                                            <input
                                                                {...methods.register('jenis_usaha_lainnya')}
                                                                type="text"
                                                                className="input"
                                                                placeholder="Contoh: Jasa Cuci, Jasa Ketik, dll"
                                                            />
                                                        </motion.div>
                                                    )}

                                                    <div>
                                                        <label className="label">Jumlah Karyawan</label>
                                                        <input
                                                            {...methods.register('jumlah_karyawan')}
                                                            type="number"
                                                            min="0"
                                                            className="input"
                                                            placeholder="Masukkan jumlah karyawan"
                                                        />
                                                    </div>

                                                    {Number(watchedValues.jumlah_karyawan) > 0 && (
                                                        <motion.div
                                                            initial={{opacity: 0, height: 0}}
                                                            animate={{opacity: 1, height: 'auto'}}
                                                        >
                                                            <label className="label">Adakah Karyawan yang
                                                                Menginap?</label>
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setValue('karyawan_menginap', true)}
                                                                    className={`selection-card ${watchedValues.karyawan_menginap === true ? 'selection-card-selected' : ''}`}
                                                                >
                                                                    <span className="text-sm font-medium">Ya</span>
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setValue('karyawan_menginap', false)}
                                                                    className={`selection-card ${watchedValues.karyawan_menginap === false ? 'selection-card-selected' : ''}`}
                                                                >
                                                                    <span className="text-sm font-medium">Tidak</span>
                                                                </button>
                                                            </div>
                                                        </motion.div>
                                                    )}

                                                    {watchedValues.karyawan_menginap === true && (
                                                        <motion.div
                                                            initial={{opacity: 0, height: 0}}
                                                            animate={{opacity: 1, height: 'auto'}}
                                                            className="space-y-4"
                                                        >
                                                            <div>
                                                                <label className="label label-required">Jumlah Karyawan yang
                                                                    Menginap</label>
                                                                <input
                                                                    {...methods.register('jumlah_karyawan_menginap')}
                                                                    type="number"
                                                                    min="0"
                                                                    className={`input ${fieldErrors.jumlah_karyawan_menginap ? 'input-error' : ''}`}
                                                                    placeholder="Masukkan jumlah"
                                                                />
                                                                {fieldErrors.jumlah_karyawan_menginap && (
                                                                    <p className="text-red-500 text-sm mt-1">{fieldErrors.jumlah_karyawan_menginap}</p>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <label className="label label-required">Nama Karyawan yang
                                                                    Menginap</label>
                                                                <textarea
                                                                    {...methods.register('nama_karyawan_menginap')}
                                                                    className={`input min-h-[80px] ${fieldErrors.nama_karyawan_menginap ? 'input-error' : ''}`}
                                                                    placeholder="Masukkan nama-nama karyawan (pisahkan dengan koma)"
                                                                />
                                                                {fieldErrors.nama_karyawan_menginap && (
                                                                    <p className="text-red-500 text-sm mt-1">{fieldErrors.nama_karyawan_menginap}</p>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </motion.div>
                                            )}

                                            {/* ==================== KONTRAK KELUARGA ==================== */}
                                            {watchedValues.sub_status === 'keluarga' && (
                                                <motion.div
                                                    initial={{opacity: 0, height: 0}}
                                                    animate={{opacity: 1, height: 'auto'}}
                                                    className="space-y-4"
                                                >
                                                    <h3 className="text-lg font-display text-maroon-700 pt-4">Data
                                                        Kontrak</h3>

                                                    <div>
                                                        <label className="label label-required">Mulai Kontrak</label>
                                                        <input
                                                            {...methods.register('mulai_kontrak')}
                                                            type="date"
                                                            className={`input ${fieldErrors.mulai_kontrak ? 'input-error' : ''}`}
                                                        />
                                                        {fieldErrors.mulai_kontrak && (
                                                            <p className="text-red-500 text-sm mt-1">{fieldErrors.mulai_kontrak}</p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label className="label label-required">Berakhir Kontrak</label>
                                                        <input
                                                            {...methods.register('berakhir_kontrak')}
                                                            type="date"
                                                            className={`input ${fieldErrors.berakhir_kontrak ? 'input-error' : ''}`}
                                                        />
                                                        {fieldErrors.berakhir_kontrak && (
                                                            <p className="text-red-500 text-sm mt-1">{fieldErrors.berakhir_kontrak}</p>
                                                        )}
                                                    </div>

                                                    <h3 className="text-lg font-display text-maroon-700 pt-4">Data
                                                        Kepemilikan</h3>

                                                    <div>
                                                        <label className="label label-required">Nama Kepala Keluarga</label>
                                                        <input
                                                            {...methods.register('nama_kepala_keluarga')}
                                                            type="text"
                                                            className={`input ${fieldErrors.nama_kepala_keluarga ? 'input-error' : ''}`}
                                                            placeholder="Masukkan nama kepala keluarga"
                                                        />
                                                        {fieldErrors.nama_kepala_keluarga && (
                                                            <p className="text-red-500 text-sm mt-1">{fieldErrors.nama_kepala_keluarga}</p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label className="label label-required">No. HP Kepala Keluarga</label>
                                                        <input
                                                            {...methods.register('hp_kepala_keluarga')}
                                                            type="tel"
                                                            className={`input ${fieldErrors.hp_kepala_keluarga ? 'input-error' : ''}`}
                                                            placeholder="08xxxxxxxxxx"
                                                        />
                                                        {fieldErrors.hp_kepala_keluarga && (
                                                            <p className="text-red-500 text-sm mt-1">{fieldErrors.hp_kepala_keluarga}</p>
                                                        )}
                                                    </div>

                                                    <h3 className="text-lg font-display text-maroon-700 pt-4">Anggota
                                                        Keluarga</h3>

                                                    <div>
                                                        <label className="label">Nama Istri (jika ada)</label>
                                                        <input
                                                            {...methods.register('nama_istri')}
                                                            type="text"
                                                            className="input"
                                                            placeholder="Masukkan nama istri"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="label">Nama Anak (jika ada)</label>
                                                        <input
                                                            {...methods.register('nama_anak')}
                                                            type="text"
                                                            className="input"
                                                            placeholder="Masukkan nama anak (pisahkan dengan koma jika lebih dari satu)"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="label">Saudara / ART Serumah (jika
                                                            ada)</label>
                                                        <select
                                                            {...methods.register('hubungan_lain')}
                                                            className="input"
                                                        >
                                                            <option value="">Pilih Hubungan</option>
                                                            {HUBUNGAN_LAIN_OPTIONS.map((option) => (
                                                                <option key={option.value}
                                                                        value={option.value}>{option.label}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {watchedValues.hubungan_lain && (
                                                        <motion.div
                                                            initial={{opacity: 0, height: 0}}
                                                            animate={{opacity: 1, height: 'auto'}}
                                                        >
                                                            <label
                                                                className="label">Nama {HUBUNGAN_LAIN_OPTIONS.find(o => o.value === watchedValues.hubungan_lain)?.label}</label>
                                                            <input
                                                                {...methods.register('nama_hubungan_lain')}
                                                                type="text"
                                                                className="input"
                                                                placeholder="Masukkan nama"
                                                            />
                                                        </motion.div>
                                                    )}
                                                </motion.div>
                                            )}

                                            {/* ==================== KONTRAK MAHASISWA ==================== */}
                                            {watchedValues.sub_status === 'mahasiswa' && (
                                                <motion.div
                                                    initial={{opacity: 0, height: 0}}
                                                    animate={{opacity: 1, height: 'auto'}}
                                                    className="space-y-4"
                                                >
                                                    <h3 className="text-lg font-display text-maroon-700 pt-4">Data PIC
                                                        (Penanggung Jawab)</h3>

                                                    <div>
                                                        <label className="label label-required">Nama PIC</label>
                                                        <input
                                                            {...methods.register('nama_pic')}
                                                            type="text"
                                                            className={`input ${fieldErrors.nama_pic ? 'input-error' : ''}`}
                                                            placeholder="Masukkan nama PIC"
                                                        />
                                                        {fieldErrors.nama_pic && (
                                                            <p className="text-red-500 text-sm mt-1">{fieldErrors.nama_pic}</p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label className="label label-required">No. HP PIC</label>
                                                        <input
                                                            {...methods.register('hp_pic')}
                                                            type="tel"
                                                            className={`input ${fieldErrors.hp_pic ? 'input-error' : ''}`}
                                                            placeholder="08xxxxxxxxxx"
                                                        />
                                                        {fieldErrors.hp_pic && (
                                                            <p className="text-red-500 text-sm mt-1">{fieldErrors.hp_pic}</p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label className="label">Nama Penghuni Lainnya (jika
                                                            ada)</label>
                                                        <input
                                                            {...methods.register('nama_penghuni_lain')}
                                                            type="text"
                                                            className="input"
                                                            placeholder="Masukkan nama penghuni lainnya (pisahkan dengan koma)"
                                                        />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    )}

                                    {/* ==================== KOST ==================== */}
                                    {watchedValues.status_tempat_tinggal === 'kost' && (
                                        <motion.div
                                            initial={{opacity: 0, height: 0}}
                                            animate={{opacity: 1, height: 'auto'}}
                                            className="space-y-4"
                                        >
                                            <h3 className="text-lg font-display text-maroon-700 pt-4">Data Kontrak</h3>

                                            <div>
                                                <label className="label label-required">Mulai Kontrak</label>
                                                <input
                                                    {...methods.register('mulai_kontrak')}
                                                    type="date"
                                                    className={`input ${fieldErrors.mulai_kontrak ? 'input-error' : ''}`}
                                                />
                                                {fieldErrors.mulai_kontrak && (
                                                    <p className="text-red-500 text-sm mt-1">{fieldErrors.mulai_kontrak}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="label label-required">Berakhir Kontrak</label>
                                                <input
                                                    {...methods.register('berakhir_kontrak')}
                                                    type="date"
                                                    className={`input ${fieldErrors.berakhir_kontrak ? 'input-error' : ''}`}
                                                />
                                                {fieldErrors.berakhir_kontrak && (
                                                    <p className="text-red-500 text-sm mt-1">{fieldErrors.berakhir_kontrak}</p>
                                                )}
                                            </div>

                                            <h3 className="text-lg font-display text-maroon-700 pt-4">Data Penghuni</h3>

                                            <div>
                                                <label className="label label-required">Nama</label>
                                                <input
                                                    {...methods.register('nama')}
                                                    type="text"
                                                    className={`input ${fieldErrors.nama ? 'input-error' : ''}`}
                                                    placeholder="Masukkan nama"
                                                />
                                                {fieldErrors.nama && (
                                                    <p className="text-red-500 text-sm mt-1">{fieldErrors.nama}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="label label-required">No. HP</label>
                                                <input
                                                    {...methods.register('hp')}
                                                    type="tel"
                                                    className={`input ${fieldErrors.hp ? 'input-error' : ''}`}
                                                    placeholder="08xxxxxxxxxx"
                                                />
                                                {fieldErrors.hp && (
                                                    <p className="text-red-500 text-sm mt-1">{fieldErrors.hp}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="label">Nama Penghuni Lainnya (jika ada)</label>
                                                <input
                                                    {...methods.register('nama_penghuni_lain')}
                                                    type="text"
                                                    className="input"
                                                    placeholder="Masukkan nama penghuni lainnya (pisahkan dengan koma)"
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}

                            {/* Step 2: Identitas */}
                            {currentStep === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{opacity: 0, x: 20}}
                                    animate={{opacity: 1, x: 0}}
                                    exit={{opacity: 0, x: -20}}
                                    className="space-y-6"
                                >
                                    <h2 className="text-2xl font-display text-maroon-700 mb-6">Identitas</h2>

                                    {ktpExists && (
                                        <motion.div
                                            initial={{opacity: 0, y: -10}}
                                            animate={{opacity: 1, y: 0}}
                                            className="bg-yellow-50 border border-yellow-200 rounded-xl p-4"
                                        >
                                            <p className="text-yellow-800 text-sm">
                                                Data dengan No. KTP ini sudah tercatat. Terima kasih, Anda tidak perlu
                                                mengisi lagi 😊
                                            </p>
                                        </motion.div>
                                    )}

                                    <div>
                                        <label className="label label-required">Nama Lengkap (sesuai KK)</label>
                                        <input
                                            {...methods.register('nama_lengkap')}
                                            type="text"
                                            className={`input ${fieldErrors.nama_lengkap ? 'input-error' : ''}`}
                                            placeholder="Masukkan nama lengkap"
                                        />
                                        {fieldErrors.nama_lengkap && (
                                            <p className="text-red-500 text-sm mt-1">{fieldErrors.nama_lengkap}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="label">No. Kartu Keluarga (16 digit) (opsional)</label>
                                        <input
                                            {...methods.register('no_kk')}
                                            type="text"
                                            maxLength={16}
                                            className={`input ${fieldErrors.no_kk ? 'input-error' : ''}`}
                                            placeholder="Masukkan 16 digit No. KK"
                                        />
                                        {fieldErrors.no_kk && (
                                            <p className="text-red-500 text-sm mt-1">{fieldErrors.no_kk}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="label">No. KTP / NIK (16 digit) (opsional)</label>
                                        <input
                                            {...methods.register('no_ktp')}
                                            type="text"
                                            maxLength={16}
                                            className={`input ${fieldErrors.no_ktp || ktpExists ? 'input-error' : ''}`}
                                            placeholder="Masukkan 16 digit No. KTP"
                                        />
                                        {ktpExists && (
                                            <p className="text-red-500 text-sm mt-1">No. KTP sudah terdaftar</p>
                                        )}
                                        {fieldErrors.no_ktp && !ktpExists && (
                                            <p className="text-red-500 text-sm mt-1">{fieldErrors.no_ktp}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="label label-required">No. HP</label>
                                        <input
                                            {...methods.register('no_hp')}
                                            type="tel"
                                            className={`input ${fieldErrors.no_hp ? 'input-error' : ''}`}
                                            placeholder="08xxxxxxxxxx"
                                        />
                                        {fieldErrors.no_hp && (
                                            <p className="text-red-500 text-sm mt-1">{fieldErrors.no_hp}</p>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 3: Data Diri */}
                            {currentStep === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{opacity: 0, x: 20}}
                                    animate={{opacity: 1, x: 0}}
                                    exit={{opacity: 0, x: -20}}
                                    className="space-y-6"
                                >
                                    <h2 className="text-2xl font-display text-maroon-700 mb-6">Status Pernikahan</h2>

                                    <div>
                                        <label className="label label-required">Status Pernikahan</label>
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
                                        {fieldErrors.status_pernikahan && (
                                            <p className="text-red-500 text-sm mt-1">{fieldErrors.status_pernikahan}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="label label-required">Pekerjaan</label>
                                        <select
                                            {...methods.register('pekerjaan')}
                                            className={`input ${fieldErrors.pekerjaan ? 'input-error' : ''}`}
                                        >
                                            <option value="">Pilih Pekerjaan</option>
                                            {PEKERJAAN_OPTIONS.map((option) => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                        {fieldErrors.pekerjaan && (
                                            <p className="text-red-500 text-sm mt-1">{fieldErrors.pekerjaan}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="label label-required">Agama</label>
                                        <select
                                            {...methods.register('agama')}
                                            className={`input ${fieldErrors.agama ? 'input-error' : ''}`}
                                        >
                                            <option value="">Pilih Agama</option>
                                            {AGAMA_OPTIONS.map((option) => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                        {fieldErrors.agama && (
                                            <p className="text-red-500 text-sm mt-1">{fieldErrors.agama}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="label">No. Kontak Darurat (opsional)</label>
                                        <input
                                            {...methods.register('no_kontak_darurat')}
                                            type="tel"
                                            className={`input ${fieldErrors.no_kontak_darurat ? 'input-error' : ''}`}
                                            placeholder="08xxxxxxxxxx"
                                        />
                                        {fieldErrors.no_kontak_darurat && (
                                            <p className="text-red-500 text-sm mt-1">{fieldErrors.no_kontak_darurat}</p>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 4: Foto */}
                            {currentStep === 4 && (
                                <motion.div
                                    key="step4"
                                    initial={{opacity: 0, x: 20}}
                                    animate={{opacity: 1, x: 0}}
                                    exit={{opacity: 0, x: -20}}
                                    className="space-y-6"
                                >
                                    <h2 className="text-2xl font-display text-maroon-700 mb-2">Foto</h2>
                                    <p className="text-gray-500 text-sm mb-6">Semua foto bersifat opsional. Anda dapat
                                        melewati langkah ini.</p>

                                    <div className="space-y-4">
                                        {['foto_kk', 'foto_ktp', 'foto_keluarga', 'foto_selfie'].map((field) => {
                                            const labels: Record<string, string> = {
                                                foto_kk: 'Foto Kartu Keluarga',
                                                foto_ktp: 'Foto KTP',
                                                foto_keluarga: 'Foto Keluarga',
                                                foto_selfie: 'Foto Selfie',
                                            };
                                            // Tampilkan foto selfie hanya untuk kontrak mahasiswa
                                            const showField = field === 'foto_selfie'
                                                ? watchedValues.status_tempat_tinggal === 'kontrak' && watchedValues.sub_status === 'mahasiswa'
                                                : true;

                                            if (!showField) return null;

                                            return (
                                                <div key={field} className="card">
                                                    <label className="label">{labels[field]}</label>
                                                    <div
                                                        className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-maroon-300 transition-colors">
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
                                                                    <svg className="w-4 h-4" fill="none"
                                                                         viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round"
                                                                              strokeLinejoin="round" strokeWidth={2}
                                                                              d="M6 18L18 6M6 6l12 12"/>
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
                                                                    <svg
                                                                        className="w-12 h-12 mx-auto text-gray-400 mb-2"
                                                                        fill="none" viewBox="0 0 24 24"
                                                                        stroke="currentColor">
                                                                        <path strokeLinecap="round"
                                                                              strokeLinejoin="round" strokeWidth={1.5}
                                                                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                                                    </svg>
                                                                    <p className="text-sm text-gray-500">Klik untuk
                                                                        upload</p>
                                                                    <p className="text-xs text-gray-400 mt-1">JPG, PNG,
                                                                        WebP (maks 2MB)</p>
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
                                    initial={{opacity: 0, x: 20}}
                                    animate={{opacity: 1, x: 0}}
                                    exit={{opacity: 0, x: -20}}
                                    className="space-y-6"
                                >
                                    <h2 className="text-2xl font-display text-maroon-700 mb-6">Tinjau & Kirim</h2>

                                    <div className="space-y-4">
                                        <div className="card">
                                            <h3 className="font-display text-maroon-700 mb-3">Tempat Tinggal</h3>
                                            <div className="text-sm space-y-1 text-gray-600">
                                                <p><span className="font-medium">Blok:</span> {watchedValues.blok}</p>
                                                <p><span className="font-medium">Unit:</span> {watchedValues.unit}</p>
                                                <p><span
                                                    className="font-medium">Status:</span> {STATUS_TEMPAT_TINGGAL.find(o => o.value === watchedValues.status_tempat_tinggal)?.label}
                                                </p>

                                                {/* Milik Sendiri */}
                                                {watchedValues.status_tempat_tinggal === 'milik_sendiri' && (
                                                    <>
                                                        <p><span
                                                            className="font-medium">Nama Kepala Keluarga:</span> {watchedValues.nama_kepala_keluarga || '-'}
                                                        </p>
                                                        <p><span
                                                            className="font-medium">HP Kepala Keluarga:</span> {watchedValues.hp_kepala_keluarga || '-'}
                                                        </p>
                                                        {watchedValues.nama_istri && <p><span
                                                            className="font-medium">Istri:</span> {watchedValues.nama_istri}
                                                        </p>}
                                                        {watchedValues.nama_anak && <p><span
                                                            className="font-medium">Anak:</span> {watchedValues.nama_anak}
                                                        </p>}
                                                        {watchedValues.hubungan_lain && watchedValues.nama_hubungan_lain && (
                                                            <p><span
                                                                className="font-medium">{HUBUNGAN_LAIN_OPTIONS.find(o => o.value === watchedValues.hubungan_lain)?.label}:</span> {watchedValues.nama_hubungan_lain}
                                                            </p>
                                                        )}
                                                    </>
                                                )}

                                                {/* Kontrak */}
                                                {watchedValues.status_tempat_tinggal === 'kontrak' && (
                                                    <>
                                                        <p><span
                                                            className="font-medium">Tipe:</span> {SUB_STATUS_KONTRAK.find(o => o.value === watchedValues.sub_status)?.label}
                                                        </p>

                                                        {/* Kontrak Usaha */}
                                                        {watchedValues.sub_status === 'usaha' && (
                                                            <>
                                                                <p><span
                                                                    className="font-medium">Mulai Kontrak:</span> {watchedValues.mulai_kontrak || '-'}
                                                                </p>
                                                                <p><span
                                                                    className="font-medium">Berakhir Kontrak:</span> {watchedValues.berakhir_kontrak || '-'}
                                                                </p>
                                                                <p><span
                                                                    className="font-medium">Nama Pemilik Usaha:</span> {watchedValues.nama_pemilik_usaha || '-'}
                                                                </p>
                                                                <p><span
                                                                    className="font-medium">HP Pemilik Usaha:</span> {watchedValues.hp_pemilik_usaha || '-'}
                                                                </p>
                                                                {watchedValues.jenis_usaha && (
                                                                    <>
                                                                        <p><span
                                                                            className="font-medium">Jenis Usaha:</span> {JENIS_USAHA_OPTIONS.find(o => o.value === watchedValues.jenis_usaha)?.label}{watchedValues.jenis_usaha === 'jasa' && watchedValues.jenis_usaha_lainnya ? ` - ${watchedValues.jenis_usaha_lainnya}` : ''}
                                                                        </p>
                                                                        <p><span className="font-medium">Jumlah Karyawan:</span> {watchedValues.jumlah_karyawan || 0}
                                                                        </p>
                                                                        {watchedValues.karyawan_menginap === true && (
                                                                            <>
                                                                                <p><span className="font-medium">Karyawan Menginap:</span> Ya
                                                                                    ({watchedValues.jumlah_karyawan_menginap} orang)
                                                                                </p>
                                                                                <p><span className="font-medium">Nama Karyawan:</span> {watchedValues.nama_karyawan_menginap}
                                                                                </p>
                                                                            </>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </>
                                                        )}

                                                        {/* Kontrak Keluarga */}
                                                        {watchedValues.sub_status === 'keluarga' && (
                                                            <>
                                                                <p><span
                                                                    className="font-medium">Mulai Kontrak:</span> {watchedValues.mulai_kontrak || '-'}
                                                                </p>
                                                                <p><span
                                                                    className="font-medium">Berakhir Kontrak:</span> {watchedValues.berakhir_kontrak || '-'}
                                                                </p>
                                                                <p><span
                                                                    className="font-medium">Nama Kepala Keluarga:</span> {watchedValues.nama_kepala_keluarga || '-'}
                                                                </p>
                                                                <p><span
                                                                    className="font-medium">HP Kepala Keluarga:</span> {watchedValues.hp_kepala_keluarga || '-'}
                                                                </p>
                                                                {watchedValues.nama_istri && <p><span
                                                                    className="font-medium">Istri:</span> {watchedValues.nama_istri}
                                                                </p>}
                                                                {watchedValues.nama_anak && <p><span
                                                                    className="font-medium">Anak:</span> {watchedValues.nama_anak}
                                                                </p>}
                                                                {watchedValues.hubungan_lain && watchedValues.nama_hubungan_lain && (
                                                                    <p><span
                                                                        className="font-medium">{HUBUNGAN_LAIN_OPTIONS.find(o => o.value === watchedValues.hubungan_lain)?.label}:</span> {watchedValues.nama_hubungan_lain}
                                                                    </p>
                                                                )}
                                                            </>
                                                        )}

                                                        {/* Kontrak Mahasiswa */}
                                                        {watchedValues.sub_status === 'mahasiswa' && (
                                                            <>
                                                                <p><span
                                                                    className="font-medium">Nama PIC:</span> {watchedValues.nama_pic || '-'}
                                                                </p>
                                                                <p><span
                                                                    className="font-medium">HP PIC:</span> {watchedValues.hp_pic || '-'}
                                                                </p>
                                                                {watchedValues.nama_penghuni_lain && <p><span
                                                                    className="font-medium">Penghuni Lain:</span> {watchedValues.nama_penghuni_lain}
                                                                </p>}
                                                            </>
                                                        )}
                                                    </>
                                                )}

                                                {/* Kost */}
                                                {watchedValues.status_tempat_tinggal === 'kost' && (
                                                    <>
                                                        <p><span
                                                            className="font-medium">Mulai Kontrak:</span> {watchedValues.mulai_kontrak || '-'}
                                                        </p>
                                                        <p><span
                                                            className="font-medium">Berakhir Kontrak:</span> {watchedValues.berakhir_kontrak || '-'}
                                                        </p>
                                                        <p><span
                                                            className="font-medium">Nama:</span> {watchedValues.nama || '-'}
                                                        </p>
                                                        <p><span
                                                            className="font-medium">HP:</span> {watchedValues.hp || '-'}
                                                        </p>
                                                        {watchedValues.nama_penghuni_lain && <p><span
                                                            className="font-medium">Penghuni Lain:</span> {watchedValues.nama_penghuni_lain}
                                                        </p>}
                                                    </>
                                                )}
                                            </div>
                                            <button type="button" onClick={() => setCurrentStep(1)}
                                                    className="text-sm text-maroon-600 mt-2 hover:underline">
                                                Edit
                                            </button>
                                        </div>

                                        <div className="card">
                                            <h3 className="font-display text-maroon-700 mb-3">Identitas</h3>
                                            <div className="text-sm space-y-1 text-gray-600">
                                                <p><span
                                                    className="font-medium">Nama:</span> {watchedValues.nama_lengkap}
                                                </p>
                                                <p><span className="font-medium">No. KK:</span> {watchedValues.no_kk}
                                                </p>
                                                <p><span className="font-medium">No. KTP:</span> {watchedValues.no_ktp}
                                                </p>
                                                <p><span className="font-medium">No. HP:</span> {watchedValues.no_hp}
                                                </p>
                                            </div>
                                            <button type="button" onClick={() => setCurrentStep(2)}
                                                    className="text-sm text-maroon-600 mt-2 hover:underline">
                                                Edit
                                            </button>
                                        </div>

                                        <div className="card">
                                            <h3 className="font-display text-maroon-700 mb-3">Data Diri</h3>
                                            <div className="text-sm space-y-1 text-gray-600">
                                                <p><span
                                                    className="font-medium">Status Pernikahan:</span> {STATUS_NIKAH_OPTIONS.find(o => o.value === watchedValues.status_pernikahan)?.label}
                                                </p>
                                                <p><span
                                                    className="font-medium">Pekerjaan:</span> {PEKERJAAN_OPTIONS.find(o => o.value === watchedValues.pekerjaan)?.label || '-'}
                                                </p>
                                                <p><span
                                                    className="font-medium">Agama:</span> {AGAMA_OPTIONS.find(o => o.value === watchedValues.agama)?.label}
                                                </p>
                                                <p><span
                                                    className="font-medium">Kontak Darurat:</span> {watchedValues.no_kontak_darurat || '-'}
                                                </p>
                                            </div>
                                            <button type="button" onClick={() => setCurrentStep(3)}
                                                    className="text-sm text-maroon-600 mt-2 hover:underline">
                                                Edit
                                            </button>
                                        </div>

                                        <div className="card">
                                            <h3 className="font-display text-maroon-700 mb-3">Persetujuan</h3>
                                            <p className="text-sm text-gray-600">
                                                Data yang saya berikan adalah benar dan akurat. Saya menyetujui bahwa
                                                data ini hanya untuk keperluan administrasi pengurus Cluster Celeste.
                                            </p>
                                        </div>
                                    </div>

                                    {submitError && (
                                        <motion.div
                                            initial={{opacity: 0, y: -10}}
                                            animate={{opacity: 1, y: 0}}
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
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M15 19l-7-7 7-7"/>
                                    </svg>
                                    Kembali
                                </button>
                            ) : (
                                <div/>
                            )}

                            {currentStep < 5 ? (
                                <button type="button" onClick={goNext} className="btn btn-primary">
                                    Lanjut
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M9 5l7 7-7 7"/>
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
                                                <circle className="opacity-25" cx="12" cy="12" r="10"
                                                        stroke="currentColor" strokeWidth="4"/>
                                                <path className="opacity-75" fill="currentColor"
                                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                            </svg>
                                            Mengirim...
                                        </>
                                    ) : (
                                        <>
                                            Kirim Data
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                                                 stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                      d="M5 13l4 4L19 7"/>
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