import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Shield,
  Scale,
  BookOpen,
  Users,
  FileCheck,
  Phone,
  ExternalLink,
  CheckCircle2,
  ChevronUp,
  MapPin,
  Clock,
  Globe,
  Building2,
  ShieldCheck,
  Calendar,
  FileText,
  List,
} from 'lucide-react';
import { Button } from './ui/button';

interface TermsAndPrivacyProps {
  onBack: () => void;
}

type SectionBase = {
  id: string;
  title: string;
  shortTitle: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  description: string;
};

type SectionWithContent = SectionBase & { content: string };
type SectionWithItems = SectionBase & { items: string[] };
type Section = SectionWithContent | SectionWithItems;

const accentClasses: Record<
  string,
  {
    gradient: string;
    iconBg: string;
    iconText: string;
    ring: string;
    chip: string;
    softBg: string;
    border: string;
  }
> = {
  blue: {
    gradient: 'from-blue-500 to-cyan-500',
    iconBg: 'bg-blue-100 dark:bg-blue-500/15',
    iconText: 'text-blue-600 dark:text-blue-400',
    ring: 'ring-blue-200/60 dark:ring-blue-500/20',
    chip: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300',
    softBg: 'bg-blue-50/60 dark:bg-blue-500/5',
    border: 'hover:border-blue-300 dark:hover:border-blue-500/40',
  },
  purple: {
    gradient: 'from-purple-500 to-fuchsia-500',
    iconBg: 'bg-purple-100 dark:bg-purple-500/15',
    iconText: 'text-purple-600 dark:text-purple-400',
    ring: 'ring-purple-200/60 dark:ring-purple-500/20',
    chip: 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300',
    softBg: 'bg-purple-50/60 dark:bg-purple-500/5',
    border: 'hover:border-purple-300 dark:hover:border-purple-500/40',
  },
  green: {
    gradient: 'from-emerald-500 to-green-500',
    iconBg: 'bg-emerald-100 dark:bg-emerald-500/15',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    ring: 'ring-emerald-200/60 dark:ring-emerald-500/20',
    chip: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
    softBg: 'bg-emerald-50/60 dark:bg-emerald-500/5',
    border: 'hover:border-emerald-300 dark:hover:border-emerald-500/40',
  },
  amber: {
    gradient: 'from-amber-500 to-orange-500',
    iconBg: 'bg-amber-100 dark:bg-amber-500/15',
    iconText: 'text-amber-600 dark:text-amber-400',
    ring: 'ring-amber-200/60 dark:ring-amber-500/20',
    chip: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
    softBg: 'bg-amber-50/60 dark:bg-amber-500/5',
    border: 'hover:border-amber-300 dark:hover:border-amber-500/40',
  },
  teal: {
    gradient: 'from-teal-500 to-cyan-500',
    iconBg: 'bg-teal-100 dark:bg-teal-500/15',
    iconText: 'text-teal-600 dark:text-teal-400',
    ring: 'ring-teal-200/60 dark:ring-teal-500/20',
    chip: 'bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300',
    softBg: 'bg-teal-50/60 dark:bg-teal-500/5',
    border: 'hover:border-teal-300 dark:hover:border-teal-500/40',
  },
  indigo: {
    gradient: 'from-indigo-500 to-violet-500',
    iconBg: 'bg-indigo-100 dark:bg-indigo-500/15',
    iconText: 'text-indigo-600 dark:text-indigo-400',
    ring: 'ring-indigo-200/60 dark:ring-indigo-500/20',
    chip: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300',
    softBg: 'bg-indigo-50/60 dark:bg-indigo-500/5',
    border: 'hover:border-indigo-300 dark:hover:border-indigo-500/40',
  },
};

