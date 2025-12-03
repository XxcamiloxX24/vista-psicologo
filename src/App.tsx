import { useState } from "react";
import { Dashboard } from "./components/Dashboard";
import { Appointments } from "./components/Appointments";
import { Messages } from "./components/Messages";
import { Followups } from "./components/Followups";
import { Students } from "./components/Students";
import { About } from "./components/About";
import { Settings } from "./components/Settings";
import { Sidebar } from "./components/Sidebar";
import { Chatbot } from "./components/Chatbot";

type Section =
  | "dashboard"
  | "appointments"
  | "messages"
  | "followups"
  | "students"
  | "about"
  | "settings";

export default function App() {
  const [activeSection, setActiveSection] =
    useState<Section>("dashboard");
  const [targetStudentId, setTargetStudentId] = useState<string | null>(null);

  const handleViewFollowup = (studentId: string) => {
    setTargetStudentId(studentId);
    setActiveSection("followups");
  };

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
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
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