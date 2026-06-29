import { useState, useMemo } from 'react';
import { useAppStore } from '../stores/appStore';
import type { Tissu } from '../types';
import { formatMontant, getStatutStockBadge } from '../lib/utils';

function ColorSwatch({ hex }: { hex: string }) {
  return <span className="inline-block w-2.5 h-2.5 rounded-full border border-[#E4E2DE] shrink-0" style={{ background: hex }} />;
}

function AddTissuModal({ onClose }: { onClose: () => void }) {
  const { qualites, couleurs, addTissu } = useAppStore();
  const [form, setForm] = useState({
    qualite_id: qualites[0]?.id || '',
    couleur_id: couleurs[0]?.id || '',
    metrage: '',
    prix_achat: '',
    prix_vente: '',
    emplacement: '',
    observation: '',
    metrage_alerte: '5',
  });
  const [loading, setLoading] = useState(false);

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function submit() {
    if (!form.qualite_id || !form.couleur_id || !form.metrage || !form.prix_vente) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    const q = qualites.find(q => q.id === form.qualite_id)!;
    const c = couleurs.find(c => c.id === form.couleur_id)!;
    const prefix = q.nom.slice(0, 3).toUpperCase();
    const num = String(Math.floor(Math.random() * 900) + 100);
    const metrage = parseFloat(form.metrage);
    const alerte = parseFloat(form.metrage_alerte);
    const tissu: Tissu = {
      id: 't-' + Date.now(),
      code: `${prefix}-${num}`,
      qualite_id: form.qualite_id, qualite_nom: q.nom,
      couleur_id: form.couleur_id, couleur_nom: c.nom, couleur_hex: c.hex,
      metrage_disponible: metrage,
      metrage_alerte: alerte,
      prix_achat: form.prix_achat ? parseFloat(form.prix_achat) : undefined,
      prix_vente: parseFloat(form.prix_vente),
      emplacement: form.emplacement || undefined,
      observation: form.observation || undefined,
      qr_code: `QR-${prefix}-${num}`,
      boutique_id: 'btq-001',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      statut: metrage <= 0 ? 'epuise' : metrage <= alerte ? 'bas' : 'disponible',
    };
    addTissu(tissu);
    setLoading(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0EFED]">
          <h2 className="text-[15px] font-semibold text-[#141412]">Ajouter un tissu</h2>
          <button onClick={onClose} className="text-[#9E9C97] hover:text-[#5A5854]"><i className="ti ti-x" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-medium text-[#5A5854] block mb-1.5">Qualité *</label>
              <select value={form.qualite_id} onChange={e => set('qualite_id', e.target.value)}
                className="w-full h-9 border border-[#E4E2DE] rounded-lg px-3 text-[13px] outline-none focus:border-[#7C5C3E] bg-white">
                {qualites.map(q => <option key={q.id} value={q.id}>{q.nom}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[12px] font-medium text-[#5A5854] block mb-1.5">Couleur *</label>
              <select value={form.couleur_id} onChange={e => set('couleur_id', e.target.value)}
                className="w-full h-9 border border-[#E4E2DE] rounded-lg px-3 text-[13px] outline-none focus:border-[#7C5C3E] bg-white">
                {couleurs.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-medium text-[#5A5854] block mb-1.5">Métrage disponible (m) *</label>
              <input type="number" min="0" step="0.5" value={form.metrage} onChange={e => set('metrage', e.target.value)}
                placeholder="0" className="w-full h-9 border border-[#E4E2DE] rounded-lg px-3 text-[13px] outline-none focus:border-[#7C5C3E]" />
            </div>
            <div>
              <label className="text-[12px] font-medium text-[#5A5854] block mb-1.5">Seuil d'alerte (m)</label>
              <input type="number" min="0" step="0.5" value={form.metrage_alerte} onChange={e => set('metrage_alerte', e.target.value)}
                placeholder="5" className="w-full h-9 border border-[#E4E2DE] rounded-lg px-3 text-[13px] outline-none focus:border-[#7C5C3E]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-medium text-[#5A5854] block mb-1.5">Prix d'achat /m (optionnel)</label>
              <input type="number" min="0" value={form.prix_achat} onChange={e => set('prix_achat', e.target.value)}
                placeholder="0 FCFA" className="w-full h-9 border border-[#E4E2DE] rounded-lg px-3 text-[13px] outline-none focus:border-[#7C5C3E]" />
            </div>
            <div>
              <label className="text-[12px] font-medium text-[#5A5854] block mb-1.5">Prix de vente /m *</label>
              <input type="number" min="0" value={form.prix_vente} onChange={e => set('prix_vente', e.target.value)}
                placeholder="0 FCFA" className="w-full h-9 border border-[#E4E2DE] rounded-lg px-3 text-[13px] outline-none focus:border-[#7C5C3E]" />
            </div>
          </div>
          <div>
            <label className="text-[12px] font-medium text-[#5A5854] block mb-1.5">Emplacement (optionnel)</label>
            <input value={form.emplacement} onChange={e => set('emplacement', e.target.value)}
              placeholder="Ex: Rayon A - Étagère 2" className="w-full h-9 border border-[#E4E2DE] rounded-lg px-3 text-[13px] outline-none focus:border-[#7C5C3E]" />
          </div>
          <div>
            <label className="text-[12px] font-medium text-[#5A5854] block mb-1.5">Observation (optionnel)</label>
            <textarea value={form.observation} onChange={e => set('observation', e.target.value)}
              placeholder="Notes sur ce tissu…" rows={2}
              className="w-full border border-[#E4E2DE] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#7C5C3E] resize-none" />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={onClose} className="flex-1 h-10 border border-[#E4E2DE] rounded-lg text-[13px] font-medium text-[#5A5854] hover:bg-[#F9F9F8] transition-colors">Annuler</button>
            <button onClick={submit} disabled={loading || !form.metrage || !form.prix_vente}
              className="flex-1 h-10 bg-[#7C5C3E] text-white rounded-lg text-[13px] font-medium hover:bg-[#6A4E34] transition-colors disabled:opacity-40">
              {loading ? 'Enregistrement…' : 'Ajouter le tissu'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StockPage() {
  const { tissus, updateTissu } = useAppStore();
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState<'tous' | 'disponible' | 'bas' | 'epuise'>('tous');
  const [showAdd, setShowAdd] = useState(false);
  const [editMetrage, setEditMetrage] = useState<{ id: string; val: string } | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return tissus.filter(t => {
      const matchSearch = !q || t.qualite_nom.toLowerCase().includes(q) || t.couleur_nom.toLowerCase().includes(q) || t.code.toLowerCase().includes(q);
      const matchStatut = filterStatut === 'tous' || t.statut === filterStatut;
      return matchSearch && matchStatut;
    });
  }, [tissus, search, filterStatut]);

  const stats = { total: tissus.length, disponible: tissus.filter(t => t.statut === 'disponible').length, bas: tissus.filter(t => t.statut === 'bas').length, epuise: tissus.filter(t => t.statut === 'epuise').length };

  function saveMetrage(tissu: Tissu) {
    if (!editMetrage) return;
    const val = parseFloat(editMetrage.val);
    if (isNaN(val) || val < 0) return;
    const statut = val <= 0 ? 'epuise' : val <= tissu.metrage_alerte ? 'bas' : 'disponible';
    updateTissu(tissu.id, { metrage_disponible: val, statut });
    setEditMetrage(null);
  }

  return (
    <div className="animate-fade-in space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total références', val: stats.total, cls: '' },
          { label: 'Disponibles', val: stats.disponible, cls: 'text-[#1A7A4A]' },
          { label: 'Stock bas', val: stats.bas, cls: 'text-[#B45309]' },
          { label: 'Épuisés', val: stats.epuise, cls: 'text-[#C0392B]' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-[#E4E2DE] rounded-xl p-4">
            <p className="text-[12px] text-[#9E9C97] mb-1">{s.label}</p>
            <p className={`text-[24px] font-semibold tracking-tight ${s.cls || 'text-[#141412]'}`}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E4E2DE] rounded-xl">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[#F0EFED]">
          <div className="flex items-center gap-2 flex-1 bg-[#F9F9F8] border border-[#E4E2DE] rounded-lg px-3">
            <i className="ti ti-search text-[#9E9C97] text-sm" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…"
              className="flex-1 h-9 bg-transparent outline-none text-[13px] placeholder:text-[#9E9C97]" />
          </div>
          {(['tous', 'disponible', 'bas', 'epuise'] as const).map(s => (
            <button key={s} onClick={() => setFilterStatut(s)}
              className={`px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors capitalize ${filterStatut === s ? 'bg-[#F5EDE4] text-[#7C5C3E]' : 'text-[#9E9C97] hover:text-[#5A5854]'}`}>
              {s === 'tous' ? 'Tous' : s === 'disponible' ? 'Disponibles' : s === 'bas' ? 'Stock bas' : 'Épuisés'}
            </button>
          ))}
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#7C5C3E] text-white rounded-lg text-[13px] font-medium hover:bg-[#6A4E34] transition-colors shrink-0">
            <i className="ti ti-plus text-sm" /> Ajouter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr>
                {['Code', 'Qualité', 'Couleur', 'Métrage', 'Alerte', 'Prix vente', 'Emplacement', 'Statut', ''].map(h => (
                  <th key={h} className="text-left text-[11px] font-medium text-[#9E9C97] uppercase tracking-[0.4px] px-5 py-2.5 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => {
                const { label, cls } = getStatutStockBadge(t.statut);
                const isEditing = editMetrage?.id === t.id;
                return (
                  <tr key={t.id} className="border-t border-[#F0EFED] hover:bg-[#F9F9F8]">
                    <td className="px-5 py-3 font-medium text-[#141412]">{t.code}</td>
                    <td className="px-5 py-3 text-[#5A5854]">{t.qualite_nom}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <ColorSwatch hex={t.couleur_hex} />
                        <span className="text-[#5A5854]">{t.couleur_nom}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <input type="number" min="0" step="0.5" value={editMetrage.val}
                            onChange={e => setEditMetrage({ id: t.id, val: e.target.value })}
                            className="w-20 h-7 border border-[#7C5C3E] rounded px-2 text-[12px] outline-none"
                            autoFocus />
                          <button onClick={() => saveMetrage(t)} className="text-[#1A7A4A]"><i className="ti ti-check text-sm" /></button>
                          <button onClick={() => setEditMetrage(null)} className="text-[#9E9C97]"><i className="ti ti-x text-sm" /></button>
                        </div>
                      ) : (
                        <span
                          className={`font-medium cursor-pointer hover:underline ${t.statut === 'bas' ? 'text-[#B45309]' : t.statut === 'epuise' ? 'text-[#C0392B]' : 'text-[#141412]'}`}
                          onClick={() => setEditMetrage({ id: t.id, val: String(t.metrage_disponible) })}
                          title="Cliquer pour modifier"
                        >
                          {t.metrage_disponible} m
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-[#9E9C97]">{t.metrage_alerte} m</td>
                    <td className="px-5 py-3 font-medium text-[#141412]">{formatMontant(t.prix_vente)}</td>
                    <td className="px-5 py-3 text-[#9E9C97]">{t.emplacement || '—'}</td>
                    <td className="px-5 py-3"><span className={`badge ${cls}`}>{label}</span></td>
                    <td className="px-5 py-3">
                      <button className="text-[#9E9C97] hover:text-[#5A5854]" title="Voir détails">
                        <i className="ti ti-dots-vertical text-sm" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="px-5 py-10 text-center text-[#9E9C97] text-[13px]">
                  <i className="ti ti-package-off text-2xl block mb-2" />
                  Aucun tissu trouvé
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && <AddTissuModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}
