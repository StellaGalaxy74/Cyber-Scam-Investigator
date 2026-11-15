import { useCallback, useState } from 'react';
import { LayoutShell } from './components/LayoutShell.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { AssistantPage } from './pages/AssistantPage.tsx';
import { AuthPage } from './pages/AuthPage.tsx';
import { ContactInvestigatorPage } from './pages/ContactInvestigatorPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { EducationPage } from './pages/EducationPage.tsx';
import { HistoryPage } from './pages/HistoryPage.tsx';
import { IndiaHelpPage } from './pages/IndiaHelpPage.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import { MessageAnalyzerPage } from './pages/MessageAnalyzerPage.tsx';
import { ScreenshotAnalyzerPage } from './pages/ScreenshotAnalyzerPage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';
import { UrlScannerPage } from './pages/UrlScannerPage.tsx';
import type { InvestigationReport } from './types/investigation.ts';
import type { AppRoute } from './types/navigation.ts';

const PAGE_TITLES: Record<AppRoute, string> = {
  landing: 'Smart Cyber Scam Investigator',
  auth: 'Sign In',
  dashboard: 'Investigation Dashboard',
  message: 'Message Scam Analyzer',
  url: 'URL & Domain Scanner',
  contact: 'Email & Phone Investigator',
  screenshot: 'Screenshot & OCR Analyzer',
  assistant: 'AI Investigation Assistant',
  history: 'Investigation History',
  education: 'Cyber Safety Education Center',
  'india-help': 'India Cybercrime Reporting Guide',
  settings: 'User Profile & Settings',
};

function AppRouter() {
  const [route, setRoute] = useState<AppRoute>('landing');
  const [assistantSeedPrompt, setAssistantSeedPrompt] = useState<string | null>(null);

  const navigate = useCallback((nextRoute: AppRoute) => {
    setRoute(nextRoute);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleAskAssistantWithReport = useCallback((report: InvestigationReport) => {
    setAssistantSeedPrompt(
      `Please explain investigation ${report.investigationCode} (${report.threatCategory}, Risk Score ${report.riskScore}/100 - ${report.threatClassification}) in plain language and tell me what protective steps I should take next.`
    );
    setRoute('assistant');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (route === 'landing') {
    return <LandingPage onNavigate={navigate} />;
  }

  if (route === 'auth') {
    return <AuthPage onNavigate={navigate} />;
  }

  return (
    <LayoutShell
      currentRoute={route}
      onNavigate={navigate}
      pageTitle={PAGE_TITLES[route]}
    >
      {route === 'dashboard' && (
        <DashboardPage
          onNavigate={navigate}
          onAskAssistantWithReport={handleAskAssistantWithReport}
        />
      )}
      {route === 'message' && (
        <MessageAnalyzerPage
          onNavigate={navigate}
          onAskAssistantWithReport={handleAskAssistantWithReport}
        />
      )}
      {route === 'url' && (
        <UrlScannerPage
          onNavigate={navigate}
          onAskAssistantWithReport={handleAskAssistantWithReport}
        />
      )}
      {route === 'contact' && (
        <ContactInvestigatorPage
          onNavigate={navigate}
          onAskAssistantWithReport={handleAskAssistantWithReport}
        />
      )}
      {route === 'screenshot' && (
        <ScreenshotAnalyzerPage
          onNavigate={navigate}
          onAskAssistantWithReport={handleAskAssistantWithReport}
        />
      )}
      {route === 'assistant' && (
        <AssistantPage
          initialPrompt={assistantSeedPrompt}
          onClearInitialPrompt={() => setAssistantSeedPrompt(null)}
        />
      )}
      {route === 'history' && (
        <HistoryPage
          onNavigate={navigate}
          onAskAssistantWithReport={handleAskAssistantWithReport}
        />
      )}
      {route === 'education' && <EducationPage onNavigate={navigate} />}
      {route === 'india-help' && <IndiaHelpPage />}
      {route === 'settings' && <SettingsPage />}
    </LayoutShell>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
