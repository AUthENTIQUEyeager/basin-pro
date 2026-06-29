import { useState } from 'react';
import { useAppStore } from '../stores/appStore';

const PRESET_COLORS = [
  '#2557D6','#E91E8C','#D4AF37','#F5F5F0','#1A1A1A','#1B6B3A',
  '#C0392B','#8B4513','#FF6B35','#7C5C3E','#4A90D9','#6C3483',
];

export function ParametresPage() {
  const { boutique, qualites, couleurs, addQualite, addCouleur } = useAppStore();
  const [newQualite, setNewQualite] = useState('');
  const [newCouleurNom, setNewCouleurNom] = useState('');
  const [newCouleurHex, setNewCouleurHex] = useState('#7C5C3E');
  const [tab, setTab] = useState<'boutique' | 'qualites' | 'couleurs'>('boutique');

  function handleAddQualite() {
    if (!newQualite.trim()) return;
    addQualite(newQualite.trim());
    setNewQualite('');
  }

  function handleAddCouleur() {
    if (!newCouleurNom.trim()) return;
    addCouleur(newCouleurNom.trim(), newCouleurHex);
    setNewCouleurNom('');
    setNewCouleurHex('#7C5C3E');
  }

  return (
    <div className="animate-fade-in max-w-2xl space-y-4">
      {/* Tabs */}
      <div className="flex border-b border-[#E4E2DE] gap-1">
        {[
          { id: 'boutique', label: 'Boutique' },
          { id: 'qualites', label: 'Qualités' },
          { id: 'couleurs', label: 'Couleurs' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
            className={`px-4 py-2.5 text-[13px] font-medium border-b-2 -mb-px transition-colors ${tab === t.id ? 'border-[#7C5C3E] text-[#7C5C3E]' : 'border-transparent text-[#9E9C97] hover:text-[#5A5854]'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'boutique' && (
        <div className="bg-white border border-[#E4E2DE] rounded-xl p-6 space-y-4">
          <h2 className="text-[14px] font-semibold text-[#141412] mb-4">Informations de la boutique</h2>
          {[
            { label: 'Nom de la boutique', value: boutique.nom },
            { label: 'Adresse', value: boutique.adresse },
            { label: 'Téléphone', value: boutique.telephone },
            { label: 'Statut abonnement', value: boutique.abonnement_statut },
            { label: 'Fin d\'abonnement', value: new Date(boutique.abonnement_fin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) },
          ].map(f => (
            <div key={f.label}>
              <label className="text-[12px] font-medium text-[#5A5854] block mb-1.5">{f.label}</label>
              <input defaultValue={f.value}
                className="w-full h-9 border border-[#E4E2DE] rounded-lg px-3 text-[13px] outline-none focus:border-[#7C5C3E] bg-[#F9F9F8]"
                readOnly={f.label.includes('abonnement') || f.label.includes('Fin')} />
            </div>
          ))}
          <button className="px-4 py-2 bg-[#7C5C3E] text-white rounded-lg text-[13px] font-medium hover:bg-[#6A4E34] transition-colors">
            Enregistrer les modifications
          </button>
        </div>
      )}

      {tab === 'qualites' && (
        <div className="bg-white border border-[#E4E2DE] rounded-xl">
          <div className="px-5 py-4 border-b border-[#F0EFED]">
            <h2 className="text-[13.5px] font-medium text-[#141412]">Qualités de bazin</h2>
            <p className="text-[12px] text-[#9E9C97] mt-0.5">Ces qualités seront proposées lors de l'ajout de stock</p>
          </div>
          <div className="p-5">
            <div className="flex gap-2 mb-5">
              <input value={newQualite} onChange={e => setNewQualite(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddQualite()}
                placeholder="Ex: Getzner Supreme…"
                className="flex-1 h-9 border border-[#E4E2DE] rounded-lg px-3 text-[13px] outline-none focus:border-[#7C5C3E]" />
              <button onClick={handleAddQualite} disabled={!newQualite.trim()}
                className="px-4 h-9 bg-[#7C5C3E] text-white rounded-lg text-[13px] font-medium hover:bg-[#6A4E34] disabled:opacity-40">
                Ajouter
              </button>
            </div>
            <div className="space-y-2">
              {qualites.map(q => (
                <div key={q.id} className="flex items-center justify-between px-4 py-2.5 bg-[#F9F9F8] rounded-lg border border-[#E4E2DE]">
                  <span className="text-[13px] font-medium text-[#141412]">{q.nom}</span>
                  <span className="badge badge-bazin">Qualité</span>
                </div>
              ))}
              {qualites.length === 0 && (
                <p className="text-[13px] text-[#9E9C97] text-center py-4">Aucune qualité enregistrée</p>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'couleurs' && (
        <div className="bg-white border border-[#E4E2DE] rounded-xl">
          <div className="px-5 py-4 border-b border-[#F0EFED]">
            <h2 className="text-[13.5px] font-medium text-[#141412]">Couleurs</h2>
            <p className="text-[12px] text-[#9E9C97] mt-0.5">Définissez les couleurs disponibles pour vos tissus</p>
          </div>
          <div className="p-5">
            <div className="space-y-3 mb-5">
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <input value={newCouleurNom} onChange={e => setNewCouleurNom(e.target.value)}
                  placeholder="Nom de la couleur…"
                  className="h-9 border border-[#E4E2DE] rounded-lg px-3 text-[13px] outline-none focus:border-[#7C5C3E]" />
                <input type="color" value={newCouleurHex} onChange={e => setNewCouleurHex(e.target.value)}
                  className="h-9 w-20 border border-[#E4E2DE] rounded-lg cursor-pointer" />
              </div>
              {/* Presets */}
              <div className="flex gap-1.5 flex-wrap">
                {PRESET_COLORS.map(hex => (
                  <button key={hex} onClick={() => setNewCouleurHex(hex)}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${newCouleurHex === hex ? 'border-[#7C5C3E] scale-110' : 'border-transparent hover:scale-105'}`}
                    style={{ background: hex }} title={hex} />
                ))}
              </div>
              <button onClick={handleAddCouleur} disabled={!newCouleurNom.trim()}
                className="w-full h-9 bg-[#7C5C3E] text-white rounded-lg text-[13px] font-medium hover:bg-[#6A4E34] disabled:opacity-40">
                Ajouter la couleur
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {couleurs.map(c => (
                <div key={c.id} className="flex items-center gap-2.5 px-3 py-2.5 bg-[#F9F9F8] rounded-lg border border-[#E4E2DE]">
                  <span className="w-4 h-4 rounded-full border border-[#E4E2DE] shrink-0" style={{ background: c.hex }} />
                  <span className="text-[13px] font-medium text-[#141412]">{c.nom}</span>
                  <span className="text-[11px] text-[#9E9C97] ml-auto">{c.hex}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
