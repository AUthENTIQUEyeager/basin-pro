import { useState, useMemo } from 'react';
import { useAppStore } from '../stores/appStore';
import type { Depense } from '../types';
import { formatMontant, formatDate } from '../lib/utils';

const CATEGORIES = ['Loyer', 'Électricité', 'Eau', 'Transport', 'Emballage', 'Salaire', 'Achat stock', 'Entretien', 'Autre'];

function AddDepenseModal({ onClose }: { onClose: () => void }) {
  const { addDepense } = useAppStore();
  const [form, setForm] = useState({ categorie: CATEGORIES[0], montant: '', date: new Date().toISOString().slice(0, 10), observation: '' });
  const [loading, setLoading] = useState(false);

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function submit() {
    if (!form.montant || parseFloat(form.montant) <= 0) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const depense: Depense = {
      id: 'd-' + Date.now(), boutique_id: 'btq-001',
      categorie: form.categorie, montant: parseFloat(form.montant),
      date: form.date, observation: form.observation || undefined,
      user_id: 'usr-001', created_at: new Date().toISOString(), synced: false,
    };
    addDepense(depense);
    setLoading(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0EFED]">
          <h2 className="text-[15px] font-semibold text-[#141412]">Nouvelle dépense</h2>
          <button onClick={onClose} className="text-[#9E9C97] hover:text-[#5A5854]"><i className="ti ti-x" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-[12px] font-medium text-[#5A5854] block mb-1.5">Catégorie *</label>
            <select value={form.categorie} onChange={e => set('categorie', e.target.value)}
              className="w-full h-9 border border-[#E4E2DE] rounded-lg px-3 text-[13px] outline-none focus:border-[#7C5C3E] bg-white">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-medium text-[#5A5854] block mb-1.5">Montant (FCFA) *</label>
              <input type="number" min="0" value={form.montant} onChange={e => set('montant', e.target.value)}
                placeholder="0" className="w-full h-9 border border-[#E4E2DE] rounded-lg px-3 text-[13px] outline-none focus:border-[#7C5C3E]" />
            </div>
            <div>
              <label className="text-[12px] font-medium text-[#5A5854] block mb-1.5">Date *</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
                className="w-full h-9 border border-[#E4E2DE] rounded-lg px-3 text-[13px] outline-none focus:border-[#7C5C3E]" />
            </div>
          </div>
          <div>
            <label className="text-[12px] font-medium text-[#5A5854] block mb-1.5">Observation (optionnel)</label>
            <textarea value={form.observation} onChange={e => set('observation', e.target.value)}
              placeholder="Notes supplémentaires…" rows={2}
              className="w-full border border-[#E4E2DE] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#7C5C3E] resize-none" />
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 h-10 border border-[#E4E2DE] rounded-lg text-[13px] text-[#5A5854] hover:bg-[#F9F9F8]">Annuler</button>
            <button onClick={submit} disabled={loading || !form.montant}
              className="flex-1 h-10 bg-[#7C5C3E] text-white rounded-lg text-[13px] font-medium hover:bg-[#6A4E34] disabled:opacity-40">
              {loading ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DepensesPage() {
  const { depenses } = useAppStore();
  const [showAdd, setShowAdd] = useState(false);
  const [filterCat, setFilterCat] = useState('tous');

  const filtered = useMemo(() =>
    filterCat === 'tous' ? depenses : depenses.filter(d => d.categorie === filterCat),
    [depenses, filterCat]
  );

  const total = filtered.reduce((s, d) => s + d.montant, 0);
  const parCategorie = CATEGORIES.map(cat => ({
    cat, total: depenses.filter(d => d.categorie === cat).reduce((s, d) => s + d.montant, 0),
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);
  const maxCat = parCategorie[0]?.total || 1;

  return (
    <div className="animate-fade-in space-y-4">
      <div className="grid grid-cols-[1fr_280px] gap-4">
        {/* Table */}
        <div className="bg-white border border-[#E4E2DE] rounded-xl">
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[#F0EFED]">
            <h2 className="text-[13.5px] font-medium text-[#141412] flex-1">Dépenses</h2>
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
              className="h-8 border border-[#E4E2DE] rounded-lg px-2.5 text-[12px] outline-none bg-white text-[#5A5854]">
              <option value="tous">Toutes catégories</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <button onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#7C5C3E] text-white rounded-lg text-[13px] font-medium hover:bg-[#6A4E34]">
              <i className="ti ti-plus text-sm" /> Ajouter
            </button>
          </div>
          <table className="w-full text-[13px]">
            <thead>
              <tr>
                {['Date', 'Catégorie', 'Montant', 'Observation', 'Sync'].map(h => (
                  <th key={h} className="text-left text-[11px] font-medium text-[#9E9C97] uppercase tracking-[0.4px] px-5 py-2.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id} className="border-t border-[#F0EFED] hover:bg-[#F9F9F8]">
                  <td className="px-5 py-3 text-[#9E9C97]">{formatDate(d.date + 'T00:00:00Z')}</td>
                  <td className="px-5 py-3">
                    <span className="badge badge-bazin">{d.categorie}</span>
                  </td>
                  <td className="px-5 py-3 font-medium text-[#C0392B]">{formatMontant(d.montant)}</td>
                  <td className="px-5 py-3 text-[#9E9C97]">{d.observation || '—'}</td>
                  <td className="px-5 py-3">
                    <i className={`ti text-sm ${d.synced ? 'ti-circle-check text-[#1A7A4A]' : 'ti-clock text-[#B45309]'}`} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-[#9E9C97] text-[13px]">
                  <i className="ti ti-wallet-off text-2xl block mb-2" />
                  Aucune dépense enregistrée
                </td></tr>
              )}
            </tbody>
          </table>
          <div className="px-5 py-3 border-t border-[#F0EFED] flex justify-between text-[13px]">
            <span className="text-[#9E9C97]">Total</span>
            <span className="font-semibold text-[#C0392B]">{formatMontant(total)}</span>
          </div>
        </div>

        {/* Répartition */}
        <div className="bg-white border border-[#E4E2DE] rounded-xl">
          <div className="px-5 py-4 border-b border-[#F0EFED]">
            <h2 className="text-[13.5px] font-medium text-[#141412]">Par catégorie</h2>
          </div>
          <div className="p-5 space-y-3">
            {parCategorie.length === 0 ? (
              <p className="text-[13px] text-[#9E9C97] text-center py-4">Aucune dépense</p>
            ) : parCategorie.map(({ cat, total: t }) => (
              <div key={cat}>
                <div className="flex justify-between text-[12.5px] mb-1">
                  <span className="text-[#5A5854]">{cat}</span>
                  <span className="font-medium text-[#141412]">{formatMontant(t)}</span>
                </div>
                <div className="bg-[#F0EFED] rounded-full h-1.5 overflow-hidden">
                  <div className="h-full bg-[#7C5C3E] rounded-full" style={{ width: `${(t / maxCat) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {showAdd && <AddDepenseModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}
