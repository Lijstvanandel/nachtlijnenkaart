import React from 'react';
import { MapPin } from 'lucide-react';
import type { NightBusLine, SortMode } from '../types/nightBus';
import { sortNightBusLines, STATUS_META } from '../utils/nightBusLogic';

interface TableViewProps {
  lines: NightBusLine[];
  sortMode: SortMode;
  onSortModeChange: (mode: SortMode) => void;
  selectedLineId: string | null;
  onSelectLine: (line: NightBusLine, jumpToMap?: boolean) => void;
}

export const TableView: React.FC<TableViewProps> = ({
  lines,
  sortMode,
  onSortModeChange,
  selectedLineId,
  onSelectLine,
}) => {
  const sorted = sortNightBusLines(lines, sortMode);

  return (
    <div id="tableViewContainer" className="w-full h-full flex flex-col bg-[var(--bg-main)]">
      <div className="px-4 py-2.5 bg-[var(--bg-card)] border-b border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Volledige Tabel — Nachtstreeklijnen Nederland (26 nov. 2026)
          </h2>
          <p id="tableCountSubtitle" className="text-[11px] font-mono text-[var(--text-dim)]">
            {sorted.length} nachtlijnen weergegeven · Klik op een rij om het lijndossier te openen
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="tableSortSelect" className="sr-only">
            Sorteer tabel
          </label>
          <select
            id="tableSortSelect"
            value={sortMode}
            onChange={(e) => onSortModeChange(e.target.value as SortMode)}
            className="px-2.5 py-1 text-xs bg-[var(--bg-elevated)] text-[var(--text-main)] border border-[var(--border-subtle)] rounded-[4px] focus:outline-none focus:border-[var(--border-focus)]"
          >
            <option value="STATUS">Sorteer: Status &amp; Onderzoek eerst</option>
            <option value="LINE_ASC">Sorteer: Lijnnummer (oplopend)</option>
            <option value="PROV_ASC">Sorteer: Provincie (A → Z)</option>
            <option value="VERVOERDER_ASC">Sorteer: Vervoerder (A → Z)</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 z-10 bg-[var(--bg-card)] border-b border-[var(--border-subtle)] uppercase text-[10px] font-mono text-[var(--text-dim)]">
            <tr>
              <th className="py-2.5 px-3">Lijn</th>
              <th className="py-2.5 px-3">Traject, Vervoerder &amp; Concessie</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Provincie</th>
              <th className="py-2.5 px-3">Richting &amp; Tariefregime</th>
              <th className="py-2.5 px-3 text-right">Kaart</th>
            </tr>
          </thead>
          <tbody id="fullDatasetTableBody" className="divide-y divide-[var(--border-subtle)]/60">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-xs text-[var(--text-dim)] font-mono">
                  Geen nachtlijnen gevonden binnen de actieve filterselectie.
                </td>
              </tr>
            ) : (
              sorted.map((line) => {
                const meta = STATUS_META[line.status];
                const isSelected = line.line_id === selectedLineId;
                return (
                  <tr
                    key={line.line_id}
                    onClick={() => onSelectLine(line, false)}
                    className={`cursor-pointer transition ${
                      isSelected
                        ? 'bg-[var(--bg-elevated)]'
                        : 'hover:bg-[var(--bg-card-hover)]/80'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono whitespace-nowrap align-top">
                      <span
                        className="px-1.5 py-0.5 rounded-[3px] text-[11px] font-bold inline-block"
                        style={{
                          backgroundColor: `${meta.color}22`,
                          color: meta.color,
                          border: `1px solid ${meta.color}55`,
                        }}
                      >
                        {line.lijnnummer}
                      </span>
                      <div className="text-[10px] text-[var(--text-dim)] mt-1">
                        {line.haltes.length} haltes
                      </div>
                    </td>
                    <td className="py-2.5 px-3 align-top">
                      <div className="font-semibold text-[var(--text-main)]">{line.naam}</div>
                      <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                        {line.vervoerder} · <span className="text-[var(--text-dim)]">{line.concessie}</span>
                      </div>
                      <div className="text-[10px] font-mono text-[var(--text-dim)] mt-0.5">
                        {line.rijnachten.join(', ')}
                        {line.chb_ndov_sleutel ? ` · ${line.chb_ndov_sleutel}` : ''}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap align-top">
                      <span
                        className="px-1.5 py-0.5 rounded-[3px] font-mono text-[10px] font-bold"
                        style={{
                          backgroundColor: `${meta.color}20`,
                          color: meta.color,
                        }}
                      >
                        {meta.shortLabel}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[var(--text-main)] whitespace-nowrap align-top">
                      {line.provincies.join(', ')}
                    </td>
                    <td className="py-2.5 px-3 align-top">
                      <div className="text-[11px] text-[var(--text-muted)]">
                        {line.richtingstypeLabel}
                      </div>
                      <div
                        className={`font-mono text-[11px] mt-0.5 ${
                          line.tariefRegime === 'REGULIER_OVPAY'
                            ? 'text-[#10b981]'
                            : line.tariefRegime === 'NACHTTOESLAG'
                            ? 'text-[#fbbf24]'
                            : 'text-[var(--text-dim)]'
                        }`}
                      >
                        {line.tariefLabel}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap align-top">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectLine(line, true);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-[3px] bg-[var(--bg-card)] hover:bg-[var(--bg-elevated)] text-[var(--accent-gold)] border border-[var(--border-subtle)] font-mono text-[10px] font-semibold cursor-pointer"
                      >
                        <MapPin className="w-3 h-3" />
                        <span>Kaart</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
