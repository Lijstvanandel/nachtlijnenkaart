import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Code2,
  Download,
  Map as MapIcon,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Table2,
  X,
} from 'lucide-react';
import type { LineStatus, ViewMode } from '../types/nightBus';

interface TopNavbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  totalCount: number;
  activeCount: number;
  researchAndPilotCount: number;
  stoppedCount: number;
  quickFilterMode: 'ALL' | 'ACTIEF' | 'ONDERZOEK_PILOT';
  onQuickFilter: (mode: 'ALL' | 'ACTIEF' | 'ONDERZOEK_PILOT', statuses: LineStatus[]) => void;
  onToggleSidebar: () => void;
  onOpenStats: () => void;
  onExportCsv: () => void;
  onRefresh: () => void;
  onOpenEmbed: () => void;
  isEmbedMode: boolean;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  search,
  onSearchChange,
  viewMode,
  onViewModeChange,
  totalCount,
  activeCount,
  researchAndPilotCount,
  stoppedCount,
  quickFilterMode,
  onQuickFilter,
  onToggleSidebar,
  onOpenStats,
  onExportCsv,
  onRefresh,
  onOpenEmbed,
  isEmbedMode,
}) => {
  const [clockText, setClockText] = useState<string>('EUROPE/AMSTERDAM');

  useEffect(() => {
    const tick = () => {
      try {
        const formatted = new Date().toLocaleTimeString('nl-NL', {
          timeZone: 'Europe/Amsterdam',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        setClockText(`${formatted} AMS`);
      } catch {
        setClockText('EUROPE/AMSTERDAM');
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <header className="shrink-0 z-30 bg-[var(--bg-card)] border-b border-[var(--border-subtle)]">
      {/* Bovenste rij */}
      <div className="px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2.5 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="h-8 w-8 rounded-[4px] bg-[#f5f6f4] text-[#060e0a] font-mono font-extrabold text-[11px] flex items-center justify-center border border-[var(--border-subtle)] shrink-0"
            title="Onafhankelijk Steenwijkerland"
          >
            OSL
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm sm:text-[15px] font-bold tracking-tight text-[var(--text-main)] truncate">
                Onafhankelijk Steenwijkerland
              </span>
              <span className="px-1.5 py-0.5 rounded-[3px] bg-[var(--accent-gold)] text-[#060e0a] font-mono font-bold text-[10px] tracking-wide shrink-0">
                GM1708
              </span>
              <span className="hidden md:inline-block text-[var(--text-dim)] font-mono text-xs">/</span>
              <h1 className="hidden md:inline-block text-xs font-semibold text-[var(--text-muted)] truncate">
                Nachtstreeklijnen Nederland (Peildatum 26 nov. 2026)
              </h1>
            </div>
            <p className="text-[11px] text-[var(--text-dim)] truncate">
              Dataproduct van Onafhankelijk Steenwijkerland · Landelijk referentiedossier nachtbuslijnen (nov. 2026)
            </p>
          </div>
        </div>

        {/* Rechts in bovenste rij */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="relative w-44 sm:w-64">
            <Search className="w-3.5 h-3.5 text-[var(--text-dim)] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="topSearchInput"
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Zoek lijn, kern, vervoerder, NDOV..."
              aria-label="Zoek nachtlijn, kern, vervoerder of NDOV-code"
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-[var(--bg-main)] text-[var(--text-main)] placeholder-[var(--text-dim)] border border-[var(--border-subtle)] rounded-[4px] focus:outline-none focus:border-[var(--border-focus)]"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Zoekopdracht wissen"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-dim)] hover:text-[var(--text-main)] text-xs font-mono cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Weergavemodus Toggle */}
          <div className="inline-flex rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-main)] p-0.5">
            <button
              id="modeMapBtn"
              type="button"
              onClick={() => onViewModeChange('map')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                viewMode === 'map'
                  ? 'bg-[var(--bg-elevated)] text-[var(--text-main)] border border-[var(--border-focus)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] border border-transparent'
              }`}
            >
              <MapIcon className={`w-3.5 h-3.5 ${viewMode === 'map' ? 'text-[var(--status-emerald)]' : ''}`} />
              <span>Kaart</span>
            </button>
            <button
              id="modeTableBtn"
              type="button"
              onClick={() => onViewModeChange('table')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                viewMode === 'table'
                  ? 'bg-[var(--bg-elevated)] text-[var(--text-main)] border border-[var(--border-focus)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] border border-transparent'
              }`}
            >
              <Table2 className={`w-3.5 h-3.5 ${viewMode === 'table' ? 'text-[var(--accent-gold)]' : ''}`} />
              <span>Tabel ({totalCount})</span>
            </button>
          </div>

          <button
            id="refreshBtn"
            type="button"
            onClick={onRefresh}
            aria-label="Herstel kaartweergave en filters"
            title="Herstel kaartweergave & filters"
            className="p-1.5 rounded-[4px] bg-[var(--bg-main)] hover:bg-[var(--bg-card-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-subtle)] transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            id="openEmbedModalBtn"
            type="button"
            onClick={onOpenEmbed}
            aria-label="Embed-code en HTML-export"
            title="Embed-code & zelfstandig HTML-bestand"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[4px] bg-[var(--bg-main)] hover:bg-[var(--bg-card-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-subtle)] text-xs font-mono transition cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5 text-[var(--status-blue)]" />
            <span className="hidden sm:inline">&lt;/&gt;</span>
          </button>
        </div>
      </div>

      {/* Onderste rij */}
      {!isEmbedMode && (
        <div className="px-3 sm:px-4 py-1.5 bg-[var(--bg-main)]/70 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              id="toggleLeftSidebarBtn"
              type="button"
              onClick={onToggleSidebar}
              className="gold-cta inline-flex items-center gap-1.5 px-3 py-1 rounded-[4px] text-xs font-bold transition cursor-pointer shrink-0 whitespace-nowrap"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters &amp; Lijst</span>
            </button>

            <button
              type="button"
              onClick={() => onQuickFilter('ACTIEF', ['ACTIEF', 'PILOT_ACTIEF'])}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-xs font-semibold border transition cursor-pointer shrink-0 whitespace-nowrap ${
                quickFilterMode === 'ACTIEF'
                  ? 'bg-[var(--bg-elevated)] text-[var(--text-main)] border-[var(--border-focus)]'
                  : 'bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-main)] border-[var(--border-subtle)]'
              }`}
            >
              <span className="w-2 h-2 rounded-[2px] bg-[var(--status-blue)]" />
              <span>Actief ({activeCount})</span>
            </button>

            <button
              type="button"
              onClick={() => onQuickFilter('ONDERZOEK_PILOT', ['VOORSTEL_ONDERZOEK', 'PILOT_ACTIEF'])}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-xs font-semibold border transition cursor-pointer shrink-0 whitespace-nowrap ${
                quickFilterMode === 'ONDERZOEK_PILOT'
                  ? 'bg-[var(--bg-elevated)] text-[var(--text-main)] border-[var(--border-focus)]'
                  : 'bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-main)] border-[var(--border-subtle)]'
              }`}
            >
              <span className="w-2 h-2 rounded-[2px] bg-[var(--accent-gold)]" />
              <span>Onderzoek/Pilot ({researchAndPilotCount})</span>
            </button>

            <button
              type="button"
              onClick={() =>
                onQuickFilter('ALL', [
                  'ACTIEF',
                  'PILOT_ACTIEF',
                  'VOORSTEL_ONDERZOEK',
                  'GESTOPT_OPGESCHORT',
                ])
              }
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-xs font-semibold border transition cursor-pointer shrink-0 whitespace-nowrap ${
                quickFilterMode === 'ALL'
                  ? 'bg-[var(--bg-elevated)] text-[var(--text-main)] border-[var(--border-focus)]'
                  : 'bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-main)] border-[var(--border-subtle)]'
              }`}
            >
              <span>Alle ({totalCount})</span>
            </button>

            <button
              id="openStatsModalBtn"
              type="button"
              onClick={onOpenStats}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-xs font-semibold bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-main)] border border-[var(--border-subtle)] transition cursor-pointer shrink-0 whitespace-nowrap"
            >
              <BarChart3 className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
              <span>Statistieken &amp; Methodiek</span>
            </button>

            <button
              id="exportCsvBtn"
              type="button"
              onClick={onExportCsv}
              title="Download huidige selectie als puntkommagescheiden CSV"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-xs font-semibold bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-subtle)] transition cursor-pointer shrink-0 whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
          </div>

          <div className="hidden xl:flex items-center gap-2 font-mono text-[11px] text-[var(--text-muted)]">
            <span className="inline-flex items-center gap-1.5 text-[var(--status-emerald)] font-semibold">
              <span className="w-2 h-2 rounded-[2px] bg-[var(--status-emerald)]" />
              26 NOV 2026
            </span>
            <span className="text-[var(--text-dim)]">·</span>
            <span className="text-[var(--status-blue)]">58 STREEK + 13 RET BOB</span>
            <span className="text-[var(--text-dim)]">·</span>
            <span className="text-[var(--accent-gold)]">{researchAndPilotCount} ONDERZOEK</span>
            <span className="text-[var(--text-dim)]">·</span>
            <span className="text-[var(--status-crimson)]">{stoppedCount} GESTOPT</span>
            <span className="text-[var(--text-dim)]">·</span>
            <span>12 PROV.</span>
            <span className="text-[var(--text-dim)]">·</span>
            <span className="text-[var(--text-dim)]">{clockText}</span>
          </div>
        </div>
      )}
    </header>
  );
};
