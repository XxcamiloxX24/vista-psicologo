import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Pencil, Trash2, Save, X, Loader2, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { CardImageUpload } from './CardImageUpload';
import { obtenerCardPorId, editarCard, eliminarCard, type CardInfo } from '../lib/cardsInfo';

interface CardInfoDetailPageProps {
  cardId: number;
  onBack: () => void;
  onDeleted: () => void;
  onSaved: () => void;
}

export function CardInfoDetailPage({ cardId, onBack, onDeleted, onSaved }: CardInfoDetailPageProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [card, setCard] = useState<CardInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    carTitulo: '',
    carDescripcion: '',
    carImagenUrl: '',
    carLink: '',
    carEstadoRegistro: 'activo' as 'activo' | 'inactivo',
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    obtenerCardPorId(cardId)
      .then((data) => {
        if (cancelled) return;
        setCard(data ?? null);
        if (data) {
          setForm({
            carTitulo: data.carTitulo ?? '',
            carDescripcion: data.carDescripcion ?? '',
            carImagenUrl: data.carImagenUrl ?? '',
            carLink: data.carLink ?? '',
            carEstadoRegistro: ((data.carEstadoRegistro ?? 'activo').toLowerCase() === 'activo' ? 'activo' : 'inactivo') as 'activo' | 'inactivo',
          });
        }
      })
      .catch(() => {
        if (!cancelled) setError('No se pudo cargar la tarjeta.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [cardId]);

  const handleSave = async () => {
    if (!card?.carCodigo) return;
    setSaving(true);
    setError(null);
    try {
      await editarCard(card.carCodigo, {
        ...card,
        carTitulo: form.carTitulo,
        carDescripcion: form.carDescripcion,
        carImagenUrl: form.carImagenUrl || null,
        carLink: form.carLink || null,
        carEstadoRegistro: form.carEstadoRegistro,
      });
      setCard((prev) => prev ? { ...prev, ...form } : null);
      setEditing(false);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!card?.carCodigo) return;
    setDeleting(true);
    setError(null);
    try {
      await eliminarCard(card.carCodigo);
      setShowDeleteConfirm(false);
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600 mb-4" />
        <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>Cargando…</p>
      </div>
    );
  }

  if (!card || error) {
    return (
      <div className="space-y-4">
        <button
          onClick={onBack}
          className={`flex items-center gap-2 ${isDark ? 'text-white hover:text-purple-400' : 'text-slate-600 hover:text-purple-600'}`}
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </button>
        <div className={`rounded-2xl border p-6 ${isDark ? 'border-red-500/50 bg-red-900/20 text-red-300' : 'border-red-200 bg-red-50 text-red-700'}`}>
          <p>{error ?? 'No se encontró la tarjeta.'}</p>
        </div>
      </div>
    );
  }

  const inputBase = 'w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-colors';
  const inputStyle = isDark
    ? 'border border-slate-500 bg-slate-800 text-white placeholder:text-slate-400'
    : 'border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-500';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className={`flex items-center gap-2 ${isDark ? 'text-white hover:text-purple-400' : 'text-slate-600 hover:text-purple-600'}`}
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </button>
        {!editing ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                isDark
                  ? 'bg-slate-700 text-white hover:bg-slate-600'
                  : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
              }`}
            >
              <Pencil className="w-4 h-4" />
              Editar
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium border transition-colors ${
                isDark ? 'border-slate-500 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg disabled:opacity-60 transition-all"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className={`rounded-xl p-4 ${isDark ? 'bg-red-900/30 text-red-300 border border-red-500/50' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {error}
        </div>
      )}

      <div className={`rounded-2xl border overflow-hidden ${
        isDark ? 'bg-slate-800/90 border-slate-600/50' : 'bg-white/90 border-purple-100/50'
      }`}>
        {editing ? (
          <div className="p-6 space-y-4">
            <div>
              <Label className={isDark ? 'text-slate-300' : 'text-slate-700'}>Título</Label>
              <Input
                value={form.carTitulo}
                onChange={(e) => setForm((f) => ({ ...f, carTitulo: e.target.value }))}
                className={`${inputBase} ${inputStyle} mt-1`}
                placeholder="Título de la tarjeta"
              />
            </div>
            <div>
              <Label className={isDark ? 'text-slate-300' : 'text-slate-700'}>Descripción</Label>
              <Textarea
                value={form.carDescripcion}
                onChange={(e) => setForm((f) => ({ ...f, carDescripcion: e.target.value }))}
                className={`${inputBase} ${inputStyle} mt-1 min-h-[100px]`}
                placeholder="Breve descripción"
              />
            </div>
            <CardImageUpload
              value={form.carImagenUrl || ''}
              onChange={(url) => setForm((f) => ({ ...f, carImagenUrl: url }))}
              disabled={saving}
            />
            <div>
              <Label className={isDark ? 'text-slate-300' : 'text-slate-700'}>Enlace externo (opcional)</Label>
              <Input
                value={form.carLink}
                onChange={(e) => setForm((f) => ({ ...f, carLink: e.target.value }))}
                className={`${inputBase} ${inputStyle} mt-1`}
                placeholder="https://..."
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.carEstadoRegistro === 'activo'}
                onCheckedChange={(checked) =>
                  setForm((f) => ({ ...f, carEstadoRegistro: checked ? 'activo' : 'inactivo' }))
                }
              />
              <Label className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                Visible para aprendices (activa)
              </Label>
            </div>
          </div>
        ) : (
          <div>
            <div className="aspect-video relative bg-gradient-to-br from-slate-100 to-purple-100/30 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center overflow-hidden">
              {(form.carImagenUrl || card.carImagenUrl) ? (
                <img
                  src={form.carImagenUrl || card.carImagenUrl || ''}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon className={`w-24 h-24 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              )}
            </div>
            <div className="p-6">
              <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {form.carTitulo || card.carTitulo || 'Sin título'}
              </h2>
              <p className={`mb-4 whitespace-pre-wrap ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {form.carDescripcion || card.carDescripcion || 'Sin descripción'}
              </p>
              {(form.carLink || card.carLink) && (
                <a
                  href={form.carLink || card.carLink || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:underline`}
                >
                  <ExternalLink className="w-4 h-4" />
                  Ver enlace externo
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {showDeleteConfirm &&
        createPortal(
          <div
            className="fixed inset-0 flex items-center justify-center p-4 z-[2147483647]"
            style={{
              backgroundColor: isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(6px)',
            }}
            onClick={() => !deleting && setShowDeleteConfirm(false)}
          >
            <div
              className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${
                isDark ? 'bg-slate-800 border border-slate-600' : 'bg-white border border-slate-200'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  ¿Eliminar esta tarjeta?
                </h3>
                <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Esta acción no se puede deshacer. La tarjeta dejará de mostrarse a los aprendices.
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => !deleting && setShowDeleteConfirm(false)}
                    disabled={deleting}
                    className={`flex-1 py-3 rounded-xl font-medium border transition-colors ${
                      isDark
                        ? 'border-slate-500 text-slate-300 hover:bg-slate-700'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 py-3 rounded-xl font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
