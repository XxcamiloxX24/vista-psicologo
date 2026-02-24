import { ArrowLeft, Shield, Scale, BookOpen, Users, FileCheck, Phone, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';

interface TermsAndPrivacyProps {
  onBack: () => void;
}

export function TermsAndPrivacy({ onBack }: TermsAndPrivacyProps) {
  const sections = [
    {
      title: 'Introducción',
      icon: BookOpen,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      content: 'La Ley 1581 de 2012 determina que los responsables del tratamiento de datos deben adoptar un manual interno de políticas y procedimientos para garantizar el adecuado cumplimiento de la ley. El SENA, en cumplimiento de su misión de invertir en el desarrollo social y técnico de los trabajadores colombianos, garantiza el tratamiento adecuado de los datos personales de aprendices, servidores públicos, contratistas y en general de la población que requiera sus servicios.'
    },
    {
      title: 'Política de Tratamiento',
      icon: Shield,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      content: 'El SENA se compromete a garantizar la protección de los derechos fundamentales al buen nombre y al derecho de información. Los datos personales serán utilizados únicamente para los fines autorizados por la ley y la normatividad vigente, sobre la base de la ley y las disposiciones aplicables.'
    },
    {
      title: 'Marco Legal',
      icon: Scale,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      items: [
        'Constitución Política de 1991 - Artículos 15 (Habeas Data), 20 y 74',
        'Ley 1266 de 2008 - Habeas Data e información financiera y crediticia',
        'Ley 1581 de 2012 - Protección de datos personales',
        'Ley 1712 de 2014 - Transparencia y acceso a la información pública',
        'Decreto 1377 de 2013 - Reglamentación Ley 1581 de 2012',
        'Decreto 103 de 2015 - Reglamentación Ley 1712 de 2014'
      ]
    },
    {
      title: 'Principios Rectores',
      icon: FileCheck,
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50',
      items: [
        'Legalidad: La recolección y tratamiento se fundamenta en la Ley.',
        'Finalidad: Obedece a una finalidad legítima informada al titular.',
        'Libertad: Solo con consentimiento previo, expreso e informado.',
        'Veracidad: La información debe ser veraz, completa, exacta y actualizada.',
        'Transparencia: Derecho del titular a conocer la existencia de sus datos.',
        'Seguridad: Medidas técnicas, humanas y administrativas para proteger la información.',
        'Confidencialidad: Reserva de la información no pública.'
      ]
    },
    {
      title: 'Derechos de los Titulares',
      icon: Users,
      color: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-50',
      items: [
        'Conocer, actualizar y rectificar sus datos personales.',
        'Solicitar prueba de la autorización otorgada al SENA.',
        'Ser informado del uso y tratamiento dado a sus datos personales.',
        'Presentar quejas ante la Superintendencia de Industria y Comercio.',
        'Revocar la autorización y solicitar la supresión de datos.',
        'Acceder en forma gratuita a sus datos personales tratados.'
      ]
    },
    {
      title: 'Tratamiento y Finalidad',
      icon: Shield,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      items: [
        'Fines administrativos propios de la entidad.',
        'Caracterizar ciudadanos y grupos de interés.',
        'Dar tratamiento a peticiones, quejas y reclamos.',
        'Alimentar el Sistema de Información y Gestión de Empleo Público (SIGEP).',
        'Adelantar encuestas de satisfacción.',
        'Conformar y mantener actualizada la base de datos del SENA.'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-100/60 to-purple-100/50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-purple-600 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver al inicio de sesión
        </button>

        <div className="space-y-8">
          <div>
            <h1 className="text-4xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Términos y Condiciones
            </h1>
            <p className="text-slate-600 mb-1">
              Política de Tratamiento de Datos Personales - SENA
            </p>
            <p className="text-sm text-slate-500">
              Documento GC-F-005 V. 01 | Vigente desde 15/11/2016
            </p>
          </div>

          {/* Enlace externo SOFIA Plus */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-purple-100/50 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
                <ExternalLink className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg text-slate-800 mb-2">Política de Confidencialidad SOFIA Plus</h3>
                <p className="text-slate-600 text-sm mb-4">
                  Consulta los términos de uso del servicio, autorización y consentimiento para el tratamiento de datos personales en el portal oficial del SENA.
                </p>
                <a
                  href="https://portal.senasofiaplus.edu.co/index.php/seguridad/politica-de-confidencialidad"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium text-sm"
                >
                  Ver política completa en portal.senasofiaplus.edu.co
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Secciones */}
          <div className="space-y-6">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <div
                  key={index}
                  className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-purple-100/50 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${section.bgColor} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-6 h-6 bg-gradient-to-r ${section.color} bg-clip-text`} style={{ WebkitTextFillColor: 'transparent', WebkitBackgroundClip: 'text', backgroundClip: 'text' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl text-slate-800 font-medium mb-3">{section.title}</h3>
                      {'content' in section && (
                        <p className="text-slate-600 leading-relaxed">{section.content}</p>
                      )}
                      {'items' in section && (
                        <ul className="space-y-2">
                          {(section.items as string[]).map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-slate-600 text-sm">
                              <span className="text-purple-500 mt-1">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Canales de atención */}
          <div className="bg-gradient-to-r from-slate-50 to-purple-50/30 rounded-2xl p-8 border border-purple-100/50">
            <h3 className="text-xl text-slate-800 mb-6 flex items-center gap-2">
              <Phone className="w-6 h-6 text-purple-600" />
              Canales de Atención
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-slate-500 mb-1">Línea Gratuita Nacional</p>
                <p className="text-slate-800 font-medium">018000 910 270</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Línea Bogotá D.C.</p>
                <p className="text-slate-800 font-medium">(1) 592 55 55</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Dirección</p>
                <p className="text-slate-800">Calle 57 No. 8-69, Bogotá D.C.</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Solicitudes en línea</p>
                <a
                  href="http://sciudadanos.sena.edu.co/SolicitudIndex.aspx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:underline"
                >
                  sciudadanos.sena.edu.co
                </a>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-slate-500 mb-1">Horario de atención</p>
                <p className="text-slate-800">Lunes a Viernes: 7:00 AM - 7:00 PM | Sábados: 8:00 AM - 1:00 PM</p>
              </div>
            </div>
          </div>

          {/* Responsable del tratamiento */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-purple-100/50">
            <h3 className="text-lg text-slate-800 mb-4">Responsable del Tratamiento</h3>
            <p className="text-slate-600 text-sm">
              Servicio Nacional de Aprendizaje – SENA – Coordinación Nacional de Servicio a la Empresa y Servicio al Cliente. 
              Coordinadora: Margarita Giraldo Correa. Todos los datos están almacenados en servidores del SENA en Colombia, 
              custodiados con mecanismos avanzados de seguridad informática.
            </p>
          </div>

          <div className="flex justify-center pt-4">
            <Button
              onClick={onBack}
              variant="outline"
              className="border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio de sesión
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
