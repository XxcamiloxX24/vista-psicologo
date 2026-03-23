import { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { uploadCardImage } from '../lib/images';

interface CardImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export function CardImageUpload({ value, onChange, disabled }: CardImageUploadProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [uploading, setUploading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    if (value) return; // Solo una imagen
    setUploading(true);
    setLoadFailed(false);
    try {
      const url = await uploadCardImage(file);
      onChange(url);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al subir la imagen');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemove = () => {
    onChange('');
    setLoadFailed(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  if (value) {
    return (
      <div className="space-y-2">
        <p className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          Imagen de la tarjeta
        </p>
        <div
          className={`relative rounded-xl border-2 overflow-hidden shrink-0 ${
            isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200'
          }`}
          style={{ width: 240, height: 140 }}
        >
          <div className="absolute inset-0 flex items-center justify-center p-1">
            {loadFailed ? (
              <span className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                No se pudo cargar
              </span>
            ) : (
              <img
                src={value}
                alt="Vista previa"
                className="w-full h-full object-contain"
                onError={() => setLoadFailed(true)}
              />
            )}
          </div>
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            title="Quitar imagen"
            className="absolute -top-1 -left-1 z-30 w-7 h-7 flex items-center justify-center text-white bg-slate-700 border-2 border-white shadow-lg hover:bg-red-600 disabled:opacity-60 rounded-full"
          >
            <X className="w-4 h-4 shrink-0" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
        Imagen de la tarjeta
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={disabled || uploading}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || uploading}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border ${
          isDark
            ? 'bg-slate-600 text-white border-slate-500 hover:bg-slate-500 disabled:opacity-50'
            : 'bg-slate-200 text-slate-800 border-slate-300 hover:bg-slate-300 disabled:opacity-50'
        }`}
      >
        {uploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            Subiendo…
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 shrink-0" />
            Cargar imagen
          </>
        )}
      </button>
    </div>
  );
}
