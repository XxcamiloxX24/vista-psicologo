import { Target, Eye, Award } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function About() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

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
        <h1 className={`text-4xl mb-2 ${isDark ? 'text-white' : 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'}`}>
          Sobre Nosotros
        </h1>
        <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>Conoce más sobre HealthyMind y nuestro compromiso con la salud mental</p>
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
              className={`backdrop-blur-sm rounded-2xl p-6 border shadow-sm hover:shadow-md transition-all ${
                isDark ? 'bg-slate-800/90 border-slate-600/50' : 'bg-white/90 border-purple-100/50'
              }`}
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
                isDark ? 'bg-transparent' : section.bgColor
              }`}>
                <Icon className={`w-7 h-7 ${
                  isDark ? 'text-white' : `bg-gradient-to-r ${section.color} bg-clip-text`
                }`} style={!isDark ? { WebkitTextFillColor: 'transparent', WebkitBackgroundClip: 'text', backgroundClip: 'text' } : undefined} />
              </div>
              <h3 className={`text-xl mb-3 ${isDark ? 'text-white' : 'text-slate-800'}`}>{section.title}</h3>
              <p className={`leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{section.content}</p>
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className={`backdrop-blur-sm rounded-2xl p-8 border shadow-sm ${
        isDark ? 'bg-slate-800/90 border-slate-600/50' : 'bg-white/90 border-purple-100/50'
      }`}>
        <h3 className={`text-xl mb-6 text-center ${isDark ? 'text-white' : 'text-slate-800'}`}>Nuestro Impacto</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className={`text-4xl mb-2 bg-clip-text text-transparent bg-gradient-to-r ${
              isDark ? 'from-blue-400 to-purple-400' : 'from-blue-600 to-purple-600'
            }`}>156</div>
            <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>Aprendices Atendidos</p>
          </div>
          <div className="text-center">
            <div className={`text-4xl mb-2 bg-clip-text text-transparent bg-gradient-to-r ${
              isDark ? 'from-purple-400 to-purple-500' : 'from-purple-600 to-purple-700'
            }`}>340</div>
            <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>Citas Realizadas</p>
          </div>
          <div className="text-center">
            <div
              className={`text-4xl mb-2 ${
                isDark ? '' : 'bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-700'
              }`}
              style={isDark ? { color: '#4ade80' } : undefined}
            >92%</div>
            <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>Satisfacción</p>
          </div>
          <div className="text-center">
            <div className={`text-4xl mb-2 bg-clip-text text-transparent bg-gradient-to-r ${
              isDark ? 'from-blue-400 to-blue-500' : 'from-blue-500 to-blue-600'
            }`}>24</div>
            <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>Seguimientos Activos</p>
          </div>
        </div>
      </div>
    </div>
  );
}
