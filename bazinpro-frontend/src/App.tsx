import { useAuthStore, useNavStore } from './stores/appStore';
import { LoginPage } from './pages/LoginPage';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { DashboardPage } from './pages/DashboardPage';
import { VentePage } from './pages/VentePage';
import { StockPage } from './pages/StockPage';
import { HistoriquePage } from './pages/HistoriquePage';
import { ClientsPage } from './pages/ClientsPage';
import { RapportsPage } from './pages/RapportsPage';
import { DepensesPage } from './pages/DepensesPage';
import { ParametresPage } from './pages/ParametresPage';
import { UtilisateursPage, SyncPage, SauvegardePage } from './pages/SystemPages';

function AppContent() {
  const { page } = useNavStore();
  const pageMap: Record<string, JSX.Element> = {
    dashboard: <DashboardPage />,
    vente: <VentePage />,
    stock: <StockPage />,
    historique: <HistoriquePage />,
    clients: <ClientsPage />,
    rapports: <RapportsPage />,
    depenses: <DepensesPage />,
    parametres: <ParametresPage />,
    utilisateurs: <UtilisateursPage />,
    sync: <SyncPage />,
    sauvegarde: <SauvegardePage />,
  };
  return pageMap[page] || <DashboardPage />;
}

export default function App() {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <LoginPage />;

  return (
    <div className="flex h-screen overflow-hidden bg-[#F9F9F8]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <AppContent />
        </main>
      </div>
    </div>
  );
}
