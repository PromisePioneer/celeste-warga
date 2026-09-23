// SuccessPage - Placeholder until full implementation
import { motion } from 'framer-motion';
import { CelesteLogo } from '../components/logo/CelesteLogo';
import { Link } from 'react-router-dom';

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-cream-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center"
      >
        <div className="mb-8 mx-auto">
          <CelesteLogo size="lg" animated={true} />
        </div>

        <div className="card">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6"
          >
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>

          <h1 className="text-2xl font-display text-maroon-700 mb-4">
            Terima Kasih!
          </h1>

          <p className="text-gray-600 mb-8">
            Data Anda telah berhasil disimpan. Semoga harimu menyenangkan!
          </p>

          <Link to="/" className="btn btn-primary">
            Kembali ke Beranda
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
