import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, User, Lock, Shield, Bell, Palette, Globe, Pencil, Check, X, Eye, EyeOff, Loader2, PenLine, Upload } from 'lucide-react';
import { usePsychologist } from '../contexts/PsychologistContext';
import { useTheme } from '../contexts/ThemeContext';
import { changePassword } from '../lib/auth';
import { listImages, uploadSignatureImage, deleteImage, type ImageItem } from '../lib/images';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

function FirmaThumbnail({
  img,
  isDark,
  isDeleting,
  onDelete,
}: {
  img: ImageItem;
  isDark: boolean;
  isDeleting: boolean;
  onDelete: () => void;
}) {
  const url = img.secureUrl ?? img.url ?? '';
  const [loadFailed, setLoadFailed] = useState(false);

  if (!url) return null;

  return (
    <div
      className={`relative rounded-lg border-2 overflow-hidden shrink-0 ${
        isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200'
      }`}
      style={{ width: 160, height: 100 }}
    >
      <div className="absolute inset-0 flex items-center justify-center p-1">
        {loadFailed ? (
          <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No disp.</span>
        ) : (
          <img
            src={url}
            alt="Firma guardada"
            className="w-full h-full object-contain"
            onError={() => setLoadFailed(true)}
          />
        )}
      </div>
      <button
        type="button"
        onClick={onDelete}
        disabled={isDeleting}
        title="Eliminar firma"
        className="absolute -top-1 -right-1 z-30 w-7 h-7 flex items-center justify-center text-white bg-gray border-2 border-white shadow-lg hover:bg-red-600 disabled:opacity-60"
      >
        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : <X className="w-4 h-4 shrink-0" strokeWidth={2.5} />}
      </button>
    </div>
  );
}

