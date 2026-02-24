import { useState } from 'react';
import { Search, UserPlus, Mail, BookOpen, Building2, Hash, User, Eye, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

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
}

interface StudentsProps {
  onViewFollowup?: (studentId: string) => void;
}

export function Students({ onViewFollowup }: StudentsProps) {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Aprendices
          </h1>
          <p className="text-slate-600">Gestión de aprendices del SENA</p>
        </div>
        <Button
          onClick={() => setShowEnrollModal(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg transition-all"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Inscribir Aprendiz
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-purple-100/50 shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar aprendices..."
              className="pl-12"
            />
          </div>
          <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los campos</SelectItem>
              <SelectItem value="name">Nombre</SelectItem>
              <SelectItem value="email">Correo</SelectItem>
              <SelectItem value="id">ID</SelectItem>
              <SelectItem value="program">Programa</SelectItem>
              <SelectItem value="faculty">Facultad</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Student Profile Modal */}
      {selectedStudent && (
        <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Perfil del Aprendiz
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl text-slate-800 mb-1">{selectedStudent.name}</h3>
                    <p className="text-slate-600">{selectedStudent.program}</p>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl">
                    {selectedStudent.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Hash className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-xs text-slate-500">ID</p>
                      <p className="text-slate-800">{selectedStudent.id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Mail className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-xs text-slate-500">Correo</p>
                      <p className="text-slate-800 text-sm">{selectedStudent.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-xs text-slate-500">Ficha</p>
                      <p className="text-slate-800">{selectedStudent.ficha}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Building2 className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-xs text-slate-500">Facultad</p>
                      <p className="text-slate-800 text-sm">{selectedStudent.faculty}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <User className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-xs text-slate-500">Teléfono</p>
                      <p className="text-slate-800">{selectedStudent.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-xs text-slate-500">Fecha de Inscripción</p>
                      <p className="text-slate-800">{new Date(selectedStudent.enrollmentDate).toLocaleDateString('es-ES')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedStudent.hasFollowup && (
                <Button
                  onClick={() => {
                    setSelectedStudent(null);
                    onViewFollowup?.(selectedStudent.id);
                  }}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg transition-all"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Seguimiento
                </Button>
              )}

              {!selectedStudent.hasFollowup && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-yellow-700">Este aprendiz aún no tiene seguimiento asignado</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Enroll Student Modal */}
      <Dialog open={showEnrollModal} onOpenChange={setShowEnrollModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Inscribir Nuevo Aprendiz
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
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
                <Select value={newStudent.faculty} onValueChange={(value) => setNewStudent({ ...newStudent, faculty: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione facultad" />
                  </SelectTrigger>
                  <SelectContent>
                    {faculties.map((faculty) => (
                      <SelectItem key={faculty} value={faculty}>{faculty}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="program">Programa de Formación *</Label>
                <Select value={newStudent.program} onValueChange={(value) => setNewStudent({ ...newStudent, program: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione programa" />
                  </SelectTrigger>
                  <SelectContent>
                    {programs.map((program) => (
                      <SelectItem key={program} value={program}>{program}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <Button
                variant="outline"
                onClick={() => setShowEnrollModal(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleEnrollStudent}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg transition-all"
              >
                Inscribir Aprendiz
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <button
            key={student.id}
            onClick={() => setSelectedStudent(student)}
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-purple-100/50 hover:shadow-lg transition-all text-left group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-slate-800 mb-1 group-hover:text-purple-700 transition-colors">
                  {student.name}
                </h3>
                <p className="text-sm text-slate-500">ID: {student.id}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white">
                {student.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Mail className="w-4 h-4 text-purple-500" />
                <span className="truncate">{student.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <BookOpen className="w-4 h-4 text-purple-500" />
                <span className="truncate">{student.program}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Building2 className="w-4 h-4 text-purple-500" />
                <span className="truncate">{student.faculty}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-purple-100/50">
              <span className="text-xs text-slate-500">Ficha: {student.ficha}</span>
              <span className="text-xs text-purple-600 group-hover:underline">
                Ver perfil →
              </span>
            </div>

            {student.hasFollowup && (
              <div className="mt-3 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg text-center">
                <p className="text-xs text-green-700">Con seguimiento activo</p>
              </div>
            )}
          </button>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12 bg-white/90 backdrop-blur-sm rounded-2xl border border-purple-100/50">
          <User className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">No se encontraron aprendices</p>
        </div>
      )}
    </div>
  );
}
