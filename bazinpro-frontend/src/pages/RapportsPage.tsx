import { useState } from 'react';
import { useAppStore } from '../stores/appStore';
import { formatMontant } from '../lib/utils';
import { MOCK_STATS_SEMAINE, MOCK_TOP_PRODUITS } from '../lib/mockData';

type Periode = 'jour' | 'semaine' | 'mois' | 'annee';

function BarChart({ data }: { data: { label: string; value: number; max: number }[] }) {
  return (
    <div className="space-y-2.5">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-[11.5px] text-[#9E9C97] w-8 text-right shrink-0">{d.label}</span>
          <div className="flex-1 bg-[#F0EFED] rounded-full h-2 overflow-hidden">
            <div className="h-full bg-[#7C5C3E] rounded-full transition-all duration-500"
              style={{ width: `${(d.value / d.max) * 100}%` }} />
          </div>
          <span className="text-[12px] font-medium text-[#141412] w-24 text-right shrink-0">{formatMontant(d.value)}</span>
        </div>
      ))}
    </div>
  );
}

function ColumnChart({ data }: { data: { label: string; ca: number; depenses: number }[] }) {
  const max = Math.max(...data.map(d => d.ca));
  return (
    <div className="flex items-end gap-2 h-28">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
          <div className="w-full flex flex-col justify-end" style={{ height: '80px' }}>
            <div className="w-full bg-[#F5EDE4] rounded-t-sm group-hover:bg-[#E8D8C8] transition-colors"
              style={{ height: `${(d.ca / max) * 80}px` }}
              title={formatMontant(d.ca)} />
          </div>
          <span className="text-[10px] text-[#9E9C97]">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function RapportsPage() {
  const { ventes, depenses } = useAppStore();
  const [periode, setPeriode] = useState<Periode>('semaine');

  const stats = MOCK_STATS_SEMAINE;
  const totalCA = stats.reduce((s, d) => s + d.ca, 0);
  const totalDepenses = depenses.reduce((s, d) => s + d.montant, 0);
  const totalVentes = stats.reduce((s, d) => s + d.nb_ventes, 0);
  const beneficeNet = totalCA - totalDepenses;

  const chartData = stats.map(s => ({
    label: new Date(s.date).toLocaleDateString('fr-FR', { weekday: 'short' }).slice(0, 2),
    ca: s.ca, depenses: s.depenses,
  }));

  const maxCA = Math.max(...stats.map(s => s.ca));
  const barData = stats.map(s => ({
    label: new Date(s.date).toLocaleDateString('fr-FR', { weekday: 'short' }).slice(0, 2),
    value: s.ca, max: maxCA,
  }));

  return (
    <div className="animate-fade-in space-y-4">
      {/* Période */}
      <div className="flex items-center gap-2">
        {(['jour', 'semaine', 'mois', 'annee'] as Periode[]).map(p => (
          <button key={p} onClick={() => setPeriode(p)}
            className={`px-4 py-1.5 rounded-lg text-[13px] font-medium transition-colors capitalize ${periode === p ? 'bg-[#7C5C3E] text-white' : 'bg-white border border-[#E4E2DE] text-[#5A5854] hover:bg-[#F9F9F8]'}`}>
            {p === 'jour' ? 'Aujourd\'hui' : p === 'semaine' ? 'Cette semaine' : p === 'mois' ? 'Ce mois' : 'Cette année'}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E4E2DE] rounded-lg text-[12.5px] text-[#5A5854] bg-white hover:bg-[#F9F9F8]">
            <i className="ti ti-file-export text-sm" /> PDF
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E4E2DE] rounded-lg text-[12.5px] text-[#5A5854] bg-white hover:bg-[#F9F9F8]">
            <i className="ti ti-table-export text-sm" /> Excel
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Chiffre d\'affaires', value: formatMontant(totalCA), icon: 'ti-trending-up', accent: true },
          { label: 'Nombre de ventes', value: totalVentes.toString(), icon: 'ti-receipt' },
          { label: 'Dépenses', value: formatMontant(totalDepenses), icon: 'ti-wallet', negative: true },
          { label: 'Bénéfice net', value: formatMontant(beneficeNet), icon: 'ti-coin', positive: true },
        ].map(k => (
          <div key={k.label} className={`bg-white border rounded-xl p-4 ${k.accent ? 'border-l-[3px] border-l-[#7C5C3E] border-y-[0.5px] border-r-[0.5px] border-[#E4E2DE]' : 'border-[0.5px] border-[#E4E2DE]'}`}>
            <div className="flex items-center gap-1.5 text-[12px] text-[#9E9C97] mb-1.5">
              <i className={`ti ${k.icon} text-sm`} />
              {k.label}
            </div>
            <p className={`text-[22px] font-semibold tracking-tight ${k.positive ? 'text-[#1A7A4A]' : k.negative ? 'text-[#C0392B]' : 'text-[#141412]'}`}>
              {k.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_300px] gap-4">
        {/* Évolution CA */}
        <div className="bg-white border border-[#E4E2DE] rounded-xl">
          <div className="px-5 py-4 border-b border-[#F0EFED]">
            <h2 className="text-[13.5px] font-medium text-[#141412]">Évolution du chiffre d'affaires</h2>
          </div>
          <div className="p-5">
            <ColumnChart data={chartData} />
            <div className="mt-4 pt-4 border-t border-[#F0EFED]">
              <BarChart data={barData} />
            </div>
          </div>
        </div>

        {/* Top produits */}
        <div className="space-y-4">
          <div className="bg-white border border-[#E4E2DE] rounded-xl">
            <div className="px-5 py-4 border-b border-[#F0EFED]">
              <h2 className="text-[13.5px] font-medium text-[#141412]">Top produits</h2>
            </div>
            <div className="divide-y divide-[#F0EFED]">
              {MOCK_TOP_PRODUITS.map((p, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3">
                  <span className="text-[11px] font-medium text-[#9E9C97] w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#141412] truncate">{p.qualite_nom} {p.couleur_nom}</p>
                    <div className="mt-1 bg-[#F0EFED] rounded-full h-1.5 overflow-hidden">
                      <div className="h-full bg-[#7C5C3E] rounded-full"
                        style={{ width: `${(p.ca_genere / MOCK_TOP_PRODUITS[0].ca_genere) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-[12px] font-medium text-[#7C5C3E] shrink-0">
                    {new Intl.NumberFormat('fr-FR').format(p.ca_genere / 1000)}k
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Répartition paiements */}
          <div className="bg-white border border-[#E4E2DE] rounded-xl p-5">
            <h2 className="text-[13.5px] font-medium text-[#141412] mb-4">Modes de paiement</h2>
            <div className="space-y-2.5">
              {[
                { label: 'Orange Money', pct: 42, cls: 'bg-[#F59E0B]' },
                { label: 'Espèces', pct: 31, cls: 'bg-[#9E9C97]' },
                { label: 'Wave', pct: 20, cls: 'bg-[#185FA5]' },
                { label: 'Moov Money', pct: 7, cls: 'bg-[#1A7A4A]' },
              ].map(m => (
                <div key={m.label} className="flex items-center gap-2.5">
                  <span className="text-[12px] text-[#5A5854] w-24 shrink-0">{m.label}</span>
                  <div className="flex-1 bg-[#F0EFED] rounded-full h-1.5 overflow-hidden">
                    <div className={`h-full ${m.cls} rounded-full`} style={{ width: `${m.pct}%` }} />
                  </div>
                  <span className="text-[12px] font-medium text-[#141412] w-8 text-right">{m.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
