import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Loader2 } from "lucide-react";
import { Dashboard } from "./components/Dashboard";
import { Appointments } from "./components/Appointments";
import { Messages } from "./components/Messages";
import { Followups } from "./components/Followups";
import { FollowupCreatePage, type FollowupCreateConfig } from "./components/FollowupCreatePage";
import { CitaDetallePage, type CitaDetalleConfig } from "./components/CitaDetallePage";
import { Students } from "./components/Students";
import { CardsInfoManager } from "./components/CardsInfoManager";
import { CardInfoDetailPage } from "./components/CardInfoDetailPage";
import { CardInfoCreatePage } from "./components/CardInfoCreatePage";
import type { CardInfo } from "./lib/cardsInfo";
import { About } from "./components/About";
import { Settings } from "./components/Settings";
import { ProfileEditPage } from "./components/ProfileEditPage";
import { Sidebar } from "./components/Sidebar";
import { Login } from "./components/Login";
import { TermsAndPrivacy } from "./components/TermsAndPrivacy";
import { PsychologistProvider } from "./contexts/PsychologistContext";
import { NotificationsProvider } from "./contexts/NotificationsContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import {
  bootstrapSession,
  isAuthenticated as checkAuth,
  removeToken,
  refreshSession,
  scheduleProactiveRefresh,
  getToken,
  isAccessExpired,
} from "./lib/auth";

type Section =
  | "dashboard"
  | "appointments"
  | "cita-detalle"
  | "messages"
  | "followups"
  | "followups-create"
  | "students"
  | "cards-info"
  | "cards-info-detail"
  | "cards-info-create"
  | "about"
  | "settings"
  | "profile-edit";

type AuthView = "login" | "terms" | "app";

