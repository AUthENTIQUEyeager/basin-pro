import { useNavStore, useAppStore } from '../../stores/appStore';
import type { Page } from '../../types';

const PAGE_TITLES: Record<Page, string> = {
  dashboard: 'Tableau de bord',
  vente: 'Nouvelle vente',
  stock: 'Stock',
  historique: 'Historique des ventes',
  clients: 'Clients',
  rapports: 'Rapports',
  depenses: 'Dépenses',
  parametres: 'Paramètres',
  utilisateurs: 'Utilisateurs',
  sync: 'Synchronisation',
  sauvegarde: 'Sauvegarde',
};

export function Topbar() {
  const { page, navigate } = useNavStore();
  const { syncState, triggerSync } = useAppStore();

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <header className="h-[52px] bg-white border-b border-[#E4E2DE] flex items-center px-6 gap-4 shrink-0">
      <div className="flex items-center gap-2">
        <h1 className="text-[14px] font-medium text-[#141412]">{PAGE_TITLES[page]}</h1>
        <span className="text-[12.5px] text-[#9E9C97] capitalize">{today}</span>
      </div>

      <div className="ml-auto flex items-center gap-2.5">
        {/* Sync indicator */}
        <button
          onClick={triggerSync}
          title="Synchroniser maintenant"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all ${
            syncState.statut === 'synced'
              ? 'bg-[#EDFAF3] text-[#1A7A4A] border-[#C6EFDC]'
              : syncState.statut === 'pending'
              ? 'bg-[#FEF3CD] text-[#B45309] border-[#F5D37A]'
              : 'bg-[#FDF0EE] text-[#C0392B] border-[#F5C4B3]'
          }`}
        >
          <i
            className={`ti text-sm ${
              syncState.statut === 'pending' ? 'ti-loader-2 animate-spin' : 'ti-circle-check'
            }`}
            aria-hidden="true"
          />
          {syncState.statut === 'synced' && 'Synchronisé'}
          {syncState.statut === 'pending' && 'Sync en cours…'}
          {syncState.statut === 'error' && 'Erreur sync'}
          {syncState.statut === 'offline' && 'Hors ligne'}
        </button>

        <button
          onClick={() => navigate('vente')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#7C5C3E] text-white rounded-lg text-[13px] font-medium hover:bg-[#6A4E34] transition-colors"
        >
          <i className="ti ti-plus text-sm" aria-hidden="true" />
          Nouvelle vente
        </button>
      </div>
    </header>
  );
}
