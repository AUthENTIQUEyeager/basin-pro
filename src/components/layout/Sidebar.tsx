import { useAppStore, useAuthStore, useNavStore } from '../../stores/appStore';
import type { Page } from '../../types';

interface NavItem {
  id: Page;
  label: string;
  icon: string;
  rolesAutorise: string[];
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Tableau de bord', icon: 'ti-layout-dashboard', rolesAutorise: ['manager', 'caissier'] },
  { id: 'vente', label: 'Nouvelle vente', icon: 'ti-shopping-cart', rolesAutorise: ['manager', 'caissier'] },
  { id: 'stock', label: 'Stock', icon: 'ti-package', rolesAutorise: ['manager', 'caissier'] },
  { id: 'historique', label: 'Historique', icon: 'ti-receipt', rolesAutorise: ['manager', 'caissier'] },
  { id: 'clients', label: 'Clients', icon: 'ti-users', rolesAutorise: ['manager'] },
  { id: 'rapports', label: 'Rapports', icon: 'ti-chart-bar', rolesAutorise: ['manager'] },
  { id: 'depenses', label: 'Dépenses', icon: 'ti-wallet', rolesAutorise: ['manager'] },
];

const SETTINGS_ITEMS: NavItem[] = [
  { id: 'parametres', label: 'Paramètres', icon: 'ti-settings', rolesAutorise: ['manager'] },
  { id: 'utilisateurs', label: 'Utilisateurs', icon: 'ti-users-group', rolesAutorise: ['manager'] },
  { id: 'sync', label: 'Synchronisation', icon: 'ti-cloud-upload', rolesAutorise: ['manager'] },
  { id: 'sauvegarde', label: 'Sauvegarde', icon: 'ti-database', rolesAutorise: ['manager'] },
];

export function Sidebar() {
  const { page, navigate } = useNavStore();
  const { user, logout } = useAuthStore();
  const { tissus, syncState } = useAppStore();

  const alertesCount = tissus.filter(t => t.statut === 'bas' || t.statut === 'epuise').length;

  function NavButton({ item }: { item: NavItem }) {
    if (!item.rolesAutorise.includes(user?.role || '')) return null;
    const isActive = page === item.id;
    return (
      <button
        onClick={() => navigate(item.id)}
        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all text-left ${
          isActive
            ? 'bg-[#F5EDE4] text-[#7C5C3E] font-medium'
            : 'text-[#5A5854] hover:bg-[#F9F9F8] hover:text-[#141412]'
        }`}
      >
        <i className={`ti ${item.icon} text-base`} aria-hidden="true" />
        <span className="flex-1">{item.label}</span>
        {item.id === 'stock' && alertesCount > 0 && (
          <span className="text-[10px] font-medium bg-[#FDF0EE] text-[#C0392B] px-1.5 py-0.5 rounded-full">
            {alertesCount}
          </span>
        )}
        {item.id === 'sync' && syncState.pending_count > 0 && (
          <span className="text-[10px] font-medium bg-[#FEF3CD] text-[#B45309] px-1.5 py-0.5 rounded-full">
            {syncState.pending_count}
          </span>
        )}
      </button>
    );
  }

  return (
    <aside className="w-[220px] min-w-[220px] bg-white border-r border-[#E4E2DE] flex flex-col py-5 h-screen">
      {/* Brand */}
      <div className="px-4 pb-4 border-b border-[#F0EFED] mb-3">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="w-2 h-2 rounded-full bg-[#7C5C3E] inline-block" />
          <span className="text-[15px] font-semibold text-[#141412] tracking-tight">BazinPro</span>
        </div>
        <p className="text-[11px] text-[#9E9C97] pl-4 truncate">{useAppStore.getState().boutique.nom}</p>
      </div>

      {/* Nav principal */}
      <nav className="flex-1 px-2.5 overflow-y-auto">
        <p className="text-[10px] font-medium text-[#9E9C97] uppercase tracking-[0.7px] px-2 pt-2 pb-1.5">Principal</p>
        <div className="space-y-0.5">
          {NAV_ITEMS.map(item => <NavButton key={item.id} item={item} />)}
        </div>

        {user?.role === 'manager' && (
          <>
            <p className="text-[10px] font-medium text-[#9E9C97] uppercase tracking-[0.7px] px-2 pt-4 pb-1.5">Système</p>
            <div className="space-y-0.5">
              {SETTINGS_ITEMS.map(item => <NavButton key={item.id} item={item} />)}
            </div>
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="px-2.5 pt-3 border-t border-[#F0EFED] mt-2">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-[#F9F9F8] cursor-pointer group">
          <div className="w-7 h-7 rounded-full bg-[#F5EDE4] flex items-center justify-center text-[11px] font-semibold text-[#7C5C3E] shrink-0">
            {user?.prenom?.[0]}{user?.nom?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-[#141412] truncate">{user?.prenom} {user?.nom}</p>
            <p className="text-[11px] text-[#9E9C97] capitalize">{user?.role}</p>
          </div>
          <button
            onClick={logout}
            title="Déconnexion"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <i className="ti ti-logout text-[#9E9C97] text-sm" aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  );
}
