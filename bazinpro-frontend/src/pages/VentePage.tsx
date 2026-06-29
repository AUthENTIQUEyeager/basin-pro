import { useState, useMemo } from 'react';
import { useAppStore } from '../stores/appStore';
import type { Tissu, ModePaiement, Vente, LigneVente } from '../types';
import { formatMontant, getPaiementLabel } from '../lib/utils';

const PAIEMENTS: { value: ModePaiement; label: string; icon: string }[] = [
  { value: 'especes', label: 'Espèces', icon: 'ti-cash' },
  { value: 'orange_money', label: 'Orange Money', icon: 'ti-device-mobile' },
  { value: 'wave', label: 'Wave', icon: 'ti-wave-sine' },
  { value: 'moov_money', label: 'Moov Money', icon: 'ti-device-mobile' },
];

function ColorSwatch({ hex }: { hex: string }) {
  return (
    <span
      className="inline-block w-2.5 h-2.5 rounded-full border border-[#E4E2DE] shrink-0"
      style={{ background: hex }}
    />
  );
}

function TissuCard({ tissu, selected, onSelect }: { tissu: Tissu; selected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      disabled={tissu.statut === 'epuise'}
      className={`text-left p-3.5 rounded-xl border transition-all ${
        selected
          ? 'border-[#7C5C3E] bg-[#F5EDE4] shadow-sm'
          : tissu.statut === 'epuise'
          ? 'border-[#E4E2DE] bg-[#F9F9F8] opacity-50 cursor-not-allowed'
          : 'border-[#E4E2DE] hover:border-[#7C5C3E] hover:shadow-sm bg-white'
      }`}
    >
      <div className="text-[10px] font-medium text-[#9E9C97] mb-1">{tissu.code}</div>
      <div className="text-[13.5px] font-medium text-[#141412]">{tissu.qualite_nom}</div>
      <div className="flex items-center gap-1.5 text-[12px] text-[#9E9C97] mt-0.5">
        <ColorSwatch hex={tissu.couleur_hex} />
        {tissu.couleur_nom}
      </div>
      <div className="mt-2.5 flex items-center justify-between">
        <span className="text-[13px] font-semibold text-[#7C5C3E]">
          {new Intl.NumberFormat('fr-FR').format(tissu.prix_vente)} F/m
        </span>
        <span className={`text-[11px] font-medium ${
          tissu.statut === 'epuise' ? 'text-[#C0392B]' :
          tissu.statut === 'bas' ? 'text-[#B45309]' : 'text-[#9E9C97]'
        }`}>
          {tissu.metrage_disponible} m
        </span>
      </div>
    </button>
  );
}

