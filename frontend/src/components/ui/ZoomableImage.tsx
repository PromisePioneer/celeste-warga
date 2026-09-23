import { useState, useRef, useCallback, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface ZoomableImageProps {
  src: string;
  alt: string;
  label?: string;
  className?: string;
}

export function ZoomableImage({ src, alt, label, className = '' }: ZoomableImageProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="cursor-zoom-in" onClick={() => setIsOpen(true)}>
        <img src={src} alt={alt} className={`w-full rounded-lg border ${className}`} />
        {label && <p className="text-sm text-gray-500 mt-1">{label}</p>}
      </div>

      {isOpen && (
        <ImageZoomModal src={src} alt={alt} label={label} onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}

interface ImageZoomModalProps {
  src: string;
  alt: string;
  label?: string;
  onClose: () => void;
}

function ImageZoomModal({ src, alt, label, onClose }: ImageZoomModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const posStart = useRef({ x: 0, y: 0 });

  // Reset on open
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => {
      const next = Math.min(Math.max(prev * delta, 0.5), 5);
      return next;
    });
    setPosition({ x: 0, y: 0 }); // Reset pan on zoom change for simplicity
  }, []);

  // Pointer drag
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    posStart.current = { x: position.x, y: position.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [scale, position]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPosition({
      x: posStart.current.x + dx,
      y: posStart.current.y + dy,
    });
  }, [isDragging]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Double click to reset
  const handleDoubleClick = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === '+' || e.key === '=') setScale(s => Math.min(s * 1.2, 5));
      if (e.key === '-') setScale(s => Math.max(s / 1.2, 0.5));
      if (e.key === '0') { setScale(1); setPosition({ x: 0, y: 0 }); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const zoomIn = () => setScale(s => Math.min(s * 1.3, 5));
  const zoomOut = () => setScale(s => Math.max(s / 1.3, 0.5));
  const reset = () => { setScale(1); setPosition({ x: 0, y: 0 }); };

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black/90"
      onClick={onClose}
    >
      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-black/60 backdrop-blur-sm shrink-0"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-white text-sm">
          {label && <span className="mr-3 text-gray-300">{label}</span>}
          <span className="text-gray-400">{alt}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={zoomOut}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Zoom out (−)"
          >
            <ZoomOut size={18} />
          </button>
          <span className="text-white/70 text-sm w-12 text-center">{Math.round(scale * 100)}%</span>
          <button
            onClick={zoomIn}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Zoom in (+)"
          >
            <ZoomIn size={18} />
          </button>
          <button
            onClick={reset}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors ml-1"
            title="Reset (0)"
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors ml-2"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Zoomable image area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden flex items-center justify-center"
        style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in' }}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDoubleClick={handleDoubleClick}
        onClick={e => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            transition: isDragging ? 'none' : 'transform 0.15s ease',
            maxWidth: '90vw',
            maxHeight: 'calc(100vh - 56px)',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
          draggable={false}
        />
      </div>

      {/* Hint */}
      <div className="text-center text-white/30 text-xs py-2 shrink-0">
        Scroll / pinch to zoom • Drag to pan • Double-click to reset
      </div>
    </div>
  );
}