const sections: Section[] = [
  {
    id: 'introduccion',
    title: 'Introducción',
    shortTitle: 'Introducción',
    icon: BookOpen,
    accent: 'blue',
    description: 'Contexto normativo y alcance de la política.',
    content:
      'La Ley 1581 de 2012 determina que los responsables del tratamiento de datos deben adoptar un manual interno de políticas y procedimientos para garantizar el adecuado cumplimiento de la ley. El SENA, en cumplimiento de su misión de invertir en el desarrollo social y técnico de los trabajadores colombianos, garantiza el tratamiento adecuado de los datos personales de aprendices, servidores públicos, contratistas y en general de la población que requiera sus servicios.',
  },
  {
    id: 'politica',
    title: 'Política de Tratamiento',
    shortTitle: 'Política',
    icon: ShieldCheck,
    accent: 'purple',
    description: 'Nuestro compromiso con tus derechos fundamentales.',
    content:
      'El SENA se compromete a garantizar la protección de los derechos fundamentales al buen nombre y al derecho de información. Los datos personales serán utilizados únicamente para los fines autorizados por la ley y la normatividad vigente, sobre la base de la ley y las disposiciones aplicables.',
  },
  {
    id: 'marco-legal',
    title: 'Marco Legal',
    shortTitle: 'Marco legal',
    icon: Scale,
    accent: 'green',
    description: 'Normativa colombiana aplicable al tratamiento de datos.',
    items: [
      'Constitución Política de 1991 - Artículos 15 (Habeas Data), 20 y 74',
      'Ley 1266 de 2008 - Habeas Data e información financiera y crediticia',
      'Ley 1581 de 2012 - Protección de datos personales',
      'Ley 1712 de 2014 - Transparencia y acceso a la información pública',
      'Decreto 1377 de 2013 - Reglamentación Ley 1581 de 2012',
      'Decreto 103 de 2015 - Reglamentación Ley 1712 de 2014',
    ],
  },
  {
    id: 'principios',
    title: 'Principios Rectores',
    shortTitle: 'Principios',
    icon: FileCheck,
    accent: 'amber',
    description: 'Fundamentos éticos y legales del tratamiento.',
    items: [
      'Legalidad: La recolección y tratamiento se fundamenta en la Ley.',
      'Finalidad: Obedece a una finalidad legítima informada al titular.',
      'Libertad: Solo con consentimiento previo, expreso e informado.',
      'Veracidad: La información debe ser veraz, completa, exacta y actualizada.',
      'Transparencia: Derecho del titular a conocer la existencia de sus datos.',
      'Seguridad: Medidas técnicas, humanas y administrativas para proteger la información.',
      'Confidencialidad: Reserva de la información no pública.',
    ],
  },
  {
    id: 'derechos',
    title: 'Derechos de los Titulares',
    shortTitle: 'Derechos',
    icon: Users,
    accent: 'teal',
    description: 'Lo que puedes hacer sobre tus datos personales.',
    items: [
      'Conocer, actualizar y rectificar sus datos personales.',
      'Solicitar prueba de la autorización otorgada al SENA.',
      'Ser informado del uso y tratamiento dado a sus datos personales.',
      'Presentar quejas ante la Superintendencia de Industria y Comercio.',
      'Revocar la autorización y solicitar la supresión de datos.',
      'Acceder en forma gratuita a sus datos personales tratados.',
    ],
  },
  {
    id: 'tratamiento',
    title: 'Tratamiento y Finalidad',
    shortTitle: 'Finalidad',
    icon: Shield,
    accent: 'indigo',
    description: 'Para qué utilizamos tu información.',
    items: [
      'Fines administrativos propios de la entidad.',
      'Caracterizar ciudadanos y grupos de interés.',
      'Dar tratamiento a peticiones, quejas y reclamos.',
      'Alimentar el Sistema de Información y Gestión de Empleo Público (SIGEP).',
      'Adelantar encuestas de satisfacción.',
      'Conformar y mantener actualizada la base de datos del SENA.',
    ],
  },
];

function splitLeadingLabel(text: string): { label: string | null; rest: string } {
  const idx = text.indexOf(':');
  if (idx === -1 || idx > 28) return { label: null, rest: text };
  return { label: text.slice(0, idx), rest: text.slice(idx + 1).trim() };
}

function parseLegalItem(text: string): { title: string; desc: string } {
  const parts = text.split(' - ');
  if (parts.length >= 2) {
    return { title: parts[0].trim(), desc: parts.slice(1).join(' - ').trim() };
  }
  return { title: text, desc: '' };
}

