import React from 'react';
import { Filter, PanelLeftClose } from 'lucide-react';
import type { ColorMode, FilterState, LineStatus, NightBusLine } from '../types/nightBus';
import { STATUS_META } from '../utils/nightBusLogic';

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  colorMode: ColorMode;
  onColorModeChange: (mode: ColorMode) => void;
  filters: FilterState;
  onFiltersChange: (next: FilterState) => void;
  onResetFilters: () => void;
  filteredLines: NightBusLine[];
  allLines: NightBusLine[];
  selectedLineId: string | null;
  onSelectLine: (line: NightBusLine) => void;
}

const PROVINCE_OPTIONS = [
  'Groningen',
  'Drenthe',
  'Friesland',
  'Overijssel',
  'Flevoland',
  'Gelderland',
  'Utrecht',
  'Noord-Holland',
  'Zuid-Holland',
  'Zeeland',
  'Noord-Brabant',
  'Limburg',
];

const OPERATOR_OPTIONS = [
  { value: 'ALL', label: 'Alle vervoerders' },
  { value: 'Qbuzz', label: 'Qbuzz (OV-bureau GD / ZHN)' },
  { value: 'Transdev', label: 'Transdev (RRReis / U-OV / HWGO)' },
  { value: 'Keolis', label: 'Keolis (U-OV Buiten / nightGo)' },
  { value: 'EBS', label: 'EBS / MeerPlus (Waterland)' },
  { value: 'Connexxion', label: 'Connexxion (Niteliner)' },
  { value: 'HTM', label: 'HTM (Haaglanden)' },
  { value: 'RET', label: 'RET (BOB-bus Rotterdam)' },
  { value: 'Arriva', label: 'Arriva (Twente / West-Brabant)' },
  { value: 'Jonker Travel', label: 'Jonker Travel (Bollenstreek)' },
  { value: 'Onbepaald', label: 'Onbepaald (Onderzoek 426)' },
];

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  isOpen,
  onClose,
  colorMode,
  onColorModeChange,
  filters,
  onFiltersChange,
  onResetFilters,
  filteredLines,
  allLines,
  selectedLineId,
  onSelectLine,
}) => {
  const statusCounts: Record<LineStatus, number> = {
    ACTIEF: allLines.filter((l) => l.status === 'ACTIEF').length,
    PILOT_ACTIEF: allLines.filter((l) => l.status === 'PILOT_ACTIEF').length,
    VOORSTEL_ONDERZOEK: allLines.filter((l) => l.status === 'VOORSTEL_ONDERZOEK').length,
    GESTOPT_OPGESCHORT: allLines.filter((l) => l.status === 'GESTOPT_OPGESCHORT').length,
  };

  const toggleStatus = (status: LineStatus) => {
    const exists = filters.activeStatuses.includes(status);
    const next = exists
      ? filters.activeStatuses.filter((s) => s !== status)
      : [...filters.activeStatuses, status];
    onFiltersChange({ ...filters, activeStatuses: next });
  };

  return (
    <aside
      id="leftSidebar"
      aria-label="Filters en nachtlijnenlijst"
      className={`fixed lg:static inset-y-0 left-0 z-40 w-[88vw] max-w-[330px] xl:max-w-[350px] bg-[var(--bg-card)] border-r border-[var(--border-subtle)] flex flex-col shrink-0 transition-transform duration-200 ${
        isOpen ? 'translate-x-0 lg:flex' : '-translate-x-full lg:hidden'
      }`}
    >
      {/* Header */}
      <div className="px-3.5 py-2.5 bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Selectie &amp; Kaartlagen
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            id="resetFiltersBtn"
            type="button"
            onClick={onResetFilters}
            className="px-2 py-0.5 rounded-[3px] text-[10px] font-mono uppercase bg-[var(--bg-main)] hover:bg-[var(--bg-card-hover)] text-[var(--text-muted)] hover:text-[var(--accent-gold-bright)] border border-[var(--border-subtle)] cursor-pointer"
          >
            Reset
          </button>
          <button
            id="closeLeftSidebarBtn"
            type="button"
            onClick={onClose}
            aria-label="Zijpaneel inklappen"
            title="Zijpaneel inklappen"
            className="p-1 rounded-[4px] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-hover)] cursor-pointer"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-3.5 border-b border-[var(--border-subtle)] space-y-2.5 bg-[var(--bg-main)]/40 shrink-0">
        <div>
          <label
            htmlFor="colorModeSelect"
            className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1"
          >
            Kaartkleuring &amp; legenda
          </label>
          <select
            id="colorModeSelect"
            value={colorMode}
            onChange={(e) => onColorModeChange(e.target.value as ColorMode)}
            className="w-full px-2.5 py-1.5 text-xs font-medium bg-[var(--bg-elevated)] text-[var(--text-main)] border border-[var(--border-subtle)] rounded-[4px] focus:outline-none focus:border-[var(--border-focus)]"
          >
            <option value="status">Lijnstatus 2026 (Actief / Pilot / Onderzoek / Gestopt)</option>
            <option value="tarief">Tariefregime (Regulier OVpay vs. Nachttoeslag)</option>
            <option value="richting">Richtingstype (Thuisbrenger vs. Tweerichting)</option>
          </select>
        </div>

        {/* 2x2 grid filters */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label
              htmlFor="provinceSelect"
              className="block text-[10px] font-mono uppercase text-[var(--text-dim)] mb-1"
            >
              Provincie
            </label>
            <select
              id="provinceSelect"
              value={filters.provincie}
              onChange={(e) => onFiltersChange({ ...filters, provincie: e.target.value })}
              className="w-full px-2 py-1.5 text-xs bg-[var(--bg-elevated)] text-[var(--text-main)] border border-[var(--border-subtle)] rounded-[4px] focus:outline-none focus:border-[var(--border-focus)]"
            >
              <option value="ALL">Alle (12)</option>
              {PROVINCE_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="operatorSelect"
              className="block text-[10px] font-mono uppercase text-[var(--text-dim)] mb-1"
            >
              Vervoerder / Concessie
            </label>
            <select
              id="operatorSelect"
              value={filters.vervoerder}
              onChange={(e) => onFiltersChange({ ...filters, vervoerder: e.target.value })}
              className="w-full px-2 py-1.5 text-xs bg-[var(--bg-elevated)] text-[var(--text-main)] border border-[var(--border-subtle)] rounded-[4px] focus:outline-none focus:border-[var(--border-focus)]"
            >
              {OPERATOR_OPTIONS.map((op) => (
                <option key={op.value} value={op.value}>
                  {op.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="directionSelect"
              className="block text-[10px] font-mono uppercase text-[var(--text-dim)] mb-1"
            >
              Richtingstype
            </label>
            <select
              id="directionSelect"
              value={filters.richting}
              onChange={(e) => onFiltersChange({ ...filters, richting: e.target.value })}
              className="w-full px-2 py-1.5 text-xs bg-[var(--bg-elevated)] text-[var(--text-main)] border border-[var(--border-subtle)] rounded-[4px] focus:outline-none focus:border-[var(--border-focus)]"
            >
              <option value="ALL">Alle richtingen</option>
              <option value="THUISBRENGER">Eenrichting thuisbrenger</option>
              <option value="TWEERICHTING">Tweerichting</option>
              <option value="GEDEELTELIJK_ASYMMETRISCH">Gedeeltelijk / Asymmetrisch</option>
              <option value="ONBEPAALD">Niet gespecificeerd</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="tariffSelect"
              className="block text-[10px] font-mono uppercase text-[var(--text-dim)] mb-1"
            >
              Tariefregime
            </label>
            <select
              id="tariffSelect"
              value={filters.tarief}
              onChange={(e) => onFiltersChange({ ...filters, tarief: e.target.value })}
              className="w-full px-2 py-1.5 text-xs bg-[var(--bg-elevated)] text-[var(--text-main)] border border-[var(--border-subtle)] rounded-[4px] focus:outline-none focus:border-[var(--border-focus)]"
            >
              <option value="ALL">Alle tarieven</option>
              <option value="REGULIER_OVPAY">Regulier OVpay</option>
              <option value="NACHTTOESLAG">Nachttoeslag (€ 5–€ 7,80)</option>
              <option value="ONBEPAALD">Onbepaald / Onderzoek</option>
            </select>
          </div>
        </div>

        {/* Status-checkboxes */}
        <div className="space-y-1">
          <div className="text-[10px] font-mono uppercase text-[var(--text-dim)] mb-1">
            Statuscategorieën (26 nov. 2026 · klik om te filteren)
          </div>

          {(
            [
              { key: 'ACTIEF', label: 'Actief (reguliere dienst)', color: '#38bdf8' },
              { key: 'PILOT_ACTIEF', label: 'Pilot actief (0 op 26 nov.)', color: '#10b981' },
              { key: 'VOORSTEL_ONDERZOEK', label: 'Voorstel / Onderzoek (o.a. 426)', color: '#f59e0b' },
              { key: 'GESTOPT_OPGESCHORT', label: 'Gestopt / Opgeschort', color: '#ef4444' },
            ] as { key: LineStatus; label: string; color: string }[]
          ).map((item) => {
            const checked = filters.activeStatuses.includes(item.key);
            return (
              <label
                key={item.key}
                className="flex items-center justify-between px-2 py-1 rounded-[4px] bg-[var(--bg-main)]/70 hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] cursor-pointer text-xs"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleStatus(item.key)}
                    className="accent-[#f59e0b] rounded-[2px]"
                  />
                  <span
                    className="w-2.5 h-2.5 rounded-[2px] shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[var(--text-main)] font-medium truncate">{item.label}</span>
                </span>
                <span className="font-mono text-[11px] font-bold" style={{ color: item.color }}>
                  {statusCounts[item.key]}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Lijst Header */}
      <div className="px-3.5 py-2 bg-[var(--bg-card)] border-b border-[var(--border-subtle)] flex items-center justify-between shrink-0">
        <span id="sidebarListCounter" className="text-[11px] font-mono text-[var(--text-muted)]">
          {filteredLines.length} / {allLines.length} nachtlijnen
        </span>
        <span className="text-[10px] font-mono uppercase text-[var(--text-dim)]">
          Klik lijn voor dossier
        </span>
      </div>

      {/* Klikbare lijnenlijst */}
      <div id="sidebarLineList" className="flex-1 overflow-y-auto p-2.5 space-y-1.5 bg-[var(--bg-main)]/50">
        {filteredLines.length === 0 ? (
          <div className="p-4 rounded-[5px] bg-[var(--bg-card)] border border-[var(--border-subtle)] text-center space-y-2">
            <div className="text-xs font-bold text-[var(--text-main)]">Geen lijnen gevonden</div>
            <div className="text-[11px] text-[var(--text-dim)]">
              Pas provincie, richtingstype, tariefregime of zoekterm aan.
            </div>
            <button
              type="button"
              onClick={onResetFilters}
              className="px-2.5 py-1 rounded-[4px] bg-[var(--bg-elevated)] hover:bg-[var(--bg-card-hover)] text-[var(--accent-gold)] border border-[var(--border-focus)] font-mono text-[11px] cursor-pointer"
            >
              Herstel alle filters
            </button>
          </div>
        ) : (
          filteredLines.map((line) => {
            const meta = STATUS_META[line.status];
            const isSelected = selectedLineId === line.line_id;
            const tariefShort =
              line.tariefRegime === 'REGULIER_OVPAY'
                ? 'OVpay dagtarief'
                : line.tariefRegime === 'NACHTTOESLAG'
                ? line.tariefBedrag
                  ? `€ ${line.tariefBedrag.toFixed(2).replace('.', ',')}`
                  : 'Nachttoeslag'
                : 'Onbepaald';

            return (
              <button
                key={line.line_id}
                type="button"
                onClick={() => onSelectLine(line)}
                className={`w-full text-left p-2.5 rounded-[4px] border transition cursor-pointer ${
                  isSelected
                    ? 'border-[var(--accent-gold)] bg-[var(--bg-elevated)]'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="px-1.5 py-0.5 rounded-[3px] font-mono text-[10px] font-bold shrink-0"
                      style={{
                        backgroundColor: `${meta.color}22`,
                        color: meta.color,
                        border: `1px solid ${meta.color}55`,
                      }}
                    >
                      {line.lijnnummer}
                    </span>
                    <span className="text-xs font-bold text-[var(--text-main)] truncate">
                      {line.naam}
                    </span>
                  </div>
                  <span
                    className="px-1.5 py-0.5 rounded-[3px] font-mono text-[9px] font-bold shrink-0"
                    style={{
                      backgroundColor: `${meta.color}20`,
                      color: meta.color,
                    }}
                  >
                    {meta.shortLabel}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)] gap-2">
                  <span className="truncate">
                    {line.vervoerder} · {line.provincies.join('/')}
                  </span>
                  <span className="text-[var(--accent-gold)] shrink-0">{tariefShort}</span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
};
