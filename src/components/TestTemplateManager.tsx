import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Loader2, X, ChevronDown, ChevronUp, Eye, ClipboardList } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  getMisPlantillas,
  crearPlantilla,
  editarPlantilla,
  eliminarPlantilla,
  getPlantillaDetalle,
  TIPOS_PREGUNTA,
  opcionesPorDefecto,
  type PlantillaResumen,
  type PlantillaDetalle,
  type CrearPlantillaPayload,
} from '../lib/tests';

interface PreguntaForm {
  texto: string;
  tipo: string;
  opciones: { texto: string }[];
}

const emptyPregunta = (): PreguntaForm => ({
  texto: '',
  tipo: 'opcion_multiple',
  opciones: [{ texto: 'Opción 1' }, { texto: 'Opción 2' }],
});

export function TestTemplateManager() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [plantillas, setPlantillas] = useState<PlantillaResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [preguntas, setPreguntas] = useState<PreguntaForm[]>([emptyPregunta()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [previewData, setPreviewData] = useState<PlantillaDetalle | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    try { setPlantillas(await getMisPlantillas()); } catch { setPlantillas([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const resetForm = () => {
    setEditingId(null);
    setNombre('');
    setDescripcion('');
    setPreguntas([emptyPregunta()]);
    setError(null);
  };

  const abrirCrear = () => { resetForm(); setShowForm(true); };

  const abrirEditar = async (id: number) => {
    setPreviewData(null);
    const det = await getPlantillaDetalle(id);
    if (!det) return;
    setEditingId(id);
    setNombre(det.plaTstNombre);
    setDescripcion(det.plaTstDescripcion ?? '');
    setPreguntas(
      det.preguntas.map((p) => ({
        texto: p.plaPrgTexto,
        tipo: p.plaPrgTipo,
        opciones: p.opciones.map((o) => ({ texto: o.plaOpcTexto })),
      }))
    );
    setError(null);
    setShowForm(true);
  };

  const guardar = async () => {
    if (!nombre.trim()) { setError('El nombre es obligatorio.'); return; }
    if (preguntas.length === 0) { setError('Agrega al menos una pregunta.'); return; }
    for (let i = 0; i < preguntas.length; i++) {
      if (!preguntas[i].texto.trim()) { setError(`La pregunta ${i + 1} está vacía.`); return; }
      if (preguntas[i].opciones.length < 2) { setError(`La pregunta ${i + 1} necesita al menos 2 opciones.`); return; }
    }

    setSaving(true);
    setError(null);
    try {
      const payload: CrearPlantillaPayload = {
        plaTstNombre: nombre.trim(),
        plaTstDescripcion: descripcion.trim() || null,
        preguntas: preguntas.map((p, idx) => ({
          plaPrgTexto: p.texto.trim(),
          plaPrgTipo: p.tipo,
          plaPrgOrden: idx,
          opciones: p.opciones.map((o, oi) => ({ plaOpcTexto: o.texto.trim(), plaOpcOrden: oi })),
        })),
      };
      if (editingId) {
        await editarPlantilla(editingId, payload);
      } else {
        await crearPlantilla(payload);
      }
      setShowForm(false);
      resetForm();
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar');
    } finally { setSaving(false); }
  };

  const handleEliminar = async (id: number) => {
    setDeletingId(id);
    try { await eliminarPlantilla(id); await cargar(); } catch { /* silencioso */ } finally { setDeletingId(null); }
  };

  const togglePreview = async (id: number) => {
    if (previewData?.plaTstCodigo === id) { setPreviewData(null); return; }
    setPreviewLoading(true);
    const det = await getPlantillaDetalle(id);
    setPreviewData(det);
    setPreviewLoading(false);
  };

  const updatePregunta = (idx: number, updates: Partial<PreguntaForm>) => {
    setPreguntas((prev) => prev.map((p, i) => (i === idx ? { ...p, ...updates } : p)));
  };

  const cambiarTipoPregunta = (idx: number, nuevoTipo: string) => {
    const defaultOps = opcionesPorDefecto(nuevoTipo);
    updatePregunta(idx, { tipo: nuevoTipo, opciones: defaultOps.map((o) => ({ texto: o.plaOpcTexto })) });
  };

  const addOpcion = (pIdx: number) => {
    setPreguntas((prev) =>
      prev.map((p, i) => (i === pIdx ? { ...p, opciones: [...p.opciones, { texto: `Opción ${p.opciones.length + 1}` }] } : p))
    );
  };

  const removeOpcion = (pIdx: number, oIdx: number) => {
    setPreguntas((prev) =>
      prev.map((p, i) => (i === pIdx ? { ...p, opciones: p.opciones.filter((_, j) => j !== oIdx) } : p))
    );
  };

  const moverPregunta = (idx: number, dir: -1 | 1) => {
    setPreguntas((prev) => {
      const arr = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= arr.length) return prev;
      [arr[idx], arr[target]] = [arr[target], arr[idx]];
      return arr;
    });
  };

  const removePregunta = (idx: number) => setPreguntas((prev) => prev.filter((_, i) => i !== idx));

  const card = `rounded-xl border p-4 ${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200'}`;
  const inputCls = `w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500' : 'bg-white border-slate-300 text-slate-800 placeholder:text-slate-400'}`;

  const selectContentClass = `!z-[100] !w-[var(--radix-select-trigger-width)] !min-w-[var(--radix-select-trigger-width)] rounded-xl ${
    isDark
      ? '!bg-slate-700 border-slate-500 text-white settings-select-dark'
      : '!bg-white border-slate-200 text-slate-900 select-light-dropdown'
  }`;

  const selectContentStyle = isDark
    ? {
        backgroundColor: '#334155',
        width: 'var(--radix-select-trigger-width)',
        minWidth: 'var(--radix-select-trigger-width)',
        zIndex: 100,
      }
    : {
        backgroundColor: '#ffffff',
        width: 'var(--radix-select-trigger-width)',
        minWidth: 'var(--radix-select-trigger-width)',
        zIndex: 100,
      };

  const selectItemClass = isDark
    ? 'px-4 py-2 text-white focus:bg-slate-500 data-[highlighted]:bg-slate-500'
    : 'px-4 py-2 text-slate-900 focus:bg-slate-100 data-[highlighted]:bg-slate-100';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Plantillas de Test</h2>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Crea y administra las evaluaciones que puedes asignar a los aprendices.
          </p>
        </div>
        <button onClick={abrirCrear} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium hover:shadow-lg transition-all">
          <Plus className="w-4 h-4" /> Nueva plantilla
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className={`mb-6 ${card} !p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {editingId ? 'Editar plantilla' : 'Crear plantilla'}
            </h3>
            <button onClick={() => { setShowForm(false); resetForm(); }} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Nombre *</label>
                <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Evaluación inicial" className={inputCls} />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Descripción</label>
                <input type="text" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Opcional" className={inputCls} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Preguntas</h4>
                <button type="button" onClick={() => setPreguntas((p) => [...p, emptyPregunta()])} className="text-xs text-purple-600 dark:text-purple-400 hover:underline">
                  + Agregar pregunta
                </button>
              </div>

              <div className="space-y-4">
                {preguntas.map((preg, pIdx) => (
                  <div key={pIdx} className={`rounded-lg border p-4 ${isDark ? 'border-slate-600 bg-slate-700/40' : 'border-slate-200 bg-slate-50'}`}>
                    <div className="flex items-start gap-2 mb-3">
                      <span className={`mt-2 text-xs font-bold shrink-0 w-6 h-6 flex items-center justify-center rounded-full ${isDark ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>{pIdx + 1}</span>
                      <div className="flex-1 space-y-2">
                        <input type="text" value={preg.texto} onChange={(e) => updatePregunta(pIdx, { texto: e.target.value })} placeholder="Escribe la pregunta..." className={inputCls} />
                        <Select value={preg.tipo} onValueChange={(v) => cambiarTipoPregunta(pIdx, v)}>
                          <SelectTrigger
                            id={`pregunta-tipo-${pIdx}`}
                            aria-label="Tipo de pregunta"
                            className={`${inputCls} !h-auto min-h-[2.5rem] cursor-pointer shadow-none`}
                          >
                            <SelectValue placeholder="Tipo de pregunta" />
                          </SelectTrigger>
                          <SelectContent className={selectContentClass} style={selectContentStyle}>
                            {TIPOS_PREGUNTA.map((t) => (
                              <SelectItem key={t.value} value={t.value} hideIndicator className={selectItemClass}>
                                {t.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        <button type="button" onClick={() => moverPregunta(pIdx, -1)} disabled={pIdx === 0} className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-30"><ChevronUp className="w-4 h-4" /></button>
                        <button type="button" onClick={() => moverPregunta(pIdx, 1)} disabled={pIdx === preguntas.length - 1} className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-30"><ChevronDown className="w-4 h-4" /></button>
                        <button type="button" onClick={() => removePregunta(pIdx)} className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>

                    <div className="ml-8 space-y-1">
                      <p className={`text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Opciones de respuesta:</p>
                      {preg.opciones.map((op, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-2">
                          <span className={`w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center text-[10px] ${isDark ? 'border-slate-500 text-slate-400' : 'border-slate-300 text-slate-500'}`}>{String.fromCharCode(65 + oIdx)}</span>
                          <input type="text" value={op.texto} onChange={(e) => {
                            const ops = [...preg.opciones];
                            ops[oIdx] = { texto: e.target.value };
                            updatePregunta(pIdx, { opciones: ops });
                          }} className={`flex-1 ${inputCls} !py-1.5`} />
                          {preg.opciones.length > 2 && (
                            <button type="button" onClick={() => removeOpcion(pIdx, oIdx)} className="p-1 text-red-400 hover:text-red-600"><X className="w-3.5 h-3.5" /></button>
                          )}
                        </div>
                      ))}
                      {preg.tipo === 'opcion_multiple' && (
                        <button type="button" onClick={() => addOpcion(pIdx)} className="text-xs text-purple-500 hover:underline mt-1">+ Agregar opción</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex justify-end gap-3">
              <button onClick={() => { setShowForm(false); resetForm(); }} className={`px-4 py-2 rounded-lg text-sm ${isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}>Cancelar</button>
              <button onClick={guardar} disabled={saving} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId ? 'Guardar cambios' : 'Crear plantilla'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center h-40"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>
      ) : plantillas.length === 0 ? (
        <div className={`flex flex-col items-center justify-center h-40 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          <ClipboardList className="w-10 h-10 mb-2 opacity-40" />
          No hay plantillas de test creadas aún.
        </div>
      ) : (
        <div className="space-y-3">
          {plantillas.map((p) => (
            <div key={p.plaTstCodigo}>
              <div className={`${card} flex items-center justify-between`}>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{p.plaTstNombre}</p>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {p.totalPreguntas} pregunta{p.totalPreguntas !== 1 ? 's' : ''} &middot; {new Date(p.plaTstFechaCreacion).toLocaleDateString('es-CO')}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => togglePreview(p.plaTstCodigo)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700" title="Preview"><Eye className="w-4 h-4 text-slate-500" /></button>
                  <button onClick={() => abrirEditar(p.plaTstCodigo)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700" title="Editar"><Pencil className="w-4 h-4 text-slate-500" /></button>
                  <button onClick={() => handleEliminar(p.plaTstCodigo)} disabled={deletingId === p.plaTstCodigo} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20" title="Eliminar">
                    {deletingId === p.plaTstCodigo ? <Loader2 className="w-4 h-4 animate-spin text-red-400" /> : <Trash2 className="w-4 h-4 text-red-500" />}
                  </button>
                </div>
              </div>

              {previewLoading && previewData === null && <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-purple-400" /></div>}

              {previewData?.plaTstCodigo === p.plaTstCodigo && (
                <div className={`mt-2 rounded-lg border p-4 space-y-3 ${isDark ? 'border-slate-600 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
                  {previewData.preguntas.map((q, qi) => (
                    <div key={q.plaPrgCodigo}>
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{qi + 1}. {q.plaPrgTexto}</p>
                      <p className={`text-[11px] mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{TIPOS_PREGUNTA.find((t) => t.value === q.plaPrgTipo)?.label ?? q.plaPrgTipo}</p>
                      <div className="flex flex-wrap gap-2">
                        {q.opciones.map((o) => (
                          <span key={o.plaOpcCodigo} className={`inline-block px-3 py-1 rounded-full text-xs ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-white border border-slate-200 text-slate-700'}`}>{o.plaOpcTexto}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
