import { useAppStore } from '../stores/appStore';
import { useNavStore } from '../stores/appStore';
import { formatMontant, formatHeure, getPaiementLabel, getPaiementBadgeClass, getStatutStockBadge } from '../lib/utils';
import { MOCK_STATS_SEMAINE, MOCK_TOP_PRODUITS } from '../lib/mockData';

function KpiCard({ label, value, delta, deltaPositive, icon, accent }: {
  label: string; value: string; delta?: string; deltaPositive?: boolean; icon: string; accent?: boolean;
}) {
  return (
    <div className={`bg-white border rounded-xl p-5 ${accent ? 'border-l-[3px] border-l-[#7C5C3E] border-t-[0.5px] border-r-[0.5px] border-b-[0.5px] border-[#E4E2DE]' : 'border-[0.5px] border-[#E4E2DE]'}`}>
      <div className="flex items-center gap-1.5 text-[12px] text-[#9E9C97] mb-2">
        <i className={`ti ${icon} text-sm`} aria-hidden="true" />
        {label}
      </div>
      <div className="text-[26px] font-semibold text-[#141412] tracking-tight leading-none mb-1.5">{value}</div>
      {delta && (
        <div className={`flex items-center gap-1 text-[11.5px] ${deltaPositive ? 'text-[#1A7A4A]' : 'text-[#C0392B]'}`}>
          <i className={`ti ${deltaPositive ? 'ti-arrow-up' : 'ti-arrow-down'} text-xs`} aria-hidden="true" />
          {delta}
        </div>
      )}
    </div>
  );
}

