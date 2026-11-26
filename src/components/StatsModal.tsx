import React from 'react';
import { BarChart3, X } from 'lucide-react';
import type { LineStatus, NightBusLine, ProvinceConcessionSummary } from '../types/nightBus';
import { computeNightBusStats } from '../utils/nightBusLogic';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  allLines: NightBusLine[];
  provinceSummaries: ProvinceConcessionSummary[];
  onFilterStatuses: (statuses: LineStatus[]) => void;
  onFilterProvince: (province: string) => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  allLines,
  provinceSummaries,
  onFilterStatuses,
  onFilterProvince,
}) => {
  if (!isOpen) return null;

  const stats = computeNightBusStats(allLines);
  const pct = (part: number, total: number) =>
    total > 0 ? ((part / total) * 100).toFixed(1).replace('.', ',') : '0,0';

  return (
    <div
      id="statsModal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="statsModalTitle"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-[#060e0a]/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
    >
      <div className="bg-[var(--bg-card)] border border-[var(--border-focus)] rounded-[6px] shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <BarChart3 className="w-4 h-4 text-[var(--accent-gold)]" />
            <div>
              <h2
                id="statsModalTitle"
                className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]"
              >
                Landelijke Statistieken, Concessies &amp; Methodiek (Peildatum 26 nov. 2026)
              </h2>
              <p className="text-[11px] font-mono text-[var(--text-muted)]">
                Inventarisatie regionale nachtstreeklijnen · {stats.totalLines} gecodeerde dossiers in 12 provincies
              </p>
            </div>
          </div>
          <button
            id="closeStatsModalBtn"
            type="button"
            onClick={onClose}
            aria-label="Sluit statistieken"
            className="p-1.5 rounded-[4px] bg-[var(--bg-main)] hover:bg-[var(--bg-card-hover)] text-[var(--text-muted)] hover:text-[var(--status-crimson)] border border-[var(--border-subtle)] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 text-xs text-[var(--text-muted)] leading-relaxed">
          {/* 3-Koloms KPI-Kaarten Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[var(--bg-main)] border border-[var(--border-subtle)] border-l-2 border-l-[#38bdf8] rounded-[5px] p-3.5 flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-mono uppercase text-[var(--text-dim)]">
                  Actief · Reguliere Nachtlijnen
                </div>
                <div className="text-2xl font-bold font-mono text-[#38bdf8] mt-1">
                  {stats.activePrimaryOutsideRetHwgo}{' '}
                  <span className="text-xs font-normal text-[var(--text-muted)]">
                    streek (+13 RET BOB)
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] mt-1.5">
                  <strong>58 actieve streeklijnen</strong> buiten Rotterdam RET (GD 12, ANF 13, U-OV 11, NH/Almere 15, ZH 7) plus 3 sec. HWGO en Twente lijn 9.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onFilterStatuses(['ACTIEF']);
                  onClose();
                }}
                className="mt-3 w-full py-1.5 px-2.5 rounded-[4px] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[#38bdf8] border border-[var(--border-subtle)] font-mono text-[11px] font-semibold text-left flex items-center justify-between cursor-pointer"
              >
                <span>Toon {stats.activeCount} actieve lijnen op kaart</span>
                <span>→</span>
              </button>
            </div>

            <div className="bg-[var(--bg-main)] border border-[var(--border-subtle)] border-l-2 border-l-[#f59e0b] rounded-[5px] p-3.5 flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-mono uppercase text-[var(--text-dim)]">
                  Voorstel / Onderzoek &amp; Pilots
                </div>
                <div className="text-2xl font-bold font-mono text-[#f59e0b] mt-1">
                  {stats.proposalCount}{' '}
                  <span className="text-xs font-normal text-[var(--text-muted)]">
                    onderzoek · {stats.pilotCount} pilot
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] mt-1.5">
                  Inclusief casus <strong>Lijn 426</strong> (Dieverbrug–Steenwijk–Meppel) en Breda-pilots <strong>850/854</strong> (start 13 dec. 2026). Lijn 422 werd definitief actief.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onFilterStatuses(['VOORSTEL_ONDERZOEK', 'PILOT_ACTIEF']);
                  onClose();
                }}
                className="mt-3 w-full py-1.5 px-2.5 rounded-[4px] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[#f59e0b] border border-[var(--border-subtle)] font-mono text-[11px] font-semibold text-left flex items-center justify-between cursor-pointer"
              >
                <span>Toon onderzoek &amp; voorstellen</span>
                <span>→</span>
              </button>
            </div>

            <div className="bg-[var(--bg-main)] border border-[var(--border-subtle)] border-l-2 border-l-[#ef4444] rounded-[5px] p-3.5 flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-mono uppercase text-[var(--text-dim)]">
                  Gestopt &amp; Structurele Nachtgaten
                </div>
                <div className="text-2xl font-bold font-mono text-[#ef4444] mt-1">
                  {stats.stoppedCount}{' '}
                  <span className="text-xs font-normal text-[var(--text-muted)]">
                    gestopt · 5 regio-gaten
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] mt-1.5">
                  Bollenstreek (Noordwijk–Leiden), EBS N01 en Meppeldag 132 zijn gestopt/opgeschort. <strong>Zeeland, Brabant, Limburg, Fryslân en Overijssel</strong> missen eigen diepe nachtnetten.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onFilterStatuses(['GESTOPT_OPGESCHORT']);
                  onClose();
                }}
                className="mt-3 w-full py-1.5 px-2.5 rounded-[4px] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[#ef4444] border border-[var(--border-subtle)] font-mono text-[11px] font-semibold text-left flex items-center justify-between cursor-pointer"
              >
                <span>Toon {stats.stoppedCount} gestopte trajecten</span>
                <span>→</span>
              </button>
            </div>
          </div>

          {/* Verdelingsbalken: Tariefregimes & Richtingstype */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-[5px] p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
                  Tariefregimes 2026 (N = {stats.totalLines})
                </h3>
                <span className="text-[10px] font-mono text-[var(--accent-gold)]">
                  OVpay vs. Toeslag
                </span>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-mono mb-1">
                  <span className="text-[#10b981]">Regulier OVpay / dagtarief</span>
                  <span className="font-bold text-[#10b981]">
                    {stats.regulierOvpayCount} ({pct(stats.regulierOvpayCount, stats.totalLines)}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-[var(--bg-card)] rounded-[2px] overflow-hidden">
                  <div
                    className="h-full bg-[#10b981]"
                    style={{ width: `${(stats.regulierOvpayCount / Math.max(1, stats.totalLines)) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-[var(--text-dim)] mt-0.5">
                  O.a. OV-bureau Groningen Drenthe (Qbuzz), EBS MeerPlus, HTM, Twente stamlijn 9.
                </p>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-mono mb-1">
                  <span className="text-[#f59e0b]">Nachttoeslag (€ 5,00 – € 7,80)</span>
                  <span className="font-bold text-[#f59e0b]">
                    {stats.nachttoeslagCount} ({pct(stats.nachttoeslagCount, stats.totalLines)}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-[var(--bg-card)] rounded-[2px] overflow-hidden">
                  <div
                    className="h-full bg-[#f59e0b]"
                    style={{ width: `${(stats.nachttoeslagCount / Math.max(1, stats.totalLines)) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-[var(--text-dim)] mt-0.5">
                  O.a. U-OV € 5,00, Transdev ANF € 5,00, RET BOB € 5,65/€ 6,50, Connexxion Niteliner (€ 2,18 + € 0,224/km), Qbuzz ZHN € 7,80.
                </p>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-mono mb-1">
                  <span className="text-[#a855f7]">Onbepaald / Onderzoek</span>
                  <span className="font-bold text-[#a855f7]">
                    {stats.tariefOnbepaaldCount} ({pct(stats.tariefOnbepaaldCount, stats.totalLines)}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-[var(--bg-card)] rounded-[2px] overflow-hidden">
                  <div
                    className="h-full bg-[#a855f7]"
                    style={{ width: `${(stats.tariefOnbepaaldCount / Math.max(1, stats.totalLines)) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-[5px] p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
                  Richtingstypes 2026 (N = {stats.totalLines})
                </h3>
                <span className="text-[10px] font-mono text-[var(--status-blue)]">
                  Thuisbrenger vs. Retour
                </span>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-mono mb-1">
                  <span className="text-[#f59e0b]">Eenrichting thuisbrenger</span>
                  <span className="font-bold text-[#f59e0b]">
                    {stats.thuisbrengerCount} ({pct(stats.thuisbrengerCount, stats.totalLines)}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-[var(--bg-card)] rounded-[2px] overflow-hidden">
                  <div
                    className="h-full bg-[#f59e0b]"
                    style={{ width: `${(stats.thuisbrengerCount / Math.max(1, stats.totalLines)) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-mono mb-1">
                  <span className="text-[#10b981]">Tweerichting</span>
                  <span className="font-bold text-[#10b981]">
                    {stats.tweerichtingCount} ({pct(stats.tweerichtingCount, stats.totalLines)}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-[var(--bg-card)] rounded-[2px] overflow-hidden">
                  <div
                    className="h-full bg-[#10b981]"
                    style={{ width: `${(stats.tweerichtingCount / Math.max(1, stats.totalLines)) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-mono mb-1">
                  <span className="text-[#22d3ee]">Gedeeltelijk / Asymmetrisch</span>
                  <span className="font-bold text-[#22d3ee]">
                    {stats.asymmetrischCount} ({pct(stats.asymmetrischCount, stats.totalLines)}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-[var(--bg-card)] rounded-[2px] overflow-hidden">
                  <div
                    className="h-full bg-[#22d3ee]"
                    style={{ width: `${(stats.asymmetrischCount / Math.max(1, stats.totalLines)) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-mono mb-1">
                  <span className="text-[var(--text-muted)]">Niet gespecificeerd in primaire bron</span>
                  <span className="font-bold text-[var(--text-muted)]">
                    {stats.richtingOnbepaaldCount} ({pct(stats.richtingOnbepaaldCount, stats.totalLines)}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-[var(--bg-card)] rounded-[2px] overflow-hidden">
                  <div
                    className="h-full bg-[#60756a]"
                    style={{ width: `${(stats.richtingOnbepaaldCount / Math.max(1, stats.totalLines)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 12-Provinciën Concessiedekkend Overzicht */}
          <div className="bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-[5px] overflow-hidden">
            <div className="px-3.5 py-2.5 bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)] flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
                Concessiedekkend Overzicht — 12 Provincies (Klik op provincie voor filter)
              </h3>
              <span className="text-[10px] font-mono text-[var(--text-muted)]">Peildatum 26 nov. 2026</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-[var(--bg-card)] border-b border-[var(--border-subtle)] uppercase text-[10px] font-mono text-[var(--text-dim)]">
                  <tr>
                    <th className="py-2 px-3">Provincie</th>
                    <th className="py-2 px-3">Concessie / Vervoerder</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Geverifieerd</th>
                    <th className="py-2 px-3">Kernwaarnemingen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]/60">
                  {provinceSummaries.map((row) => (
                    <tr
                      key={row.provincie}
                      onClick={() => {
                        onFilterProvince(row.provincie);
                        onClose();
                      }}
                      className="hover:bg-[var(--bg-card-hover)] cursor-pointer transition"
                    >
                      <td className="py-2 px-3 font-semibold text-[var(--text-main)] whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-[2px] ${
                              row.heeftNachtgat ? 'bg-[#ef4444]' : 'bg-[#10b981]'
                            }`}
                          />
                          <span>{row.provincie}</span>
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono text-[11px]">
                        <div className="text-[var(--text-main)]">{row.concessie}</div>
                        <div className="text-[10px] text-[var(--text-dim)]">{row.vervoerder}</div>
                      </td>
                      <td className="py-2 px-3 text-[11px] font-mono">
                        <span className={row.heeftNachtgat ? 'text-[#ef4444]' : 'text-[#38bdf8]'}>
                          {row.statusSamenvatting}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono text-[11px] text-[var(--accent-gold)] whitespace-nowrap">
                        {row.aantalGeverifieerd}
                      </td>
                      <td className="py-2 px-3 text-[11px] text-[var(--text-muted)]">
                        {row.kernwaarnemingen}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Methodiek, Casus Lijn 426 & NDOV-koppeling */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-[5px] p-3.5 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--accent-gold)]">
                Casus Lijn 426 &amp; Concessiegrens GM1708
              </h3>
              <p className="text-[11px] text-[var(--text-muted)]">
                De voorgestelde nachtbuslijn <strong>426</strong> (Dieverbrug – Vledder – Steenwijk – Giethoorn – Wanneperveen – Meppel) doorkruist de concessiegrens tussen{' '}
                <strong>OV-bureau Groningen Drenthe (Qbuzz)</strong> en <strong>IJssel-Vecht (RRReis)</strong>. Op 26 nov. 2026 kent gemeente <strong>Steenwijkerland (GM1708)</strong> nul nachtlijnen, terwijl buurregio Zuidwest-Drenthe rond Meppel vier actieve nachtlijnen (422, 428, 432, 434) tegen regulier OVpay-dagtarief exploiteert.
              </p>
            </div>

            <div className="bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-[5px] p-3.5 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--status-blue)]">
                Databronnen, CHB/NDOV &amp; Kwaliteitsborging
              </h3>
              <p className="text-[11px] text-[var(--text-muted)]">
                Routegeometrie en passagetijden zijn ontsloten uit geverifieerde concessie-overzichten en NDOV/CHB-haltecodes (o.a.{' '}
                <code className="font-mono text-[var(--status-blue)]">NL:S:16530020</code> Dieverbrug Busstation,{' '}
                <code className="font-mono text-[var(--status-blue)]">NL:Q:57332107</code> Dieverbrug Rijksweg en{' '}
                <code className="font-mono text-[var(--status-blue)]">3800155</code> Steenwijk Station). Verouderde acceptatie-URL’s (<code className="font-mono text-[#fbbf24]">acc.busgd.nl</code>) en vervallen pilots zijn expliciet gelabeld.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
