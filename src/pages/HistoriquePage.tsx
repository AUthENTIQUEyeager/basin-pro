import { useState, useMemo } from 'react';
import { useAppStore } from '../stores/appStore';
import { formatMontant, formatDate, formatHeure, getPaiementLabel, getPaiementBadgeClass, getStatutVenteBadge } from '../lib/utils';

export function HistoriquePage() {
  const { ventes, annulerVente } = useAppStore();
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState('tous');
  const [filterStatut, setFilterStatut] = useState('tous');
  const [annulerModal, setAnnulerModal] = useState<string | null>(null);
  const [motif, setMotif] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return ventes.filter(v => {
      const matchSearch = !q ||
        v.numero.toLowerCase().includes(q) ||
        (v.client_prenom && v.client_prenom.toLowerCase().includes(q)) ||
        (v.client_nom && v.client_nom.toLowerCase().includes(q)) ||
        v.lignes.some(l => l.qualite_nom.toLowerCase().includes(q) || l.couleur_nom.toLowerCase().includes(q));
      const matchMode = filterMode === 'tous' || v.mode_paiement === filterMode;
      const matchStatut = filterStatut === 'tous' || v.statut === filterStatut;
      return matchSearch && matchMode && matchStatut;
    });
  }, [ventes, search, filterMode, filterStatut]);

  const totalCA = filtered.filter(v => v.statut === 'validee').reduce((s, v) => s + v.montant_total, 0);

  function handleAnnuler() {
    if (annulerModal && motif.trim()) {
      annulerVente(annulerModal, motif);
      setAnnulerModal(null);
      setMotif('');
    }
  }

  return (
    <div className="animate-fade-in space-y-4">
      {/* Stats rapides */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-[#E4E2DE] rounded-xl p-4">
          <p className="text-[12px] text-[#9E9C97] mb-1">Total filtré</p>
          <p className="text-[22px] font-semibold tracking-tight text-[#141412]">{filtered.length} ventes</p>
        </div>
        <div className="bg-white border border-[#E4E2DE] rounded-xl p-4">
          <p className="text-[12px] text-[#9E9C97] mb-1">Chiffre d'affaires</p>
          <p className="text-[22px] font-semibold tracking-tight text-[#7C5C3E]">{formatMontant(totalCA)}</p>
        </div>
        <div className="bg-white border border-[#E4E2DE] rounded-xl p-4">
          <p className="text-[12px] text-[#9E9C97] mb-1">Annulées</p>
          <p className="text-[22px] font-semibold tracking-tight text-[#C0392B]">{filtered.filter(v => v.statut === 'annulee').length}</p>
        </div>
      </div>

      <div className="bg-white border border-[#E4E2DE] rounded-xl">
        {/* Filters */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[#F0EFED] flex-wrap">
          <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-[#F9F9F8] border border-[#E4E2DE] rounded-lg px-3">
            <i className="ti ti-search text-[#9E9C97] text-sm" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="N° vente, client, tissu…"
              className="flex-1 h-9 bg-transparent outline-none text-[13px] placeholder:text-[#9E9C97]" />
          </div>
          <select value={filterMode} onChange={e => setFilterMode(e.target.value)}
            className="h-9 border border-[#E4E2DE] rounded-lg px-3 text-[12.5px] outline-none bg-white text-[#5A5854]">
            <option value="tous">Tous paiements</option>
            <option value="especes">Espèces</option>
            <option value="orange_money">Orange Money</option>
            <option value="wave">Wave</option>
            <option value="moov_money">Moov Money</option>
          </select>
          <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)}
            className="h-9 border border-[#E4E2DE] rounded-lg px-3 text-[12.5px] outline-none bg-white text-[#5A5854]">
            <option value="tous">Tous statuts</option>
            <option value="validee">Validées</option>
            <option value="annulee">Annulées</option>
          </select>
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E4E2DE] rounded-lg text-[12.5px] text-[#5A5854] hover:bg-[#F9F9F8]">
            <i className="ti ti-file-export text-sm" /> Export PDF
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E4E2DE] rounded-lg text-[12.5px] text-[#5A5854] hover:bg-[#F9F9F8]">
            <i className="ti ti-table-export text-sm" /> Excel
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr>
                {['N° vente', 'Date', 'Tissu', 'Client', 'Métrage', 'Montant', 'Paiement', 'Statut', 'Actions'].map(h => (
                  <th key={h} className="text-left text-[11px] font-medium text-[#9E9C97] uppercase tracking-[0.4px] px-5 py-2.5 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => {
                const { label, cls } = getStatutVenteBadge(v.statut);
                return (
                  <tr key={v.id} className="border-t border-[#F0EFED] hover:bg-[#F9F9F8]">
                    <td className="px-5 py-3 font-medium text-[#141412]">{v.numero}</td>
                    <td className="px-5 py-3 text-[#9E9C97] whitespace-nowrap">
                      <div>{formatDate(v.created_at)}</div>
                      <div className="text-[11px]">{formatHeure(v.created_at)}</div>
                    </td>
                    <td className="px-5 py-3 text-[#5A5854]">
                      {v.lignes[0]?.qualite_nom} {v.lignes[0]?.couleur_nom}
                      <div className="text-[11px] text-[#9E9C97]">{v.lignes[0]?.tissu_code}</div>
                    </td>
                    <td className="px-5 py-3 text-[#5A5854]">
                      {v.client_prenom ? `${v.client_prenom} ${v.client_nom}` : '—'}
                      {v.client_telephone && <div className="text-[11px] text-[#9E9C97]">{v.client_telephone}</div>}
                    </td>
                    <td className="px-5 py-3 text-[#141412]">{v.lignes[0]?.metrage} m</td>
                    <td className="px-5 py-3 font-medium text-[#141412]">{formatMontant(v.montant_total)}</td>
                    <td className="px-5 py-3">
                      <span className={`badge ${getPaiementBadgeClass(v.mode_paiement)}`}>{getPaiementLabel(v.mode_paiement)}</span>
                    </td>
                    <td className="px-5 py-3"><span className={`badge ${cls}`}>{label}</span></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <button title="Réimprimer" className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[#F0EFED] text-[#9E9C97] hover:text-[#5A5854]">
                          <i className="ti ti-printer text-sm" />
                        </button>
                        {v.statut === 'validee' && (
                          <button title="Annuler" onClick={() => setAnnulerModal(v.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[#FDF0EE] text-[#9E9C97] hover:text-[#C0392B]">
                            <i className="ti ti-x text-sm" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="px-5 py-10 text-center text-[#9E9C97] text-[13px]">
                  <i className="ti ti-receipt-off text-2xl block mb-2" />
                  Aucune vente trouvée
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal annulation */}
      {annulerModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm shadow-xl p-6">
            <h3 className="text-[15px] font-semibold text-[#141412] mb-1">Annuler la vente</h3>
            <p className="text-[13px] text-[#9E9C97] mb-4">Cette action est irréversible. Précisez le motif.</p>
            <textarea value={motif} onChange={e => setMotif(e.target.value)} placeholder="Motif de l'annulation…" rows={3}
              className="w-full border border-[#E4E2DE] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#7C5C3E] resize-none mb-4" />
            <div className="flex gap-2">
              <button onClick={() => setAnnulerModal(null)} className="flex-1 h-9 border border-[#E4E2DE] rounded-lg text-[13px] text-[#5A5854] hover:bg-[#F9F9F8]">Annuler</button>
              <button onClick={handleAnnuler} disabled={!motif.trim()}
                className="flex-1 h-9 bg-[#C0392B] text-white rounded-lg text-[13px] font-medium hover:bg-[#A93226] disabled:opacity-40">Confirmer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
