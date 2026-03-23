import { useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { CardImageUpload } from './CardImageUpload';
import { crearCard } from '../lib/cardsInfo';

interface CardInfoCreatePageProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function CardInfoCreatePage({ onBack, onSuccess }: CardInfoCreatePageProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [form, setForm] = useState({
    carTitulo: '',
    carDescripcion: '',
    carImagenUrl: '',
    carLink: '',
    carEstadoRegistro: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputBase = 'w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-colors';
  const inputStyle = isDark
    ? 'border border-slate-500 bg-slate-800 text-white placeholder:text-slate-400'
    : 'border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-500';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.carTitulo.trim()) {
      setError('El título es obligatorio.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await crearCard({
        carTitulo: form.carTitulo.trim(),
        carDescripcion: form.carDescripcion.trim() || null,
        carImagenUrl: form.carImagenUrl.trim() || null,
        carLink: form.carLink.trim() || null,
        carEstadoRegistro: form.carEstadoRegistro ? 'activo' : 'inactivo',
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la tarjeta');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className={`flex items-center gap-2 ${isDark ? 'text-white hover:text-purple-400' : 'text-slate-600 hover:text-purple-600'}`}
      >
        <ArrowLeft className="w-5 h-5" />
        Volver
      </button>

      <h1 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Nueva tarjeta informativa
      </h1>

      {error && (
        <div className={`rounded-xl p-4 ${isDark ? 'bg-red-900/30 text-red-300 border border-red-500/50' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className={`rounded-2xl border p-6 space-y-4 ${
        isDark ? 'bg-slate-800/90 border-slate-600/50' : 'bg-white/90 border-purple-100/50'
      }`}>
        <div>
          <Label htmlFor="titulo" className={isDark ? 'text-slate-300' : 'text-slate-700'}>Título *</Label>
          <Input
            id="titulo"
            value={form.carTitulo}
            onChange={(e) => setForm((f) => ({ ...f, carTitulo: e.target.value }))}
            className={`${inputBase} ${inputStyle} mt-1`}
            placeholder="Título de la tarjeta"
            required
          />
        </div>
        <div>
          <Label htmlFor="descripcion" className={isDark ? 'text-slate-300' : 'text-slate-700'}>Descripción</Label>
          <Textarea
            id="descripcion"
            value={form.carDescripcion}
            onChange={(e) => setForm((f) => ({ ...f, carDescripcion: e.target.value }))}
            className={`${inputBase} ${inputStyle} mt-1 min-h-[100px]`}
            placeholder="Breve descripción para los aprendices"
          />
        </div>
        <CardImageUpload
          value={form.carImagenUrl}
          onChange={(url) => setForm((f) => ({ ...f, carImagenUrl: url }))}
          disabled={saving}
        />
        <div>
          <Label htmlFor="link" className={isDark ? 'text-slate-300' : 'text-slate-700'}>Enlace externo (opcional)</Label>
          <Input
            id="link"
            type="url"
            value={form.carLink}
            onChange={(e) => setForm((f) => ({ ...f, carLink: e.target.value }))}
            className={`${inputBase} ${inputStyle} mt-1`}
            placeholder="https://..."
          />
        </div>
        <div className="flex items-center gap-3">
          <Switch
            checked={form.carEstadoRegistro}
            onCheckedChange={(checked) => setForm((f) => ({ ...f, carEstadoRegistro: checked }))}
          />
          <Label className={isDark ? 'text-slate-300' : 'text-slate-700'}>
            Visible para aprendices (activa)
          </Label>
        </div>
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onBack}
            className={`flex-1 py-3 rounded-xl font-medium border transition-colors ${
              isDark ? 'border-slate-500 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3 rounded-xl font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            Crear tarjeta
          </button>
        </div>
      </form>
    </div>
  );
}
