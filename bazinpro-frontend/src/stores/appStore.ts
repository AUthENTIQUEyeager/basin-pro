import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Page, SyncState, Vente, Tissu, Client, Depense, Qualite, Couleur, Boutique } from '../types';

// ─── Auth Store ───────────────────────────────────────────────────────────────
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (email: string, _password: string) => {
        await new Promise(r => setTimeout(r, 800));
        const user: User = {
          id: 'usr-' + Date.now(),
          nom: '',
          prenom: email.split('@')[0],
          email,
          role: 'manager',
          actif: true,
          boutique_id: 'btq-' + Date.now(),
          created_at: new Date().toISOString(),
        };
        // Vider les données de l'ancien compte
        localStorage.removeItem('bazinpro-data');
        set({ user, isAuthenticated: true });
        return true;
      },
      logout: () => {
        localStorage.removeItem('bazinpro-data');
        set({ user: null, isAuthenticated: false });
      },
    }),
    { name: 'bazinpro-auth' }
  )
);

// ─── Navigation Store ─────────────────────────────────────────────────────────
interface NavStore {
  page: Page;
  navigate: (page: Page) => void;
}

export const useNavStore = create<NavStore>((set) => ({
  page: 'dashboard',
  navigate: (page) => set({ page }),
}));

// ─── App Data Store ───────────────────────────────────────────────────────────
interface AppStore {
  boutique: Boutique;
  qualites: Qualite[];
  couleurs: Couleur[];
  tissus: Tissu[];
  ventes: Vente[];
  clients: Client[];
  depenses: Depense[];
  syncState: SyncState;

  addTissu: (tissu: Tissu) => void;
  updateTissu: (id: string, updates: Partial<Tissu>) => void;
  addVente: (vente: Vente) => void;
  annulerVente: (id: string, motif: string) => void;
  addClient: (client: Client) => void;
  addDepense: (depense: Depense) => void;
  setSyncState: (state: Partial<SyncState>) => void;
  triggerSync: () => Promise<void>;
  addQualite: (nom: string) => void;
  addCouleur: (nom: string, hex: string) => void;
  updateBoutique: (updates: Partial<Boutique>) => void;
}

const DEFAULT_BOUTIQUE: Boutique = {
  id: 'btq-001',
  nom: 'Ma Boutique',
  adresse: '',
  telephone: '',
  abonnement_statut: 'actif',
  abonnement_fin: '2026-12-31',
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      boutique: DEFAULT_BOUTIQUE,
      qualites: [],
      couleurs: [],
      tissus: [],
      ventes: [],
      clients: [],
      depenses: [],
      syncState: {
        statut: 'synced',
        derniere_sync: new Date().toISOString(),
        pending_count: 0,
      },

      addTissu: (tissu) => set((s) => ({ tissus: [tissu, ...s.tissus] })),

      updateTissu: (id, updates) =>
        set((s) => ({
          tissus: s.tissus.map((t) => t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t),
        })),

      addVente: (vente) => {
        const s = get();
        const newTissus = s.tissus.map((t) => {
          const ligne = vente.lignes.find((l) => l.tissu_id === t.id);
          if (!ligne) return t;
          const nouveau = t.metrage_disponible - ligne.metrage;
          const statut = nouveau <= 0 ? 'epuise' : nouveau <= t.metrage_alerte ? 'bas' : 'disponible';
          return { ...t, metrage_disponible: Math.max(0, nouveau), statut, updated_at: new Date().toISOString() };
        });

        let newClients = s.clients;
        if (vente.client_nom && vente.client_prenom) {
          const existing = s.clients.find(c => c.nom === vente.client_nom && c.prenom === vente.client_prenom);
          if (existing) {
            newClients = s.clients.map(c => c.id === existing.id
              ? { ...c, total_achats: c.total_achats + vente.montant_total, nb_achats: c.nb_achats + 1, derniere_visite: vente.created_at }
              : c
            );
          } else if (vente.client_id) {
            const newClient: Client = {
              id: vente.client_id, nom: vente.client_nom!, prenom: vente.client_prenom!,
              telephone: vente.client_telephone, boutique_id: vente.boutique_id,
              total_achats: vente.montant_total, nb_achats: 1,
              derniere_visite: vente.created_at, created_at: vente.created_at,
            };
            newClients = [newClient, ...s.clients];
          }
        }
        set({ ventes: [vente, ...s.ventes], tissus: newTissus, clients: newClients });
      },

      annulerVente: (id, motif) =>
        set((s) => ({
          ventes: s.ventes.map((v) => v.id === id ? { ...v, statut: 'annulee' as const, motif_annulation: motif } : v),
        })),

      addClient: (client) => set((s) => ({ clients: [client, ...s.clients] })),

      addDepense: (depense) => set((s) => ({ depenses: [depense, ...s.depenses] })),

      setSyncState: (state) => set((s) => ({ syncState: { ...s.syncState, ...state } })),

      triggerSync: async () => {
        const { setSyncState } = get();
        setSyncState({ statut: 'pending' });
        await new Promise(r => setTimeout(r, 1500));
        setSyncState({ statut: 'synced', derniere_sync: new Date().toISOString(), pending_count: 0 });
      },

      addQualite: (nom) =>
        set((s) => ({
          qualites: [...s.qualites, { id: 'q-' + Date.now(), nom, boutique_id: 'btq-001', created_at: new Date().toISOString() }],
        })),

      addCouleur: (nom, hex) =>
        set((s) => ({
          couleurs: [...s.couleurs, { id: 'c-' + Date.now(), nom, hex, boutique_id: 'btq-001', created_at: new Date().toISOString() }],
        })),

      updateBoutique: (updates) =>
        set((s) => ({ boutique: { ...s.boutique, ...updates } })),
    }),
    { name: 'bazinpro-data' }
  )
);
