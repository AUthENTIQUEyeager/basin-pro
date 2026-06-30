import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Page, SyncState, Vente, Tissu, Client, Depense, Qualite, Couleur, Boutique } from '../types';
import { api } from '../lib/api';

// ─── Auth Store ───────────────────────────────────────────────────────────────
interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          const res: any = await api.post('/auth/login', { email, password });
          localStorage.removeItem('bazinpro-data');
          set({ user: res.user, token: res.access_token, isAuthenticated: true });
          return true;
        } catch {
          return false;
        }
      },

      logout: () => {
        localStorage.removeItem('bazinpro-data');
        set({ user: null, token: null, isAuthenticated: false });
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
  loading: boolean;

  // Fetch depuis l'API
  fetchAll: () => Promise<void>;
  fetchTissus: () => Promise<void>;
  fetchVentes: () => Promise<void>;
  fetchClients: () => Promise<void>;
  fetchDepenses: () => Promise<void>;
  fetchParametres: () => Promise<void>;

  // Actions
  addTissu: (dto: any) => Promise<void>;
  updateTissu: (id: string, updates: Partial<Tissu>) => Promise<void>;
  addVente: (dto: any) => Promise<void>;
  annulerVente: (id: string, motif: string) => Promise<void>;
  addDepense: (dto: any) => Promise<void>;
  addQualite: (nom: string) => Promise<void>;
  addCouleur: (nom: string, hex: string) => Promise<void>;
  triggerSync: () => Promise<void>;
  setSyncState: (state: Partial<SyncState>) => void;
}

