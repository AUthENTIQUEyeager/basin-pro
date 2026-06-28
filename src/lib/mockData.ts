import type { User, Boutique, Tissu, Vente, Client, Depense, Qualite, Couleur, StatJour, ProduitTop } from '../types';

export const MOCK_USER: User = {
  id: 'usr-001',
  nom: 'Maïga',
  prenom: 'Amadou',
  email: 'amadou@al-baraka.bf',
  role: 'manager',
  actif: true,
  boutique_id: 'btq-001',
  created_at: '2024-01-15T08:00:00Z',
};

export const MOCK_BOUTIQUE: Boutique = {
  id: 'btq-001',
  nom: 'Boutique Al-Baraka',
  adresse: 'Secteur 22, Bobo-Dioulasso',
  telephone: '+226 70 12 34 56',
  abonnement_statut: 'actif',
  abonnement_fin: '2025-12-31',
};

export const MOCK_QUALITES: Qualite[] = [
  { id: 'q-1', nom: 'Getzner', boutique_id: 'btq-001', created_at: '2024-01-01T00:00:00Z' },
  { id: 'q-2', nom: 'Rich Brocade', boutique_id: 'btq-001', created_at: '2024-01-01T00:00:00Z' },
  { id: 'q-3', nom: 'Super Basin', boutique_id: 'btq-001', created_at: '2024-01-01T00:00:00Z' },
  { id: 'q-4', nom: 'Bazin Riche', boutique_id: 'btq-001', created_at: '2024-01-01T00:00:00Z' },
];

export const MOCK_COULEURS: Couleur[] = [
  { id: 'c-1', nom: 'Bleu Royal', hex: '#2557D6', boutique_id: 'btq-001', created_at: '2024-01-01T00:00:00Z' },
  { id: 'c-2', nom: 'Rose', hex: '#E91E8C', boutique_id: 'btq-001', created_at: '2024-01-01T00:00:00Z' },
  { id: 'c-3', nom: 'Or', hex: '#D4AF37', boutique_id: 'btq-001', created_at: '2024-01-01T00:00:00Z' },
  { id: 'c-4', nom: 'Blanc', hex: '#F5F5F0', boutique_id: 'btq-001', created_at: '2024-01-01T00:00:00Z' },
  { id: 'c-5', nom: 'Noir', hex: '#1A1A1A', boutique_id: 'btq-001', created_at: '2024-01-01T00:00:00Z' },
  { id: 'c-6', nom: 'Vert Émeraude', hex: '#1B6B3A', boutique_id: 'btq-001', created_at: '2024-01-01T00:00:00Z' },
  { id: 'c-7', nom: 'Rouge', hex: '#C0392B', boutique_id: 'btq-001', created_at: '2024-01-01T00:00:00Z' },
];

