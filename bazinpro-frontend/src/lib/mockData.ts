import type { User, Boutique, Tissu, Vente, Client, Depense, Qualite, Couleur, StatJour, ProduitTop } from '../types';

export const MOCK_USER: User = {
  id: 'usr-001',
  nom: '',
  prenom: '',
  email: '',
  role: 'manager',
  actif: true,
  boutique_id: 'btq-001',
  created_at: new Date().toISOString(),
};

export const MOCK_BOUTIQUE: Boutique = {
  id: 'btq-001',
  nom: 'Ma Boutique',
  adresse: '',
  telephone: '',
  abonnement_statut: 'actif',
  abonnement_fin: '2025-12-31',
};

export const MOCK_QUALITES: Qualite[] = [];
export const MOCK_COULEURS: Couleur[] = [];
export const MOCK_TISSUS: Tissu[] = [];
export const MOCK_VENTES: Vente[] = [];
export const MOCK_CLIENTS: Client[] = [];
export const MOCK_DEPENSES: Depense[] = [];
export const MOCK_STATS_SEMAINE: StatJour[] = [];
export const MOCK_TOP_PRODUITS: ProduitTop[] = [];
