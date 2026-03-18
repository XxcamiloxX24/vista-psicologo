import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Loader2 } from "lucide-react";
import { Dashboard } from "./components/Dashboard";
import { Appointments } from "./components/Appointments";
import { Messages } from "./components/Messages";
import { Followups } from "./components/Followups";
import { Students } from "./components/Students";
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
  | "messages"
  | "followups"
  | "students"
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
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutProgress, setLogoutProgress] = useState(0);
  const [profileSavedToast, setProfileSavedToast] = useState(false);

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
    setTargetStudentId(studentId);
    setActiveSection("followups");
  };

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
        return <Appointments />;
      case "messages":
        return <Messages />;
      case "followups":
        return <Followups targetStudentId={targetStudentId} />;
      case "students":
        return <Students onViewFollowup={handleViewFollowup} />;
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
        <div className="flex min-h-screen bg-gradient-to-br from-slate-100 via-blue-100/60 to-purple-100/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative">
        {logoutOverlay}
        <Sidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onLogout={handleLogout}
        />

        <main className={`flex-1 ml-64 ${activeSection === 'messages' ? 'p-4 flex flex-col h-screen overflow-hidden min-h-0' : 'p-8'}`}>
          <div className={activeSection === 'messages' ? 'flex-1 min-h-0 flex flex-col' : 'max-w-7xl mx-auto'}>
            {renderSection()}
          </div>
        </main>

      </div>
        </NotificationsProvider>
      </PsychologistProvider>
    </ThemeProvider>
  );
}