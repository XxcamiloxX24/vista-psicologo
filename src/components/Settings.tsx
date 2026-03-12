import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, User, Lock, Shield, Bell, Palette, Globe, Pencil, Check, X } from 'lucide-react';
import { usePsychologist } from '../contexts/PsychologistContext';
import { ProfileEditModal } from './ProfileEditModal';

export function Settings() {
  const [openSection, setOpenSection] = useState<string | null>('profile');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showSavedNotification, setShowSavedNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { psychologist, loading } = usePsychologist();

  useEffect(() => {
    if (showSavedNotification) {
      const t = setTimeout(() => setShowSavedNotification(false), 4000);
      return () => clearTimeout(t);
    }
  }, [showSavedNotification]);

  useEffect(() => {
    if (showErrorNotification) {
      const t = setTimeout(() => setShowErrorNotification(false), 5000);
      return () => clearTimeout(t);
    }
  }, [showErrorNotification]);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const sections = [
    {
      id: 'profile',
      title: 'Perfil',
      icon: User,
      color: 'from-blue-500 to-purple-600'
    },
    {
      id: 'security',
      title: 'Seguridad',
      icon: Lock,
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'privacy',
      title: 'Políticas de Seguridad',
      icon: Shield,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'notifications',
      title: 'Notificaciones',
      icon: Bell,
      color: 'from-yellow-500 to-orange-600'
    },
    {
      id: 'appearance',
      title: 'Apariencia',
      icon: Palette,
      color: 'from-pink-500 to-purple-600'
    },
    {
      id: 'language',
      title: 'Idioma y Región',
      icon: Globe,
      color: 'from-blue-400 to-blue-600'
    }
  ];

  const notificationToast = (showSavedNotification || showErrorNotification) && createPortal(
    <div
      role={showSavedNotification ? 'status' : 'alert'}
      style={{
        position: 'fixed',
        bottom: 24,
        left: window.innerWidth >= 768 ? 288 : 24,
        zIndex: 2147483647,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        borderRadius: 12,
        backgroundColor: showSavedNotification ? '#10b981' : '#ef4444',
        color: 'white',
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
      }}
    >
      {showSavedNotification && <Check style={{ width: 20, height: 20, flexShrink: 0 }} />}
      <span style={{ fontWeight: 500 }}>
        {showSavedNotification ? 'Guardado' : errorMessage}
      </span>
      <button
        type="button"
        onClick={() => {
          setShowSavedNotification(false);
          setShowErrorNotification(false);
        }}
        style={{ marginLeft: 8, padding: 4, borderRadius: 4, background: 'rgba(255,255,255,0.2)' }}
      >
        <X style={{ width: 16, height: 16 }} />
      </button>
    </div>,
    document.body
  );

  return (
    <div className="relative space-y-6">
      {notificationToast}
      {/* Header */}
      <div>
        <h1 className="text-4xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Configuración
        </h1>
        <p className="text-slate-600">Administra tus preferencias y ajustes de la plataforma</p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-4">
        {sections.map((section) => {
          const Icon = section.icon;
          const isOpen = openSection === section.id;

          return (
            <div
              key={section.id}
              className="bg-white/90 backdrop-blur-sm rounded-2xl border border-purple-100/50 shadow-sm overflow-hidden"
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full p-6 flex items-center justify-between hover:bg-purple-50/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${section.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-slate-800">{section.title}</h3>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 transition-transform ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-6 pb-6 space-y-4 border-t border-purple-100/50 pt-6">
                  {section.id === 'profile' && (
                    <>
                      {loading ? (
                        <div className="py-8 text-center text-slate-500">Cargando perfil...</div>
                      ) : (
                        <>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm text-slate-500 mb-1 block">Documento</label>
                              <p className="text-slate-800 py-2">{psychologist?.psiDocumento || '—'}</p>
                            </div>
                            <div>
                              <label className="text-sm text-slate-500 mb-1 block">Nombre Completo</label>
                              <p className="text-slate-800 py-2">
                                {psychologist
                                  ? `${psychologist.psiNombre || ''} ${psychologist.psiApellido || ''}`.trim() || '—'
                                  : '—'}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm text-slate-500 mb-1 block">Correo Institucional</label>
                              <p className="text-slate-800 py-2">{psychologist?.psiCorreoInstitucional || '—'}</p>
                            </div>
                            <div>
                              <label className="text-sm text-slate-500 mb-1 block">Correo Personal</label>
                              <p className="text-slate-800 py-2">{psychologist?.psiCorreoPersonal || '—'}</p>
                            </div>
                            <div>
                              <label className="text-sm text-slate-500 mb-1 block">Teléfono</label>
                              <p className="text-slate-800 py-2">{psychologist?.psiTelefono || '—'}</p>
                            </div>
                            <div>
                              <label className="text-sm text-slate-500 mb-1 block">Especialidad</label>
                              <p className="text-slate-800 py-2">{psychologist?.psiEspecialidad || '—'}</p>
                            </div>
                            <div>
                              <label className="text-sm text-slate-500 mb-1 block">Fecha de nacimiento</label>
                              <p className="text-slate-800 py-2">
                                {psychologist?.psiFechaNac
                                  ? new Date(psychologist.psiFechaNac).toLocaleDateString('es-CO')
                                  : '—'}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm text-slate-500 mb-1 block">Dirección</label>
                              <p className="text-slate-800 py-2">{psychologist?.psiDireccion || '—'}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                          >
                            <Pencil className="w-4 h-4" />
                            Editar perfil
                          </button>
                        </>
                      )}
                      <ProfileEditModal
                        isOpen={isEditModalOpen}
                        onClose={() => setIsEditModalOpen(false)}
                        onSaveSuccess={() => {
                          setShowSavedNotification(true);
                          setIsEditModalOpen(false);
                        }}
                        onSaveError={(msg) => {
                          setErrorMessage(msg);
                          setShowErrorNotification(true);
                        }}
                      />
                    </>
                  )}

                  {section.id === 'security' && (
                    <>
                      <div>
                        <label className="text-sm text-slate-700 mb-2 block">Contraseña Actual</label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full px-4 py-3 rounded-xl border border-purple-200/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 bg-slate-50"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-slate-700 mb-2 block">Nueva Contraseña</label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full px-4 py-3 rounded-xl border border-purple-200/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 bg-slate-50"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-slate-700 mb-2 block">Confirmar Contraseña</label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full px-4 py-3 rounded-xl border border-purple-200/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 bg-slate-50"
                        />
                      </div>
                      <button className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all">
                        Actualizar Seguridad
                      </button>
                    </>
                  )}

                  {section.id === 'privacy' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <span className="text-sm text-slate-700">Compartir datos con el sistema</span>
                        <label className="relative inline-block w-12 h-6">
                          <input type="checkbox" defaultChecked className="opacity-0 w-0 h-0 peer" />
                          <span className="absolute cursor-pointer inset-0 bg-slate-300 rounded-full transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-600 before:absolute before:content-[''] before:h-5 before:w-5 before:left-0.5 before:bottom-0.5 before:bg-white before:rounded-full before:transition-all peer-checked:before:translate-x-6"></span>
                        </label>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <span className="text-sm text-slate-700">Permitir análisis de uso</span>
                        <label className="relative inline-block w-12 h-6">
                          <input type="checkbox" defaultChecked className="opacity-0 w-0 h-0 peer" />
                          <span className="absolute cursor-pointer inset-0 bg-slate-300 rounded-full transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-600 before:absolute before:content-[''] before:h-5 before:w-5 before:left-0.5 before:bottom-0.5 before:bg-white before:rounded-full before:transition-all peer-checked:before:translate-x-6"></span>
                        </label>
                      </div>
                      <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                        <p className="text-sm text-slate-700">
                          Los datos de los aprendices están protegidos según la normativa de protección de datos del SENA y las leyes colombianas de habeas data.
                        </p>
                      </div>
                    </div>
                  )}

                  {section.id === 'notifications' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <span className="text-sm text-slate-700">Nuevas citas</span>
                        <label className="relative inline-block w-12 h-6">
                          <input type="checkbox" defaultChecked className="opacity-0 w-0 h-0 peer" />
                          <span className="absolute cursor-pointer inset-0 bg-slate-300 rounded-full transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-600 before:absolute before:content-[''] before:h-5 before:w-5 before:left-0.5 before:bottom-0.5 before:bg-white before:rounded-full before:transition-all peer-checked:before:translate-x-6"></span>
                        </label>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <span className="text-sm text-slate-700">Mensajes nuevos</span>
                        <label className="relative inline-block w-12 h-6">
                          <input type="checkbox" defaultChecked className="opacity-0 w-0 h-0 peer" />
                          <span className="absolute cursor-pointer inset-0 bg-slate-300 rounded-full transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-600 before:absolute before:content-[''] before:h-5 before:w-5 before:left-0.5 before:bottom-0.5 before:bg-white before:rounded-full before:transition-all peer-checked:before:translate-x-6"></span>
                        </label>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <span className="text-sm text-slate-700">Casos críticos</span>
                        <label className="relative inline-block w-12 h-6">
                          <input type="checkbox" defaultChecked className="opacity-0 w-0 h-0 peer" />
                          <span className="absolute cursor-pointer inset-0 bg-slate-300 rounded-full transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-600 before:absolute before:content-[''] before:h-5 before:w-5 before:left-0.5 before:bottom-0.5 before:bg-white before:rounded-full before:transition-all peer-checked:before:translate-x-6"></span>
                        </label>
                      </div>
                    </div>
                  )}

                  {section.id === 'appearance' && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-slate-700 mb-2 block">Tema</label>
                        <select className="w-full px-4 py-3 rounded-xl border border-purple-200/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 bg-slate-50">
                          <option>Claro</option>
                          <option>Oscuro</option>
                          <option>Automático</option>
                        </select>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-purple-200">
                        <p className="text-sm text-slate-700">
                          La paleta de colores azul/púrpura con acentos verdes SENA se mantiene en todos los temas.
                        </p>
                      </div>
                    </div>
                  )}

                  {section.id === 'language' && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-slate-700 mb-2 block">Idioma</label>
                        <select className="w-full px-4 py-3 rounded-xl border border-purple-200/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 bg-slate-50">
                          <option>Español</option>
                          <option>English</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-slate-700 mb-2 block">Zona Horaria</label>
                        <select className="w-full px-4 py-3 rounded-xl border border-purple-200/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 bg-slate-50">
                          <option>America/Bogota (GMT-5)</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
