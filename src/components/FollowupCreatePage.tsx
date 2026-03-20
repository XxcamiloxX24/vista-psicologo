import { useEffect, useState, useRef, useCallback } from 'react';
import { ChevronRight, ArrowLeft, Loader2, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { crearSeguimiento, ESTADOS_SEGUIMIENTO_API } from '../lib/seguimiento';
import { getPsychologistId } from '../lib/auth';
import { getPsychologistIdFromToken } from '../lib/psychologist';
import { buscarAprendicesDinamico, normalizarAprendizBusqueda, type AprendizBusquedaRaw } from '../lib/aprendiz';
import { getAprendizFichaPorDocumento, type AprendizFichaRaw } from '../lib/fichas';

export type FollowupCreateConfig =
  | { mode: 'manual'; key: number }
  | {
      mode: 'fromFicha';
      aprendizFichaCodigo: number;
      name: string;
      email: string;
      program: string;
      ficha: string;
      key: number;
    };

interface FollowupCreatePageProps {
  config: FollowupCreateConfig;
  onBack: () => void;
  onSuccess: () => void;
}

function mapUiEstadoToApi(status: 'stable' | 'observation' | 'critical'): string {
  if (status === 'stable') return ESTADOS_SEGUIMIENTO_API.estable;
  if (status === 'critical') return ESTADOS_SEGUIMIENTO_API.critico;
  return ESTADOS_SEGUIMIENTO_API.observacion;
}

export function FollowupCreatePage({ config, onBack, onSuccess }: FollowupCreatePageProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [form, setForm] = useState({
    aprendizCodigo: '',
    studentName: '',
    email: '',
    ficha: '',
    program: '',
    aprendizBloqueado: false,
    remitidoDesdeArea: 'no' as 'no' | 'si',
    areaRemitido: '',
    trimestre: '',
    motivo: '',
    descripcion: '',
    recomendaciones: '',
    status: 'stable' as 'stable' | 'observation' | 'critical',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const estadoSelectRef = useRef<HTMLDivElement>(null);
  const [estadoSelectWidth, setEstadoSelectWidth] = useState<number>(200);

  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<AprendizBusquedaRaw[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [fichaOptions, setFichaOptions] = useState<AprendizFichaRaw[]>([]);
  const [loadingFichas, setLoadingFichas] = useState(false);
  const [studentSelected, setStudentSelected] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (config.mode === 'fromFicha') {
      setForm({
        aprendizCodigo: String(config.aprendizFichaCodigo),
        studentName: config.name,
        email: config.email,
        ficha: config.ficha,
        program: config.program,
        aprendizBloqueado: true,
        remitidoDesdeArea: 'no',
        areaRemitido: '',
        trimestre: '',
        motivo: '',
        descripcion: '',
        recomendaciones: '',
        status: 'stable',
      });
      setStudentSelected(true);
    } else {
      setForm({
        aprendizCodigo: '',
        studentName: '',
        email: '',
        ficha: '',
        program: '',
        aprendizBloqueado: false,
        remitidoDesdeArea: 'no',
        areaRemitido: '',
        trimestre: '',
        motivo: '',
        descripcion: '',
        recomendaciones: '',
        status: 'stable',
      });
      setStudentSelected(false);
      setSearchText('');
      setSearchResults([]);
      setFichaOptions([]);
    }
  }, [config.key]);

  useEffect(() => {
    const el = estadoSelectRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (typeof w === 'number') setEstadoSelectWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = useCallback((text: string) => {
    setSearchText(text);
    setError(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (text.trim().length < 3) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    setSearching(true);
    setShowDropdown(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await buscarAprendicesDinamico(text.trim());
        const validNames = results.filter((r) => {
          const n = normalizarAprendizBusqueda(r);
          return n.fullName.trim().length > 0 && n.nroDocumento.trim().length > 0;
        });
        const uniqueDocs = [...new Set(validNames.map((r) => normalizarAprendizBusqueda(r).nroDocumento))];
        const fichaChecks = await Promise.all(
          uniqueDocs.map(async (doc) => {
            try {
              const fichas = await getAprendizFichaPorDocumento(doc);
              return { doc, hasFicha: fichas.length > 0 };
            } catch {
              return { doc, hasFicha: false };
            }
          }),
        );
        const docsWithFicha = new Set(fichaChecks.filter((c) => c.hasFicha).map((c) => c.doc));
        const filtered = validNames.filter((r) => docsWithFicha.has(normalizarAprendizBusqueda(r).nroDocumento));
        setSearchResults(filtered);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  }, []);

  const handleSelectAprendiz = useCallback(async (raw: AprendizBusquedaRaw) => {
    setShowDropdown(false);
    const normalized = normalizarAprendizBusqueda(raw);
    setSearchText(normalized.fullName);
    setLoadingFichas(true);
    setFichaOptions([]);
    try {
      const fichas = await getAprendizFichaPorDocumento(normalized.nroDocumento);
      if (fichas.length === 0) {
        setError('Este aprendiz no tiene vínculo con ninguna ficha activa.');
        setLoadingFichas(false);
        return;
      }
      if (fichas.length === 1) {
        applyFichaSelection(fichas[0], normalized);
      } else {
        setFichaOptions(fichas);
      }
    } catch {
      setError('Error al buscar las fichas del aprendiz.');
    } finally {
      setLoadingFichas(false);
    }
  }, []);

  function normalizarAprendizFicha(af: AprendizFichaRaw) {
    const apr = af.aprendiz ?? af.Aprendiz;
    const fic = af.ficha ?? af.Ficha;
    const nombres = apr?.nombres ?? apr?.Nombres;
    const apellidos = apr?.apellidos ?? apr?.Apellidos;
    const contacto = apr?.contacto ?? apr?.Contacto;
    const prog = fic?.programaFormacion ?? fic?.ProgramaFormacion as Record<string, unknown> | null;
    const primerNombre = (nombres as Record<string, unknown>)?.primerNombre ?? (nombres as Record<string, unknown>)?.PrimerNombre ?? '';
    const segundoNombre = (nombres as Record<string, unknown>)?.segundoNombre ?? (nombres as Record<string, unknown>)?.SegundoNombre ?? '';
    const primerApellido = (apellidos as Record<string, unknown>)?.primerApellido ?? (apellidos as Record<string, unknown>)?.PrimerApellido ?? '';
    const segundoApellido = (apellidos as Record<string, unknown>)?.segundoApellido ?? (apellidos as Record<string, unknown>)?.SegundoApellido ?? '';
    const fullName = [primerNombre, segundoNombre, primerApellido, segundoApellido].filter(Boolean).join(' ');
    const email =
      String((contacto as Record<string, unknown>)?.correoInstitucional ?? (contacto as Record<string, unknown>)?.CorreoInstitucional ?? '') ||
      String((contacto as Record<string, unknown>)?.correoPersonal ?? (contacto as Record<string, unknown>)?.CorreoPersonal ?? '');
    const fichaCodigo = fic?.ficCodigo ?? fic?.FicCodigo ?? null;
    const progNombre = (prog as Record<string, unknown>)?.progNombre ?? (prog as Record<string, unknown>)?.ProgNombre ?? '';
    return { fullName, email, fichaCodigo: String(fichaCodigo ?? ''), progNombre: String(progNombre ?? '') };
  }

  function applyFichaSelection(af: AprendizFichaRaw, normalized?: { fullName: string; email: string }) {
    const codigo = af.codigo ?? af.Codigo ?? 0;
    const info = normalizarAprendizFicha(af);
    setForm((prev) => ({
      ...prev,
      aprendizCodigo: String(codigo),
      studentName: normalized?.fullName || info.fullName,
      email: normalized?.email || info.email,
      ficha: info.fichaCodigo,
      program: info.progNombre,
      aprendizBloqueado: true,
    }));
    setStudentSelected(true);
    setFichaOptions([]);
  }

  function handleClearStudent() {
    setStudentSelected(false);
    setSearchText('');
    setSearchResults([]);
    setFichaOptions([]);
    setForm((prev) => ({
      ...prev,
      aprendizCodigo: '',
      studentName: '',
      email: '',
      ficha: '',
      program: '',
      aprendizBloqueado: false,
    }));
  }

  const handleSubmit = async () => {
    setError(null);
    const segAprendizFk = parseInt(String(form.aprendizCodigo).trim(), 10);
    if (Number.isNaN(segAprendizFk) || segAprendizFk <= 0) {
      setError('Selecciona un aprendiz usando el buscador.');
      return;
    }
    const psiId = getPsychologistIdFromToken() ?? getPsychologistId();
    if (!psiId) {
      setError('No se pudo obtener el psicólogo de la sesión. Vuelve a iniciar sesión.');
      return;
    }
    const trim = parseInt(String(form.trimestre).trim(), 10);
    if (Number.isNaN(trim) || trim < 1) {
      setError('El trimestre actual debe ser un número válido (mínimo 1).');
      return;
    }
    if (!form.motivo.trim()) {
      setError('El motivo del seguimiento es obligatorio.');
      return;
    }
    const area =
      form.remitidoDesdeArea === 'si' && form.areaRemitido.trim() ? form.areaRemitido.trim() : null;

    setLoading(true);
    try {
      await crearSeguimiento({
        segAprendizFk,
        segPsicologoFk: psiId,
        segFechaSeguimiento: new Date().toISOString(),
        segFechaFin: null,
        segAreaRemitido: area,
        segTrimestreActual: trim,
        segMotivo: form.motivo.trim(),
        segDescripcion: form.descripcion.trim() || '',
        segRecomendaciones: form.recomendaciones.trim() || '',
        segEstadoSeguimiento: mapUiEstadoToApi(form.status),
        segFirmaProfesional: '',
        segFirmaAprendiz: '',
      });
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al crear el seguimiento.');
    } finally {
      setLoading(false);
    }
  };

  const cardClass = `rounded-2xl border p-6 sm:p-8 shadow-sm ${
    isDark ? 'bg-slate-800/90 border-slate-600/50' : 'bg-white/90 border-purple-100/50'
  }`;

  return (
    <div className="space-y-6">
      <nav
        className="flex flex-wrap items-center gap-2 text-sm"
        aria-label="Ruta de navegación"
      >
        <button
          type="button"
          onClick={onBack}
          className={`font-medium transition-colors hover:underline ${
            isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'
          }`}
        >
          Seguimientos
        </button>
        <ChevronRight className="h-4 w-4 shrink-0 opacity-50" aria-hidden />
        {config.mode === 'manual' && !studentSelected ? (
          <span className={isDark ? 'text-slate-200' : 'text-slate-800'}>Nuevo seguimiento</span>
        ) : config.mode === 'manual' && studentSelected ? (
          <>
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Nuevo seguimiento</span>
            <ChevronRight className="h-4 w-4 shrink-0 opacity-50" aria-hidden />
            <span
              className={`max-w-[min(100%,28rem)] truncate font-medium ${isDark ? 'text-slate-100' : 'text-slate-900'}`}
              title={form.studentName}
            >
              {form.studentName}
            </span>
          </>
        ) : config.mode === 'fromFicha' ? (
          <>
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Nuevo seguimiento</span>
            <ChevronRight className="h-4 w-4 shrink-0 opacity-50" aria-hidden />
            <span
              className={`max-w-[min(100%,28rem)] truncate font-medium ${
                isDark ? 'text-slate-100' : 'text-slate-900'
              }`}
              title={config.name}
            >
              {config.name}
            </span>
          </>
        ) : null}
      </nav>

      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={onBack}
          className={`mt-1 rounded-xl p-2 transition-colors ${
            isDark
              ? 'border border-slate-600 text-slate-200 hover:bg-slate-700'
              : 'border border-purple-100 text-slate-700 hover:bg-slate-50'
          }`}
          aria-label="Volver a seguimientos"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="mb-2 text-3xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent sm:text-4xl">
            Crear nuevo seguimiento
          </h1>
          <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
            Completa los datos para registrar el seguimiento en el sistema.
          </p>
        </div>
      </div>

      <div className={cardClass}>
        <div className="mx-auto max-w-2xl space-y-4">
          {studentSelected ? (
            <div className="text-center py-6 relative">
              {config.mode === 'manual' && (
                <button
                  type="button"
                  onClick={handleClearStudent}
                  className={`absolute left-0 top-4 rounded-lg p-1.5 transition-colors ${
                    isDark ? 'text-red-400 hover:text-red-300 hover:bg-slate-700' : 'text-red-500 hover:text-red-700 hover:bg-red-50'
                  }`}
                  title="Cambiar aprendiz"
                >
                  <X className="h-4 w-4" style={{ color: 'red' }}/>
                </button>
              )}
              <h2 className={`text-xl sm:text-2xl font-semibold mb-6 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                {form.studentName}
              </h2>
              <div className={`grid grid-cols-2 gap-x-8 gap-y-4 max-w-xl mx-auto text-left ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {form.email && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5">Correo</p>
                    <p className="text-sm break-all">{form.email}</p>
                  </div>
                )}
                {form.ficha && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5">Ficha</p>
                    <p className="text-sm">{form.ficha}</p>
                  </div>
                )}
                {form.program && (
                  <div className="col-span-2">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5">Programa</p>
                    <p className="text-sm">{form.program}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Buscar aprendiz <span style={{ color: 'red' }}>*</span></Label>
              <div ref={searchContainerRef} className="relative">
                <div className="relative">
                  <Input
                    value={searchText}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
                    placeholder="Escribe nombre, documento o correo (mín. 3 caracteres)"
                    className={isDark ? 'border-slate-600 bg-slate-800 text-white' : 'border-purple-200/50 bg-slate-50'}
                  />
                  {searching && (
                    <Loader2 className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  )}
                </div>

                {showDropdown && (
                  <div
                    className={`absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-xl border shadow-xl ${
                      isDark ? 'border-slate-600' : 'border-slate-200'
                    }`}
                    style={isDark ? { backgroundColor: '#1e293b' } : { backgroundColor: '#ffffff' }}
                  >
                    {searching && searchResults.length === 0 ? (
                      <div className={`px-4 py-3 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Buscando…
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className={`px-4 py-3 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        No se encontraron resultados
                      </div>
                    ) : (
                      searchResults.map((raw) => {
                        const n = normalizarAprendizBusqueda(raw);
                        return (
                          <button
                            key={n.codigo}
                            type="button"
                            onClick={() => void handleSelectAprendiz(raw)}
                            className={`w-full text-left px-4 py-3 transition-colors ${
                              isDark
                                ? 'hover:bg-slate-700 text-slate-200 border-b border-slate-700/50 last:border-b-0'
                                : 'hover:bg-slate-50 text-slate-800 border-b border-slate-100 last:border-b-0'
                            }`}
                          >
                            <p className="text-sm font-medium">{n.fullName}</p>
                            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              Doc: {n.nroDocumento}{n.email ? ` · ${n.email}` : ''}
                            </p>
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {loadingFichas && (
                <div className={`flex items-center gap-2 text-sm py-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Obteniendo fichas del aprendiz…
                </div>
              )}

              {fichaOptions.length > 1 && (
                <div className="space-y-2 pt-2">
                  <Label>Este aprendiz tiene varias fichas. Selecciona una:</Label>
                  <div className={`space-y-2 rounded-xl border p-3 ${isDark ? 'border-slate-600 bg-slate-900/50' : 'border-purple-100/50 bg-slate-50'}`}>
                    {fichaOptions.map((af) => {
                      const info = normalizarAprendizFicha(af);
                      const codigo = af.codigo ?? af.Codigo ?? 0;
                      return (
                        <button
                          key={codigo}
                          type="button"
                          onClick={() => applyFichaSelection(af)}
                          className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                            isDark
                              ? 'hover:bg-slate-700 text-slate-200 border border-slate-700'
                              : 'hover:bg-white text-slate-800 border border-slate-200'
                          }`}
                        >
                          <p className="text-sm font-medium">Ficha {info.fichaCodigo}</p>
                          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {info.progNombre || 'Sin programa'}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>¿Fue remitido desde alguna área?</Label>
            <div className="flex flex-row items-center gap-3">
              <Select
                value={form.remitidoDesdeArea}
                onValueChange={(v) =>
                  setForm({
                    ...form,
                    remitidoDesdeArea: v as 'no' | 'si',
                    areaRemitido: v === 'no' ? '' : form.areaRemitido,
                  })
                }
              >
                <SelectTrigger
                  className={`w-[90px] shrink-0 rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500/50 ${
                    isDark ? 'border-slate-600 bg-slate-700 text-white' : 'border-purple-200/50 bg-slate-50 text-slate-700'
                  }`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  className={`z-[100] rounded-xl shadow-lg ${
                    isDark ? 'border-slate-500 text-white settings-select-dark' : 'border-slate-200 text-slate-900 select-light-dropdown'
                  }`}
                  style={isDark ? { backgroundColor: '#334155', width: 90, minWidth: 90 } : { backgroundColor: '#fff', width: 90, minWidth: 90 }}
                  position="popper"
                  sideOffset={4}
                >
                  <SelectItem
                    value="no"
                    hideIndicator
                    className={isDark ? 'px-4 py-2.5 text-white focus:bg-slate-500 data-[highlighted]:bg-slate-500 transition-colors duration-150' : 'px-4 py-2.5 text-slate-900 focus:bg-slate-100 data-[highlighted]:bg-slate-100 transition-colors duration-150'}
                  >
                    No
                  </SelectItem>
                  <SelectItem
                    value="si"
                    hideIndicator
                    className={isDark ? 'px-4 py-2.5 text-white focus:bg-slate-500 data-[highlighted]:bg-slate-500 transition-colors duration-150' : 'px-4 py-2.5 text-slate-900 focus:bg-slate-100 data-[highlighted]:bg-slate-100 transition-colors duration-150'}
                  >
                    Sí
                  </SelectItem>
                </SelectContent>
              </Select>
              {form.remitidoDesdeArea === 'si' && (
                <Input
                  id="areaRemitido"
                  value={form.areaRemitido}
                  onChange={(e) => setForm({ ...form, areaRemitido: e.target.value })}
                  placeholder="Ej: Bienestar al aprendiz, Enfermería…"
                  className={`flex-1 min-w-0 ${isDark ? 'border-slate-600 bg-slate-800 text-white' : 'border-purple-200/50 bg-slate-50'}`}
                />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="trimestre">Trimestre actual <span style={{ color: 'red' }}>*</span></Label>
            <Input
              id="trimestre"
              type="number"
              min={1}
              value={form.trimestre}
              onChange={(e) => setForm({ ...form, trimestre: e.target.value })}
              placeholder="1, 2, 3..."
              className={isDark ? 'border-slate-600 bg-slate-800 text-white' : 'border-purple-200/50 bg-slate-50'}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo <span style={{ color: 'red' }}>*</span></Label>
            <Textarea
              id="motivo"
              value={form.motivo}
              onChange={(e) => setForm({ ...form, motivo: e.target.value })}
              placeholder="Motivo de apertura del seguimiento"
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción / observación</Label>
            <Textarea
              id="descripcion"
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              placeholder="Descripción u observación al aprendiz"
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recomendaciones">Recomendaciones</Label>
            <Textarea
              id="recomendaciones"
              value={form.recomendaciones}
              onChange={(e) => setForm({ ...form, recomendaciones: e.target.value })}
              placeholder="Recomendaciones para el aprendiz"
              rows={3}
              className="resize-none"
            />
          </div>

          <div ref={estadoSelectRef} className="space-y-2">
            <Label>Estado inicial del seguimiento <span style={{ color: 'red' }}>*</span></Label>
            <Select
              value={form.status}
              onValueChange={(v) => setForm({ ...form, status: v as 'stable' | 'observation' | 'critical' })}
            >
              <SelectTrigger
                className={`w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-purple-500/50 ${
                  isDark ? 'border-slate-600 bg-slate-700 text-white' : 'border-purple-200/50 bg-slate-50 text-slate-700'
                }`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                className={`z-[100] rounded-xl shadow-lg ${
                  isDark ? 'border-slate-500 text-white settings-select-dark' : 'border-slate-200 text-slate-900 select-light-dropdown'
                }`}
                style={isDark ? { backgroundColor: '#334155', width: estadoSelectWidth, minWidth: estadoSelectWidth } : { backgroundColor: '#fff', width: estadoSelectWidth, minWidth: estadoSelectWidth }}
                position="popper"
                sideOffset={4}
              >
                <SelectItem
                  value="stable"
                  hideIndicator
                  className={isDark ? 'px-4 py-2.5 text-white focus:bg-slate-500 data-[highlighted]:bg-slate-500 transition-colors duration-150' : 'px-4 py-2.5 text-slate-900 focus:bg-slate-100 data-[highlighted]:bg-slate-100 transition-colors duration-150'}
                >
                  Estable
                </SelectItem>
                <SelectItem
                  value="observation"
                  hideIndicator
                  className={isDark ? 'px-4 py-2.5 text-white focus:bg-slate-500 data-[highlighted]:bg-slate-500 transition-colors duration-150' : 'px-4 py-2.5 text-slate-900 focus:bg-slate-100 data-[highlighted]:bg-slate-100 transition-colors duration-150'}
                >
                  En Observación
                </SelectItem>
                <SelectItem
                  value="critical"
                  hideIndicator
                  className={isDark ? 'px-4 py-2.5 text-white focus:bg-slate-500 data-[highlighted]:bg-slate-500 transition-colors duration-150' : 'px-4 py-2.5 text-slate-900 focus:bg-slate-100 data-[highlighted]:bg-slate-100 transition-colors duration-150'}
                >
                  Crítico
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Se enviará a la API como: Estables, En Observacion o Criticos.
            </p>
          </div>

          {error && (
            <div
              className={`rounded-xl border px-4 py-3 text-sm font-medium ${
                isDark
                  ? 'border-red-500/60 bg-red-950 text-red-300'
                  : 'border-red-300 bg-red-50 text-red-800'
              }`}
            >
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row">
            <button
              type="button"
              disabled={loading}
              onClick={onBack}
              className="flex-1 rounded-2xl border border-purple-200/50 px-6 py-3 text-slate-700 transition-all hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => void handleSubmit()}
              className="flex-1 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 font-medium text-white transition-all hover:shadow-lg disabled:opacity-60"
            >
              {loading ? 'Guardando…' : 'Crear seguimiento'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
