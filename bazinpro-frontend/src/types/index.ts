// ─── Auth ─────────────────────────────────────────────────────────────────────
export type Role = 'manager' | 'caissier';

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: Role;
  actif: boolean;
  boutique_id: string;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// ─── Boutique ─────────────────────────────────────────────────────────────────
export interface Boutique {
  id: string;
  nom: string;
  adresse: string;
  telephone: string;
  logo_url?: string;
  abonnement_statut: 'actif' | 'suspendu' | 'expire';
  abonnement_fin: string;
}

// ─── Paramètres ───────────────────────────────────────────────────────────────
export interface Qualite {
  id: string;
  nom: string;
  boutique_id: string;
  created_at: string;
}

export interface Couleur {
  id: string;
  nom: string;
  hex: string;
  boutique_id: string;
  created_at: string;
}

// ─── Stock ────────────────────────────────────────────────────────────────────
export type StatutStock = 'disponible' | 'bas' | 'epuise';

export interface Tissu {
  id: string;
  code: string; // ex: GTZ-001
  qualite_id: string;
  qualite_nom: string;
  couleur_id: string;
  couleur_nom: string;
  couleur_hex: string;
  metrage_disponible: number;
  metrage_alerte: number;
  prix_achat?: number;
  prix_vente: number;
  emplacement?: string;
  observation?: string;
  qr_code: string;
  boutique_id: string;
  created_at: string;
  updated_at: string;
  statut: StatutStock;
}

export interface MouvementStock {
  id: string;
  tissu_id: string;
  type: 'entree' | 'sortie' | 'correction';
  quantite: number;
  motif: string;
  user_id: string;
  created_at: string;
}

// ─── Client ───────────────────────────────────────────────────────────────────
export interface Client {
  id: string;
  nom: string;
  prenom: string;
  telephone?: string;
  boutique_id: string;
  total_achats: number;
  nb_achats: number;
  derniere_visite?: string;
  created_at: string;
}

// ─── Vente ────────────────────────────────────────────────────────────────────
export type ModePaiement = 'especes' | 'orange_money' | 'wave' | 'moov_money';
export type StatutVente = 'validee' | 'annulee' | 'retour';

export interface LigneVente {
  tissu_id: string;
  tissu_code: string;
  qualite_nom: string;
  couleur_nom: string;
  metrage: number;
  prix_unitaire: number;
  montant: number;
}

export interface Vente {
  id: string;
  numero: string; // V-2406-001
  boutique_id: string;
  caissier_id: string;
  caissier_nom: string;
  client_id?: string;
  client_nom?: string;
  client_prenom?: string;
  client_telephone?: string;
  lignes: LigneVente[];
  montant_total: number;
  mode_paiement: ModePaiement;
  statut: StatutVente;
  motif_annulation?: string;
  created_at: string;
  synced: boolean;
}

// ─── Dépense ──────────────────────────────────────────────────────────────────
export interface Depense {
  id: string;
  boutique_id: string;
  categorie: string;
  montant: number;
  date: string;
  observation?: string;
  user_id: string;
  created_at: string;
  synced: boolean;
}

// ─── Rapport ──────────────────────────────────────────────────────────────────
export interface StatJour {
  date: string;
  ca: number;
  nb_ventes: number;
  nb_clients: number;
  depenses: number;
  benefice: number;
}

export interface ProduitTop {
  tissu_code: string;
  qualite_nom: string;
  couleur_nom: string;
  total_vendu: number;
  ca_genere: number;
}

// ─── Sync ─────────────────────────────────────────────────────────────────────
export type SyncStatut = 'synced' | 'pending' | 'error' | 'offline';

export interface SyncState {
  statut: SyncStatut;
  derniere_sync?: string;
  pending_count: number;
  erreur?: string;
}

// ─── UI ───────────────────────────────────────────────────────────────────────
export interface NavItem {
  id: string;
  label: string;
  icon: string;
  page: string;
  badge?: number;
  rolesAutorise: Role[];
}

export type Page =
  | 'dashboard'
  | 'vente'
  | 'stock'
  | 'historique'
  | 'clients'
  | 'rapports'
  | 'depenses'
  | 'parametres'
  | 'utilisateurs'
  | 'sync'
  | 'sauvegarde';
