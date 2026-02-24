import { Target, Eye, Award } from 'lucide-react';

export function About() {
  const sections = [
    {
      title: 'Misión',
      icon: Target,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      content: 'Brindar servicios de atención psicológica de alta calidad a la comunidad estudiantil del SENA, promoviendo el bienestar emocional y mental de los aprendices, contribuyendo así a su desarrollo integral y éxito académico.'
    },
    {
      title: 'Visión',
      icon: Eye,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      content: 'Ser reconocidos como un centro de excelencia en salud mental institucional, liderando iniciativas innovadoras en el campo de la psicología educativa y siendo referente en el acompañamiento psicológico de estudiantes en formación técnica y tecnológica.'
    },
    {
      title: 'Objetivos',
      icon: Award,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      content: 'Implementar programas de prevención y promoción de la salud mental. Ofrecer atención psicológica individual y grupal. Desarrollar estrategias de intervención temprana. Crear espacios de apoyo emocional y desarrollo personal.'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Sobre Nosotros
        </h1>
        <p className="text-slate-600">Conoce más sobre HealthyMind y nuestro compromiso con la salud mental</p>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
        <div className="max-w-3xl">
          <h2 className="text-3xl mb-4">HealthyMind</h2>
          <p className="text-lg text-white/90 leading-relaxed">
            Plataforma integral de gestión psicológica institucional del SENA, diseñada para facilitar el trabajo de los profesionales de la salud mental y mejorar la atención brindada a nuestros aprendices.
          </p>
        </div>
      </div>

      {/* Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {sections.map((section, index) => {
          const Icon = section.icon;
          return (
            <div
              key={index}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-purple-100/50 shadow-sm hover:shadow-md transition-all"
            >
              <div className={`w-14 h-14 rounded-xl ${section.bgColor} flex items-center justify-center mb-4`}>
                <Icon className={`w-7 h-7 bg-gradient-to-r ${section.color} bg-clip-text`} style={{ WebkitTextFillColor: 'transparent', WebkitBackgroundClip: 'text', backgroundClip: 'text' }} />
              </div>
              <h3 className="text-xl text-slate-800 mb-3">{section.title}</h3>
              <p className="text-slate-600 leading-relaxed">{section.content}</p>
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 border border-purple-100/50 shadow-sm">
        <h3 className="text-xl text-slate-800 mb-6 text-center">Nuestro Impacto</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-4xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              156
            </div>
            <p className="text-slate-600">Aprendices Atendidos</p>
          </div>
          <div className="text-center">
            <div className="text-4xl bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent mb-2">
              340
            </div>
            <p className="text-slate-600">Citas Realizadas</p>
          </div>
          <div className="text-center">
            <div className="text-4xl bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mb-2">
              92%
            </div>
            <p className="text-slate-600">Satisfacción</p>
          </div>
          <div className="text-center">
            <div className="text-4xl bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent mb-2">
              24
            </div>
            <p className="text-slate-600">Seguimientos Activos</p>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-gradient-to-r from-slate-50 to-purple-50/30 rounded-2xl p-8 border border-purple-100/50">
        <h3 className="text-xl text-slate-800 mb-6">Información de Contacto</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-slate-500 mb-1">Dirección</p>
            <p className="text-slate-800">SENA Regional - Centro de Servicios y Gestión Empresarial</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-1">Correo Electrónico</p>
            <p className="text-slate-800">psicologia@sena.edu.co</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-1">Teléfono</p>
            <p className="text-slate-800">+57 (1) 343 0111</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-1">Horario de Atención</p>
            <p className="text-slate-800">Lunes a Viernes: 8:00 AM - 6:00 PM</p>
          </div>
        </div>
      </div>
    </div>
  );
}