const DEFAULT_BOUTIQUE: Boutique = {
  id: '', nom: 'Ma Boutique', adresse: '', telephone: '',
  abonnement_statut: 'actif', abonnement_fin: '2026-12-31',
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
      loading: false,
      syncState: {
        statut: 'synced',
        derniere_sync: new Date().toISOString(),
        pending_count: 0,
      },

      fetchAll: async () => {
        set({ loading: true });
        await Promise.all([
          get().fetchTissus(),
          get().fetchVentes(),
          get().fetchClients(),
          get().fetchDepenses(),
          get().fetchParametres(),
        ]);
        set({ loading: false });
      },

      fetchTissus: async () => {
        try {
          const tissus: any[] = await api.get('/tissus');
          set({ tissus: tissus.map(t => ({
            id: t.id, code: t.code,
            qualite_id: t.qualiteId, qualite_nom: t.qualite?.nom || '',
            couleur_id: t.couleurId, couleur_nom: t.couleur?.nom || '', couleur_hex: t.couleur?.hex || '#000',
            metrage_disponible: Number(t.metrageDisponible),
            metrage_alerte: Number(t.metrageAlerte),
            prix_achat: t.prixAchat ? Number(t.prixAchat) : undefined,
            prix_vente: Number(t.prixVente),
            emplacement: t.emplacement, observation: t.observation,
            qr_code: t.qrCode, boutique_id: t.boutiqueId,
            created_at: t.createdAt, updated_at: t.updatedAt,
            statut: t.statut?.toLowerCase() || 'disponible',
          })) });
        } catch (e) { console.error('fetchTissus', e); }
      },

      fetchVentes: async () => {
        try {
          const ventes: any[] = await api.get('/ventes');
          set({ ventes: ventes.map(v => ({
            id: v.id, numero: v.numero, boutique_id: v.boutiqueId,
            caissier_id: v.caissierIdRef, caissier_nom: `${v.caissier?.prenom || ''} ${v.caissier?.nom || ''}`.trim(),
            client_id: v.clientId, client_nom: v.clientNom, client_prenom: v.clientPrenom,
            client_telephone: v.clientTelephone,
            lignes: (v.lignes || []).map((l: any) => ({
              tissu_id: l.tissuId, tissu_code: l.tissuCode,
              qualite_nom: l.qualiteNom, couleur_nom: l.couleurNom,
              metrage: Number(l.metrage), prix_unitaire: Number(l.prixUnitaire), montant: Number(l.montant),
            })),
            montant_total: Number(v.montantTotal),
            mode_paiement: v.modePaiement?.toLowerCase() || 'especes',
            statut: v.statut?.toLowerCase() || 'validee',
            motif_annulation: v.motifAnnulation,
            created_at: v.createdAt, synced: true,
          })) });
        } catch (e) { console.error('fetchVentes', e); }
      },

      fetchClients: async () => {
        try {
          const clients: any[] = await api.get('/clients');
          set({ clients: clients.map(c => ({
            id: c.id, nom: c.nom, prenom: c.prenom, telephone: c.telephone,
            boutique_id: c.boutiqueId, total_achats: Number(c.totalAchats),
            nb_achats: c.nbAchats, derniere_visite: c.derniereVisite, created_at: c.createdAt,
          })) });
        } catch (e) { console.error('fetchClients', e); }
      },

      fetchDepenses: async () => {
        try {
          const depenses: any[] = await api.get('/depenses');
          set({ depenses: depenses.map(d => ({
            id: d.id, boutique_id: d.boutiqueId, categorie: d.categorie,
            montant: Number(d.montant), date: d.date?.slice(0, 10),
            observation: d.observation, user_id: d.userId,
            created_at: d.createdAt, synced: true,
          })) });
        } catch (e) { console.error('fetchDepenses', e); }
      },

      fetchParametres: async () => {
        try {
          const [qualites, couleurs, boutique]: any[] = await Promise.all([
            api.get('/boutiques/qualites'),
            api.get('/boutiques/couleurs'),
            api.get('/boutiques/me'),
          ]);
          set({
            qualites: qualites.map((q: any) => ({ id: q.id, nom: q.nom, boutique_id: q.boutiqueId, created_at: q.createdAt })),
            couleurs: couleurs.map((c: any) => ({ id: c.id, nom: c.nom, hex: c.hex, boutique_id: c.boutiqueId, created_at: c.createdAt })),
            boutique: {
              id: boutique.id, nom: boutique.nom, adresse: boutique.adresse || '',
              telephone: boutique.telephone || '',
              abonnement_statut: boutique.abonnementStatut?.toLowerCase() || 'actif',
              abonnement_fin: boutique.abonnementFin,
            },
          });
        } catch (e) { console.error('fetchParametres', e); }
      },

      addTissu: async (dto) => {
        await api.post('/tissus', dto);
        await get().fetchTissus();
      },

      updateTissu: async (id, updates) => {
        if (updates.metrage_disponible !== undefined) {
          await api.patch(`/tissus/${id}/metrage`, { metrage: updates.metrage_disponible });
        }
        await get().fetchTissus();
      },

      addVente: async (dto) => {
        await api.post('/ventes', dto);
        await Promise.all([get().fetchVentes(), get().fetchTissus(), get().fetchClients()]);
      },

      annulerVente: async (id, motif) => {
        await api.patch(`/ventes/${id}/annuler`, { motif });
        await get().fetchVentes();
      },

      addDepense: async (dto) => {
        await api.post('/depenses', dto);
        await get().fetchDepenses();
      },

      addQualite: async (nom) => {
        await api.post('/boutiques/qualites', { nom });
        await get().fetchParametres();
      },

      addCouleur: async (nom, hex) => {
        await api.post('/boutiques/couleurs', { nom, hex });
        await get().fetchParametres();
      },

      setSyncState: (state) => set((s) => ({ syncState: { ...s.syncState, ...state } })),

      triggerSync: async () => {
        set((s) => ({ syncState: { ...s.syncState, statut: 'pending' } }));
        await get().fetchAll();
        set((s) => ({ syncState: { ...s.syncState, statut: 'synced', derniere_sync: new Date().toISOString(), pending_count: 0 } }));
      },
    }),
    {
      name: 'bazinpro-data',
      partialize: (s) => ({ boutique: s.boutique, qualites: s.qualites, couleurs: s.couleurs }),
    }
  )
);
