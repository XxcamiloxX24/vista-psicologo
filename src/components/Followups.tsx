import { useState, useEffect } from 'react';
import { Search, AlertCircle, TrendingUp, TrendingDown, Minus, Plus, Filter, LayoutGrid, Table2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { StudentProfile } from './StudentProfile.tsx';
import { FollowupsTable } from './FollowupsTable';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { listarSeguimientos, getSeguimientoPorId, type SeguimientoListarResult, type SeguimientoDetalle } from '../lib/seguimiento';

interface Student {
  id: number;
  name: string;
  ficha: string;
  email: string;
  status: 'stable' | 'observation' | 'critical';
  program: string;
  /** Texto del estado desde la API (misma fila que la tabla) */
  estadoTexto?: string;
  phone?: string;
  area?: string;
  centro?: string;
  jornada?: string;
  nivelFormacion?: string;
  modalidad?: string;
  formaModalidad?: string;
  /** Estado de formación de la ficha: en ejecucion, cancelada, terminada, etc. */
  estadoFormacion?: string;
  /** Código del aprendiz en la API (estadísticas de diario, etc.). */
  aprendizId?: number;
}

function mapEstadoToStatus(estado: string): 'stable' | 'observation' | 'critical' {
  const e = (estado || '').toLowerCase();
  if (e.includes('completada') || e.includes('finaliz')) return 'stable';
  if (e.includes('estable')) return 'stable';
  if (e.includes('observ') || e.includes('observacion')) return 'observation';
  if (e.includes('critic')) return 'critical';
  return 'observation';
}

function getVal<T>(o: Record<string, unknown> | null | undefined, ...keys: string[]): T | undefined {
  if (!o) return undefined;
  for (const k of keys) {
    const v = o[k];
    if (v != null && v !== '') return v as T;
  }
  return undefined;
}

function getStr(o: Record<string, unknown> | null | undefined, ...keys: string[]): string {
  const v = getVal<string | number>(o, ...keys);
  if (v == null) return '';
  return String(v).trim();
}

function toRecord(x: unknown): Record<string, unknown> | undefined {
  if (x != null && typeof x === 'object' && !Array.isArray(x)) return x as Record<string, unknown>;
  return undefined;
}

function seguimientoToStudent(r: SeguimientoListarResult): Student {
  const root = toRecord(r.aprendiz) ?? toRecord((r as unknown as Record<string, unknown>).aprendiz) ?? toRecord((r as unknown as Record<string, unknown>).Aprendiz);
  const apr = toRecord(root?.aprendiz) ?? toRecord(root?.Aprendiz);
  const n = toRecord(apr?.nombres) ?? toRecord(apr?.Nombres);
  const a = toRecord(apr?.apellidos) ?? toRecord(apr?.Apellidos);
  const contacto = toRecord(apr?.contacto) ?? toRecord(apr?.Contacto);

  const parts: string[] = [];
  const p1 = getVal<string>(n, 'primerNombre', 'PrimerNombre');
  const p2 = getVal<string>(n, 'segundoNombre', 'SegundoNombre');
  const p3 = getVal<string>(a, 'primerApellido', 'PrimerApellido');
  const p4 = getVal<string>(a, 'segundoApellido', 'SegundoApellido');
  if (p1) parts.push(p1);
  if (p2) parts.push(p2);
  if (p3) parts.push(p3);
  if (p4) parts.push(p4);
  const name = parts.join(' ') || '—';

  const ficha = toRecord(root?.ficha) ?? toRecord(root?.Ficha);
  const prog = toRecord(ficha?.programaFormacion) ?? toRecord(ficha?.ProgramaFormacion);
  const areaObj = toRecord(prog?.area) ?? toRecord(prog?.Area);
  const centroObj = toRecord(prog?.centro) ?? toRecord(prog?.Centro);
  const nivObj = toRecord(prog?.nivelFormacion) ?? toRecord(prog?.NivelFormacion);

  const area = getStr(areaObj, 'areaNombre', 'AreaNombre');
  const centro = getStr(centroObj, 'cenNombre', 'CenNombre');
  const nivelFormacion = getStr(nivObj, 'nivForNombre', 'NivForNombre');
  const modalidad = getStr(prog, 'progModalidad', 'ProgModalidad');
  const formaModalidad = getStr(prog, 'progFormaModalidad', 'ProgFormaModalidad');
  const jornada = getStr(ficha, 'ficJornada', 'FicJornada');
  const estadoFormacion = getStr(ficha, 'ficEstadoFormacion', 'FicEstadoFormacion');
  const phone = getStr(contacto, 'telefono', 'Telefono');

  const email = getVal<string>(contacto, 'correoInstitucional', 'CorreoInstitucional') ?? getVal<string>(contacto, 'correoPersonal', 'CorreoPersonal') ?? '';
  const ficCodigo = getVal<number>(ficha, 'ficCodigo', 'FicCodigo');
  const progNombre = getVal<string>(prog, 'progNombre', 'ProgNombre') ?? '';
  const segCodigo = r.segCodigo ?? (r as unknown as Record<string, unknown>).SegCodigo;
  const estado = r.estadoSeguimiento ?? (r as unknown as Record<string, unknown>).EstadoSeguimiento;

  const aprendizCodigo = getVal<number>(apr, 'codigo', 'Codigo');

  return {
    id: Number(segCodigo ?? 0),
    name,
    ficha: String(ficCodigo ?? ''),
    email,
    status: mapEstadoToStatus(String(estado ?? '')),
    program: progNombre,
    estadoTexto: String(estado ?? '').trim() || undefined,
    phone: phone || undefined,
    area: area || undefined,
    centro: centro || undefined,
    jornada: jornada || undefined,
    nivelFormacion: nivelFormacion || undefined,
    modalidad: modalidad || undefined,
    formaModalidad: formaModalidad || undefined,
    estadoFormacion: estadoFormacion || undefined,
    aprendizId: aprendizCodigo ?? undefined,
  };
}

interface FollowupsProps {
  targetStudentId?: string | null;
  /** Al incrementar (tras crear seguimiento), se vuelven a cargar cards/tabla */
  listRefreshKey?: number;
  onOpenCreateManual?: () => void;
}

export function Followups({
  targetStudentId,
  listRefreshKey: parentListRefreshKey = 0,
  onOpenCreateManual,
}: FollowupsProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);

  useEffect(() => {
    if (targetStudentId) {
      const id = parseInt(targetStudentId, 10);
      if (!Number.isNaN(id)) queueMicrotask(() => setSelectedStudent(id));
    }
  }, [targetStudentId]);

  useEffect(() => {
    if (selectedStudent == null) {
      setProfileStudent(null);
      setProfileSeguimiento(null);
      return;
    }
    let cancelled = false;
    setProfileLoading(true);
    setProfileStudent(null);
    setProfileSeguimiento(null);
    getSeguimientoPorId(selectedStudent)
      .then((r) => {
        if (cancelled || !r) return;
        setProfileStudent(seguimientoToStudent(r));
        setProfileSeguimiento(r);
      })
      .catch(() => {
        if (!cancelled) {
          setProfileStudent(null);
          setProfileSeguimiento(null);
        }
      })
      .finally(() => {
        if (!cancelled) setProfileLoading(false);
      });
    return () => { cancelled = true; };
  }, [selectedStudent]);

  const [profileStudent, setProfileStudent] = useState<Student | null>(null);
  const [profileSeguimiento, setProfileSeguimiento] = useState<SeguimientoDetalle | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'name' | 'email' | 'id' | 'program' | 'ficha'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const [tableData, setTableData] = useState<SeguimientoListarResult[]>([]);
  const [tablePage, setTablePage] = useState(1);
  const [tablePageSize, setTablePageSize] = useState(10);
  const [tableTotalPages, setTableTotalPages] = useState(0);
  const [tableTotalRegistros, setTableTotalRegistros] = useState(0);
  const [tableLoading, setTableLoading] = useState(false);

  const [cardsData, setCardsData] = useState<SeguimientoListarResult[]>([]);
  const [cardsPage, setCardsPage] = useState(1);
  const [cardsPageSize] = useState(12);
  const [cardsTotalPages, setCardsTotalPages] = useState(0);
  const [cardsTotalRegistros, setCardsTotalRegistros] = useState(0);
  const [cardsLoading, setCardsLoading] = useState(true);
  /** Incrementar tras eliminar un seguimiento para volver a cargar tabla/cards. */
  const [listBumpAfterDelete, setListBumpAfterDelete] = useState(0);
  useEffect(() => {
    if (viewMode !== 'table') return;
    let cancelled = false;
    const startLoading = () => { if (!cancelled) setTableLoading(true); };
    const tid = setTimeout(startLoading, 0);
    listarSeguimientos(tablePage, tablePageSize)
      .then((res) => {
        if (cancelled) return;
        setTableData(res.resultados ?? []);
        setTableTotalPages(res.totalPaginas ?? 0);
        setTableTotalRegistros(res.totalRegistros ?? 0);
      })
      .catch(() => {
        if (!cancelled) setTableData([]);
      })
      .finally(() => {
        if (!cancelled) setTableLoading(false);
      });
    return () => { cancelled = true; clearTimeout(tid); };
  }, [viewMode, tablePage, tablePageSize, parentListRefreshKey, listBumpAfterDelete]);

  useEffect(() => {
    if (viewMode !== 'cards') return;
    let cancelled = false;
    const tid = setTimeout(() => { if (!cancelled) setCardsLoading(true); }, 0);
    listarSeguimientos(cardsPage, cardsPageSize)
      .then((res) => {
        if (cancelled) return;
        setCardsData(res.resultados ?? []);
        setCardsTotalPages(res.totalPaginas ?? 0);
        setCardsTotalRegistros(res.totalRegistros ?? 0);
      })
      .catch(() => {
        if (!cancelled) {
          setCardsData([]);
          setCardsTotalPages(0);
          setCardsTotalRegistros(0);
        }
      })
      .finally(() => {
        if (!cancelled) setCardsLoading(false);
      });
    return () => { cancelled = true; clearTimeout(tid); };
  }, [viewMode, cardsPage, cardsPageSize, parentListRefreshKey, listBumpAfterDelete]);

  const students = cardsData.map(seguimientoToStudent);

  const getStatusColor = (status: string) => {
    const colors = {
      stable: {
        light: { border: 'border-l-green-500', bg: 'bg-green-50/50', badge: 'border border-green-200 bg-green-100 text-green-700', iconColor: 'text-green-600' },
        dark: { border: 'border-l-green-500', borderColor: '#22c55e', bg: 'bg-transparent', badge: 'text-white', badgeStyle: { backgroundColor: '#22c55e' } as React.CSSProperties, iconColor: 'text-green-500', iconStyle: { color: '#22c55e' } as React.CSSProperties },
        icon: TrendingUp,
        label: 'Estable'
      },
      observation: {
        light: { border: 'border-l-yellow-500', bg: 'bg-yellow-50/50', badge: 'border border-yellow-200 bg-yellow-100 text-yellow-700', iconColor: 'text-yellow-600' },
        dark: { border: 'border-l-yellow-500', borderColor: '#facc15', bg: 'bg-transparent', badge: 'text-slate-900', badgeStyle: { backgroundColor: '#facc15' } as React.CSSProperties, iconColor: 'text-yellow-500', iconStyle: { color: '#facc15' } as React.CSSProperties },
        icon: Minus,
        label: 'En Observación'
      },
      critical: {
        light: { border: 'border-l-red-500', bg: 'bg-red-50/50', badge: 'border border-red-200 bg-red-100 text-red-700', iconColor: 'text-red-600' },
        dark: { border: 'border-l-red-500', borderColor: '#ef4444', bg: 'bg-transparent', badge: 'text-white', badgeStyle: { backgroundColor: '#dc2626' } as React.CSSProperties, iconColor: 'text-red-500', iconStyle: { color: '#ef4444' } as React.CSSProperties },
        icon: TrendingDown,
        label: 'Crítico'
      }
    };
    return colors[status as keyof typeof colors];
  };

  const filteredStudents = students.filter(student => {
    const search = searchTerm.toLowerCase();
    
    if (filterType === 'all') {
      return (
        student.name.toLowerCase().includes(search) ||
        student.ficha.includes(search) ||
        student.email.toLowerCase().includes(search) ||
        student.program.toLowerCase().includes(search) ||
        student.id.toString().includes(search)
      );
    } else if (filterType === 'name') {
      return student.name.toLowerCase().includes(search);
    } else if (filterType === 'email') {
      return student.email.toLowerCase().includes(search);
    } else if (filterType === 'id') {
      return student.id.toString().includes(search);
    } else if (filterType === 'program') {
      return student.program.toLowerCase().includes(search);
    } else if (filterType === 'ficha') {
      return student.ficha.includes(search);
    }
    return true;
  });

  if (selectedStudent != null) {
    if (profileLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-24 gap-2 text-slate-500 dark:text-slate-400">
          <p>Cargando perfil…</p>
        </div>
      );
    }
    if (profileStudent) {
      return (
        <StudentProfile
          student={profileStudent}
          seguimiento={profileSeguimiento}
          onBack={() => { setSelectedStudent(null); setProfileStudent(null); setProfileSeguimiento(null); }}
          onSeguimientoUpdated={() => {
            if (selectedStudent != null) {
              getSeguimientoPorId(selectedStudent).then((r) => {
                if (r) {
                  setProfileStudent(seguimientoToStudent(r));
                  setProfileSeguimiento(r);
                }
              });
            }
          }}
          onSeguimientoDeleted={() => {
            setSelectedStudent(null);
            setProfileStudent(null);
            setProfileSeguimiento(null);
            setListBumpAfterDelete((b) => b + 1);
          }}
        />
      );
    }
    return (
      <div className="space-y-4 p-6 text-center">
        <p className="text-slate-600 dark:text-slate-400">
          No se encontró ese seguimiento.
        </p>
        <button
          type="button"
          onClick={() => setSelectedStudent(null)}
          className="text-purple-600 dark:text-purple-400 underline"
        >
          Volver al listado
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Seguimientos
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Listado de aprendices con seguimiento activo</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div
            className={`flex rounded-xl overflow-hidden border ${
              isDark ? 'border-slate-600 bg-slate-800/50' : 'border-slate-200 bg-slate-100/50'
            }`}
          >
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'cards'
                  ? 'bg-purple-900 text-dark'
                  : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Cards
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-purple-600 text-dark'
                  : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <Table2 className="w-4 h-4" />
              Tabla
            </button>
          </div>
          {onOpenCreateManual && (
            <button
              type="button"
              onClick={onOpenCreateManual}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4 shrink-0" />
              Nuevo Seguimiento
            </button>
          )}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${isDark ? 'bg-green-900/30 border-green-600/50' : 'bg-green-50 border-green-200'}`}>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className={`text-sm ${isDark ? 'text-green-300' : 'text-green-700'}`}>Estable</span>
          </div>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${isDark ? 'bg-yellow-900/30 border-yellow-600/50' : 'bg-yellow-50 border-yellow-200'}`}>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className={`text-sm ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>Observación</span>
          </div>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${isDark ? 'bg-red-900/30 border-red-600/50' : 'bg-red-50 border-red-200'}`}>
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className={`text-sm ${isDark ? 'text-red-300' : 'text-red-700'}`}>Crítico</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-purple-100/50 dark:border-slate-600/50 shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3 relative min-w-0">
            <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, ficha, correo..."
              className={`pl-12 min-w-0 w-full h-10 rounded-xl ${
                isDark
                  ? 'border-slate-600 bg-slate-800 text-white placeholder:text-slate-400'
                  : 'border-purple-200/50 bg-slate-50 text-slate-700'
              }`}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500 z-10" />
            <Select value={filterType} onValueChange={(v) => setFilterType(v as typeof filterType)}>
              <SelectTrigger
                className={`w-full pl-11 pr-10 py-3 rounded-xl border-2 focus:ring-2 focus:ring-purple-500/50 font-medium ${
                  isDark ? 'border-slate-600 bg-slate-800 text-white' : 'border-purple-200/60 bg-gradient-to-br from-slate-50 to-purple-50/30 text-slate-700'
                }`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                className={`!w-[var(--radix-select-trigger-width)] !min-w-[var(--radix-select-trigger-width)] rounded-xl z-[2147483648] ${
                  isDark ? '!bg-slate-700 border-slate-500 text-white settings-select-dark' : '!bg-white border-slate-200 text-slate-900 select-light-dropdown'
                }`}
                style={isDark ? { backgroundColor: '#334155', width: 'var(--radix-select-trigger-width)', minWidth: 'var(--radix-select-trigger-width)' } : { backgroundColor: '#fff', width: 'var(--radix-select-trigger-width)', minWidth: 'var(--radix-select-trigger-width)' }}
              >
                <SelectItem value="all" hideIndicator className={isDark ? 'px-4 py-2 text-white focus:bg-slate-500 data-[highlighted]:bg-slate-500' : 'px-4 py-2 text-slate-900 focus:bg-slate-100 data-[highlighted]:bg-slate-100'}>Todos los campos</SelectItem>
                <SelectItem value="name" hideIndicator className={isDark ? 'px-4 py-2 text-white focus:bg-slate-500 data-[highlighted]:bg-slate-500' : 'px-4 py-2 text-slate-900 focus:bg-slate-100 data-[highlighted]:bg-slate-100'}>Nombre</SelectItem>
                <SelectItem value="email" hideIndicator className={isDark ? 'px-4 py-2 text-white focus:bg-slate-500 data-[highlighted]:bg-slate-500' : 'px-4 py-2 text-slate-900 focus:bg-slate-100 data-[highlighted]:bg-slate-100'}>Correo</SelectItem>
                <SelectItem value="id" hideIndicator className={isDark ? 'px-4 py-2 text-white focus:bg-slate-500 data-[highlighted]:bg-slate-500' : 'px-4 py-2 text-slate-900 focus:bg-slate-100 data-[highlighted]:bg-slate-100'}>ID</SelectItem>
                <SelectItem value="program" hideIndicator className={isDark ? 'px-4 py-2 text-white focus:bg-slate-500 data-[highlighted]:bg-slate-500' : 'px-4 py-2 text-slate-900 focus:bg-slate-100 data-[highlighted]:bg-slate-100'}>Programa</SelectItem>
                <SelectItem value="ficha" hideIndicator className={isDark ? 'px-4 py-2 text-white focus:bg-slate-500 data-[highlighted]:bg-slate-500' : 'px-4 py-2 text-slate-900 focus:bg-slate-100 data-[highlighted]:bg-slate-100'}>Ficha</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Cards: mismos datos que la API de la tabla (mis-seguimientos), paginado */}
      {viewMode === 'cards' && (
        <>
          {cardsLoading ? (
            <div className={`rounded-2xl border px-6 py-16 text-center text-slate-500 ${isDark ? 'border-slate-600 bg-slate-800/50' : 'border-purple-100/50 bg-white/90'}`}>
              Cargando seguimientos…
            </div>
          ) : (
            <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => {
          const statusConfig = getStatusColor(student.status);
          const StatusIcon = statusConfig.icon;
          const cfg = isDark ? statusConfig.dark : statusConfig.light;
          const cardStyle = isDark && 'borderColor' in cfg
            ? { borderLeftWidth: 4, borderLeftStyle: 'solid' as const, borderLeftColor: (cfg as { borderColor?: string }).borderColor }
            : undefined;

          return (
            <button
              key={student.id}
              onClick={() => setSelectedStudent(student.id)}
              className={`rounded-2xl p-6 border-l-4 ${cfg.border} ${cfg.bg} hover:shadow-lg transition-all text-left group border ${
                isDark
                  ? 'border-slate-600/50 hover:border-slate-500/50'
                  : 'border-purple-100/50 backdrop-blur-sm'
              }`}
              style={cardStyle}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className={`mb-1 group-hover:text-purple-700 transition-colors ${isDark ? 'text-white group-hover:text-purple-400' : 'text-slate-800 dark:text-slate-200'}`}>
                    {student.name}
                  </h3>
                  <p className={`text-sm ${!isDark ? 'text-slate-500 dark:text-slate-400' : ''}`} style={isDark ? { color: '#94a3b8' } : undefined}>Ficha: {student.ficha}</p>
                </div>
                <StatusIcon
                  className={`w-5 h-5 shrink-0 ${cfg.iconColor}`}
                  style={isDark && 'iconStyle' in cfg ? (cfg as { iconStyle?: React.CSSProperties }).iconStyle : undefined}
                />
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm" style={isDark ? { color: '#94a3b8' } : undefined}>{student.email}</p>
                <p className="text-sm" style={isDark ? { color: '#94a3b8' } : undefined}>{student.program}</p>
              </div>

              <div className={`flex items-center justify-between pt-4 border-t ${isDark ? 'border-slate-600/50' : 'border-purple-100/50'}`}>
                <span
                  className={`text-xs px-3 py-1 rounded-full ${cfg.badge}`}
                  style={'badgeStyle' in cfg ? (cfg as { badgeStyle?: React.CSSProperties }).badgeStyle : undefined}
                >
                  {student.estadoTexto || statusConfig.label}
                </span>
                <span className={`text-xs group-hover:underline ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                  Ver perfil →
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {!cardsLoading && filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">
            {searchTerm.trim()
              ? 'Ningún resultado coincide con la búsqueda en esta página'
              : cardsTotalRegistros === 0
                ? 'No tienes seguimientos activos'
                : 'No hay registros en esta página'}
          </p>
        </div>
      )}

      <div className={`flex flex-wrap items-center justify-between gap-4 pt-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
        <span className="text-sm">
          {cardsTotalRegistros} registro{cardsTotalRegistros !== 1 ? 's' : ''} · Página {cardsPage} de {cardsTotalPages || 1}
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setCardsPage((p) => Math.max(1, p - 1))}
            disabled={cardsPage <= 1 || cardsLoading}
            className={`p-2 rounded-lg disabled:opacity-40 ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-200'}`}
            aria-label="Página anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setCardsPage((p) => p + 1)}
            disabled={cardsPage >= cardsTotalPages || cardsTotalPages < 1 || cardsLoading}
            className={`p-2 rounded-lg disabled:opacity-40 ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-200'}`}
            aria-label="Página siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
            </>
          )}
        </>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="rounded-2xl p-4">
          <FollowupsTable
            data={tableData}
            paginaActual={tablePage}
            totalPaginas={tableTotalPages}
            totalRegistros={tableTotalRegistros}
            tamanoPagina={tablePageSize}
            onPageChange={setTablePage}
            onPageSizeChange={(s) => {
              setTablePageSize(s);
              setTablePage(1);
            }}
            isLoading={tableLoading}
            onRowClick={(r) => setSelectedStudent(r.segCodigo)}
          />
        </div>
      )}
    </div>
  );
}