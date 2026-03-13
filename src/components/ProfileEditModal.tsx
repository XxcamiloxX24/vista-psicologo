import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2 } from 'lucide-react';
import type { PsychologistUpdate } from '../lib/psychologist';
import { usePsychologist } from '../contexts/PsychologistContext';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess?: () => void;
  onSaveError?: (message: string) => void;
}

export function ProfileEditModal({ isOpen, onClose, onSaveSuccess, onSaveError }: ProfileEditModalProps) {
  const { psychologist, updateProfile, refresh } = usePsychologist();
  const [formData, setFormData] = useState<PsychologistUpdate>({});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (psychologist && isOpen) {
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
  }, [psychologist, isOpen]);

  const handleChange = (field: keyof PsychologistUpdate, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!psychologist) return;
    setIsSaving(true);
    setError(null);
    try {
      await updateProfile(formData);
      refresh().catch(() => {});
      onSaveSuccess?.();
      if (!onSaveSuccess) onClose();
    } catch (err) {
      let msg = 'Error al guardar los cambios.';
      if (err instanceof Error) {
        msg = err.name === 'AbortError' ? 'La solicitud tardó demasiado. Intenta de nuevo.' : err.message;
      }
      setError(msg);
      onSaveError?.(msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;
  if (!psychologist) return null;

  const modalContent = (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/60 p-4"
      style={{ zIndex: 2147483647 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 px-6 py-4">
          <h2 id="edit-profile-title" className="text-xl font-semibold text-white">
            Editar perfil
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && (
            <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 p-3 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="psiNombre" className="mb-2 block text-sm text-slate-700 dark:text-slate-300">
                  Nombre
                </label>
                <input
                  id="psiNombre"
                  type="text"
                  value={formData.psiNombre ?? ''}
                  onChange={(e) => handleChange('psiNombre', e.target.value)}
                  className="w-full rounded-xl border border-purple-200/50 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 dark:text-slate-200 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
              <div>
                <label htmlFor="psiApellido" className="mb-2 block text-sm text-slate-700 dark:text-slate-300">
                  Apellido
                </label>
                <input
                  id="psiApellido"
                  type="text"
                  value={formData.psiApellido ?? ''}
                  onChange={(e) => handleChange('psiApellido', e.target.value)}
                  className="w-full rounded-xl border border-purple-200/50 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 dark:text-slate-200 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
            </div>
            <div>
                <label htmlFor="psiDocumento" className="mb-2 block text-sm text-slate-700 dark:text-slate-300">
                Documento
              </label>
              <input
                id="psiDocumento"
                type="text"
                value={formData.psiDocumento ?? ''}
                onChange={(e) => handleChange('psiDocumento', e.target.value)}
                className="w-full rounded-xl border border-purple-200/50 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 dark:text-slate-200 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>
            <div>
                <label htmlFor="psiEspecialidad" className="mb-2 block text-sm text-slate-700 dark:text-slate-300">
                Especialidad
              </label>
              <input
                id="psiEspecialidad"
                type="text"
                value={formData.psiEspecialidad ?? ''}
                onChange={(e) => handleChange('psiEspecialidad', e.target.value)}
                className="w-full rounded-xl border border-purple-200/50 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 dark:text-slate-200 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>
            <div>
                <label htmlFor="psiFechaNac" className="mb-2 block text-sm text-slate-700 dark:text-slate-300">
                Fecha de nacimiento
              </label>
              <input
                id="psiFechaNac"
                type="date"
                value={formData.psiFechaNac ?? ''}
                onChange={(e) => handleChange('psiFechaNac', e.target.value)}
                className="w-full rounded-xl border border-purple-200/50 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 dark:text-slate-200 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>
            <div>
                <label htmlFor="psiTelefono" className="mb-2 block text-sm text-slate-700 dark:text-slate-300">
                Teléfono
              </label>
              <input
                id="psiTelefono"
                type="tel"
                value={formData.psiTelefono ?? ''}
                onChange={(e) => handleChange('psiTelefono', e.target.value)}
                className="w-full rounded-xl border border-purple-200/50 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 dark:text-slate-200 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>
            <div>
                <label htmlFor="psiDireccion" className="mb-2 block text-sm text-slate-700 dark:text-slate-300">
                Dirección
              </label>
              <input
                id="psiDireccion"
                type="text"
                value={formData.psiDireccion ?? ''}
                onChange={(e) => handleChange('psiDireccion', e.target.value)}
                className="w-full rounded-xl border border-purple-200/50 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 dark:text-slate-200 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>
            <div>
                <label htmlFor="psiCorreoInstitucional" className="mb-2 block text-sm text-slate-700 dark:text-slate-300">
                Correo institucional
              </label>
              <input
                id="psiCorreoInstitucional"
                type="email"
                value={formData.psiCorreoInstitucional ?? ''}
                onChange={(e) => handleChange('psiCorreoInstitucional', e.target.value)}
                className="w-full rounded-xl border border-purple-200/50 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 dark:text-slate-200 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>
            <div>
                <label htmlFor="psiCorreoPersonal" className="mb-2 block text-sm text-slate-700 dark:text-slate-300">
                Correo personal
              </label>
              <input
                id="psiCorreoPersonal"
                type="email"
                value={formData.psiCorreoPersonal ?? ''}
                onChange={(e) => handleChange('psiCorreoPersonal', e.target.value)}
                className="w-full rounded-xl border border-purple-200/50 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 dark:text-slate-200 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-purple-200/50 dark:border-slate-600 px-4 py-3 text-slate-700 dark:text-slate-200 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 text-white transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
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

  return createPortal(modalContent, document.body);
}
