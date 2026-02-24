import { useState } from 'react';
import { Search, AlertCircle, TrendingUp, TrendingDown, Minus, Plus, Filter } from 'lucide-react';
import { StudentProfile } from './StudentProfile.tsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';

interface Student {
  id: number;
  name: string;
  ficha: string;
  email: string;
  status: 'stable' | 'observation' | 'critical';
  program: string;
}

export function Followups() {
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'name' | 'email' | 'id' | 'program' | 'ficha'>('all');
  const [showNewFollowupModal, setShowNewFollowupModal] = useState(false);
  const [students, setStudents] = useState<Student[]>([
    {
      id: 1,
      name: 'Ana García Pérez',
      ficha: '2589634',
      email: 'ana.garcia@sena.edu.co',
      status: 'stable',
      program: 'Análisis y Desarrollo de Software'
    },
    {
      id: 2,
      name: 'Carlos Rodríguez Martínez',
      ficha: '2589635',
      email: 'carlos.rodriguez@sena.edu.co',
      status: 'observation',
      program: 'Diseño Gráfico'
    },
    {
      id: 3,
      name: 'María López Santos',
      ficha: '2589636',
      email: 'maria.lopez@sena.edu.co',
      status: 'critical',
      program: 'Administración de Empresas'
    },
    {
      id: 4,
      name: 'Juan Martínez Díaz',
      ficha: '2589637',
      email: 'juan.martinez@sena.edu.co',
      status: 'critical',
      program: 'Gestión Logística'
    },
    {
      id: 5,
      name: 'Laura Pérez González',
      ficha: '2589638',
      email: 'laura.perez@sena.edu.co',
      status: 'observation',
      program: 'Contabilidad'
    },
    {
      id: 6,
      name: 'Pedro González Ruiz',
      ficha: '2589639',
      email: 'pedro.gonzalez@sena.edu.co',
      status: 'stable',
      program: 'Marketing Digital'
    }
  ]);

  const [newFollowup, setNewFollowup] = useState({
    studentId: '',
    studentName: '',
    email: '',
    ficha: '',
    program: '',
    status: 'stable' as 'stable' | 'observation' | 'critical',
    initialNotes: ''
  });

  const availableStudents = [
    { id: '1001234573', name: 'Sofia Ramírez Torres', email: 'sofia.ramirez@sena.edu.co', ficha: '2589640', program: 'Enfermería' },
    { id: '1001234574', name: 'Diego Hernández Silva', email: 'diego.hernandez@sena.edu.co', ficha: '2589641', program: 'Mecatrónica' }
  ];

  const handleCreateFollowup = () => {
    if (!newFollowup.studentId || !newFollowup.status) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    const newId = Math.max(...students.map(s => s.id)) + 1;
    const newStudent: Student = {
      id: newId,
      name: newFollowup.studentName,
      email: newFollowup.email,
      ficha: newFollowup.ficha,
      program: newFollowup.program,
      status: newFollowup.status
    };

    setStudents([...students, newStudent]);
    setShowNewFollowupModal(false);
    setNewFollowup({
      studentId: '',
      studentName: '',
      email: '',
      ficha: '',
      program: '',
      status: 'stable',
      initialNotes: ''
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      stable: {
        border: 'border-l-green-500',
        bg: 'bg-green-50/50',
        badge: 'bg-green-100 text-green-700 border-green-200',
        icon: TrendingUp,
        label: 'Estable'
      },
      observation: {
        border: 'border-l-yellow-500',
        bg: 'bg-yellow-50/50',
        badge: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        icon: Minus,
        label: 'En Observación'
      },
      critical: {
        border: 'border-l-red-500',
        bg: 'bg-red-50/50',
        badge: 'bg-red-100 text-red-700 border-red-200',
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

  if (selectedStudent) {
    const student = students.find(s => s.id === selectedStudent);
    if (student) {
      return <StudentProfile student={student} onBack={() => setSelectedStudent(null)} />;
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Seguimientos
          </h1>
          <p className="text-slate-600">Listado de aprendices con seguimiento activo</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowNewFollowupModal(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Seguimiento
          </Button>
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm text-green-700">Estable</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-sm text-yellow-700">Observación</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg border border-red-200">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm text-red-700">Crítico</span>
          </div>
        </div>
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
              placeholder="Buscar por nombre, ficha, correo, programa o ID..."
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
              <SelectItem value="ficha">Ficha</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* New Followup Modal */}
      <Dialog open={showNewFollowupModal} onOpenChange={setShowNewFollowupModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Crear Nuevo Seguimiento
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="studentId">Seleccionar Aprendiz *</Label>
              <Select
                value={newFollowup.studentId}
                onValueChange={(value) => {
                  const student = availableStudents.find(s => s.id === value);
                  if (student) {
                    setNewFollowup({
                      ...newFollowup,
                      studentId: value,
                      studentName: student.name,
                      email: student.email,
                      ficha: student.ficha,
                      program: student.program
                    });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un aprendiz">
                    {newFollowup.studentName || 'Seleccione un aprendiz'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {availableStudents.map(student => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} - Ficha: {student.ficha}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {newFollowup.studentId && (
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-slate-500">Correo</p>
                    <p className="text-sm text-slate-800">{newFollowup.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Ficha</p>
                    <p className="text-sm text-slate-800">{newFollowup.ficha}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Programa</p>
                  <p className="text-sm text-slate-800">{newFollowup.program}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="status">Estado Inicial *</Label>
              <Select
                value={newFollowup.status}
                onValueChange={(value) => setNewFollowup({ ...newFollowup, status: value as 'stable' | 'observation' | 'critical' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado">
                    {newFollowup.status === 'stable' ? 'Estable' : 
                     newFollowup.status === 'observation' ? 'En Observación' : 'Crítico'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stable">Estable</SelectItem>
                  <SelectItem value="observation">En Observación</SelectItem>
                  <SelectItem value="critical">Crítico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="initialNotes">Notas Iniciales</Label>
              <Textarea
                id="initialNotes"
                value={newFollowup.initialNotes}
                onChange={(e) => setNewFollowup({ ...newFollowup, initialNotes: e.target.value })}
                placeholder="Escriba observaciones iniciales sobre el aprendiz..."
                rows={4}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowNewFollowupModal(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateFollowup}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg transition-all"
              >
                Crear Seguimiento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => {
          const statusConfig = getStatusColor(student.status);
          const StatusIcon = statusConfig.icon;

          return (
            <button
              key={student.id}
              onClick={() => setSelectedStudent(student.id)}
              className={`bg-white/90 backdrop-blur-sm rounded-2xl p-6 border-l-4 ${statusConfig.border} ${statusConfig.bg} hover:shadow-lg transition-all text-left group`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-slate-800 mb-1 group-hover:text-purple-700 transition-colors">
                    {student.name}
                  </h3>
                  <p className="text-sm text-slate-500">Ficha: {student.ficha}</p>
                </div>
                <StatusIcon className={`w-5 h-5 ${
                  student.status === 'stable' ? 'text-green-600' :
                  student.status === 'observation' ? 'text-yellow-600' :
                  'text-red-600'
                }`} />
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm text-slate-600">{student.email}</p>
                <p className="text-sm text-slate-600">{student.program}</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-purple-100/50">
                <span className={`text-xs px-3 py-1 rounded-full border ${statusConfig.badge}`}>
                  {statusConfig.label}
                </span>
                <span className="text-xs text-purple-600 group-hover:underline">
                  Ver perfil →
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">No se encontraron aprendices</p>
        </div>
      )}
    </div>
  );
}