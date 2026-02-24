import { useState, useEffect } from "react";
import { Dashboard } from "./components/Dashboard";
import { Appointments } from "./components/Appointments";
import { Messages } from "./components/Messages";
import { Followups } from "./components/Followups";
import { Students } from "./components/Students";
import { About } from "./components/About";
import { Settings } from "./components/Settings";
import { Sidebar } from "./components/Sidebar";
import { Chatbot } from "./components/Chatbot";
import { Login } from "./components/Login";
import { TermsAndPrivacy } from "./components/TermsAndPrivacy";
import { isAuthenticated as checkAuth } from "./lib/auth";

type Section =
  | "dashboard"
  | "appointments"
  | "messages"
  | "followups"
  | "students"
  | "about"
  | "settings";

type AuthView = "login" | "terms" | "app";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(checkAuth());
  const [authView, setAuthView] = useState<AuthView>("login");

  useEffect(() => {
    setIsAuthenticated(checkAuth());
  }, []);
  const [activeSection, setActiveSection] =
    useState<Section>("dashboard");
  const [targetStudentId, setTargetStudentId] = useState<string | null>(null);

  const handleViewFollowup = (studentId: string) => {
    setTargetStudentId(studentId);
    setActiveSection("followups");
  };

  // Pantalla de login o términos (no autenticado)
  if (!isAuthenticated) {
    if (authView === "terms") {
      return <TermsAndPrivacy onBack={() => setAuthView("login")} />;
    }
    return (
      <Login
        onLogin={() => setIsAuthenticated(true)}
        onViewTerms={() => setAuthView("terms")}
      />
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
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-100 via-blue-100/60 to-purple-100/50">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {renderSection()}
        </div>
      </main>

      <Chatbot />
    </div>
  );
}