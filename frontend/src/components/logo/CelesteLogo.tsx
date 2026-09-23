import { motion } from 'framer-motion';
import clsx from 'clsx';

interface CelesteLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
}

const sizes = {
  sm: { width: 200, height: 60, textSize: 26 },
  md: { width: 280, height: 84, textSize: 36 },
  lg: { width: 400, height: 120, textSize: 52 },
  xl: { width: 500, height: 150, textSize: 65 },
};

export function CelesteLogo({
  className,
  size = 'md',
  animated = true,
}: CelesteLogoProps) {
  const { width, height, textSize } = sizes[size];

  return (
    <svg
      viewBox="0 0 400 120"
      width={width}
      height={height}
      className={clsx('select-none', className)}
      aria-label="Celeste Logo"
    >
      <defs>
        {/* Gold gradient */}
        <linearGradient id={`gold-gradient-${size}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E8C547" />
          <stop offset="50%" stopColor="#D5A526" />
          <stop offset="100%" stopColor="#B08A1E" />
        </linearGradient>

        {/* Maroon gradient */}
        <linearGradient id={`maroon-gradient-${size}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8B2244" />
          <stop offset="100%" stopColor="#7B1B36" />
        </linearGradient>
      </defs>

      {/* Ornamen Kiri */}
      <motion.g
        className="logo-ornament"
        initial={animated ? { opacity: 0 } : { opacity: 1 }}
        animate={{ opacity: animated ? 1 : 1 }}
        transition={{ duration: 0.1 }}
      >
        {/* Tangkai 1 */}
        <motion.path
            d="M 75 25 Q 45 35, 30 50 Q 18 65, 28 80"
            stroke={`url(#gold-gradient-${size})`}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            initial={animated ? { strokeDashoffset: 500 } : { strokeDashoffset: 0 }}
            animate={{ strokeDashoffset: animated ? 0 : 0 }}
            transition={{ duration: 1.2, delay: 0, ease: 'easeOut' }}
        />
        <motion.circle
          cx="28"
          cy="80"
          r="4"
          fill={`url(#gold-gradient-${size})`}
          initial={animated ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
          animate={{ scale: animated ? 1 : 1, opacity: animated ? 1 : 1 }}
          transition={{ duration: 0.4, delay: 0.8, type: 'spring', stiffness: 300 }}
        />

        {/* Tangkai 2 */}
        <motion.path
          d="M 70 32 Q 42 42, 25 58 Q 12 72, 22 88"
          stroke={`url(#gold-gradient-${size})`}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          initial={animated ? { strokeDashoffset: 500 } : { strokeDashoffset: 0 }}
          animate={{ strokeDashoffset: animated ? 0 : 0 }}
          transition={{ duration: 1.2, delay: 0.1, ease: 'easeOut' }}
        />
        <motion.circle
          cx="22"
          cy="88"
          r="4"
          fill={`url(#gold-gradient-${size})`}
          initial={animated ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
          animate={{ scale: animated ? 1 : 1, opacity: animated ? 1 : 1 }}
          transition={{ duration: 0.4, delay: 0.9, type: 'spring', stiffness: 300 }}
        />

        {/* Tangkai 3 (tengah) */}
        <motion.path
          d="M 65 40 Q 35 52, 18 70 Q 8 85, 20 100"
          stroke={`url(#gold-gradient-${size})`}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          initial={animated ? { strokeDashoffset: 500 } : { strokeDashoffset: 0 }}
          animate={{ strokeDashoffset: animated ? 0 : 0 }}
          transition={{ duration: 1.2, delay: 0.2, ease: 'easeOut' }}
        />
        <motion.circle
          cx="20"
          cy="100"
          r="5"
          fill={`url(#gold-gradient-${size})`}
          initial={animated ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
          animate={{ scale: animated ? 1 : 1, opacity: animated ? 1 : 1 }}
          transition={{ duration: 0.4, delay: 1.0, type: 'spring', stiffness: 300 }}
        />

        {/* Tangkai 4 */}
        <motion.path
          d="M 62 48 Q 38 58, 22 76 Q 12 90, 26 105"
          stroke={`url(#gold-gradient-${size})`}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          initial={animated ? { strokeDashoffset: 500 } : { strokeDashoffset: 0 }}
          animate={{ strokeDashoffset: animated ? 0 : 0 }}
          transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
        />
        <motion.circle
          cx="26"
          cy="105"
          r="4"
          fill={`url(#gold-gradient-${size})`}
          initial={animated ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
          animate={{ scale: animated ? 1 : 1, opacity: animated ? 1 : 1 }}
          transition={{ duration: 0.4, delay: 1.1, type: 'spring', stiffness: 300 }}
        />

        {/* Tangkai 5 */}
        <motion.path
          d="M 60 55 Q 40 62, 28 78 Q 18 92, 32 108"
          stroke={`url(#gold-gradient-${size})`}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          initial={animated ? { strokeDashoffset: 500 } : { strokeDashoffset: 0 }}
          animate={{ strokeDashoffset: animated ? 0 : 0 }}
          transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
        />
        <motion.circle
          cx="32"
          cy="108"
          r="4"
          fill={`url(#gold-gradient-${size})`}
          initial={animated ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
          animate={{ scale: animated ? 1 : 1, opacity: animated ? 1 : 1 }}
          transition={{ duration: 0.4, delay: 1.2, type: 'spring', stiffness: 300 }}
        />
      </motion.g>

      {/* Ornamen Kanan (mirror) */}
      <motion.g
        className="logo-ornament"
        initial={animated ? { opacity: 0 } : { opacity: 1 }}
        animate={{ opacity: animated ? 1 : 1 }}
        transition={{ duration: 0.1 }}
      >
        {/* Tangkai 1 */}
        <motion.path
          d="M 325 25 Q 355 35, 370 50 Q 382 65, 372 80"
          stroke={`url(#gold-gradient-${size})`}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          initial={animated ? { strokeDashoffset: 500 } : { strokeDashoffset: 0 }}
          animate={{ strokeDashoffset: animated ? 0 : 0 }}
          transition={{ duration: 1.2, delay: 0, ease: 'easeOut' }}
        />
        <motion.circle
          cx="372"
          cy="80"
          r="4"
          fill={`url(#gold-gradient-${size})`}
          initial={animated ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
          animate={{ scale: animated ? 1 : 1, opacity: animated ? 1 : 1 }}
          transition={{ duration: 0.4, delay: 0.8, type: 'spring', stiffness: 300 }}
        />

        {/* Tangkai 2 */}
        <motion.path
          d="M 330 32 Q 358 42, 375 58 Q 388 72, 378 88"
          stroke={`url(#gold-gradient-${size})`}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          initial={animated ? { strokeDashoffset: 500 } : { strokeDashoffset: 0 }}
          animate={{ strokeDashoffset: animated ? 0 : 0 }}
          transition={{ duration: 1.2, delay: 0.1, ease: 'easeOut' }}
        />
        <motion.circle
          cx="378"
          cy="88"
          r="4"
          fill={`url(#gold-gradient-${size})`}
          initial={animated ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
          animate={{ scale: animated ? 1 : 1, opacity: animated ? 1 : 1 }}
          transition={{ duration: 0.4, delay: 0.9, type: 'spring', stiffness: 300 }}
        />

        {/* Tangkai 3 (tengah) */}
        <motion.path
          d="M 335 40 Q 365 52, 382 70 Q 392 85, 380 100"
          stroke={`url(#gold-gradient-${size})`}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          initial={animated ? { strokeDashoffset: 500 } : { strokeDashoffset: 0 }}
          animate={{ strokeDashoffset: animated ? 0 : 0 }}
          transition={{ duration: 1.2, delay: 0.2, ease: 'easeOut' }}
        />
        <motion.circle
          cx="380"
          cy="100"
          r="5"
          fill={`url(#gold-gradient-${size})`}
          initial={animated ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
          animate={{ scale: animated ? 1 : 1, opacity: animated ? 1 : 1 }}
          transition={{ duration: 0.4, delay: 1.0, type: 'spring', stiffness: 300 }}
        />

        {/* Tangkai 4 */}
        <motion.path
          d="M 338 48 Q 362 58, 378 76 Q 388 90, 374 105"
          stroke={`url(#gold-gradient-${size})`}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          initial={animated ? { strokeDashoffset: 500 } : { strokeDashoffset: 0 }}
          animate={{ strokeDashoffset: animated ? 0 : 0 }}
          transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
        />
        <motion.circle
          cx="374"
          cy="105"
          r="4"
          fill={`url(#gold-gradient-${size})`}
          initial={animated ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
          animate={{ scale: animated ? 1 : 1, opacity: animated ? 1 : 1 }}
          transition={{ duration: 0.4, delay: 1.1, type: 'spring', stiffness: 300 }}
        />

        {/* Tangkai 5 */}
        <motion.path
          d="M 340 55 Q 360 62, 372 78 Q 382 92, 368 108"
          stroke={`url(#gold-gradient-${size})`}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          initial={animated ? { strokeDashoffset: 500 } : { strokeDashoffset: 0 }}
          animate={{ strokeDashoffset: animated ? 0 : 0 }}
          transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
        />
        <motion.circle
          cx="368"
          cy="108"
          r="4"
          fill={`url(#gold-gradient-${size})`}
          initial={animated ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
          animate={{ scale: animated ? 1 : 1, opacity: animated ? 1 : 1 }}
          transition={{ duration: 0.4, delay: 1.2, type: 'spring', stiffness: 300 }}
        />
      </motion.g>

      {/* Teks Celeste */}
      <g className="logo-text">
        {/* Shadow */}
        <text
          x="200"
          y={70 + (textSize - 52) * 0.35}
          textAnchor="middle"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize={textSize}
          fontWeight="bold"
          fontStyle="italic"
          fill="#5A1528"
          opacity="0.2"
        >
          Celeste
        </text>

        {/* Main text */}
        <text
          x="200"
          y={68 + (textSize - 52) * 0.35}
          textAnchor="middle"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize={textSize}
          fontWeight="bold"
          fontStyle="italic"
          fill={`url(#maroon-gradient-${size})`}
        >
          Celeste
        </text>

      </g>
    </svg>
  );
}

// Simple wordmark only
export function CelesteWordmark({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const textSizes = { sm: 'text-2xl', md: 'text-4xl', lg: 'text-5xl' };

  return (
    <span
      className={clsx(
        'font-display font-bold italic text-celeste-700',
        textSizes[size],
        className
      )}
      style={{
        fontFamily: 'Georgia, "Times New Roman", serif',
        textShadow: '0 2px 4px rgba(123, 27, 54, 0.1)',
      }}
    >
      Celeste
    </span>
  );
}

export default CelesteLogo;
