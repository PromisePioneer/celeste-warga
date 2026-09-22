import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CelesteLogo } from '../components/logo/CelesteLogo';
import { HeroScene } from '../components/three/HeroScene';

export default function HomePage() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 via-cream-100 to-cream-50 relative overflow-hidden">
      {/* 3D Hero Background */}
      <div className="absolute inset-0 z-0">
        <HeroScene />
      </div>

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-cream-50/90 z-10 pointer-events-none" />

      {/* Content */}
      <div className="relative z-20 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-4"
        >
          <CelesteLogo size={isMobile ? 'md' : 'lg'} animated={true} />
        </motion.div>

        {/* Welcome Text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          className="text-center"
        >
          <h1 className="font-display text-2xl md:text-4xl text-maroon-700 mb-3 leading-tight">
            Selamat Datang,<br />
            <span className="text-gold-600">Warga Celeste</span> yang Berbahagia
          </h1>

          <p className="text-base md:text-lg text-gray-600 mb-6 leading-relaxed max-w-lg mx-auto">
            Mohon luangkan waktu sejenak untuk mengisi data warga ini.
            Data Anda akan membantu kami meningkatkan kualitas pengelolaan komplek kita.
          </p>

          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 2 }}
            onClick={() => navigate('/form')}
            className="btn btn-primary text-lg px-10 py-4 shadow-elegant hover:shadow-gold group"
          >
            <span>Mulai Isi Data</span>
            <svg
              className="w-5 h-5 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </motion.button>
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 2.5 }}
          className="py-4 text-center text-sm text-gray-500 mt-8"
        >
          <p>© 2026 Komplek Celeste. Seluruh hak dilindungi.</p>
        </motion.footer>
      </div>
    </div>
  );
}