export const MOCK_TISSUS: Tissu[] = [
  {
    id: 't-001', code: 'GTZ-001', qualite_id: 'q-1', qualite_nom: 'Getzner',
    couleur_id: 'c-1', couleur_nom: 'Bleu Royal', couleur_hex: '#2557D6',
    metrage_disponible: 2.5, metrage_alerte: 5, prix_achat: 18000, prix_vente: 25000,
    emplacement: 'Rayon A - Étagère 1', qr_code: 'QR-GTZ-001',
    boutique_id: 'btq-001', created_at: '2024-03-01T08:00:00Z', updated_at: '2024-06-20T14:00:00Z', statut: 'bas',
  },
  {
    id: 't-002', code: 'GTZ-007', qualite_id: 'q-1', qualite_nom: 'Getzner',
    couleur_id: 'c-2', couleur_nom: 'Rose', couleur_hex: '#E91E8C',
    metrage_disponible: 18, metrage_alerte: 5, prix_achat: 18000, prix_vente: 25000,
    emplacement: 'Rayon A - Étagère 2', qr_code: 'QR-GTZ-007',
    boutique_id: 'btq-001', created_at: '2024-03-01T08:00:00Z', updated_at: '2024-06-22T10:00:00Z', statut: 'disponible',
  },
  {
    id: 't-003', code: 'GTZ-002', qualite_id: 'q-1', qualite_nom: 'Getzner',
    couleur_id: 'c-4', couleur_nom: 'Blanc', couleur_hex: '#F5F5F0',
    metrage_disponible: 24, metrage_alerte: 5, prix_vente: 25000,
    emplacement: 'Rayon A - Étagère 1', qr_code: 'QR-GTZ-002',
    boutique_id: 'btq-001', created_at: '2024-04-01T08:00:00Z', updated_at: '2024-06-25T09:00:00Z', statut: 'disponible',
  },
  {
    id: 't-004', code: 'RB-011', qualite_id: 'q-2', qualite_nom: 'Rich Brocade',
    couleur_id: 'c-3', couleur_nom: 'Or', couleur_hex: '#D4AF37',
    metrage_disponible: 12, metrage_alerte: 4, prix_achat: 20000, prix_vente: 28000,
    emplacement: 'Rayon B', qr_code: 'QR-RB-011',
    boutique_id: 'btq-001', created_at: '2024-02-15T08:00:00Z', updated_at: '2024-06-23T11:00:00Z', statut: 'disponible',
  },
  {
    id: 't-005', code: 'RB-014', qualite_id: 'q-2', qualite_nom: 'Rich Brocade',
    couleur_id: 'c-4', couleur_nom: 'Blanc', couleur_hex: '#F5F5F0',
    metrage_disponible: 5, metrage_alerte: 4, prix_vente: 28000,
    emplacement: 'Rayon B', qr_code: 'QR-RB-014',
    boutique_id: 'btq-001', created_at: '2024-02-15T08:00:00Z', updated_at: '2024-06-27T16:00:00Z', statut: 'bas',
  },
  {
    id: 't-006', code: 'SB-003', qualite_id: 'q-3', qualite_nom: 'Super Basin',
    couleur_id: 'c-1', couleur_nom: 'Bleu', couleur_hex: '#1565C0',
    metrage_disponible: 45, metrage_alerte: 10, prix_achat: 5000, prix_vente: 8500,
    emplacement: 'Rayon C', qr_code: 'QR-SB-003',
    boutique_id: 'btq-001', created_at: '2024-01-20T08:00:00Z', updated_at: '2024-06-28T08:00:00Z', statut: 'disponible',
  },
  {
    id: 't-007', code: 'SB-022', qualite_id: 'q-3', qualite_nom: 'Super Basin',
    couleur_id: 'c-6', couleur_nom: 'Vert Émeraude', couleur_hex: '#1B6B3A',
    metrage_disponible: 1, metrage_alerte: 5, prix_vente: 8500,
    emplacement: 'Rayon C', qr_code: 'QR-SB-022',
    boutique_id: 'btq-001', created_at: '2024-01-20T08:00:00Z', updated_at: '2024-06-26T15:00:00Z', statut: 'bas',
  },
  {
    id: 't-008', code: 'BZR-001', qualite_id: 'q-4', qualite_nom: 'Bazin Riche',
    couleur_id: 'c-7', couleur_nom: 'Rouge', couleur_hex: '#C0392B',
    metrage_disponible: 30, metrage_alerte: 8, prix_vente: 35000,
    emplacement: 'Rayon D - Vitrine', qr_code: 'QR-BZR-001',
    boutique_id: 'btq-001', created_at: '2024-05-10T08:00:00Z', updated_at: '2024-06-28T07:00:00Z', statut: 'disponible',
  },
];

export const MOCK_CLIENTS: Client[] = [
  { id: 'cl-001', nom: 'Koné', prenom: 'Fatoumata', telephone: '+226 76 11 22 33', boutique_id: 'btq-001', total_achats: 580000, nb_achats: 7, derniere_visite: '2024-06-28T14:32:00Z', created_at: '2024-02-10T08:00:00Z' },
  { id: 'cl-002', nom: 'Sawadogo', prenom: 'Ibrahima', telephone: '+226 70 99 88 77', boutique_id: 'btq-001', total_achats: 340000, nb_achats: 4, derniere_visite: '2024-06-28T13:15:00Z', created_at: '2024-03-05T08:00:00Z' },
  { id: 'cl-003', nom: 'Traoré', prenom: 'Mariam', telephone: '+226 65 44 33 22', boutique_id: 'btq-001', total_achats: 920000, nb_achats: 12, derniere_visite: '2024-06-25T10:05:00Z', created_at: '2024-01-20T08:00:00Z' },
  { id: 'cl-004', nom: 'Ouédraogo', prenom: 'Salif', telephone: '+226 71 22 33 44', boutique_id: 'btq-001', total_achats: 175000, nb_achats: 2, derniere_visite: '2024-06-20T11:00:00Z', created_at: '2024-05-15T08:00:00Z' },
  { id: 'cl-005', nom: 'Diallo', prenom: 'Aïssata', boutique_id: 'btq-001', total_achats: 690000, nb_achats: 9, derniere_visite: '2024-06-27T16:30:00Z', created_at: '2024-02-28T08:00:00Z' },
];

