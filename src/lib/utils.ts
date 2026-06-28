import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ModePaiement, StatutStock, StatutVente } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMontant(montant: number): string {
  return new Intl.NumberFormat('fr-FR').format(montant) + ' FCFA';
}
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}
export function formatDateCourt(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}
export function formatHeure(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}
export function getPaiementLabel(mode: ModePaiement): string {
  const labels: Record<ModePaiement, string> = { especes: 'Espèces', orange_money: 'Orange Money', wave: 'Wave', moov_money: 'Moov Money' };
  return labels[mode] || mode;
}
export function getPaiementBadgeClass(mode: ModePaiement): string {
  const classes: Record<ModePaiement, string> = { especes: 'badge-gray', orange_money: 'badge-amber', wave: 'badge-blue', moov_money: 'badge-green' };
  return classes[mode] || 'badge-gray';
}
export function getStatutStockBadge(statut: StatutStock): { label: string; cls: string } {
  const map: Record<StatutStock, { label: string; cls: string }> = {
    disponible: { label: 'Disponible', cls: 'badge-green' },
    bas: { label: 'Stock bas', cls: 'badge-amber' },
    epuise: { label: 'Épuisé', cls: 'badge-red' },
  };
  return map[statut] || { label: statut, cls: 'badge-gray' };
}
export function getStatutVenteBadge(statut: StatutVente): { label: string; cls: string } {
  const map: Record<StatutVente, { label: string; cls: string }> = {
    validee: { label: 'Validée', cls: 'badge-green' },
    annulee: { label: 'Annulée', cls: 'badge-red' },
    retour: { label: 'Retour', cls: 'badge-amber' },
  };
  return map[statut] || { label: statut, cls: 'badge-gray' };
}
export function generateId(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}
export function getInitiales(prenom: string, nom: string): string {
  return (prenom?.[0] || '') + (nom?.[0] || '');
}
export function deltaPercent(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 100);
}
export function tempsDepuis(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const heures = Math.floor(minutes / 60);
  const jours = Math.floor(heures / 24);
  if (jours > 0) return `il y a ${jours} j`;
  if (heures > 0) return `il y a ${heures} h`;
  if (minutes > 0) return `il y a ${minutes} min`;
  return "à l'instant";
}