export default function App() {
  const [authBootstrapping, setAuthBootstrapping] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState<AuthView>("login");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await bootstrapSession();
      if (!cancelled) {
        setIsAuthenticated(checkAuth());
        setAuthBootstrapping(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated || authBootstrapping) return;
    const onVis = () => {
      if (document.visibilityState !== "visible") return;
      const t = getToken();
      if (t && isAccessExpired(t, 150)) {
        void refreshSession().then((ok) => {
          if (ok) scheduleProactiveRefresh();
        });
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [isAuthenticated, authBootstrapping]);
  const [activeSection, setActiveSection] =
    useState<Section>("dashboard");
  const [targetStudentId, setTargetStudentId] = useState<string | null>(null);
  /** Página crear seguimiento: manual o datos desde Fichas */
  const [followupCreateConfig, setFollowupCreateConfig] = useState<FollowupCreateConfig | null>(null);
  /** Página detalle de cita (desde calendario) */
  const [citaDetalleConfig, setCitaDetalleConfig] = useState<CitaDetalleConfig | null>(null);
  /** Incrementar para forzar recarga de listas en Seguimientos tras crear */
  const [followupsListKey, setFollowupsListKey] = useState(0);
  /** Tarjetas informativas: card seleccionada para detalle */
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  /** Recarga lista de tarjetas informativas */
  const [cardsInfoListKey, setCardsInfoListKey] = useState(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutProgress, setLogoutProgress] = useState(0);
  const [profileSavedToast, setProfileSavedToast] = useState(false);
  /** appointmentId para seleccionar al abrir Mensajes desde una notificación de chat */
  const [chatToSelectFromNotification, setChatToSelectFromNotification] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoggingOut) return;
    setLogoutProgress(0);
    const duration = 1200;
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min((elapsed / duration) * 100, 100);
      setLogoutProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        removeToken();
        setIsAuthenticated(false);
        setIsLoggingOut(false);
        setLogoutProgress(0);
      }
    }, 40);
    return () => clearInterval(interval);
  }, [isLoggingOut]);

  const handleViewFollowup = (studentId: string) => {
    setFollowupCreateConfig(null);
    setTargetStudentId(studentId);
    setActiveSection("followups");
  };

  const handleNavigateCreateSeguimiento = useCallback(
    (payload: {
      aprendizFichaCodigo: number;
      name: string;
      email: string;
      program: string;
      ficha: string;
    }) => {
      setTargetStudentId(null);
      setFollowupCreateConfig({ mode: "fromFicha", ...payload, key: Date.now() });
      setActiveSection("followups-create");
    },
    []
  );

  const handleOpenFollowupCreateManual = useCallback(() => {
    setFollowupCreateConfig({ mode: "manual", key: Date.now() });
    setActiveSection("followups-create");
  }, []);

  const closeFollowupCreate = useCallback(() => {
    setFollowupCreateConfig(null);
    setActiveSection("followups");
  }, []);

  const handleFollowupCreateSuccess = useCallback(() => {
    setFollowupCreateConfig(null);
    setActiveSection("followups");
    setFollowupsListKey((k) => k + 1);
  }, []);

  const handleViewCard = useCallback((card: CardInfo) => {
    const id = card.carCodigo;
    if (id != null) {
      setSelectedCardId(id);
      setActiveSection("cards-info-detail");
    }
  }, []);

  const handleOpenCardsInfoCreate = useCallback(() => {
    setSelectedCardId(null);
    setActiveSection("cards-info-create");
  }, []);

  const handleCardsInfoBack = useCallback(() => {
    setSelectedCardId(null);
    setActiveSection("cards-info");
  }, []);

  const handleCardsInfoDeleted = useCallback(() => {
    setSelectedCardId(null);
    setActiveSection("cards-info");
    setCardsInfoListKey((k) => k + 1);
  }, []);

  const handleCardsInfoSaved = useCallback(() => {
    setCardsInfoListKey((k) => k + 1);
  }, []);

  const handleCardsInfoCreateSuccess = useCallback(() => {
    setActiveSection("cards-info");
    setCardsInfoListKey((k) => k + 1);
  }, []);

  const handleLogout = useCallback(() => {
    setIsLoggingOut(true);
  }, []);

  if (authBootstrapping) {
    return (
      <ThemeProvider>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400">
          <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
          <p className="text-sm">Restaurando sesión…</p>
        </div>
      </ThemeProvider>
    );
  }

  // Pantalla de login o términos (no autenticado)
  if (!isAuthenticated) {
    if (authView === "terms") {
      return (
        <ThemeProvider>
          <TermsAndPrivacy onBack={() => setAuthView("login")} />
        </ThemeProvider>
      );
    }
    return (
      <ThemeProvider>
        <Login
          onLogin={() => setIsAuthenticated(true)}
          onViewTerms={() => setAuthView("terms")}
        />
      </ThemeProvider>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />;
      case "appointments":
        return (
          <Appointments
            onViewCitaDetalle={(cita) => {
              setCitaDetalleConfig({ cita });
              setActiveSection("cita-detalle");
            }}
          />
        );
      case "cita-detalle":
        return citaDetalleConfig ? (
          <CitaDetallePage
            config={citaDetalleConfig}
            onBack={() => {
              setCitaDetalleConfig(null);
              setActiveSection("appointments");
            }}
          />
        ) : (
          <Appointments
            onViewCitaDetalle={(cita) => {
              setCitaDetalleConfig({ cita });
              setActiveSection("cita-detalle");
            }}
          />
        );
      case "messages":
        return (
          <Messages
            initialChatToSelect={chatToSelectFromNotification}
            onInitialChatApplied={() => setChatToSelectFromNotification(null)}
          />
        );
      case "followups":
        return (
          <Followups
            targetStudentId={targetStudentId}
            listRefreshKey={followupsListKey}
            onOpenCreateManual={handleOpenFollowupCreateManual}
          />
        );
      case "followups-create":
        return followupCreateConfig ? (
          <FollowupCreatePage
            config={followupCreateConfig}
            onBack={closeFollowupCreate}
            onSuccess={handleFollowupCreateSuccess}
          />
        ) : (
          <Followups
            targetStudentId={targetStudentId}
            listRefreshKey={followupsListKey}
            onOpenCreateManual={handleOpenFollowupCreateManual}
          />
        );
      case "students":
        return (
          <Students
            onViewFollowup={handleViewFollowup}
            onNavigateCreateSeguimiento={handleNavigateCreateSeguimiento}
          />
        );
      case "cards-info":
        return (
          <CardsInfoManager
            onViewCard={handleViewCard}
            onOpenCreate={handleOpenCardsInfoCreate}
            listRefreshKey={cardsInfoListKey}
          />
        );
      case "cards-info-detail":
        return selectedCardId != null ? (
          <CardInfoDetailPage
            cardId={selectedCardId}
            onBack={handleCardsInfoBack}
            onDeleted={handleCardsInfoDeleted}
            onSaved={handleCardsInfoSaved}
          />
        ) : (
          <CardsInfoManager
            onViewCard={handleViewCard}
            onOpenCreate={handleOpenCardsInfoCreate}
            listRefreshKey={cardsInfoListKey}
          />
        );
      case "cards-info-create":
        return (
          <CardInfoCreatePage
            onBack={handleCardsInfoBack}
            onSuccess={handleCardsInfoCreateSuccess}
          />
        );
      case "about":
        return <About />;
      case "settings":
        return (
          <Settings
            onEditProfile={() => setActiveSection("profile-edit")}
            showSavedToast={profileSavedToast}
            onDismissSavedToast={() => setProfileSavedToast(false)}
          />
        );
      case "profile-edit":
        return (
          <ProfileEditPage
            onBack={(showSaved) => {
              setActiveSection("settings");
              if (showSaved) setProfileSavedToast(true);
            }}
          />
        );
      default:
        return <Dashboard />;
    }
  };

  const logoutOverlay = isLoggingOut && createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/95 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-6 min-w-[280px]">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-purple-200 dark:border-purple-500/50 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">Cerrando sesión</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Un momento, por favor...</p>
        </div>
        <div className="w-full h-2 rounded-full bg-purple-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-75 ease-out"
            style={{ width: `${logoutProgress}%` }}
          />
        </div>
      </div>
    </div>,
    document.body
  );

  return (
    <ThemeProvider>
      <PsychologistProvider>
        <NotificationsProvider>
        <div
          className={`flex bg-gradient-to-br from-slate-100 via-blue-100/60 to-purple-100/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative ${
            activeSection === 'messages' ? 'h-screen overflow-hidden' : 'min-h-screen'
          }`}
        >
        {logoutOverlay}
        <Sidebar
          activeSection={
            activeSection === "cita-detalle"
              ? "appointments"
              : activeSection === "cards-info-detail" || activeSection === "cards-info-create"
              ? "cards-info"
              : activeSection
          }
          onSectionChange={(section) => {
            if (section !== "followups-create") setFollowupCreateConfig(null);
            if (section === "appointments") setCitaDetalleConfig(null);
            if (section !== "cards-info" && section !== "cards-info-detail" && section !== "cards-info-create") {
              setSelectedCardId(null);
            }
            setActiveSection(section);
          }}
          onLogout={handleLogout}
          onNotificationChatClick={(appointmentId) => {
            if (appointmentId != null) setChatToSelectFromNotification(appointmentId);
          }}
        />

        <main
          className={`flex-1 ml-64 min-w-0 ${activeSection === 'messages' ? 'p-4 flex flex-col h-screen overflow-hidden min-h-0' : 'p-8'}`}
        >
          <div
            className={activeSection === 'messages' ? 'flex-1 min-h-0 flex flex-col min-w-0 overflow-hidden' : 'max-w-7xl mx-auto'}
          >
            {renderSection()}
          </div>
        </main>

      </div>
        </NotificationsProvider>
      </PsychologistProvider>
    </ThemeProvider>
  );
}