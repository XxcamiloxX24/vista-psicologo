import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, UserPlus, Mail, BookOpen, Building2, Hash, User, Eye, X, Filter, ChevronLeft } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { getAprendicesPorFicha, getMisFichas, type AprendizFichaRaw, type MisFichaRaw } from '../lib/fichas';
import { listarSeguimientos } from '../lib/seguimiento';

interface Student {
  id: string;
  name: string;
  email: string;
  program: string;
  faculty: string;
  ficha: string;
  enrollmentDate: string;
  phone: string;
  hasFollowup: boolean;
  seguimientoSegCodigo?: number;
}

interface StudentsProps {
  onViewFollowup?: (studentId: string) => void;
}

export function Students({ onViewFollowup }: StudentsProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  type StudentsView = 'fichas' | 'aprendices';
  const [viewMode] = useState<StudentsView>('fichas'); // Vista fija: solo se muestra "Fichas"
  const [misFichas, setMisFichas] = useState<MisFichaRaw[]>([]);
  const [fichasLoading, setFichasLoading] = useState(false);
  const [fichasError, setFichasError] = useState<string | null>(null);
  const [selectedFichaCodigo, setSelectedFichaCodigo] = useState<number | null>(null);
  const [fichaAprendices, setFichaAprendices] = useState<Student[]>([]);
  const [fichaAprendicesLoading, setFichaAprendicesLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'name' | 'email' | 'id' | 'program' | 'faculty'>('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [students, setStudents] = useState<Student[]>([
    {
      id: '1001234567',
      name: 'Ana García Pérez',
      email: 'ana.garcia@sena.edu.co',
      program: 'Análisis y Desarrollo de Software',
      faculty: 'Tecnologías de la Información',
      ficha: '2589634',
      enrollmentDate: '2024-01-15',
      phone: '3001234567',
      hasFollowup: true
    },
    {
      id: '1001234568',
      name: 'Carlos Rodríguez Martínez',
      email: 'carlos.rodriguez@sena.edu.co',
      program: 'Diseño Gráfico',
      faculty: 'Artes y Diseño',
      ficha: '2589635',
      enrollmentDate: '2024-01-15',
      phone: '3001234568',
      hasFollowup: true
    },
    {
      id: '1001234569',
      name: 'María López Santos',
      email: 'maria.lopez@sena.edu.co',
      program: 'Administración de Empresas',
      faculty: 'Gestión Administrativa',
      ficha: '2589636',
      enrollmentDate: '2024-01-20',
      phone: '3001234569',
      hasFollowup: true
    },
    {
      id: '1001234570',
      name: 'Juan Martínez Díaz',
      email: 'juan.martinez@sena.edu.co',
      program: 'Gestión Logística',
      faculty: 'Logística y Transporte',
      ficha: '2589637',
      enrollmentDate: '2024-02-01',
      phone: '3001234570',
      hasFollowup: true
    },
    {
      id: '1001234571',
      name: 'Laura Pérez González',
      email: 'laura.perez@sena.edu.co',
      program: 'Contabilidad',
      faculty: 'Gestión Administrativa',
      ficha: '2589638',
      enrollmentDate: '2024-02-05',
      phone: '3001234571',
      hasFollowup: true
    },
    {
      id: '1001234572',
      name: 'Pedro González Ruiz',
      email: 'pedro.gonzalez@sena.edu.co',
      program: 'Marketing Digital',
      faculty: 'Gestión Comercial',
      ficha: '2589639',
      enrollmentDate: '2024-02-10',
      phone: '3001234572',
      hasFollowup: true
    },
    {
      id: '1001234573',
      name: 'Sofia Ramírez Torres',
      email: 'sofia.ramirez@sena.edu.co',
      program: 'Enfermería',
      faculty: 'Salud',
      ficha: '2589640',
      enrollmentDate: '2024-02-15',
      phone: '3001234573',
      hasFollowup: false
    },
    {
      id: '1001234574',
      name: 'Diego Hernández Silva',
      email: 'diego.hernandez@sena.edu.co',
      program: 'Mecatrónica',
      faculty: 'Ingeniería',
      ficha: '2589641',
      enrollmentDate: '2024-02-20',
      phone: '3001234574',
      hasFollowup: false
    }
  ]);

  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    id: '',
    program: '',
    faculty: '',
    ficha: '',
    phone: ''
  });

  const programs = [
    'Análisis y Desarrollo de Software',
    'Diseño Gráfico',
    'Administración de Empresas',
    'Gestión Logística',
    'Contabilidad',
    'Marketing Digital',
    'Enfermería',
    'Mecatrónica',
    'Gastronomía',
    'Construcción'
  ];

  const faculties = [
    'Tecnologías de la Información',
    'Artes y Diseño',
    'Gestión Administrativa',
    'Logística y Transporte',
    'Gestión Comercial',
    'Salud',
    'Ingeniería',
    'Gastronomía',
    'Construcción y Obras Civiles'
  ];

  const filteredStudents = students.filter(student => {
    const search = searchTerm.toLowerCase();
    
    if (filterType === 'all') {
      return (
        student.name.toLowerCase().includes(search) ||
        student.email.toLowerCase().includes(search) ||
        student.id.includes(search) ||
        student.program.toLowerCase().includes(search) ||
        student.faculty.toLowerCase().includes(search) ||
        student.ficha.includes(search)
      );
    } else if (filterType === 'name') {
      return student.name.toLowerCase().includes(search);
    } else if (filterType === 'email') {
      return student.email.toLowerCase().includes(search);
    } else if (filterType === 'id') {
      return student.id.includes(search);
    } else if (filterType === 'program') {
      return student.program.toLowerCase().includes(search);
    } else if (filterType === 'faculty') {
      return student.faculty.toLowerCase().includes(search);
    }
    return true;
  });

  const handleEnrollStudent = () => {
    if (!newStudent.name || !newStudent.email || !newStudent.id || !newStudent.program || !newStudent.faculty || !newStudent.ficha) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    const student: Student = {
      ...newStudent,
      enrollmentDate: new Date().toISOString().split('T')[0],
      hasFollowup: false
    };

    setStudents([...students, student]);
    setShowEnrollModal(false);
    setNewStudent({
      name: '',
      email: '',
      id: '',
      program: '',
      faculty: '',
      ficha: '',
      phone: ''
    });
  };

  const mapAprendizFichaRawToStudent = (r: AprendizFichaRaw): Student => {
    // Nota: evitamos mezclar camelCase/PascalCase en una sola variable para no romper el tipado.
    const primerNombre =
      r.aprendiz?.nombres?.primerNombre ??
      r.Aprendiz?.Nombres?.PrimerNombre ??
      '';
    const segundoNombre =
      r.aprendiz?.nombres?.segundoNombre ??
      r.Aprendiz?.Nombres?.SegundoNombre ??
      '';
    const primerApellido =
      r.aprendiz?.apellidos?.primerApellido ??
      r.Aprendiz?.Apellidos?.PrimerApellido ??
      '';
    const segundoApellido =
      r.aprendiz?.apellidos?.segundoApellido ??
      r.Aprendiz?.Apellidos?.SegundoApellido ??
      '';

    const nombre = [primerNombre, segundoNombre, primerApellido, segundoApellido]
      .map((x: unknown) => String(x ?? '').trim())
      .filter(Boolean)
      .join(' ');

    const email =
      r.aprendiz?.contacto?.correoInstitucional ??
      r.aprendiz?.contacto?.correoPersonal ??
      r.Aprendiz?.Contacto?.CorreoInstitucional ??
      r.Aprendiz?.Contacto?.CorreoPersonal ??
      '';

    const program =
      r.ficha?.programaFormacion?.progNombre ??
      r.Ficha?.programaFormacion?.ProgNombre ??
      r.Ficha?.ProgramaFormacion?.ProgNombre ??
      '';

    const faculty =
      r.ficha?.programaFormacion?.area?.areaNombre ??
      r.Ficha?.programaFormacion?.Area?.AreaNombre ??
      r.Ficha?.ProgramaFormacion?.Area?.AreaNombre ??
      '';

    const fichaCodigo =
      r.ficha?.ficCodigo ??
      r.Ficha?.FicCodigo ??
      '';

    // Para match con mis-seguimientos, usamos SIEMPRE `aprendiz.codigo`.
    const idValue =
      r.aprendiz?.codigo ??
      r.Aprendiz?.Codigo ??
      r.aprendiz?.nroDocumento ??
      r.Aprendiz?.NroDocumento ??
      '';
    const id = String(idValue ?? '');

    const fechaCreacion =
      r.aprendiz?.fechaCreacion ??
      r.Aprendiz?.FechaCreacion ??
      new Date().toISOString().split('T')[0];

    const phone =
      r.aprendiz?.contacto?.telefono ??
      r.Aprendiz?.Contacto?.Telefono ??
      '';

    return {
      id: id || '',
      name: nombre || '—',
      email,
      program: program || '—',
      faculty: faculty || '—',
      ficha: fichaCodigo != null ? String(fichaCodigo) : '',
      enrollmentDate: String(fechaCreacion),
      phone,
      hasFollowup: false,
      seguimientoSegCodigo: undefined,
    };
  };

  useEffect(() => {
    if (viewMode !== 'fichas') return;
    if (selectedFichaCodigo != null) return;

    let cancelled = false;
    setFichasLoading(true);
    setFichasError(null);
    void getMisFichas()
      .then((res) => {
        if (cancelled) return;
        setMisFichas(res);
      })
      .catch((err) => {
        if (cancelled) return;
        setMisFichas([]);
        setFichasError(err instanceof Error ? err.message : 'Error al cargar fichas');
      })
      .finally(() => {
        if (cancelled) return;
        setFichasLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [viewMode, selectedFichaCodigo]);

  useEffect(() => {
    if (viewMode !== 'fichas') return;
    if (selectedFichaCodigo == null) return;

    let cancelled = false;
    setFichaAprendicesLoading(true);
    void getAprendicesPorFicha(selectedFichaCodigo)
      .then((raw) => {
        if (cancelled) return;
        setFichaAprendices(raw.map(mapAprendizFichaRawToStudent));
      })
      .catch(() => {
        if (cancelled) return;
        setFichaAprendices([]);
      })
      .finally(() => {
        if (cancelled) return;
        setFichaAprendicesLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, selectedFichaCodigo]);

  // Marca qué aprendices de la ficha tienen seguimiento activo
  useEffect(() => {
    if (viewMode !== 'fichas') return;
    if (selectedFichaCodigo == null) return;
    if (fichaAprendicesLoading) return;
    if (fichaAprendices.length === 0) return;

    let cancelled = false;

    const run = async () => {
      const targetIds = new Set(
        fichaAprendices
          .map((s) => String(s.id))
          .filter((id) => id.trim().length > 0),
      );
      if (targetIds.size === 0) return;

      const foundIds = new Set<string>();
      const seguimientoPorCodigoAprendiz = new Map<string, number>();

      const pageSize = 100;
      let page = 1;
      let totalPages = 1;

      while (page <= totalPages && foundIds.size < targetIds.size) {
        const res = await listarSeguimientos(page, pageSize).catch(() => null);
        if (!res) break;

        totalPages = res.totalPaginas || 1;
        for (const seg of res.resultados) {
          // El AprendizFicha/buscar puede devolver `nroDocumento: null`, pero siempre trae `codigo`.
          const codigo = seg.aprendiz?.aprendiz?.codigo;
          if (codigo == null) continue;
          const id = String(codigo);
          if (targetIds.has(id)) {
            foundIds.add(id);
            seguimientoPorCodigoAprendiz.set(id, seg.segCodigo);
          }
        }

        page += 1;
      }

      if (cancelled) return;
      setFichaAprendices((prev) =>
        prev.map((s) => ({
          ...s,
          hasFollowup: foundIds.has(String(s.id)),
          seguimientoSegCodigo: foundIds.has(String(s.id))
            ? seguimientoPorCodigoAprendiz.get(String(s.id))
            : undefined,
        })),
      );
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [viewMode, selectedFichaCodigo, fichaAprendicesLoading]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            {viewMode === 'fichas' ? 'Fichas' : 'Aprendices'}
          </h1>
          <p className={isDark ? 'text-slate-400' : 'text-slate-600 dark:text-slate-400'}>
            {viewMode === 'fichas'
              ? 'Fichas asociadas a tu área. Da click para ver sus aprendices.'
              : 'Gestión de aprendices del SENA'}
          </p>
        </div>
        {viewMode === 'aprendices' && (
          <button
            type="button"
            onClick={() => setShowEnrollModal(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
          >
            <UserPlus className="w-4 h-4 shrink-0" />
            Inscribir Aprendiz
          </button>
        )}
      </div>

      {/* Fichas view */}
      {viewMode === 'fichas' && (
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-purple-100/50 dark:border-slate-600/50 shadow-sm p-6">
          {selectedFichaCodigo == null ? (
            <>
              {fichasLoading ? (
                <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                  Cargando fichas…
                </div>
              ) : fichasError ? (
                <div className="text-center py-10">
                  <p className="text-red-600 dark:text-red-400">{fichasError}</p>
                </div>
              ) : misFichas.length === 0 ? (
                <div className="text-center py-10">
                  <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                    No hay fichas asignadas a tu área.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {misFichas.map((f) => {
                    const ficCodigo = f.ficCodigo ?? f.FicCodigo ?? null;
                    const ficJornada = f.ficJornada ?? f.FicJornada ?? null;

                    const programName =
                      f.programaFormacion?.progNombre ??
                      f.ProgramaFormacion?.ProgNombre ??
                      '';

                    const areaName =
                      f.programaFormacion?.area?.areaNombre ??
                      f.ProgramaFormacion?.Area?.AreaNombre ??
                      '';

                    const centerName =
                      f.programaFormacion?.centro?.cenNombre ??
                      f.programaFormacion?.centro?.regional?.regNombre ??
                      f.ProgramaFormacion?.Centro?.CenNombre ??
                      f.ProgramaFormacion?.Centro?.Regional?.RegNombre ??
                      '';
                    return (
                      <button
                        key={ficCodigo}
                        type="button"
                        onClick={() => setSelectedFichaCodigo(ficCodigo != null ? Number(ficCodigo) : null)}
                        className={`rounded-2xl p-6 border backdrop-blur-sm hover:shadow-lg transition-all text-left group ${
                          isDark ? 'bg-slate-800/95 border-slate-600/80 hover:border-slate-500' : 'bg-white/90 border-purple-100/50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1 min-w-0 pr-2">
                            <h3 className={`mb-1 font-semibold transition-colors ${isDark ? 'text-slate-100 group-hover:text-purple-300' : 'text-slate-800 group-hover:text-purple-700'}`}>
                              Ficha: {ficCodigo ?? '—'}
                            </h3>
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              Jornada: {ficJornada ?? '—'}
                            </p>
                          </div>
                          <div className="w-12 h-12 shrink-0 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                            {ficCodigo != null ? String(ficCodigo).slice(-2) : '—'}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                            Programa: {programName || '—'}
                          </p>
                          <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                            Área: {areaName || '—'}
                          </p>
                          {centerName && (
                            <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                              Centro/Regional: {centerName}
                            </p>
                          )}
                        </div>

                        <div className={`flex items-center justify-between pt-4 border-t ${isDark ? 'border-slate-600/70' : 'border-purple-100/50'}`}>
                          <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Ver aprendices</span>
                          <span className={`text-xs font-medium group-hover:underline ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                            →
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setSelectedFichaCodigo(null)}
                  className={`p-2 rounded-lg border transition-all ${
                    isDark ? 'bg-slate-800/40 border-slate-600/70 hover:border-slate-500 text-slate-200' : 'bg-white/70 border-purple-100/70 hover:border-purple-200 text-slate-700'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <h2 className={`text-xl font-semibold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                  Aprendices de la ficha {selectedFichaCodigo}
                </h2>
              </div>

              {fichaAprendicesLoading ? (
                <div className="text-center py-10 text-slate-500 dark:text-slate-400">Cargando aprendices…</div>
              ) : fichaAprendices.length === 0 ? (
                <div className="text-center py-10">
                  <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                    No hay aprendices activos para esta ficha.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {fichaAprendices.map((student) => (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => setSelectedStudent(student)}
                      className={`rounded-2xl p-6 border backdrop-blur-sm hover:shadow-lg transition-all text-left group ${
                        isDark
                          ? student.hasFollowup
                            ? 'bg-slate-800/95 border-amber-500/60 hover:border-amber-400'
                            : 'bg-slate-800/95 border-slate-600/80 hover:border-slate-500'
                          : student.hasFollowup
                            ? 'bg-white/90 border-amber-200/80 hover:border-amber-300'
                            : 'bg-white/90 border-purple-100/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0 pr-2">
                          <h3
                            className={`mb-1 font-semibold transition-colors ${
                              isDark ? 'text-slate-100 group-hover:text-purple-300' : 'text-slate-800 group-hover:text-purple-700'
                            }`}
                          >
                            {student.name}
                          </h3>
                          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>ID: {student.id}</p>
                        </div>
                        <div className="w-12 h-12 shrink-0 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                          {student.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className={`flex items-center gap-2 text-sm min-w-0 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          <Mail className={`w-4 h-4 shrink-0 ${isDark ? 'text-purple-400' : 'text-purple-500'}`} />
                          <span className="truncate">{student.email}</span>
                        </div>
                        <div className={`flex items-center gap-2 text-sm min-w-0 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          <BookOpen className={`w-4 h-4 shrink-0 ${isDark ? 'text-purple-400' : 'text-purple-500'}`} />
                          <span className="truncate">{student.program}</span>
                        </div>
                        <div className={`flex items-center gap-2 text-sm min-w-0 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          <Building2 className={`w-4 h-4 shrink-0 ${isDark ? 'text-purple-400' : 'text-purple-500'}`} />
                          <span className="truncate">{student.faculty}</span>
                        </div>
                      </div>

                      <div className={`flex items-center justify-between pt-4 border-t ${isDark ? 'border-slate-600/70' : 'border-purple-100/50'}`}>
                        <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Ficha: {student.ficha}</span>
                        <span className={`text-xs font-medium group-hover:underline ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                          Ver perfil →
                        </span>
                      </div>

                      {student.hasFollowup && (
                        <div
                          className="mt-3 px-3 py-1.5 rounded-lg text-center"
                          style={{
                            border: '1px solid #f59e0b',
                            backgroundColor: isDark ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.1)',
                          }}
                        >
                          <p
                            className="text-xs font-medium"
                            style={{ color: isDark ? '#fbbf24' : '#b45309' }}
                          >
                            Con seguimiento activo
                          </p>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Search and Filters */}
      {viewMode === 'aprendices' && (
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-purple-100/50 dark:border-slate-600/50 shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar aprendices..."
              className={`pl-12 h-10 rounded-xl ${
                isDark
                  ? 'border-slate-600 bg-slate-800/90 text-slate-100 placeholder:text-slate-500'
                  : 'border-purple-200/50 bg-slate-50 text-slate-800'
              }`}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as typeof filterType)}
              className="w-full pl-11 pr-10 py-3 rounded-xl border-2 border-purple-200/60 dark:border-slate-600 bg-gradient-to-br from-slate-50 to-purple-50/30 dark:from-slate-700 dark:to-slate-800 text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 appearance-none cursor-pointer"
            >
              <option value="all">Todos los campos</option>
              <option value="name">Nombre</option>
              <option value="email">Correo</option>
              <option value="id">ID</option>
              <option value="program">Programa</option>
              <option value="faculty">Facultad</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-purple-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Student Profile Modal */}
      {selectedStudent &&
        createPortal(
          <div
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{
              zIndex: 2147483647,
              backgroundColor: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(6px)',
            }}
            onClick={() => setSelectedStudent(null)}
          >
            <div
              className="relative max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
              style={{
                width: '100%',
                maxWidth: '460px',
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                border: isDark ? '1px solid rgba(100,116,139,0.4)' : '1px solid rgba(216,180,254,0.3)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 rounded-t-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Perfil del Aprendiz</h2>
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="rounded-lg p-2 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div
                  className="rounded-xl p-4"
                  style={{
                    background: isDark
                      ? 'linear-gradient(to right, #334155, rgba(88,28,135,0.3))'
                      : 'linear-gradient(to right, #eff6ff, #f5f3ff)',
                  }}
                >
                  <h3 style={{ color: isDark ? '#e2e8f0' : '#1e293b' }} className="text-lg font-semibold mb-1">
                    {selectedStudent.name}
                  </h3>
                  <p style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-sm">
                    {selectedStudent.program}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: <Hash className="w-4 h-4 text-purple-500" />, label: 'ID', value: selectedStudent.id },
                    { icon: <Building2 className="w-4 h-4 text-purple-500" />, label: 'Facultad', value: selectedStudent.faculty },
                    { icon: <Mail className="w-4 h-4 text-purple-500" />, label: 'Correo', value: selectedStudent.email },
                    { icon: <User className="w-4 h-4 text-purple-500" />, label: 'Teléfono', value: selectedStudent.phone },
                    { icon: <BookOpen className="w-4 h-4 text-purple-500" />, label: 'Ficha', value: selectedStudent.ficha },
                    {
                      icon: <BookOpen className="w-4 h-4 text-purple-500" />,
                      label: 'Fecha de Inscripción',
                      value: new Date(selectedStudent.enrollmentDate).toLocaleDateString('es-ES'),
                    },
                  ].map(({ icon, label, value }) => (
                    <div
                      key={label}
                      className="flex items-center gap-2 p-3 rounded-lg"
                      style={{ backgroundColor: isDark ? 'rgba(51,65,85,0.7)' : '#f8fafc' }}
                    >
                      {icon}
                      <div className="min-w-0">
                        <p className="text-xs" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>{label}</p>
                        <p className="text-sm font-medium truncate" style={{ color: isDark ? '#e2e8f0' : '#1e293b' }}>{value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedStudent.hasFollowup && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStudent(null);
                      onViewFollowup?.(String(selectedStudent.seguimientoSegCodigo ?? selectedStudent.id));
                    }}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:shadow-lg transition-all"
                  >
                    <Eye className="w-4 h-4 shrink-0" />
                    Ver Seguimiento
                  </button>
                )}

                {!selectedStudent.hasFollowup && (
                  <div
                    className="rounded-lg p-4 text-center border"
                    style={{
                      backgroundColor: isDark ? 'rgba(161,140,0,0.1)' : '#fefce8',
                      borderColor: isDark ? 'rgba(161,140,0,0.3)' : '#fde68a',
                    }}
                  >
                    <p className="text-sm" style={{ color: isDark ? '#fcd34d' : '#92400e' }}>
                      Este aprendiz aún no tiene seguimiento asignado
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Enroll Student Modal */}
      {viewMode === 'aprendices' && showEnrollModal && createPortal(
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{
            zIndex: 2147483647,
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-800 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 rounded-t-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">Inscribir Nuevo Aprendiz</h2>
              <button
                type="button"
                onClick={() => setShowEnrollModal(false)}
                className="rounded-lg p-2 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo *</Label>
                  <Input
                    id="name"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                    placeholder="Nombre completo del aprendiz"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="id">Documento de Identidad *</Label>
                  <Input
                    id="id"
                    value={newStudent.id}
                    onChange={(e) => setNewStudent({ ...newStudent, id: e.target.value })}
                    placeholder="Número de documento"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                    placeholder="correo@sena.edu.co"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={newStudent.phone}
                    onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                    placeholder="3001234567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="faculty">Facultad *</Label>
                  <select
                    id="faculty"
                    value={newStudent.faculty}
                    onChange={(e) => setNewStudent({ ...newStudent, faculty: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-purple-200/50 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 bg-slate-50 dark:bg-slate-700 dark:text-slate-200"
                  >
                    <option value="">Seleccione facultad</option>
                    {faculties.map((faculty) => (
                      <option key={faculty} value={faculty}>{faculty}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="program">Programa de Formación *</Label>
                  <select
                    id="program"
                    value={newStudent.program}
                    onChange={(e) => setNewStudent({ ...newStudent, program: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-purple-200/50 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 bg-slate-50 dark:bg-slate-700 dark:text-slate-200"
                  >
                    <option value="">Seleccione programa</option>
                    {programs.map((program) => (
                      <option key={program} value={program}>{program}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ficha">Número de Ficha *</Label>
                <Input
                  id="ficha"
                  value={newStudent.ficha}
                  onChange={(e) => setNewStudent({ ...newStudent, ficha: e.target.value })}
                  placeholder="Ej: 2589634"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEnrollModal(false)}
                  className="flex-1 px-6 py-3 rounded-2xl border border-purple-200/50 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleEnrollStudent}
                  className="flex-1 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:shadow-lg transition-all"
                >
                  Inscribir Aprendiz
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Students Grid */}
      {viewMode === 'aprendices' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student) => (
              <button
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                type="button"
                className={`rounded-2xl p-6 border backdrop-blur-sm hover:shadow-lg transition-all text-left group ${
                  isDark
                    ? 'bg-slate-800/95 border-slate-600/80 hover:border-slate-500'
                    : 'bg-white/90 border-purple-100/50'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0 pr-2">
                    <h3
                      className={`mb-1 font-semibold transition-colors ${
                        isDark
                          ? 'text-slate-100 group-hover:text-purple-300'
                          : 'text-slate-800 group-hover:text-purple-700'
                      }`}
                    >
                      {student.name}
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>ID: {student.id}</p>
                  </div>
                  <div className="w-12 h-12 shrink-0 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                    {student.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className={`flex items-center gap-2 text-sm min-w-0 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    <Mail className={`w-4 h-4 shrink-0 ${isDark ? 'text-purple-400' : 'text-purple-500'}`} />
                    <span className="truncate">{student.email}</span>
                  </div>
                  <div className={`flex items-center gap-2 text-sm min-w-0 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    <BookOpen className={`w-4 h-4 shrink-0 ${isDark ? 'text-purple-400' : 'text-purple-500'}`} />
                    <span className="truncate">{student.program}</span>
                  </div>
                  <div className={`flex items-center gap-2 text-sm min-w-0 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    <Building2 className={`w-4 h-4 shrink-0 ${isDark ? 'text-purple-400' : 'text-purple-500'}`} />
                    <span className="truncate">{student.faculty}</span>
                  </div>
                </div>

                <div
                  className={`flex items-center justify-between pt-4 border-t ${
                    isDark ? 'border-slate-600/70' : 'border-purple-100/50'
                  }`}
                >
                  <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Ficha: {student.ficha}</span>
                  <span className={`text-xs font-medium group-hover:underline ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                    Ver perfil →
                  </span>
                </div>

                {student.hasFollowup && (
                  <div
                    className={`mt-3 px-3 py-1.5 rounded-lg text-center border ${
                      isDark
                        ? 'bg-emerald-950/50 border-emerald-700/40'
                        : 'bg-green-50 border-green-200'
                    }`}
                  >
                    <p className={`text-xs font-medium ${isDark ? 'text-emerald-300' : 'text-green-700'}`}>
                      Con seguimiento activo
                    </p>
                  </div>
                )}
              </button>
            ))}
          </div>

          {filteredStudents.length === 0 && (
            <div
              className={`text-center py-12 backdrop-blur-sm rounded-2xl border ${
                isDark ? 'bg-slate-800/95 border-slate-600/80' : 'bg-white/90 border-purple-100/50'
              }`}
            >
              <User className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>No se encontraron aprendices</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
