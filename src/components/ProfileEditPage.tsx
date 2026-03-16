import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Loader2, X, Upload, Trash2, RefreshCw } from 'lucide-react';
import type { PsychologistUpdate } from '../lib/psychologist';
import { uploadProfileImage, deleteImage } from '../lib/images';
import { usePsychologist } from '../contexts/PsychologistContext';
import { useTheme } from '../contexts/ThemeContext';

interface ProfileEditPageProps {
  onBack: (showSaved?: boolean) => void;
}

const inputClass = (isDark: boolean) =>
  `w-full rounded-xl border px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
    isDark
      ? 'border-slate-600 bg-slate-700 text-slate-200 placeholder:text-slate-400'
      : 'border-purple-200/50 bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200'
  }`;

const labelClass = (isDark: boolean) =>
  `mb-2 block text-sm ${isDark ? 'text-slate-300' : 'text-slate-700 dark:text-slate-300'}`;

export function ProfileEditPage({ onBack }: ProfileEditPageProps) {
  const { psychologist, updateProfile, refresh, profileImageUrl, profileImageId, initials } = usePsychologist();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<PsychologistUpdate>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (psychologist) {
      const fechaNac = psychologist.psiFechaNac?.split('T')[0] ?? '';
      setFormData({
        psiDocumento: psychologist.psiDocumento,
        psiNombre: psychologist.psiNombre,
        psiApellido: psychologist.psiApellido,
        psiEspecialidad: psychologist.psiEspecialidad,
        psiTelefono: psychologist.psiTelefono,
        psiFechaNac: fechaNac,
        psiDireccion: psychologist.psiDireccion,
        psiCorreoInstitucional: psychologist.psiCorreoInstitucional,
        psiCorreoPersonal: psychologist.psiCorreoPersonal,
      });
    }
  }, [psychologist]);

  useEffect(() => {
    if (showErrorNotification) {
      const t = setTimeout(() => setShowErrorNotification(false), 5000);
      return () => clearTimeout(t);
    }
  }, [showErrorNotification]);

  const handleChange = (field: keyof PsychologistUpdate, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    e.target.value = '';
    setIsUploadingImage(true);
    setError(null);
    try {
      if (profileImageId) {
        await deleteImage(profileImageId);
      }
      await uploadProfileImage(file);
      await refresh();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Error al subir la imagen');
      setShowErrorNotification(true);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!profileImageId) return;
    setIsDeletingImage(true);
    setError(null);
    try {
      await deleteImage(profileImageId);
      await refresh();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Error al eliminar la imagen');
      setShowErrorNotification(true);
    } finally {
      setIsDeletingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!psychologist) return;
    setIsSaving(true);
    setError(null);
    try {
      await updateProfile(formData);
      refresh().catch(() => {});
      onBack(true);
    } catch (err) {
      let msg = 'Error al guardar los cambios.';
      if (err instanceof Error) {
        msg = err.name === 'AbortError' ? 'La solicitud tardó demasiado. Intenta de nuevo.' : err.message;
      }
      setError(msg);
      setErrorMessage(msg);
      setShowErrorNotification(true);
    } finally {
      setIsSaving(false);
    }
  };

  const toastEl = showErrorNotification && (
    <div
      role="alert"
      className="fixed bottom-6 right-6 z-[99999] flex min-w-[280px] items-center gap-3 rounded-xl px-4 py-3 text-white shadow-xl"
      style={{ backgroundColor: '#ef4444' }}
    >
      <span className="font-medium">{errorMessage}</span>
      <button
        type="button"
        onClick={() => setShowErrorNotification(false)}
        className="ml-1 rounded p-1 hover:bg-white/20"
        aria-label="Cerrar"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );

  if (!psychologist) {
    return (
      <div className={`flex min-h-[40vh] items-center justify-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
        Cargando perfil...
      </div>
    );
  }

  return (
    <div className="relative space-y-6">
      {showErrorNotification ? createPortal(toastEl, document.body) : null}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className={`text-4xl mb-2 ${
              isDark ? 'text-white' : 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'
            }`}
          >
            Editar perfil
          </h1>
          <p className={isDark ? 'text-slate-400' : 'text-slate-600 dark:text-slate-400'}>
            Actualiza tu información personal y profesional
          </p>
        </div>
        <div className="w-fit self-start sm:self-center">
          <button
            type="button"
            onClick={() => onBack()}
            title="Volver a Configuración"
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
              isDark
                ? 'border-slate-600 text-slate-200 hover:bg-slate-700'
                : 'border-purple-200/50 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            <span>Volver a Configuración</span>
          </button>
        </div>
      </div>

      <div
        className={`rounded-2xl border shadow-sm ${
          isDark ? 'border-slate-600/50 bg-slate-800/90' : 'border-purple-100/50 bg-white/90 dark:border-slate-600/50 dark:bg-slate-800/90'
        } p-6 sm:p-8`}
      >
        {/* Imagen de perfil: foto de la API o iniciales + Subir / Eliminar */}
        <div
          className={`mb-8 flex flex-col items-center gap-4 rounded-xl border border-dashed p-6 ${
            isDark ? 'border-slate-600 bg-slate-800/50' : 'border-purple-200/50 bg-slate-50/50 dark:border-slate-600 dark:bg-slate-800/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleUploadPhoto}
          />
          {profileImageUrl ? (
            <img
              src={profileImageUrl}
              alt="Foto de perfil"
              className="h-24 w-24 rounded-full object-cover"
            />
          ) : (
            <div
              className={`flex h-24 w-24 items-center justify-center rounded-full text-2xl font-semibold ${
                isDark ? 'bg-slate-700 text-slate-300' : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
              }`}
            >
              {initials}
            </div>
          )}
          <div className="text-center">
            <p className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700 dark:text-slate-200'}`}>
              Imagen de perfil
            </p>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>
              {profileImageUrl
                ? 'Cambia tu foto (se reemplazará la actual) o elimínala si lo deseas.'
                : 'Sube una foto (JPEG, PNG, WebP o GIF, máx. 5 MB).'}
            </p>
          </div>
          {profileImageUrl ? (
            <div className="flex flex-row flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage}
                className="inline-flex flex-row items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 [&:not(:disabled):hover]:brightness-95"
                style={{
                  backgroundColor: '#eab308',
                  borderColor: '#eab308',
                  color: '#1c1917',
                }}
              >
                {isUploadingImage ? (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 shrink-0" />
                )}
                <span>{isUploadingImage ? 'Cambiando...' : 'Cambiar foto'}</span>
              </button>
              <button
                type="button"
                onClick={handleDeletePhoto}
                disabled={isDeletingImage}
                className="inline-flex flex-row items-center justify-center gap-2 rounded-xl border border-red-500 bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-60 dark:border-red-600 dark:bg-red-600 dark:hover:bg-red-700"
              >
                {isDeletingImage ? (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 shrink-0" />
                )}
                <span>{isDeletingImage ? 'Eliminando...' : 'Eliminar foto'}</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingImage}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 ${
                isDark
                  ? 'border-slate-500 text-slate-200 hover:bg-slate-700'
                  : 'border-purple-200/50 text-slate-700 hover:bg-slate-50 dark:border-slate-500 dark:text-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {isUploadingImage ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {isUploadingImage ? 'Subiendo...' : 'Subir foto'}
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {showErrorNotification && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-700 dark:text-red-300"
            >
              {errorMessage}
            </div>
          )}
          {error && !showErrorNotification && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="grid gap-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="psiNombre" className={labelClass(isDark)}>
                  Nombre
                </label>
                <input
                  id="psiNombre"
                  type="text"
                  value={formData.psiNombre ?? ''}
                  onChange={(e) => handleChange('psiNombre', e.target.value)}
                  className={inputClass(isDark)}
                />
              </div>
              <div>
                <label htmlFor="psiApellido" className={labelClass(isDark)}>
                  Apellido
                </label>
                <input
                  id="psiApellido"
                  type="text"
                  value={formData.psiApellido ?? ''}
                  onChange={(e) => handleChange('psiApellido', e.target.value)}
                  className={inputClass(isDark)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="psiDocumento" className={labelClass(isDark)}>
                Documento
              </label>
              <input
                id="psiDocumento"
                type="text"
                value={formData.psiDocumento ?? ''}
                onChange={(e) => handleChange('psiDocumento', e.target.value)}
                className={inputClass(isDark)}
              />
            </div>

            <div>
              <label htmlFor="psiEspecialidad" className={labelClass(isDark)}>
                Especialidad
              </label>
              <input
                id="psiEspecialidad"
                type="text"
                value={formData.psiEspecialidad ?? ''}
                onChange={(e) => handleChange('psiEspecialidad', e.target.value)}
                className={inputClass(isDark)}
              />
            </div>

            <div>
              <label htmlFor="psiFechaNac" className={labelClass(isDark)}>
                Fecha de nacimiento
              </label>
              <input
                id="psiFechaNac"
                type="date"
                value={formData.psiFechaNac ?? ''}
                onChange={(e) => handleChange('psiFechaNac', e.target.value)}
                className={inputClass(isDark)}
              />
            </div>

            <div>
              <label htmlFor="psiTelefono" className={labelClass(isDark)}>
                Teléfono
              </label>
              <input
                id="psiTelefono"
                type="tel"
                value={formData.psiTelefono ?? ''}
                onChange={(e) => handleChange('psiTelefono', e.target.value)}
                className={inputClass(isDark)}
              />
            </div>

            <div>
              <label htmlFor="psiDireccion" className={labelClass(isDark)}>
                Dirección
              </label>
              <input
                id="psiDireccion"
                type="text"
                value={formData.psiDireccion ?? ''}
                onChange={(e) => handleChange('psiDireccion', e.target.value)}
                className={inputClass(isDark)}
              />
            </div>

            <div>
              <label htmlFor="psiCorreoInstitucional" className={labelClass(isDark)}>
                Correo institucional
              </label>
              <input
                id="psiCorreoInstitucional"
                type="email"
                value={formData.psiCorreoInstitucional ?? ''}
                onChange={(e) => handleChange('psiCorreoInstitucional', e.target.value)}
                className={inputClass(isDark)}
              />
            </div>

            <div>
              <label htmlFor="psiCorreoPersonal" className={labelClass(isDark)}>
                Correo personal
              </label>
              <input
                id="psiCorreoPersonal"
                type="email"
                value={formData.psiCorreoPersonal ?? ''}
                onChange={(e) => handleChange('psiCorreoPersonal', e.target.value)}
                className={inputClass(isDark)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4">
            <button
              type="button"
              onClick={() => onBack()}
              className={`rounded-xl border px-4 py-3 transition-colors ${
                isDark
                  ? 'border-slate-600 text-slate-200 hover:bg-slate-700'
                  : 'border-purple-200/50 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 text-white transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar cambios'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