export function TermsAndPrivacy({ onBack }: TermsAndPrivacyProps) {
  const [activeId, setActiveId] = useState<string>(sections[0].id);
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowTopBtn(scrollY > 400);
      setScrolled(scrollY > 40);

      // Barra de progreso de lectura
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, (scrollY / docHeight) * 100) : 0;
      setProgress(pct);

      // Sección activa
      let current = sections[0].id;
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el) {
          const top = el.getBoundingClientRect().top;
          if (top <= 140) current = s.id;
        }
      }
      setActiveId(current);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const activeSection =
    sections.find((s) => s.id === activeId) ?? sections[0];
  const ActiveIcon = activeSection.icon;
  const activeAccent = accentClasses[activeSection.accent];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-100/60 to-purple-100/50 dark:from-slate-900 dark:via-slate-900 dark:to-purple-950/40">
      {/* Barra superior sticky (opaca y con progreso) */}
      <div
        className={`sticky top-0 z-40 border-b transition-all ${
          scrolled
            ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-slate-200 dark:border-slate-700 shadow-sm'
            : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-slate-200/70 dark:border-slate-700/70'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-sm font-medium shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Volver al inicio de sesión</span>
            <span className="sm:hidden">Volver</span>
          </button>

          {/* Indicador de sección activa (aparece al scrollear) */}
          <div
            className={`hidden md:flex items-center gap-2 text-sm transition-all ${
              scrolled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1 pointer-events-none'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-md flex items-center justify-center ${activeAccent.iconBg}`}
            >
              <ActiveIcon className={`w-3.5 h-3.5 ${activeAccent.iconText}`} />
            </span>
            <span className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
              Leyendo
            </span>
            <span className="font-medium text-slate-800 dark:text-slate-100">
              {activeSection.title}
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 shrink-0">
            <FileText className="w-3.5 h-3.5" />
            <span>GC-F-005 V.01</span>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="h-0.5 bg-slate-200/50 dark:bg-slate-700/50 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-fuchsia-500 transition-[width] duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-14">
        {/* Hero */}
        <div className="mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-purple-200/60 dark:border-purple-500/20 text-xs text-purple-700 dark:text-purple-300 mb-4">
            <Shield className="w-3.5 h-3.5" />
            Protección de Datos Personales
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent mb-3 leading-[1.1]">
            Términos y Condiciones
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg max-w-3xl">
            Política de Tratamiento de Datos Personales del{' '}
            <span className="font-medium text-slate-800 dark:text-slate-100">
              Servicio Nacional de Aprendizaje – SENA
            </span>
            . Conoce cómo protegemos, usamos y garantizamos tus derechos sobre la información.
          </p>

          {/* Meta chips */}
          <div className="flex flex-wrap gap-2 mt-6">
            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
              <FileText className="w-3.5 h-3.5" /> Documento GC-F-005 V. 01
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
              <Calendar className="w-3.5 h-3.5" /> Vigente desde 15/11/2016
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" /> Ley 1581 de 2012
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-300">
              <Clock className="w-3.5 h-3.5" /> ~5 min de lectura
            </span>
          </div>
        </div>

        {/* Grid con TOC + Contenido */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 items-start">
          {/* Tabla de contenidos (sticky) */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl border border-slate-200/70 dark:border-slate-700/70 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 px-2">
                  <List className="w-3.5 h-3.5" />
                  Contenido
                </div>
                <nav className="space-y-1">
                  {sections.map((s) => {
                    const isActive = activeId === s.id;
                    const c = accentClasses[s.accent];
                    const Icon = s.icon;
                    return (
                      <button
                        key={s.id}
                        onClick={() => scrollToSection(s.id)}
                        className={`w-full flex items-center gap-2.5 text-left text-sm px-2.5 py-2 rounded-lg transition-all ${
                          isActive
                            ? `${c.chip} font-medium`
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-md flex items-center justify-center ${
                            isActive ? c.iconBg : 'bg-slate-100 dark:bg-slate-700/50'
                          }`}
                        >
                          <Icon
                            className={`w-3.5 h-3.5 ${
                              isActive ? c.iconText : 'text-slate-500 dark:text-slate-400'
                            }`}
                          />
                        </span>
                        <span className="truncate">{s.shortTitle}</span>
                      </button>
                    );
                  })}
                  <div className="border-t border-slate-200 dark:border-slate-700 my-2" />
                  <button
                    onClick={() => scrollToSection('canales')}
                    className="w-full flex items-center gap-2.5 text-left text-sm px-2.5 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all"
                  >
                    <span className="w-6 h-6 rounded-md flex items-center justify-center bg-slate-100 dark:bg-slate-700/50">
                      <Phone className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    </span>
                    Canales de atención
                  </button>
                  <button
                    onClick={() => scrollToSection('responsable')}
                    className="w-full flex items-center gap-2.5 text-left text-sm px-2.5 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all"
                  >
                    <span className="w-6 h-6 rounded-md flex items-center justify-center bg-slate-100 dark:bg-slate-700/50">
                      <Building2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    </span>
                    Responsable
                  </button>
                </nav>
              </div>
            </div>
          </aside>

          {/* Contenido principal */}
          <main className="space-y-6 min-w-0">
            {/* Callout SOFIA Plus */}
            <div className="relative overflow-hidden rounded-2xl border border-purple-200/60 dark:border-purple-500/20 bg-gradient-to-r from-blue-50 via-white to-purple-50 dark:from-blue-950/40 dark:via-slate-800 dark:to-purple-950/40 p-6 shadow-sm">
              <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-500/20 blur-3xl pointer-events-none" />
              <div className="relative flex flex-col sm:flex-row items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20">
                  <ExternalLink className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                      Política de Confidencialidad SOFIA Plus
                    </h3>
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300">
                      Oficial
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
                    Consulta los términos de uso del servicio, autorización y consentimiento para el
                    tratamiento de datos personales en el portal oficial del SENA.
                  </p>
                  <a
                    href="https://portal.senasofiaplus.edu.co/index.php/seguridad/politica-de-confidencialidad"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex shrink-0 flex-nowrap items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-500/10 text-sm font-medium transition-colors shadow-sm w-max max-w-full"
                  >
                    <span className="whitespace-nowrap">Ver política completa</span>
                    {/* El SVG tiene display:block en index.css (preflight); un mini-flex lo mantiene en línea con el texto */}
                    <span className="flex shrink-0 items-center justify-center" aria-hidden>
                      <ExternalLink className="size-4" />
                    </span>
                  </a>
                </div>
              </div>
            </div>

            {/* Secciones unificadas */}
            {sections.map((section, index) => {
              const Icon = section.icon;
              const c = accentClasses[section.accent];
              const isLegal = section.id === 'marco-legal';
              const isPrinciples = section.id === 'principios';
              const isRights = section.id === 'derechos';
              const isPurpose = section.id === 'tratamiento';
              const isChecklistStyle = isPrinciples || isRights || isPurpose;

              return (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-28 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl border border-slate-200/70 dark:border-slate-700/70 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  {/* Header consistente */}
                  <div
                    className={`flex items-center gap-4 px-6 py-5 border-b border-slate-200/70 dark:border-slate-700/70 ${c.softBg}`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl ${c.iconBg} ring-1 ${c.ring} flex items-center justify-center shrink-0`}
                    >
                      <Icon className={`w-6 h-6 ${c.iconText}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[10px] font-semibold tracking-wider ${c.iconText}`}
                        >
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          Sección
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                        {section.title}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        {section.description}
                      </p>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6">
                    {'content' in section && (
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[15px]">
                        {section.content}
                      </p>
                    )}

                    {/* Marco Legal → grid de cards con icono de balanza */}
                    {'items' in section && isLegal && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {section.items.map((item, i) => {
                          const { title, desc } = parseLegalItem(item);
                          return (
                            <div
                              key={i}
                              className={`group flex items-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/30 ${c.border} hover:shadow-sm transition-all`}
                            >
                              <div
                                className={`w-9 h-9 rounded-lg ${c.iconBg} flex items-center justify-center shrink-0`}
                              >
                                <Scale className={`w-5 h-5 ${c.iconText}`} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                                  {title}
                                </p>
                                {desc && (
                                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                    {desc}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Principios / Derechos / Finalidad → todas usan el mismo patrón checklist */}
                    {'items' in section && isChecklistStyle && (
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {section.items.map((item, i) => {
                          const { label, rest } = splitLeadingLabel(item);
                          const isLastOdd =
                            section.items.length % 2 === 1 &&
                            i === section.items.length - 1;
                          return (
                            <li
                              key={i}
                              className={`flex items-start gap-3 p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-700/60 hover:bg-white dark:hover:bg-slate-900/60 transition-colors ${
                                isLastOdd ? 'md:col-span-2' : ''
                              }`}
                            >
                              <CheckCircle2
                                className={`w-5 h-5 ${c.iconText} shrink-0 mt-0.5`}
                              />
                              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                {label && (
                                  <span className="font-semibold text-slate-800 dark:text-slate-100">
                                    {label}:{' '}
                                  </span>
                                )}
                                {rest}
                              </p>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </section>
              );
            })}

            {/* Canales de atención */}
            <section
              id="canales"
              className="scroll-mt-28 rounded-2xl border border-purple-200/60 dark:border-purple-500/20 bg-gradient-to-br from-slate-50 via-white to-purple-50/60 dark:from-slate-800 dark:via-slate-800 dark:to-purple-950/30 p-6 md:p-8 shadow-sm"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-500/15 ring-1 ring-purple-200/60 dark:ring-purple-500/20 flex items-center justify-center shrink-0">
                  <Phone className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                    Canales de Atención
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Contáctanos a través de cualquiera de estos medios oficiales.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Línea Gratuita Nacional
                    </p>
                    <p className="text-base font-semibold text-slate-800 dark:text-slate-100 mt-0.5">
                      018000 910 270
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Línea Bogotá D.C.
                    </p>
                    <p className="text-base font-semibold text-slate-800 dark:text-slate-100 mt-0.5">
                      (1) 592 55 55
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Dirección
                    </p>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100 mt-0.5">
                      Calle 57 No. 8-69, Bogotá D.C.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-500/15 flex items-center justify-center shrink-0">
                    <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Solicitudes en línea
                    </p>
                    <a
                      href="http://sciudadanos.sena.edu.co/SolicitudIndex.aspx"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium text-purple-700 dark:text-purple-300 hover:underline mt-0.5 break-all"
                    >
                      sciudadanos.sena.edu.co
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    </a>
                  </div>
                </div>

                {/* Horario — reestructurado en 2 columnas internas */}
                <div className="md:col-span-2 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-500/10 dark:to-blue-500/10 border border-purple-200/60 dark:border-purple-500/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-sm">
                      <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Horario de atención
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-[52px]">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                      <p className="text-sm text-slate-700 dark:text-slate-200">
                        <span className="font-semibold">Lunes a Viernes:</span>{' '}
                        7:00 AM – 7:00 PM
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <p className="text-sm text-slate-700 dark:text-slate-200">
                        <span className="font-semibold">Sábados:</span> 8:00 AM – 1:00 PM
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Responsable del tratamiento */}
            <section
              id="responsable"
              className="scroll-mt-28 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl border border-slate-200/70 dark:border-slate-700/70 p-6 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700/60 flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
                    Responsable del Tratamiento
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    <span className="font-medium text-slate-800 dark:text-slate-100">
                      Servicio Nacional de Aprendizaje – SENA
                    </span>{' '}
                    – Coordinación Nacional de Servicio a la Empresa y Servicio al Cliente.
                    Coordinadora:{' '}
                    <span className="font-medium text-slate-800 dark:text-slate-100">
                      Margarita Giraldo Correa
                    </span>
                    . Todos los datos están almacenados en servidores del SENA en Colombia,
                    custodiados con mecanismos avanzados de seguridad informática.
                  </p>
                </div>
              </div>
            </section>

            {/* CTA final — estilo alineado con el botón de login */}
            <div className="mt-4 rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm p-6 md:p-8 shadow-sm flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                  ¿Listo para continuar?
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md">
                  Al continuar aceptas la Política de Tratamiento de Datos Personales del SENA.
                </p>
              </div>
              <Button
                onClick={onBack}
                className="h-12 px-6 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 text-white font-medium flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5 shrink-0" />
                Volver al inicio de sesión
              </Button>
            </div>
          </main>
        </div>

        {/* Espacio inferior para que el botón no quede pegado al borde */}
        <div className="h-16 md:h-24" />
      </div>

      {/* Botón flotante "volver arriba" */}
      {showTopBtn && (
        <button
          onClick={scrollToTop}
          aria-label="Volver arriba"
          className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