function FirmaProfesionalSection({
  isDark,
  savedFirmas,
  savedFirmasLoading,
  firmaMode,
  setFirmaMode,
  firmaSaving,
  setFirmaSaving,
  deletingFirmaId,
  setDeletingFirmaId,
  refreshSavedFirmas,
  firmaCanvasRef,
  firmaFileInputRef,
  firmaIsDrawingRef,
  firmaLastPosRef,
  setFirmaToast,
}: {
  isDark: boolean;
  savedFirmas: ImageItem[];
  savedFirmasLoading: boolean;
  firmaMode: 'list' | 'draw';
  setFirmaMode: (m: 'list' | 'draw') => void;
  firmaSaving: boolean;
  setFirmaSaving: (v: boolean) => void;
  deletingFirmaId: string | null;
  setDeletingFirmaId: (id: string | null) => void;
  refreshSavedFirmas: () => void;
  firmaCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  firmaFileInputRef: React.RefObject<HTMLInputElement | null>;
  firmaIsDrawingRef: React.MutableRefObject<boolean>;
  firmaLastPosRef: React.MutableRefObject<{ x: number; y: number } | null>;
  setFirmaToast: (msg: string) => void;
}) {
  useEffect(() => {
    if (firmaMode !== 'draw') return;
    const canvas = firmaCanvasRef.current;
    if (!canvas) return;
    const init = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      ctx.strokeStyle = isDark ? '#ffffff' : '#1e293b';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.fillStyle = isDark ? '#334155' : '#f8fafc';
      ctx.fillRect(0, 0, rect.width, rect.height);
    };
    const id = requestAnimationFrame(() => requestAnimationFrame(init));
    return () => cancelAnimationFrame(id);
  }, [isDark, firmaMode, firmaCanvasRef]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = firmaCanvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const draw = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const ctx = firmaCanvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  };

  const clearCanvas = () => {
    const canvas = firmaCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = isDark ? '#334155' : '#f8fafc';
    ctx.fillRect(0, 0, rect.width, rect.height);
  };

  const handleSaveDraw = async () => {
    const canvas = firmaCanvasRef.current;
    if (!canvas) return;
    setFirmaSaving(true);
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          setFirmaSaving(false);
          return;
        }
        try {
          const file = new File([blob], 'firma.png', { type: 'image/png' });
          await uploadSignatureImage(file);
          setFirmaToast('Firma guardada correctamente');
          setFirmaMode('list');
          refreshSavedFirmas();
        } catch (e) {
          alert(e instanceof Error ? e.message : 'Error al subir la firma');
        } finally {
          setFirmaSaving(false);
        }
      },
      'image/png',
      0.95
    );
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setFirmaSaving(true);
    try {
      await uploadSignatureImage(file);
      setFirmaToast('Firma guardada correctamente');
      refreshSavedFirmas();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al subir la imagen');
    } finally {
      setFirmaSaving(false);
    }
    e.target.value = '';
  };

  const handleDelete = async (id: string) => {
    setDeletingFirmaId(id);
    try {
      await deleteImage(id);
      setFirmaToast('Firma eliminada');
      refreshSavedFirmas();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar');
    } finally {
      setDeletingFirmaId(null);
    }
  };

  return (
    <div className="space-y-4">
      <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600 dark:text-slate-300'}`}>
        Guarda firmas que podrás reutilizar al finalizar seguimientos. Dibuja una nueva o sube una imagen.
      </p>

      <div>
        <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700 dark:text-slate-300'}`}>Tus firmas guardadas</h4>
        {savedFirmasLoading ? (
          <p className={`text-sm py-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Cargando…</p>
        ) : savedFirmas.length === 0 ? (
          <p className={`text-sm py-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No tienes firmas guardadas.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {savedFirmas.map((img) => (
              <FirmaThumbnail
                key={img._id}
                img={img}
                isDark={isDark}
                isDeleting={deletingFirmaId === img._id}
                onDelete={() => handleDelete(img._id)}
              />
            ))}
          </div>
        )}
      </div>

      <div>
        <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700 dark:text-slate-300'}`}>Agregar firma</h4>
        {firmaMode === 'list' ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFirmaMode('draw')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border ${
                isDark
                  ? 'bg-slate-600 text-white border-slate-500 hover:bg-slate-500'
                  : 'bg-slate-200 text-slate-800 border-slate-300 hover:bg-slate-300 dark:bg-slate-600 dark:text-white dark:border-slate-500 dark:hover:bg-slate-500'
              }`}
            >
              <PenLine className="w-4 h-4" />
              Dibujar
            </button>
            <button
              type="button"
              onClick={() => firmaFileInputRef.current?.click()}
              disabled={firmaSaving}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border ${
                isDark
                  ? 'bg-slate-600 text-white border-slate-500 hover:bg-slate-500 disabled:opacity-50'
                  : 'bg-slate-200 text-slate-800 border-slate-300 hover:bg-slate-300 dark:bg-slate-600 dark:text-white dark:border-slate-500 dark:hover:bg-slate-500 disabled:opacity-50'
              }`}
            >
              {firmaSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Cargar imagen
            </button>
          </div>
        ) : firmaMode === 'draw' ? (
          <div className="space-y-3 w-64 max-w-full">
            <canvas
              ref={firmaCanvasRef}
              className={`w-full h-20 rounded-lg border-2 cursor-crosshair touch-none ${
                isDark ? 'border-slate-500 bg-slate-700/50' : 'border-slate-200 bg-slate-50'
              }`}
              onMouseDown={(e) => {
                e.preventDefault();
                const pos = getPos(e);
                if (pos) {
                  firmaIsDrawingRef.current = true;
                  firmaLastPosRef.current = pos;
                }
              }}
              onMouseMove={(e) => {
                e.preventDefault();
                if (!firmaIsDrawingRef.current) return;
                const pos = getPos(e);
                if (pos && firmaLastPosRef.current) {
                  draw(firmaLastPosRef.current, pos);
                  firmaLastPosRef.current = pos;
                }
              }}
              onMouseUp={() => {
                firmaIsDrawingRef.current = false;
                firmaLastPosRef.current = null;
              }}
              onMouseLeave={() => {
                firmaIsDrawingRef.current = false;
                firmaLastPosRef.current = null;
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                const pos = getPos(e);
                if (pos) {
                  firmaIsDrawingRef.current = true;
                  firmaLastPosRef.current = pos;
                }
              }}
              onTouchMove={(e) => {
                e.preventDefault();
                if (!firmaIsDrawingRef.current) return;
                const pos = getPos(e);
                if (pos && firmaLastPosRef.current) {
                  draw(firmaLastPosRef.current, pos);
                  firmaLastPosRef.current = pos;
                }
              }}
              onTouchEnd={() => {
                firmaIsDrawingRef.current = false;
                firmaLastPosRef.current = null;
              }}
              style={{ touchAction: 'none' }}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { clearCanvas(); setFirmaMode('list'); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium ${
                  isDark ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveDraw}
                disabled={firmaSaving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 disabled:opacity-60"
              >
                {firmaSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Guardar firma
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="sr-only">
        <input
          ref={firmaFileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          aria-label="Cargar imagen de firma"
        />
      </div>
    </div>
  );
}

interface SettingsProps {
  onEditProfile?: () => void;
  showSavedToast?: boolean;
  onDismissSavedToast?: () => void;
}

export function Settings({ onEditProfile, showSavedToast, onDismissSavedToast }: SettingsProps) {
  const [openSection, setOpenSection] = useState<string | null>('profile');
  const { psychologist, loading } = usePsychologist();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const settingsContainerRef = useRef<HTMLDivElement>(null);

  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNueva, setPasswordNueva] = useState('');
  const [passwordConfirmar, setPasswordConfirmar] = useState('');
  const [showPasswordActual, setShowPasswordActual] = useState(false);
  const [showPasswordNueva, setShowPasswordNueva] = useState(false);
  const [showPasswordConfirmar, setShowPasswordConfirmar] = useState(false);
  const [securityToast, setSecurityToast] = useState<{ type: 'warning' | 'success' | 'error'; message: string } | null>(null);
  const [securityLoading, setSecurityLoading] = useState(false);

  const [savedFirmas, setSavedFirmas] = useState<ImageItem[]>([]);
  const [savedFirmasLoading, setSavedFirmasLoading] = useState(false);
  const [firmaMode, setFirmaMode] = useState<'list' | 'draw'>('list');
  const [firmaSaving, setFirmaSaving] = useState(false);
  const [deletingFirmaId, setDeletingFirmaId] = useState<string | null>(null);
  const firmaCanvasRef = useRef<HTMLCanvasElement>(null);
  const firmaFileInputRef = useRef<HTMLInputElement>(null);
  const firmaIsDrawingRef = useRef(false);
  const firmaLastPosRef = useRef<{ x: number; y: number } | null>(null);

  const refreshSavedFirmas = useCallback(() => {
    setSavedFirmasLoading(true);
    listImages('firma', 20)
      .then(setSavedFirmas)
      .finally(() => setSavedFirmasLoading(false));
  }, []);

  useEffect(() => {
    if (!showSavedToast || !onDismissSavedToast) return;
    const t = setTimeout(() => onDismissSavedToast(), 3500);
    return () => clearTimeout(t);
  }, [showSavedToast, onDismissSavedToast]);

  useEffect(() => {
    if (!securityToast) return;
    const t = setTimeout(() => setSecurityToast(null), 4500);
    return () => clearTimeout(t);
  }, [securityToast]);

  useEffect(() => {
    if (openSection === 'signature') {
      refreshSavedFirmas();
    }
  }, [openSection, refreshSavedFirmas]);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const sections = [
    {
      id: 'profile',
      title: 'Perfil',
      icon: User,
      color: 'from-blue-500 to-purple-600'
    },
    {
      id: 'security',
      title: 'Seguridad',
      icon: Lock,
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'privacy',
      title: 'Políticas de Seguridad',
      icon: Shield,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'notifications',
      title: 'Notificaciones',
      icon: Bell,
      color: 'from-yellow-500 to-orange-600'
    },
    {
      id: 'appearance',
      title: 'Apariencia',
      icon: Palette,
      color: 'from-pink-500 to-purple-600'
    },
    {
      id: 'language',
      title: 'Idioma y Región',
      icon: Globe,
      color: 'from-blue-400 to-blue-600'
    },
    {
      id: 'signature',
      title: 'Firma Profesional',
      icon: PenLine,
      color: 'from-teal-500 to-teal-600'
    }
  ];

  const toastLeft = typeof window !== 'undefined' && window.innerWidth >= 768 ? 288 : 24;
  const savedToast =
    showSavedToast &&
    createPortal(
      <div
        role="status"
        style={{
          position: 'fixed',
          bottom: 24,
          left: toastLeft,
          zIndex: 2147483647,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 16px',
          borderRadius: 12,
          backgroundColor: '#10b981',
          color: 'white',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
        }}
      >
        <Check style={{ width: 20, height: 20, flexShrink: 0 }} />
        <span style={{ fontWeight: 500 }}>Se guardó correctamente</span>
        {onDismissSavedToast && (
          <button
            type="button"
            onClick={onDismissSavedToast}
            style={{ marginLeft: 8, padding: 4, borderRadius: 4, background: 'rgba(255,255,255,0.2)' }}
            aria-label="Cerrar"
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        )}
      </div>,
      document.body
    );

  const securityToastBg =
    securityToast?.type === 'success'
      ? '#10b981'
      : securityToast?.type === 'warning'
        ? '#ea580c'
        : securityToast?.type === 'error'
          ? '#ef4444'
          : 'transparent';
  const securityToastEl =
    securityToast &&
    createPortal(
      <div
        role={securityToast.type === 'error' ? 'alert' : 'status'}
        style={{
          position: 'fixed',
          bottom: 24,
          left: toastLeft,
          zIndex: 2147483647,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 16px',
          borderRadius: 12,
          backgroundColor: securityToastBg,
          color: 'white',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
        }}
      >
        {securityToast.type === 'success' && <Check style={{ width: 20, height: 20, flexShrink: 0 }} />}
        <span style={{ fontWeight: 500 }}>{securityToast.message}</span>
        <button
          type="button"
          onClick={() => setSecurityToast(null)}
          style={{ marginLeft: 8, padding: 4, borderRadius: 4, background: 'rgba(255,255,255,0.2)' }}
          aria-label="Cerrar"
        >
          <X style={{ width: 16, height: 16 }} />
        </button>
      </div>,
      document.body
    );

  return (
    <div ref={settingsContainerRef} className="relative space-y-6">
      {savedToast}
      {securityToastEl}
      {/* Header */}
      <div>
        <h1 className={`text-4xl mb-2 ${isDark ? 'text-white' : 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'}`}>
          Configuración
        </h1>
        <p className={isDark ? 'text-slate-400' : 'text-slate-600 dark:text-slate-400'}>Administra tus preferencias y ajustes de la plataforma</p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-4">
        {sections.map((section) => {
          const Icon = section.icon;
          const isOpen = openSection === section.id;

          return (
            <div
              key={section.id}
              className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-purple-100/50 dark:border-slate-600/50 shadow-sm overflow-hidden"
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full p-6 flex items-center justify-between hover:bg-purple-50/30 dark:hover:bg-slate-700/50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${section.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className={isDark ? 'text-white' : 'text-slate-800 dark:text-slate-200'}>{section.title}</h3>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isOpen && (
                <div className="px-6 pb-6 space-y-4 border-t border-purple-100/50 dark:border-slate-600/50 pt-6">
                  {section.id === 'profile' && (
                    <>
                      {loading ? (
                        <div className={`py-8 text-center ${isDark ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>Cargando perfil...</div>
                      ) : (
                        <>
                          <div className="space-y-4">
                            <div>
                              <label className={`text-sm mb-1 block ${isDark ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>Documento</label>
                              <p className={`py-2 ${isDark ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>{psychologist?.psiDocumento || '—'}</p>
                            </div>
                            <div>
                              <label className={`text-sm mb-1 block ${isDark ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>Nombre Completo</label>
                              <p className={`py-2 ${isDark ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                                {psychologist
                                  ? `${psychologist.psiNombre || ''} ${psychologist.psiApellido || ''}`.trim() || '—'
                                  : '—'}
                              </p>
                            </div>
                            <div>
                              <label className={`text-sm mb-1 block ${isDark ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>Correo Institucional</label>
                              <p className={`py-2 ${isDark ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>{psychologist?.psiCorreoInstitucional || '—'}</p>
                            </div>
                            <div>
                              <label className={`text-sm mb-1 block ${isDark ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>Correo Personal</label>
                              <p className={`py-2 ${isDark ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>{psychologist?.psiCorreoPersonal || '—'}</p>
                            </div>
                            <div>
                              <label className={`text-sm mb-1 block ${isDark ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>Teléfono</label>
                              <p className={`py-2 ${isDark ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>{psychologist?.psiTelefono || '—'}</p>
                            </div>
                            <div>
                              <label className={`text-sm mb-1 block ${isDark ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>Especialidad</label>
                              <p className={`py-2 ${isDark ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>{psychologist?.psiEspecialidad || '—'}</p>
                            </div>
                            <div>
                              <label className={`text-sm mb-1 block ${isDark ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>Fecha de nacimiento</label>
                              <p className={`py-2 ${isDark ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                                {psychologist?.psiFechaNac
                                  ? new Date(psychologist.psiFechaNac).toLocaleDateString('es-CO')
                                  : '—'}
                              </p>
                            </div>
                            <div>
                              <label className={`text-sm mb-1 block ${isDark ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>Dirección</label>
                              <p className={`py-2 ${isDark ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>{psychologist?.psiDireccion || '—'}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => onEditProfile?.()}
                            className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                          >
                            <Pencil className="w-4 h-4" />
                            Editar perfil
                          </button>
                        </>
                      )}
                    </>
                  )}

                  {section.id === 'security' && (
                    <>
                      <div>
                        <label className={`text-sm mb-2 block ${isDark ? 'text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>Contraseña Actual</label>
                        <div className="relative">
                          <input
                            type={showPasswordActual ? 'text' : 'password'}
                            value={passwordActual}
                            onChange={(e) => { setPasswordActual(e.target.value); setSecurityToast(null); }}
                            placeholder="••••••••"
                            className={`w-full px-4 py-3 pr-12 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
                              isDark ? 'border-slate-600 bg-slate-800 text-white placeholder:text-slate-400' : 'border-purple-200/50 bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswordActual((v) => !v)}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700'}`}
                            title={showPasswordActual ? 'Ocultar contraseña' : 'Ver contraseña'}
                            aria-label={showPasswordActual ? 'Ocultar contraseña' : 'Ver contraseña'}
                          >
                            {showPasswordActual ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className={`text-sm mb-2 block ${isDark ? 'text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>Nueva Contraseña</label>
                        <div className="relative">
                          <input
                            type={showPasswordNueva ? 'text' : 'password'}
                            value={passwordNueva}
                            onChange={(e) => { setPasswordNueva(e.target.value); setSecurityToast(null); }}
                            placeholder="••••••••"
                            className={`w-full px-4 py-3 pr-12 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
                              isDark ? 'border-slate-600 bg-slate-800 text-white placeholder:text-slate-400' : 'border-purple-200/50 bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswordNueva((v) => !v)}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700'}`}
                            title={showPasswordNueva ? 'Ocultar contraseña' : 'Ver contraseña'}
                            aria-label={showPasswordNueva ? 'Ocultar contraseña' : 'Ver contraseña'}
                          >
                            {showPasswordNueva ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className={`text-sm mb-2 block ${isDark ? 'text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>Confirmar Contraseña</label>
                        <div className="relative">
                          <input
                            type={showPasswordConfirmar ? 'text' : 'password'}
                            value={passwordConfirmar}
                            onChange={(e) => { setPasswordConfirmar(e.target.value); setSecurityToast(null); }}
                            placeholder="••••••••"
                            className={`w-full px-4 py-3 pr-12 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
                              isDark ? 'border-slate-600 bg-slate-800 text-white placeholder:text-slate-400' : 'border-purple-200/50 bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswordConfirmar((v) => !v)}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700'}`}
                            title={showPasswordConfirmar ? 'Ocultar contraseña' : 'Ver contraseña'}
                            aria-label={showPasswordConfirmar ? 'Ocultar contraseña' : 'Ver contraseña'}
                          >
                            {showPasswordConfirmar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          setSecurityToast(null);
                          if (!passwordActual.trim()) {
                            setSecurityToast({ type: 'warning', message: 'Ingresa tu contraseña actual.' });
                            return;
                          }
                          if (!passwordNueva.trim()) {
                            setSecurityToast({ type: 'warning', message: 'Ingresa la nueva contraseña.' });
                            return;
                          }
                          if (passwordNueva !== passwordConfirmar) {
                            setSecurityToast({ type: 'warning', message: 'La nueva contraseña y la confirmación no coinciden.' });
                            return;
                          }
                          setSecurityLoading(true);
                          try {
                            await changePassword({ passwordActual: passwordActual.trim(), passwordNueva: passwordNueva.trim() });
                            setSecurityToast({ type: 'success', message: 'Contraseña actualizada correctamente.' });
                            setPasswordActual('');
                            setPasswordNueva('');
                            setPasswordConfirmar('');
                          } catch (err) {
                            setSecurityToast({
                              type: 'error',
                              message: err instanceof Error ? err.message : 'Error al actualizar la contraseña.',
                            });
                          } finally {
                            setSecurityLoading(false);
                          }
                        }}
                        disabled={securityLoading}
                        className="flex w-full items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {securityLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                        {securityLoading ? 'Actualizando...' : 'Actualizar Seguridad'}
                      </button>
                    </>
                  )}

                  {section.id === 'privacy' && (
                    <div className="space-y-3">
                      <div className={`flex items-center justify-between p-4 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-50 dark:bg-slate-700/50'}`}>
                        <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700 dark:text-slate-300'}`}>Compartir datos con el sistema</span>
                        <label className="relative inline-block w-12 h-6">
                          <input type="checkbox" defaultChecked className="opacity-0 w-0 h-0 peer" />
                          <span className="absolute cursor-pointer inset-0 bg-slate-300 rounded-full transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-600 before:absolute before:content-[''] before:h-5 before:w-5 before:left-0.5 before:bottom-0.5 before:bg-white before:rounded-full before:transition-all peer-checked:before:translate-x-6"></span>
                        </label>
                      </div>
                      <div className={`flex items-center justify-between p-4 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-50 dark:bg-slate-700/50'}`}>
                        <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700 dark:text-slate-300'}`}>Permitir análisis de uso</span>
                        <label className="relative inline-block w-12 h-6">
                          <input type="checkbox" defaultChecked className="opacity-0 w-0 h-0 peer" />
                          <span className="absolute cursor-pointer inset-0 bg-slate-300 rounded-full transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-600 before:absolute before:content-[''] before:h-5 before:w-5 before:left-0.5 before:bottom-0.5 before:bg-white before:rounded-full before:transition-all peer-checked:before:translate-x-6"></span>
                        </label>
                      </div>
                      <div className={`p-4 rounded-xl border ${isDark ? 'bg-yellow-900/30 border-yellow-700/50' : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800/50'}`}>
                        <p className={`text-sm ${isDark ? 'text-slate-200' : 'text-slate-700 dark:text-slate-300'}`}>
                          Los datos de los aprendices están protegidos según la normativa de protección de datos del SENA y las leyes colombianas de habeas data.
                        </p>
                      </div>
                    </div>
                  )}

                  {section.id === 'notifications' && (
                    <div className="space-y-3">
                      <div className={`flex items-center justify-between p-4 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-50 dark:bg-slate-700/50'}`}>
                        <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700 dark:text-slate-300'}`}>Nuevas citas</span>
                        <label className="relative inline-block w-12 h-6">
                          <input type="checkbox" defaultChecked className="opacity-0 w-0 h-0 peer" />
                          <span className="absolute cursor-pointer inset-0 bg-slate-300 rounded-full transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-600 before:absolute before:content-[''] before:h-5 before:w-5 before:left-0.5 before:bottom-0.5 before:bg-white before:rounded-full before:transition-all peer-checked:before:translate-x-6"></span>
                        </label>
                      </div>
                      <div className={`flex items-center justify-between p-4 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-50 dark:bg-slate-700/50'}`}>
                        <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700 dark:text-slate-300'}`}>Mensajes nuevos</span>
                        <label className="relative inline-block w-12 h-6">
                          <input type="checkbox" defaultChecked className="opacity-0 w-0 h-0 peer" />
                          <span className="absolute cursor-pointer inset-0 bg-slate-300 rounded-full transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-600 before:absolute before:content-[''] before:h-5 before:w-5 before:left-0.5 before:bottom-0.5 before:bg-white before:rounded-full before:transition-all peer-checked:before:translate-x-6"></span>
                        </label>
                      </div>
                      <div className={`flex items-center justify-between p-4 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-50 dark:bg-slate-700/50'}`}>
                        <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700 dark:text-slate-300'}`}>Casos críticos</span>
                        <label className="relative inline-block w-12 h-6">
                          <input type="checkbox" defaultChecked className="opacity-0 w-0 h-0 peer" />
                          <span className="absolute cursor-pointer inset-0 bg-slate-300 rounded-full transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-600 before:absolute before:content-[''] before:h-5 before:w-5 before:left-0.5 before:bottom-0.5 before:bg-white before:rounded-full before:transition-all peer-checked:before:translate-x-6"></span>
                        </label>
                      </div>
                    </div>
                  )}

                  {section.id === 'appearance' && (
                    <div className="space-y-4">
                      <div>
                        <label className={`text-sm mb-2 block ${isDark ? 'text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>Tema</label>
                        <Select value={theme} onValueChange={(v) => setTheme(v as 'light' | 'dark' | 'system')}>
                          <SelectTrigger
                            className={`h-11 rounded-xl ${
                              isDark ? 'border-slate-600 bg-slate-800 text-white' : 'border-purple-200/50 bg-slate-50 dark:border-purple-500/30 dark:bg-slate-800 dark:text-slate-200'
                            }`}
                          >
                            <SelectValue placeholder="Seleccione tema" />
                          </SelectTrigger>
                          <SelectContent
                            container={settingsContainerRef.current}
                            className={`!w-[var(--radix-select-trigger-width)] !min-w-[var(--radix-select-trigger-width)] rounded-xl ${
                              isDark ? '!bg-slate-700 border-slate-500 text-white settings-select-dark' : '!bg-white border-slate-200 text-slate-900 select-light-dropdown'
                            }`}
                            style={isDark ? { backgroundColor: '#334155', width: 'var(--radix-select-trigger-width)', minWidth: 'var(--radix-select-trigger-width)' } : { backgroundColor: '#fff', width: 'var(--radix-select-trigger-width)', minWidth: 'var(--radix-select-trigger-width)' }}
                          >
                            <SelectItem value="light" hideIndicator className={isDark ? 'px-4 py-2 text-white focus:bg-slate-500 data-[highlighted]:bg-slate-500 transition-colors duration-150' : 'px-4 py-2 text-slate-900 focus:bg-slate-100 data-[highlighted]:bg-slate-100 transition-colors duration-150'}>Claro</SelectItem>
                            <SelectItem value="dark" hideIndicator className={isDark ? 'px-4 py-2 text-white focus:bg-slate-500 data-[highlighted]:bg-slate-500 transition-colors duration-150' : 'px-4 py-2 text-slate-900 focus:bg-slate-100 data-[highlighted]:bg-slate-100 transition-colors duration-150'}>Oscuro</SelectItem>
                            <SelectItem value="system" hideIndicator className={isDark ? 'px-4 py-2 text-white focus:bg-slate-500 data-[highlighted]:bg-slate-500 transition-colors duration-150' : 'px-4 py-2 text-slate-900 focus:bg-slate-100 data-[highlighted]:bg-slate-100 transition-colors duration-150'}>Automático</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-600' : 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-500/30'}`}>
                        <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700 dark:text-slate-300'}`}>
                          La paleta de colores azul/púrpura con acentos verdes SENA se mantiene en todos los temas.
                        </p>
                      </div>
                    </div>
                  )}

                  {section.id === 'signature' && (
                    <FirmaProfesionalSection
                      isDark={isDark}
                      savedFirmas={savedFirmas}
                      savedFirmasLoading={savedFirmasLoading}
                      firmaMode={firmaMode}
                      setFirmaMode={setFirmaMode}
                      firmaSaving={firmaSaving}
                      setFirmaSaving={setFirmaSaving}
                      deletingFirmaId={deletingFirmaId}
                      setDeletingFirmaId={setDeletingFirmaId}
                      refreshSavedFirmas={refreshSavedFirmas}
                      firmaCanvasRef={firmaCanvasRef}
                      firmaFileInputRef={firmaFileInputRef}
                      firmaIsDrawingRef={firmaIsDrawingRef}
                      firmaLastPosRef={firmaLastPosRef}
                      setFirmaToast={(msg) => setSecurityToast({ type: 'success', message: msg })}
                    />
                  )}

                  {section.id === 'language' && (
                    <div className="space-y-4">
                      <div>
                        <label className={`text-sm mb-2 block ${isDark ? 'text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>Idioma</label>
                        <Select value="es" onValueChange={() => {}}>
                          <SelectTrigger
                            className={`h-11 rounded-xl ${
                              isDark ? 'border-slate-600 bg-slate-800 text-white' : 'border-purple-200/50 bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200'
                            }`}
                          >
                            <SelectValue placeholder="Idioma" />
                          </SelectTrigger>
                          <SelectContent
                            container={settingsContainerRef.current}
                            className={`!w-[var(--radix-select-trigger-width)] !min-w-[var(--radix-select-trigger-width)] rounded-xl ${
                              isDark ? '!bg-slate-700 border-slate-500 text-white settings-select-dark' : '!bg-white border-slate-200 text-slate-900 select-light-dropdown'
                            }`}
                            style={isDark ? { backgroundColor: '#334155', width: 'var(--radix-select-trigger-width)', minWidth: 'var(--radix-select-trigger-width)' } : { backgroundColor: '#fff', width: 'var(--radix-select-trigger-width)', minWidth: 'var(--radix-select-trigger-width)' }}
                          >
                            <SelectItem value="es" hideIndicator className={isDark ? 'px-4 py-2 text-white focus:bg-slate-500 data-[highlighted]:bg-slate-500 transition-colors duration-150' : 'px-4 py-2 text-slate-900 focus:bg-slate-100 data-[highlighted]:bg-slate-100 transition-colors duration-150'}>Español</SelectItem>
                            <SelectItem value="en" hideIndicator className={isDark ? 'px-4 py-2 text-white focus:bg-slate-500 data-[highlighted]:bg-slate-500 transition-colors duration-150' : 'px-4 py-2 text-slate-900 focus:bg-slate-100 data-[highlighted]:bg-slate-100 transition-colors duration-150'}>English</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className={`text-sm mb-2 block ${isDark ? 'text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>Zona Horaria</label>
                        <Select value="bogota" onValueChange={() => {}}>
                          <SelectTrigger
                            className={`h-11 rounded-xl ${
                              isDark ? 'border-slate-600 bg-slate-800 text-white' : 'border-purple-200/50 bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200'
                            }`}
                          >
                            <SelectValue placeholder="Zona horaria" />
                          </SelectTrigger>
                          <SelectContent
                            container={settingsContainerRef.current}
                            className={`!w-[var(--radix-select-trigger-width)] !min-w-[var(--radix-select-trigger-width)] rounded-xl ${
                              isDark ? '!bg-slate-700 border-slate-500 text-white settings-select-dark' : '!bg-white border-slate-200 text-slate-900 select-light-dropdown'
                            }`}
                            style={isDark ? { backgroundColor: '#334155', width: 'var(--radix-select-trigger-width)', minWidth: 'var(--radix-select-trigger-width)' } : { backgroundColor: '#fff', width: 'var(--radix-select-trigger-width)', minWidth: 'var(--radix-select-trigger-width)' }}
                          >
                            <SelectItem value="bogota" hideIndicator className={isDark ? 'px-4 py-2 text-white focus:bg-slate-500 data-[highlighted]:bg-slate-500 transition-colors duration-150' : 'px-4 py-2 text-slate-900 focus:bg-slate-100 data-[highlighted]:bg-slate-100 transition-colors duration-150'}>America/Bogota (GMT-5)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