function MiniChart() {
  const max = Math.max(...MOCK_STATS_SEMAINE.map(s => s.ca));
  const jours = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];
  return (
    <div className="flex items-end gap-1.5 h-20 pt-2">
      {MOCK_STATS_SEMAINE.map((stat, i) => {
        const height = Math.round((stat.ca / max) * 100);
        const isToday = i === MOCK_STATS_SEMAINE.length - 1;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
            <div
              className={`w-full rounded-t-sm transition-colors ${isToday ? 'bg-[#7C5C3E]' : 'bg-[#F5EDE4] group-hover:bg-[#E8D8C8]'}`}
              style={{ height: `${height}%` }}
              title={formatMontant(stat.ca)}
            />
            <span className={`text-[10px] ${isToday ? 'text-[#7C5C3E] font-medium' : 'text-[#9E9C97]'}`}>
              {jours[i]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function DashboardPage() {
  const { ventes, tissus } = useAppStore();
  const { navigate } = useNavStore();

  const ventesAujourdHui = ventes.filter(v => {
    const d = new Date(v.created_at);
    const today = new Date();
    return d.toDateString() === today.toDateString() && v.statut === 'validee';
  });

  const caAujourdhui = ventesAujourdHui.reduce((s, v) => s + v.montant_total, 0);
  const alertes = tissus.filter(t => t.statut === 'bas' || t.statut === 'epuise');
  const ventesRecentes = ventes.slice(0, 6);

  return (
    <div className="animate-fade-in space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3.5">
        <KpiCard label="CA du jour" value={new Intl.NumberFormat('fr-FR').format(caAujourdhui)} delta="+12% vs hier" deltaPositive icon="ti-trending-up" accent />
        <KpiCard label="Ventes du jour" value={ventesAujourdHui.length.toString()} delta="+3 vs hier" deltaPositive icon="ti-receipt" />
        <KpiCard label="Clients actifs" value="11" delta="5 nouveaux ce mois" deltaPositive icon="ti-users" />
        <KpiCard label="Alertes stock" value={alertes.length.toString()} delta={alertes.length > 0 ? 'Réappro requis' : 'Stock OK'} deltaPositive={alertes.length === 0} icon="ti-alert-triangle" />
      </div>

      {/* Chart + Alertes */}
      <div className="grid grid-cols-[1fr_320px] gap-4">
        <div className="bg-white border border-[#E4E2DE] rounded-xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0EFED]">
            <h2 className="text-[13.5px] font-medium text-[#141412]">Chiffre d'affaires — 7 derniers jours</h2>
            <span className="text-[12px] text-[#7C5C3E] font-medium cursor-pointer">Ce mois</span>
          </div>
          <div className="px-5 py-4">
            <MiniChart />
          </div>
          <div className="px-5 pb-4 text-[11.5px] text-[#9E9C97]">
            En FCFA · Max : {formatMontant(Math.max(...MOCK_STATS_SEMAINE.map(s => s.ca)))} (samedi)
          </div>
        </div>

        <div className="bg-white border border-[#E4E2DE] rounded-xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0EFED]">
            <h2 className="text-[13.5px] font-medium text-[#141412]">Alertes stock</h2>
            <button onClick={() => navigate('stock')} className="text-[12px] text-[#7C5C3E] font-medium">Voir tout</button>
          </div>
          <div>
            {alertes.length === 0 ? (
              <div className="px-5 py-8 text-center text-[13px] text-[#9E9C97]">
                <i className="ti ti-circle-check text-2xl text-[#1A7A4A] block mb-2" aria-hidden="true" />
                Tous les stocks sont OK
              </div>
            ) : alertes.map((t, i) => {
              const { label, cls } = getStatutStockBadge(t.statut);
              return (
                <div key={t.id} className={`flex items-center gap-3 px-5 py-3 ${i > 0 ? 'border-t border-[#F0EFED]' : ''} hover:bg-[#F9F9F8] cursor-pointer`}
                  onClick={() => navigate('stock')}>
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${t.statut === 'bas' ? 'bg-[#F59E0B]' : 'bg-[#C0392B]'}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#141412] truncate">{t.qualite_nom} {t.couleur_nom}</p>
                    <p className="text-[11.5px] text-[#9E9C97]">{t.code} · {t.emplacement || '—'}</p>
                  </div>
                  <span className={`badge ${cls} text-[11px]`}>{t.metrage_disponible} m</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dernières ventes + Top produits */}
      <div className="grid grid-cols-[1fr_280px] gap-4">
        <div className="bg-white border border-[#E4E2DE] rounded-xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0EFED]">
            <h2 className="text-[13.5px] font-medium text-[#141412]">Dernières ventes</h2>
            <button onClick={() => navigate('historique')} className="text-[12px] text-[#7C5C3E] font-medium">Historique complet</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr>
                  {['N° vente', 'Tissu', 'Client', 'Montant', 'Paiement', 'Heure'].map(h => (
                    <th key={h} className="text-left text-[11px] font-medium text-[#9E9C97] uppercase tracking-[0.5px] px-5 py-2.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ventesRecentes.map((v) => (
                  <tr key={v.id} className="border-t border-[#F0EFED] hover:bg-[#F9F9F8]">
                    <td className="px-5 py-3 font-medium text-[#141412]">{v.numero}</td>
                    <td className="px-5 py-3 text-[#5A5854]">{v.lignes[0]?.qualite_nom} {v.lignes[0]?.couleur_nom}</td>
                    <td className="px-5 py-3 text-[#5A5854]">{v.client_prenom ? `${v.client_prenom} ${v.client_nom}` : '—'}</td>
                    <td className="px-5 py-3 font-medium text-[#141412]">{formatMontant(v.montant_total)}</td>
                    <td className="px-5 py-3">
                      <span className={`badge ${getPaiementBadgeClass(v.mode_paiement)}`}>
                        {getPaiementLabel(v.mode_paiement)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#9E9C97]">{formatHeure(v.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top produits */}
        <div className="bg-white border border-[#E4E2DE] rounded-xl">
          <div className="px-5 py-4 border-b border-[#F0EFED]">
            <h2 className="text-[13.5px] font-medium text-[#141412]">Produits les plus vendus</h2>
          </div>
          <div>
            {MOCK_TOP_PRODUITS.map((p, i) => (
              <div key={i} className={`flex items-center gap-3 px-5 py-3 ${i > 0 ? 'border-t border-[#F0EFED]' : ''}`}>
                <span className="text-[12px] font-medium text-[#9E9C97] w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-[#141412] truncate">{p.qualite_nom} {p.couleur_nom}</p>
                  <p className="text-[11.5px] text-[#9E9C97]">{p.total_vendu} m vendus</p>
                </div>
                <span className="text-[12px] font-medium text-[#7C5C3E]">{new Intl.NumberFormat('fr-FR').format(p.ca_genere / 1000)}k</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