export const MOCK_VENTES: Vente[] = [
  {
    id: 'v-014', numero: 'V-2406-014', boutique_id: 'btq-001',
    caissier_id: 'usr-001', caissier_nom: 'Amadou Maïga',
    client_id: 'cl-001', client_nom: 'Koné', client_prenom: 'Fatoumata', client_telephone: '+226 76 11 22 33',
    lignes: [{ tissu_id: 't-002', tissu_code: 'GTZ-007', qualite_nom: 'Getzner', couleur_nom: 'Rose', metrage: 6, prix_unitaire: 25000, montant: 150000 }],
    montant_total: 150000, mode_paiement: 'orange_money', statut: 'validee', synced: true,
    created_at: '2024-06-28T14:32:00Z',
  },
  {
    id: 'v-013', numero: 'V-2406-013', boutique_id: 'btq-001',
    caissier_id: 'usr-001', caissier_nom: 'Amadou Maïga',
    client_id: 'cl-002', client_nom: 'Sawadogo', client_prenom: 'Ibrahima',
    lignes: [{ tissu_id: 't-006', tissu_code: 'SB-003', qualite_nom: 'Super Basin', couleur_nom: 'Bleu', metrage: 10, prix_unitaire: 8500, montant: 85000 }],
    montant_total: 85000, mode_paiement: 'wave', statut: 'validee', synced: true,
    created_at: '2024-06-28T13:15:00Z',
  },
  {
    id: 'v-012', numero: 'V-2406-012', boutique_id: 'btq-001',
    caissier_id: 'usr-001', caissier_nom: 'Amadou Maïga',
    lignes: [{ tissu_id: 't-004', tissu_code: 'RB-011', qualite_nom: 'Rich Brocade', couleur_nom: 'Or', metrage: 4, prix_unitaire: 28000, montant: 112000 }],
    montant_total: 112000, mode_paiement: 'especes', statut: 'validee', synced: true,
    created_at: '2024-06-28T11:48:00Z',
  },
  {
    id: 'v-011', numero: 'V-2406-011', boutique_id: 'btq-001',
    caissier_id: 'usr-001', caissier_nom: 'Amadou Maïga',
    client_id: 'cl-003', client_nom: 'Traoré', client_prenom: 'Mariam',
    lignes: [{ tissu_id: 't-003', tissu_code: 'GTZ-002', qualite_nom: 'Getzner', couleur_nom: 'Blanc', metrage: 8, prix_unitaire: 25000, montant: 200000 }],
    montant_total: 200000, mode_paiement: 'orange_money', statut: 'validee', synced: true,
    created_at: '2024-06-28T10:05:00Z',
  },
  {
    id: 'v-010', numero: 'V-2406-010', boutique_id: 'btq-001',
    caissier_id: 'usr-001', caissier_nom: 'Amadou Maïga',
    client_id: 'cl-005', client_nom: 'Diallo', client_prenom: 'Aïssata',
    lignes: [{ tissu_id: 't-008', tissu_code: 'BZR-001', qualite_nom: 'Bazin Riche', couleur_nom: 'Rouge', metrage: 5, prix_unitaire: 35000, montant: 175000 }],
    montant_total: 175000, mode_paiement: 'wave', statut: 'validee', synced: true,
    created_at: '2024-06-27T16:30:00Z',
  },
];

export const MOCK_DEPENSES: Depense[] = [
  { id: 'd-001', boutique_id: 'btq-001', categorie: 'Loyer', montant: 150000, date: '2024-06-01', user_id: 'usr-001', created_at: '2024-06-01T09:00:00Z', synced: true },
  { id: 'd-002', boutique_id: 'btq-001', categorie: 'Électricité', montant: 28500, date: '2024-06-10', observation: 'Facture SONABEL', user_id: 'usr-001', created_at: '2024-06-10T10:00:00Z', synced: true },
  { id: 'd-003', boutique_id: 'btq-001', categorie: 'Transport', montant: 15000, date: '2024-06-15', user_id: 'usr-001', created_at: '2024-06-15T14:00:00Z', synced: true },
  { id: 'd-004', boutique_id: 'btq-001', categorie: 'Emballage', montant: 8000, date: '2024-06-20', user_id: 'usr-001', created_at: '2024-06-20T11:00:00Z', synced: false },
];

export const MOCK_STATS_SEMAINE: StatJour[] = [
  { date: '2024-06-22', ca: 290000, nb_ventes: 8, nb_clients: 6, depenses: 15000, benefice: 275000 },
  { date: '2024-06-23', ca: 403000, nb_ventes: 11, nb_clients: 9, depenses: 0, benefice: 403000 },
  { date: '2024-06-24', ca: 247000, nb_ventes: 7, nb_clients: 5, depenses: 8000, benefice: 239000 },
  { date: '2024-06-25', ca: 521000, nb_ventes: 14, nb_clients: 11, depenses: 0, benefice: 521000 },
  { date: '2024-06-26', ca: 358000, nb_ventes: 9, nb_clients: 7, depenses: 0, benefice: 358000 },
  { date: '2024-06-27', ca: 650000, nb_ventes: 18, nb_clients: 14, depenses: 0, benefice: 650000 },
  { date: '2024-06-28', ca: 487500, nb_ventes: 14, nb_clients: 11, depenses: 0, benefice: 487500 },
];

export const MOCK_TOP_PRODUITS: ProduitTop[] = [
  { tissu_code: 'GTZ-007', qualite_nom: 'Getzner', couleur_nom: 'Rose', total_vendu: 42, ca_genere: 1050000 },
  { tissu_code: 'BZR-001', qualite_nom: 'Bazin Riche', couleur_nom: 'Rouge', total_vendu: 38, ca_genere: 1330000 },
  { tissu_code: 'RB-011', qualite_nom: 'Rich Brocade', couleur_nom: 'Or', total_vendu: 31, ca_genere: 868000 },
  { tissu_code: 'SB-003', qualite_nom: 'Super Basin', couleur_nom: 'Bleu', total_vendu: 87, ca_genere: 739500 },
  { tissu_code: 'GTZ-002', qualite_nom: 'Getzner', couleur_nom: 'Blanc', total_vendu: 24, ca_genere: 600000 },
];
