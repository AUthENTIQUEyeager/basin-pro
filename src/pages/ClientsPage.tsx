import { useState, useMemo } from 'react';
import { useAppStore } from '../stores/appStore';
import { formatMontant, formatDate, getInitiales } from '../lib/utils';

export function ClientsPage() {
  const { clients, ventes } = useAppStore();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return clients;
    return clients.filter(c =>
      c.nom.toLowerCase().includes(q) ||
      c.prenom.toLowerCase().includes(q) ||
      (c.telephone && c.telephone.includes(q))
    );
  }, [clients, search]);

  const selectedClient = clients.find(c => c.id === selected);
  const clientVentes = selected ? ventes.filter(v => v.client_id === selected && v.statut === 'validee') : [];

  return (
    <div className="animate-fade-in grid grid-cols-[1fr_340px] gap-4">
      {/* Liste */}
      <div className="bg-white border border-[#E4E2DE] rounded-xl">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[#F0EFED]">
          <div className="flex items-center gap-2 flex-1 bg-[#F9F9F8] border border-[#E4E2DE] rounded-lg px-3">
            <i className="ti ti-search text-[#9E9C97] text-sm" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un client…"
              className="flex-1 h-9 bg-transparent outline-none text-[13px] placeholder:text-[#9E9C97]" />
          </div>
          <span className="text-[12px] text-[#9E9C97]">{filtered.length} client{filtered.length > 1 ? 's' : ''}</span>
        </div>

        <div className="divide-y divide-[#F0EFED]">
          {filtered.map(c => (
            <button key={c.id} onClick={() => setSelected(c.id === selected ? null : c.id)}
              className={`w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors ${selected === c.id ? 'bg-[#F5EDE4]' : 'hover:bg-[#F9F9F8]'}`}>
              <div className="w-9 h-9 rounded-full bg-[#F5EDE4] flex items-center justify-center text-[13px] font-semibold text-[#7C5C3E] shrink-0">
                {getInitiales(c.prenom, c.nom)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13.5px] font-medium text-[#141412] truncate">{c.prenom} {c.nom}</p>
                <p className="text-[12px] text-[#9E9C97]">{c.telephone || 'Pas de téléphone'}</p>
              </div>
              <div className="text-right">
                <p className="text-[13px] font-medium text-[#7C5C3E]">{formatMontant(c.total_achats)}</p>
                <p className="text-[11px] text-[#9E9C97]">{c.nb_achats} achat{c.nb_achats > 1 ? 's' : ''}</p>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="py-12 text-center text-[#9E9C97] text-[13px]">
              <i className="ti ti-users-off text-2xl block mb-2" />
              Aucun client trouvé
            </div>
          )}
        </div>
      </div>

      {/* Fiche client */}
      {selectedClient ? (
        <div className="space-y-4">
          <div className="bg-white border border-[#E4E2DE] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#F0EFED]">
              <div className="w-12 h-12 rounded-full bg-[#F5EDE4] flex items-center justify-center text-[16px] font-semibold text-[#7C5C3E]">
                {getInitiales(selectedClient.prenom, selectedClient.nom)}
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-[#141412]">{selectedClient.prenom} {selectedClient.nom}</h3>
                <p className="text-[12px] text-[#9E9C97]">Client depuis {formatDate(selectedClient.created_at)}</p>
              </div>
            </div>
            <div className="space-y-2.5 text-[13px]">
              {[
                ['Téléphone', selectedClient.telephone || '—'],
                ['Total achats', formatMontant(selectedClient.total_achats)],
                ['Nombre d\'achats', selectedClient.nb_achats.toString()],
                ['Dernière visite', selectedClient.derniere_visite ? formatDate(selectedClient.derniere_visite) : '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-[#9E9C97]">{k}</span>
                  <span className="font-medium text-[#141412]">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[#E4E2DE] rounded-xl">
            <div className="px-5 py-3.5 border-b border-[#F0EFED]">
              <h4 className="text-[13.5px] font-medium text-[#141412]">Historique des achats</h4>
            </div>
            <div className="divide-y divide-[#F0EFED]">
              {clientVentes.length === 0 ? (
                <p className="px-5 py-6 text-[13px] text-[#9E9C97] text-center">Aucun achat enregistré</p>
              ) : clientVentes.map(v => (
                <div key={v.id} className="px-5 py-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[13px] font-medium text-[#141412]">{v.lignes[0]?.qualite_nom} {v.lignes[0]?.couleur_nom}</p>
                      <p className="text-[11.5px] text-[#9E9C97]">{v.numero} · {formatDate(v.created_at)}</p>
                    </div>
                    <span className="text-[13px] font-medium text-[#7C5C3E]">{formatMontant(v.montant_total)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-[#E4E2DE] rounded-xl flex items-center justify-center text-[#9E9C97] text-[13px]">
          <div className="text-center">
            <i className="ti ti-user text-2xl block mb-2" />
            Sélectionner un client
          </div>
        </div>
      )}
    </div>
  );
}