export function VentePage() {
  const { tissus, clients, addVente, ventes } = useAppStore();
  const [search, setSearch] = useState('');
  const [selectedTissu, setSelectedTissu] = useState<Tissu | null>(null);
  const [metrage, setMetrage] = useState('');
  const [paiement, setPaiement] = useState<ModePaiement>('especes');
  const [clientNom, setClientNom] = useState('');
  const [clientPrenom, setClientPrenom] = useState('');
  const [clientTel, setClientTel] = useState('');
  const [step, setStep] = useState<'tissu' | 'form' | 'confirm'>('tissu');
  const [venteConfirmee, setVenteConfirmee] = useState<Vente | null>(null);
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return tissus.filter(t => t.statut !== 'epuise');
    return tissus.filter(t =>
      t.qualite_nom.toLowerCase().includes(q) ||
      t.couleur_nom.toLowerCase().includes(q) ||
      t.code.toLowerCase().includes(q)
    );
  }, [tissus, search]);

  const montantTotal = selectedTissu && metrage
    ? selectedTissu.prix_vente * parseFloat(metrage)
    : 0;

  async function valider() {
    if (!selectedTissu || !metrage || parseFloat(metrage) <= 0) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));

    const lastNum = ventes.length > 0
      ? parseInt(ventes[0].numero.split('-')[2] || '0') + 1
      : 1;
    const numero = `V-${new Date().toISOString().slice(2, 4)}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(lastNum).padStart(3, '0')}`;

    const ligne: LigneVente = {
      tissu_id: selectedTissu.id,
      tissu_code: selectedTissu.code,
      qualite_nom: selectedTissu.qualite_nom,
      couleur_nom: selectedTissu.couleur_nom,
      metrage: parseFloat(metrage),
      prix_unitaire: selectedTissu.prix_vente,
      montant: montantTotal,
    };

    const vente: Vente = {
      id: 'v-' + Date.now(),
      numero,
      boutique_id: 'btq-001',
      caissier_id: 'usr-001',
      caissier_nom: 'Amadou Maïga',
      client_nom: clientNom || undefined,
      client_prenom: clientPrenom || undefined,
      client_telephone: clientTel || undefined,
      client_id: (clientNom && clientPrenom) ? 'cl-' + Date.now() : undefined,
      lignes: [ligne],
      montant_total: montantTotal,
      mode_paiement: paiement,
      statut: 'validee',
      synced: false,
      created_at: new Date().toISOString(),
    };

    addVente(vente);
    setVenteConfirmee(vente);
    setStep('confirm');
    setLoading(false);
  }

  function reset() {
    setSelectedTissu(null);
    setMetrage('');
    setPaiement('especes');
    setClientNom('');
    setClientPrenom('');
    setClientTel('');
    setStep('tissu');
    setVenteConfirmee(null);
    setSearch('');
  }

  if (step === 'confirm' && venteConfirmee) {
    return (
      <div className="animate-fade-in max-w-lg mx-auto">
        <div className="bg-white border border-[#E4E2DE] rounded-xl overflow-hidden">
          {/* Success header */}
          <div className="bg-[#EDFAF3] px-6 py-8 text-center border-b border-[#C6EFDC]">
            <div className="w-14 h-14 bg-[#1A7A4A] rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="ti ti-check text-white text-2xl" aria-hidden="true" />
            </div>
            <h2 className="text-[18px] font-semibold text-[#141412]">Vente enregistrée</h2>
            <p className="text-[#9E9C97] text-[13px] mt-1">{venteConfirmee.numero}</p>
          </div>

          {/* Reçu */}
          <div className="p-6 space-y-4">
            <div className="space-y-2 text-[13px]">
              {[
                ['Tissu', `${venteConfirmee.lignes[0].qualite_nom} ${venteConfirmee.lignes[0].couleur_nom}`],
                ['Métrage', `${venteConfirmee.lignes[0].metrage} m`],
                ['Prix au mètre', formatMontant(venteConfirmee.lignes[0].prix_unitaire)],
                ['Paiement', getPaiementLabel(venteConfirmee.mode_paiement)],
                ['Client', venteConfirmee.client_prenom ? `${venteConfirmee.client_prenom} ${venteConfirmee.client_nom}` : '—'],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-[#9E9C97]">{label}</span>
                  <span className="font-medium text-[#141412]">{val}</span>
                </div>
              ))}
              <div className="flex justify-between pt-3 border-t border-[#F0EFED] text-[15px] font-semibold">
                <span className="text-[#5A5854]">Total</span>
                <span className="text-[#7C5C3E]">{formatMontant(venteConfirmee.montant_total)}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-[#E4E2DE] rounded-lg text-[13px] font-medium text-[#5A5854] hover:bg-[#F9F9F8] transition-colors"
              >
                <i className="ti ti-printer" aria-hidden="true" />
                Imprimer le reçu
              </button>
              <button
                onClick={reset}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#7C5C3E] text-white rounded-lg text-[13px] font-medium hover:bg-[#6A4E34] transition-colors"
              >
                <i className="ti ti-plus" aria-hidden="true" />
                Nouvelle vente
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in grid grid-cols-[1fr_340px] gap-5 h-full">
      {/* Gauche : sélection tissu */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 bg-white border border-[#E4E2DE] rounded-xl px-4 py-0">
          <i className="ti ti-search text-[#9E9C97] text-base" aria-hidden="true" />
          <input
            type="text"
            placeholder="Rechercher qualité, couleur, code ou scanner QR…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 h-11 bg-transparent outline-none text-[13.5px] text-[#141412] placeholder:text-[#9E9C97]"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-[#9E9C97] hover:text-[#5A5854]">
              <i className="ti ti-x text-sm" aria-hidden="true" />
            </button>
          )}
          <button className="flex items-center gap-1.5 text-[#7C5C3E] text-[13px] font-medium">
            <i className="ti ti-scan text-base" aria-hidden="true" />
            Scanner
          </button>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 text-[12px]">
          {['Choisir un tissu', 'Informations client', 'Valider'].map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-medium ${
                step === 'tissu' && i === 0 ? 'bg-[#7C5C3E] text-white' :
                step === 'form' && i <= 1 ? 'bg-[#7C5C3E] text-white' :
                i < (step === 'tissu' ? 0 : step === 'form' ? 1 : 2) ? 'bg-[#1A7A4A] text-white' :
                'bg-[#F0EFED] text-[#9E9C97]'
              }`}>{i + 1}</div>
              <span className={step === ['tissu','form','confirm'][i] ? 'text-[#141412] font-medium' : 'text-[#9E9C97]'}>{s}</span>
              {i < 2 && <i className="ti ti-chevron-right text-[#C8C5BF] text-xs" aria-hidden="true" />}
            </div>
          ))}
        </div>

        {/* Grille tissus */}
        <div className="grid grid-cols-3 gap-2.5">
          {filtered.map(tissu => (
            <TissuCard
              key={tissu.id}
              tissu={tissu}
              selected={selectedTissu?.id === tissu.id}
              onSelect={() => { setSelectedTissu(tissu); setStep('form'); }}
            />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3 py-12 text-center text-[#9E9C97] text-[13px]">
              <i className="ti ti-package-off text-2xl block mb-2" aria-hidden="true" />
              Aucun tissu trouvé pour "{search}"
            </div>
          )}
        </div>
      </div>

      {/* Droite : formulaire */}
      <div className="space-y-4">
        {/* Tissu sélectionné */}
        {selectedTissu ? (
          <div className="bg-[#F5EDE4] border border-[#E8D8C8] rounded-xl p-4">
            <div className="flex items-start justify-between mb-1">
              <div>
                <p className="text-[12px] font-medium text-[#9E9C97]">{selectedTissu.code}</p>
                <p className="text-[15px] font-semibold text-[#141412]">{selectedTissu.qualite_nom}</p>
                <div className="flex items-center gap-1.5 text-[12px] text-[#5A5854] mt-0.5">
                  <ColorSwatch hex={selectedTissu.couleur_hex} />
                  {selectedTissu.couleur_nom}
                </div>
              </div>
              <button onClick={() => { setSelectedTissu(null); setStep('tissu'); }} className="text-[#9E9C97] hover:text-[#5A5854]">
                <i className="ti ti-x text-sm" aria-hidden="true" />
              </button>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#E8D8C8]">
              <span className="text-[13px] text-[#5A5854]">Stock restant</span>
              <span className="text-[13px] font-medium text-[#141412]">{selectedTissu.metrage_disponible} m</span>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-[#E4E2DE] rounded-xl p-5 text-center text-[#9E9C97] text-[13px]">
            <i className="ti ti-hand-click text-xl block mb-1" aria-hidden="true" />
            Sélectionner un tissu
          </div>
        )}

        {/* Client (optionnel) */}
        <div className="bg-white border border-[#E4E2DE] rounded-xl p-4 space-y-3">
          <p className="text-[12px] font-medium text-[#9E9C97] uppercase tracking-[0.5px]">Client (optionnel)</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[12px] font-medium text-[#5A5854] block mb-1">Prénom</label>
              <input
                value={clientPrenom}
                onChange={e => setClientPrenom(e.target.value)}
                placeholder="Fatoumata"
                className="w-full h-9 border border-[#E4E2DE] rounded-lg px-3 text-[13px] outline-none focus:border-[#7C5C3E] transition-colors"
              />
            </div>
            <div>
              <label className="text-[12px] font-medium text-[#5A5854] block mb-1">Nom</label>
              <input
                value={clientNom}
                onChange={e => setClientNom(e.target.value)}
                placeholder="Koné"
                className="w-full h-9 border border-[#E4E2DE] rounded-lg px-3 text-[13px] outline-none focus:border-[#7C5C3E] transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="text-[12px] font-medium text-[#5A5854] block mb-1">Téléphone</label>
            <input
              value={clientTel}
              onChange={e => setClientTel(e.target.value)}
              placeholder="+226 70 00 00 00"
              className="w-full h-9 border border-[#E4E2DE] rounded-lg px-3 text-[13px] outline-none focus:border-[#7C5C3E] transition-colors"
            />
          </div>
        </div>

        {/* Métrage + paiement */}
        <div className="bg-white border border-[#E4E2DE] rounded-xl p-4 space-y-3">
          <div>
            <label className="text-[12px] font-medium text-[#5A5854] block mb-1">Métrage (m)</label>
            <input
              type="number"
              min="0.5"
              step="0.5"
              max={selectedTissu?.metrage_disponible || 9999}
              value={metrage}
              onChange={e => setMetrage(e.target.value)}
              placeholder="0"
              className="w-full h-10 border border-[#E4E2DE] rounded-lg px-3 text-[16px] font-semibold outline-none focus:border-[#7C5C3E] transition-colors"
            />
            {selectedTissu && metrage && parseFloat(metrage) > selectedTissu.metrage_disponible && (
              <p className="text-[11.5px] text-[#C0392B] mt-1">
                Stock insuffisant ({selectedTissu.metrage_disponible} m disponibles)
              </p>
            )}
          </div>

          <div>
            <label className="text-[12px] font-medium text-[#5A5854] block mb-2">Mode de paiement</label>
            <div className="grid grid-cols-2 gap-1.5">
              {PAIEMENTS.map(p => (
                <button
                  key={p.value}
                  onClick={() => setPaiement(p.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-[12.5px] transition-all ${
                    paiement === p.value
                      ? 'border-[#7C5C3E] bg-[#F5EDE4] text-[#7C5C3E] font-medium'
                      : 'border-[#E4E2DE] text-[#5A5854] hover:border-[#C8C5BF]'
                  }`}
                >
                  <i className={`ti ${p.icon} text-sm`} aria-hidden="true" />
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Récapitulatif */}
        {montantTotal > 0 && (
          <div className="bg-[#F5EDE4] border border-[#E8D8C8] rounded-xl p-4 space-y-2 text-[13px]">
            <div className="flex justify-between">
              <span className="text-[#5A5854]">Prix au mètre</span>
              <span className="font-medium">{formatMontant(selectedTissu!.prix_vente)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5A5854]">Métrage</span>
              <span className="font-medium">{metrage} m</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[#E8D8C8] text-[15px] font-semibold">
              <span className="text-[#5A5854]">Total à payer</span>
              <span className="text-[#7C5C3E]">{formatMontant(montantTotal)}</span>
            </div>
          </div>
        )}

        <button
          onClick={valider}
          disabled={!selectedTissu || !metrage || parseFloat(metrage) <= 0 || loading}
          className="w-full flex items-center justify-center gap-2 h-11 bg-[#7C5C3E] text-white rounded-xl text-[14px] font-medium hover:bg-[#6A4E34] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <><i className="ti ti-loader-2 animate-spin" aria-hidden="true" /> Enregistrement…</>
          ) : (
            <><i className="ti ti-check" aria-hidden="true" /> Valider la vente et imprimer</>
          )}
        </button>
      </div>
    </div>
  );
}
