import { useState } from 'react';
import { useAppStore } from '../stores/appStore';
import { formatDate } from '../lib/utils';
import { MOCK_USER } from '../lib/mockData';

// ─── Utilisateurs ─────────────────────────────────────────────────────────────
const MOCK_USERS = [
  { id: 'usr-001', prenom: 'Amadou', nom: 'Maïga', email: 'amadou@al-baraka.bf', role: 'manager', actif: true, derniere_connexion: '2024-06-28T07:45:00Z' },
  { id: 'usr-002', prenom: 'Kadiatou', nom: 'Bah', email: 'kadia@al-baraka.bf', role: 'caissier', actif: true, derniere_connexion: '2024-06-28T08:00:00Z' },
  { id: 'usr-003', prenom: 'Ibrahim', nom: 'Coulibaly', email: 'ibrahim@al-baraka.bf', role: 'caissier', actif: false, derniere_connexion: '2024-06-10T10:00:00Z' },
];

export function UtilisateursPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ prenom: '', nom: '', email: '', role: 'caissier', mdp: '' });

  return (
    <div className="animate-fade-in max-w-2xl space-y-4">
      <div className="bg-white border border-[#E4E2DE] rounded-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0EFED]">
          <h2 className="text-[13.5px] font-medium text-[#141412]">Utilisateurs</h2>
          <button onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#7C5C3E] text-white rounded-lg text-[13px] font-medium hover:bg-[#6A4E34]">
            <i className="ti ti-plus text-sm" /> Ajouter
          </button>
        </div>

        {showAdd && (
          <div className="p-5 border-b border-[#F0EFED] bg-[#F9F9F8]">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input placeholder="Prénom" value={form.prenom} onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))}
                className="h-9 border border-[#E4E2DE] rounded-lg px-3 text-[13px] outline-none focus:border-[#7C5C3E] bg-white" />
              <input placeholder="Nom" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                className="h-9 border border-[#E4E2DE] rounded-lg px-3 text-[13px] outline-none focus:border-[#7C5C3E] bg-white" />
              <input type="email" placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="h-9 border border-[#E4E2DE] rounded-lg px-3 text-[13px] outline-none focus:border-[#7C5C3E] bg-white" />
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                className="h-9 border border-[#E4E2DE] rounded-lg px-3 text-[13px] outline-none focus:border-[#7C5C3E] bg-white">
                <option value="caissier">Caissier</option>
                <option value="manager">Manager</option>
              </select>
              <input type="password" placeholder="Mot de passe" value={form.mdp} onChange={e => setForm(f => ({ ...f, mdp: e.target.value }))}
                className="h-9 border border-[#E4E2DE] rounded-lg px-3 text-[13px] outline-none focus:border-[#7C5C3E] bg-white col-span-2" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowAdd(false)} className="px-4 h-9 border border-[#E4E2DE] rounded-lg text-[13px] text-[#5A5854] hover:bg-white">Annuler</button>
              <button className="px-4 h-9 bg-[#7C5C3E] text-white rounded-lg text-[13px] font-medium hover:bg-[#6A4E34]">Créer l'utilisateur</button>
            </div>
          </div>
        )}

        <div className="divide-y divide-[#F0EFED]">
          {MOCK_USERS.map(u => (
            <div key={u.id} className="flex items-center gap-3 px-5 py-3.5">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-semibold shrink-0 ${u.actif ? 'bg-[#F5EDE4] text-[#7C5C3E]' : 'bg-[#F0EFED] text-[#9E9C97]'}`}>
                {u.prenom[0]}{u.nom[0]}
              </div>
              <div className="flex-1">
                <p className="text-[13.5px] font-medium text-[#141412]">{u.prenom} {u.nom}</p>
                <p className="text-[12px] text-[#9E9C97]">{u.email}</p>
              </div>
              <span className={`badge ${u.role === 'manager' ? 'badge-bazin' : 'badge-gray'} capitalize`}>{u.role}</span>
              <span className={`badge ${u.actif ? 'badge-green' : 'badge-red'}`}>{u.actif ? 'Actif' : 'Inactif'}</span>
              <div className="flex gap-1 ml-2">
                <button title="Modifier" className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[#F0EFED] text-[#9E9C97]">
                  <i className="ti ti-pencil text-sm" />
                </button>
                <button title={u.actif ? 'Désactiver' : 'Activer'}
                  className={`w-7 h-7 flex items-center justify-center rounded-md hover:bg-[#F0EFED] ${u.actif ? 'text-[#C0392B]' : 'text-[#1A7A4A]'}`}>
                  <i className={`ti ${u.actif ? 'ti-lock' : 'ti-lock-open'} text-sm`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Synchronisation ──────────────────────────────────────────────────────────
export function SyncPage() {
  const { syncState, triggerSync } = useAppStore();
  const [syncing, setSyncing] = useState(false);

  async function handleSync() {
    setSyncing(true);
    await triggerSync();
    setSyncing(false);
  }

  const history = [
    { date: '2024-06-28T14:30:00Z', statut: 'success', elements: 3 },
    { date: '2024-06-28T12:00:00Z', statut: 'success', elements: 7 },
    { date: '2024-06-28T09:15:00Z', statut: 'error', elements: 0, erreur: 'Connexion refusée' },
    { date: '2024-06-27T18:00:00Z', statut: 'success', elements: 12 },
  ];

  return (
    <div className="animate-fade-in max-w-2xl space-y-4">
      {/* État actuel */}
      <div className={`border rounded-xl p-5 flex items-center gap-4 ${
        syncState.statut === 'synced' ? 'bg-[#EDFAF3] border-[#C6EFDC]' :
        syncState.statut === 'pending' ? 'bg-[#FEF3CD] border-[#F5D37A]' :
        'bg-[#FDF0EE] border-[#F5C4B3]'
      }`}>
        <i className={`ti text-2xl ${
          syncState.statut === 'synced' ? 'ti-circle-check text-[#1A7A4A]' :
          syncState.statut === 'pending' ? 'ti-loader-2 animate-spin text-[#B45309]' :
          'ti-alert-circle text-[#C0392B]'
        }`} />
        <div className="flex-1">
          <p className="text-[14px] font-medium text-[#141412]">
            {syncState.statut === 'synced' && 'Toutes les données sont synchronisées'}
            {syncState.statut === 'pending' && 'Synchronisation en cours…'}
            {syncState.statut === 'error' && 'Erreur de synchronisation'}
            {syncState.statut === 'offline' && 'Hors ligne — synchronisation suspendue'}
          </p>
          {syncState.derniere_sync && (
            <p className="text-[12px] text-[#5A5854] mt-0.5">
              Dernière sync : {new Date(syncState.derniere_sync).toLocaleString('fr-FR')}
            </p>
          )}
        </div>
        <button onClick={handleSync} disabled={syncing}
          className="flex items-center gap-1.5 px-4 py-2 bg-white border border-[#E4E2DE] rounded-lg text-[13px] font-medium text-[#5A5854] hover:bg-[#F9F9F8] disabled:opacity-40">
          <i className={`ti ti-refresh text-sm ${syncing ? 'animate-spin' : ''}`} />
          Synchroniser maintenant
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-[#E4E2DE] rounded-xl p-4">
          <p className="text-[12px] text-[#9E9C97] mb-1">En attente</p>
          <p className="text-[22px] font-semibold text-[#B45309]">{syncState.pending_count}</p>
        </div>
        <div className="bg-white border border-[#E4E2DE] rounded-xl p-4">
          <p className="text-[12px] text-[#9E9C97] mb-1">Syncs aujourd'hui</p>
          <p className="text-[22px] font-semibold text-[#141412]">4</p>
        </div>
        <div className="bg-white border border-[#E4E2DE] rounded-xl p-4">
          <p className="text-[12px] text-[#9E9C97] mb-1">Mode</p>
          <p className="text-[22px] font-semibold text-[#1A7A4A]">Auto</p>
        </div>
      </div>

      {/* Historique sync */}
      <div className="bg-white border border-[#E4E2DE] rounded-xl">
        <div className="px-5 py-4 border-b border-[#F0EFED]">
          <h2 className="text-[13.5px] font-medium text-[#141412]">Historique des synchronisations</h2>
        </div>
        <div className="divide-y divide-[#F0EFED]">
          {history.map((h, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3">
              <i className={`ti text-sm ${h.statut === 'success' ? 'ti-circle-check text-[#1A7A4A]' : 'ti-circle-x text-[#C0392B]'}`} />
              <div className="flex-1">
                <p className="text-[13px] text-[#141412]">
                  {h.statut === 'success' ? `${h.elements} éléments synchronisés` : `Échec — ${h.erreur}`}
                </p>
                <p className="text-[11.5px] text-[#9E9C97]">{new Date(h.date).toLocaleString('fr-FR')}</p>
              </div>
              <span className={`badge ${h.statut === 'success' ? 'badge-green' : 'badge-red'}`}>
                {h.statut === 'success' ? 'Succès' : 'Échec'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Sauvegarde ───────────────────────────────────────────────────────────────
export function SauvegardePage() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleBackup() {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setDone(true);
    setTimeout(() => setDone(false), 3000);
  }

  const backups = [
    { date: '2024-06-27T23:00:00Z', type: 'auto', taille: '2.1 Mo' },
    { date: '2024-06-26T23:00:00Z', type: 'auto', taille: '1.9 Mo' },
    { date: '2024-06-25T14:30:00Z', type: 'manuel', taille: '1.8 Mo' },
    { date: '2024-06-24T23:00:00Z', type: 'auto', taille: '1.7 Mo' },
  ];

  return (
    <div className="animate-fade-in max-w-2xl space-y-4">
      {/* Actions */}
      <div className="bg-white border border-[#E4E2DE] rounded-xl p-5 flex items-center justify-between">
        <div>
          <h2 className="text-[14px] font-medium text-[#141412]">Sauvegarde manuelle</h2>
          <p className="text-[12px] text-[#9E9C97] mt-0.5">Créer une sauvegarde complète de toutes vos données</p>
        </div>
        <button onClick={handleBackup} disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-colors ${done ? 'bg-[#EDFAF3] text-[#1A7A4A] border border-[#C6EFDC]' : 'bg-[#7C5C3E] text-white hover:bg-[#6A4E34]'} disabled:opacity-50`}>
          <i className={`ti text-sm ${loading ? 'ti-loader-2 animate-spin' : done ? 'ti-check' : 'ti-database-export'}`} />
          {loading ? 'Sauvegarde…' : done ? 'Sauvegardé !' : 'Sauvegarder maintenant'}
        </button>
      </div>

      <div className="bg-white border border-[#E4E2DE] rounded-xl p-5 space-y-3">
        <h2 className="text-[13.5px] font-medium text-[#141412]">Configuration automatique</h2>
        {[
          { label: 'Sauvegarde automatique', val: 'Chaque nuit à 23h00' },
          { label: 'Rétention', val: '30 jours' },
          { label: 'Chiffrement', val: 'AES-256' },
          { label: 'Stockage', val: 'Supabase Storage' },
        ].map(f => (
          <div key={f.label} className="flex justify-between text-[13px]">
            <span className="text-[#9E9C97]">{f.label}</span>
            <span className="font-medium text-[#141412]">{f.val}</span>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#E4E2DE] rounded-xl">
        <div className="px-5 py-4 border-b border-[#F0EFED]">
          <h2 className="text-[13.5px] font-medium text-[#141412]">Sauvegardes récentes</h2>
        </div>
        <div className="divide-y divide-[#F0EFED]">
          {backups.map((b, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3">
              <i className="ti ti-database text-[#7C5C3E] text-sm" />
              <div className="flex-1">
                <p className="text-[13px] text-[#141412]">{new Date(b.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</p>
                <p className="text-[11.5px] text-[#9E9C97]">{b.taille}</p>
              </div>
              <span className={`badge ${b.type === 'auto' ? 'badge-gray' : 'badge-bazin'}`}>{b.type}</span>
              <button title="Télécharger" className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[#F0EFED] text-[#9E9C97]">
                <i className="ti ti-download text-sm" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
