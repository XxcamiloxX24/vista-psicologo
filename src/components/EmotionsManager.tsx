import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Loader2, SmilePlus, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import {
  getEmociones,
  crearEmocion,
  editarEmocion,
  eliminarEmocion,
  categoriaDeEscala,
  colorDeCategoria,
  type Emocion,
  type CrearEmocionPayload,
} from '../lib/emociones';

const CATEGORY_BADGE: Record<string, string> = {
  Positiva: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  Neutral: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  Negativa: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  Critica: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

const COMMON_EMOJIS = [
  '😊', '😌', '🙏', '💪', '😢', '😰', '😡', '😣',
  '😴', '🤔', '😐', '🕰', '🤩', '😇', '🥺', '😤',
  '😱', '🤗', '😎', '🥳', '😔', '😭', '🫠', '😶',
];

interface EmotionFormData {
  emoNombre: string;
  emoEmoji: string;
  emoEscala: number;
  emoColorFondo: string;
  emoDescripcion: string;
}

const EMPTY_FORM: EmotionFormData = {
  emoNombre: '',
  emoEmoji: '😊',
  emoEscala: 5,
  emoColorFondo: '#e0e7ff',
  emoDescripcion: '',
};

export function EmotionsManager() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [emociones, setEmociones] = useState<Emocion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<EmotionFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      setEmociones(await getEmociones());
    } catch {
      setEmociones([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const abrirCrear = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
    setEmojiPickerOpen(false);
    setShowForm(true);
  };

  const abrirEditar = (emo: Emocion) => {
    setEditingId(emo.emoCodigo);
    setForm({
      emoNombre: emo.emoNombre,
      emoEmoji: emo.emoEmoji ?? '😊',
      emoEscala: emo.emoEscala,
      emoColorFondo: emo.emoColorFondo ?? '#e0e7ff',
      emoDescripcion: emo.emoDescripcion ?? '',
    });
    setError(null);
    setEmojiPickerOpen(false);
    setShowForm(true);
  };

  const cerrarForm = () => {
    setShowForm(false);
    setEditingId(null);
    setError(null);
    setEmojiPickerOpen(false);
  };

  const handleGuardar = async () => {
    if (!form.emoNombre.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }
    if (form.emoEscala < 1 || form.emoEscala > 10) {
      setError('La escala debe estar entre 1 y 10.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const payload: CrearEmocionPayload = {
        emoNombre: form.emoNombre.trim(),
        emoEmoji: form.emoEmoji || null,
        emoEscala: form.emoEscala,
        emoColorFondo: form.emoColorFondo || null,
        emoDescripcion: form.emoDescripcion.trim() || null,
      };
      if (editingId != null) {
        await editarEmocion(editingId, payload);
      } else {
        await crearEmocion(payload);
      }
      cerrarForm();
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleEliminar = async (id: number) => {
    setDeletingId(id);
    try {
      await eliminarEmocion(id);
      await cargar();
    } catch {
      /* silencioso */
    } finally {
      setDeletingId(null);
    }
  };

  const categoriaPreview = categoriaDeEscala(form.emoEscala);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
            Gestión de Emociones
          </h2>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Administra el catálogo de emociones que los aprendices usan en su diario.
          </p>
        </div>
        <button
          onClick={abrirCrear}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          Nueva emoción
        </button>
      </div>

      {/* Formulario crear/editar */}
      {showForm && (
        <div className={`mb-6 rounded-xl border p-6 overflow-visible ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {editingId != null ? 'Editar emoción' : 'Crear emoción'}
            </h3>
            <button onClick={cerrarForm} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Nombre *
              </label>
              <input
                type="text"
                value={form.emoNombre}
                onChange={(e) => setForm({ ...form, emoNombre: e.target.value })}
                placeholder="Ej: Feliz, Ansioso..."
                className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500' : 'bg-white border-slate-300 text-slate-800 placeholder:text-slate-400'}`}
              />
            </div>

            {/* Emoji: Popover en portal para evitar recortes del grid y apilado vertical */}
            <div className="min-w-0">
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Emoji
              </label>
              <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={`w-full px-3 py-2 rounded-lg border text-sm text-left flex items-center gap-2 ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-800'}`}
                  >
                    <span className="text-xl shrink-0">{form.emoEmoji}</span>
                    <span className="text-slate-400 truncate">Seleccionar emoji</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  side="bottom"
                  sideOffset={6}
                  className={`w-72 p-4 z-[200] ${isDark ? 'bg-black backdrop-blur-sm border border-slate-700' : 'bg-white border-slate-200'}`}
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  <p className={`text-sll font-medium mb-2 px-1 ${isDark ? 'text-slate-200' : 'text-slate-500'}`}>
                    Elige un emoji
                  </p>
                  <div
                    className="max-h-52 overflow-y-auto overscroll-contain"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(8, minmax(0, 1fr))',
                      gap: '6px',
                    }}
                  >
                    {COMMON_EMOJIS.map((e) => (
                      <button
                        key={e}
                        type="button"
                        onClick={() => {
                          setForm((prev) => ({ ...prev, emoEmoji: e }));
                          setEmojiPickerOpen(false);
                        }}
                        className={`flex h-9 w-full items-center justify-center rounded-lg text-xl transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 ${form.emoEmoji === e ? 'bg-purple-100 dark:bg-purple-900/40 ring-1 ring-purple-400/50' : ''}`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Escala */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Escala (1 - 10)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={form.emoEscala}
                  onChange={(e) => setForm({ ...form, emoEscala: Number(e.target.value) })}
                  className="flex-1 accent-purple-600"
                />
                <span className={`text-lg font-bold w-8 text-center ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  {form.emoEscala}
                </span>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_BADGE[categoriaPreview] ?? ''}`}
                >
                  {categoriaPreview}
                </span>
              </div>
            </div>

            {/* Color de fondo */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Color de fondo
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.emoColorFondo}
                  onChange={(e) => setForm({ ...form, emoColorFondo: e.target.value })}
                  className="w-10 h-10 rounded-lg border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={form.emoColorFondo}
                  onChange={(e) => setForm({ ...form, emoColorFondo: e.target.value })}
                  className={`flex-1 px-3 py-2 rounded-lg border text-sm font-mono ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-800'}`}
                />
              </div>
            </div>

            {/* Descripción */}
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Descripción (opcional)
              </label>
              <textarea
                value={form.emoDescripcion}
                onChange={(e) => setForm({ ...form, emoDescripcion: e.target.value })}
                rows={2}
                placeholder="Breve descripción de esta emoción..."
                className={`w-full px-3 py-2 rounded-lg border text-sm resize-none ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500' : 'bg-white border-slate-300 text-slate-800 placeholder:text-slate-400'}`}
              />
            </div>

            {/* Preview */}
            <div className="md:col-span-2">
              <p className={`text-xs font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Vista previa</p>
              <div
                className="inline-flex items-center gap-4 px-4 py-2 rounded-xl border"
                style={{ backgroundColor: form.emoColorFondo + '33', borderColor: form.emoColorFondo }}
              >
                <span className="text-2xl shrink-0 px-2">{form.emoEmoji}</span>
                <span className={`font-medium shrink-0 px-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  {form.emoNombre || 'Nombre'}
                </span>
                <span
                  className={`text-xs font-medium shrink-0 px-2 py-1 rounded-full ${CATEGORY_BADGE[categoriaPreview] ?? ''}`}
                >
                  {categoriaPreview} ({form.emoEscala})
                </span>
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-red-500 mt-3">{error}</p>}

          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={cerrarForm}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Cancelar
            </button>
            <button
              onClick={handleGuardar}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium hover:shadow-lg disabled:opacity-60 transition-all"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingId != null ? 'Guardar cambios' : 'Crear emoción'}
            </button>
          </div>
        </div>
      )}

      {/* Tabla */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      ) : emociones.length === 0 ? (
        <div className={`text-center py-16 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white/80 border-slate-200'}`}>
          <SmilePlus className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
          <p className={`text-lg font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            No hay emociones registradas
          </p>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Crea la primera emoción para que los aprendices la usen en su diario.
          </p>
        </div>
      ) : (
        <div className={`rounded-xl border overflow-hidden ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <table className="w-full">
            <thead>
              <tr className={isDark ? 'bg-slate-800' : 'bg-slate-50'}>
                <th className={`text-left text-xs font-semibold px-4 py-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Emoji</th>
                <th className={`text-left text-xs font-semibold px-4 py-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Nombre</th>
                <th className={`text-center text-xs font-semibold px-4 py-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Escala</th>
                <th className={`text-left text-xs font-semibold px-4 py-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Categoría</th>
                <th className={`text-left text-xs font-semibold px-4 py-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Descripción</th>
                <th className={`text-center text-xs font-semibold px-4 py-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Acciones</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-slate-100'}`}>
              {emociones.map((emo) => {
                const cat = emo.categoria || categoriaDeEscala(emo.emoEscala);
                return (
                  <tr key={emo.emoCodigo} className={`${isDark ? 'bg-slate-800/50 hover:bg-slate-700/50' : 'bg-white hover:bg-slate-50'} transition-colors`}>
                    <td className="px-4 py-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                        style={{ backgroundColor: (emo.emoColorFondo ?? '#e0e7ff') + '40' }}
                      >
                        {emo.emoEmoji || '❓'}
                      </div>
                    </td>
                    <td className={`px-4 py-3 font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      {emo.emoNombre}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <div className="w-16 h-2 rounded-full bg-slate-200 dark:bg-slate-600 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${emo.emoEscala * 10}%`, backgroundColor: colorDeCategoria(cat) }}
                          />
                        </div>
                        <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{emo.emoEscala}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-2 rounded-full ${CATEGORY_BADGE[cat] ?? ''}`}>
                        {cat}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-sm max-w-[200px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {emo.emoDescripcion || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-4">
                        <button
                          onClick={() => abrirEditar(emo)}
                          className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-600 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'}`}
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEliminar(emo.emoCodigo)}
                          disabled={deletingId === emo.emoCodigo}
                          className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-red-900/40 text-slate-400 hover:text-red-400' : 'hover:bg-red-50 text-slate-400 hover:text-red-500'}`}
                          title="Eliminar"
                        >
                          {deletingId === emo.emoCodigo ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
