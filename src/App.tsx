import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Code2, Maximize } from 'lucide-react';
import {
  NIGHT_BUS_LINES,
  PROVINCE_CONCESSION_SUMMARIES,
} from './data/nightBusLines';
import type {
  ColorMode,
  FilterState,
  LineStatus,
  NightBusLine,
  NightBusStop,
  SortMode,
  ViewMode,
} from './types/nightBus';
import {
  buildSemicolonCsv,
  computeNightBusStats,
  filterNightBusLines,
  sortNightBusLines,
} from './utils/nightBusLogic';
import { TopNavbar } from './components/TopNavbar';
import { FilterSidebar } from './components/FilterSidebar';
import { NightBusMap, type MapFocusCommand } from './components/NightBusMap';
import { TableView } from './components/TableView';
import { DetailDrawer } from './components/DetailDrawer';
import { StatsModal } from './components/StatsModal';
import { EmbedModal } from './components/EmbedModal';

const ALL_STATUSES: LineStatus[] = [
  'ACTIEF',
  'PILOT_ACTIEF',
  'VOORSTEL_ONDERZOEK',
  'GESTOPT_OPGESCHORT',
];

const DEFAULT_FILTERS: FilterState = {
  search: '',
  provincie: 'ALL',
  vervoerder: 'ALL',
  richting: 'ALL',
  tarief: 'ALL',
  activeStatuses: ALL_STATUSES,
};

export default function App() {
  const isEmbedMode = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('embed') === 'true';
  }, []);

  const defaultDesktopOpen = useMemo(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth >= 1024;
  }, []);

  const defaultSelectedLine = useMemo(() => {
    return (
      NIGHT_BUS_LINES.find((l) => l.line_id === 'GD-OV-ONDERZOEK-426') ||
      NIGHT_BUS_LINES[0] ||
      null
    );
  }, []);

  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 1024 : false
  );

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [colorMode, setColorMode] = useState<ColorMode>('status');
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [sortMode, setSortMode] = useState<SortMode>('STATUS');
  const [quickFilterMode, setQuickFilterMode] = useState<'ALL' | 'ACTIEF' | 'ONDERZOEK_PILOT'>('ALL');

  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState<boolean>(
    !isEmbedMode && defaultDesktopOpen
  );
  const [isRightDrawerOpen, setIsRightDrawerOpen] = useState<boolean>(
    !isEmbedMode && defaultDesktopOpen
  );
  const [selectedLine, setSelectedLine] = useState<NightBusLine | null>(defaultSelectedLine);
  const [focusCommand, setFocusCommand] = useState<MapFocusCommand | null>(null);

  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isEmbedOpen, setIsEmbedOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 1023px)');
    const handleChange = (matches: boolean) => {
      setIsMobileViewport(matches);
      if (matches) {
        setIsLeftSidebarOpen(false);
        setIsRightDrawerOpen(false);
      }
    };
    handleChange(mq.matches);
    const listener = (e: MediaQueryListEvent) => handleChange(e.matches);
    mq.addEventListener('change', listener);
    return () => mq.removeEventListener('change', listener);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const t = window.setTimeout(() => setToastMessage(null), 3200);
    return () => window.clearTimeout(t);
  }, [toastMessage]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsStatsOpen(false);
        setIsEmbedOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const stats = useMemo(() => computeNightBusStats(NIGHT_BUS_LINES), []);

  const filteredLines = useMemo(() => {
    const matched = filterNightBusLines(NIGHT_BUS_LINES, filters);
    return sortNightBusLines(matched, 'STATUS');
  }, [filters]);

  const handleQuickFilter = useCallback(
    (mode: 'ALL' | 'ACTIEF' | 'ONDERZOEK_PILOT', statuses: LineStatus[]) => {
      setQuickFilterMode(mode);
      setFilters((prev) => ({ ...prev, activeStatuses: statuses }));
    },
    []
  );

  const handleFiltersChange = useCallback((next: FilterState) => {
    setFilters(next);
    if (next.activeStatuses.length === 4) {
      setQuickFilterMode('ALL');
    } else if (
      next.activeStatuses.includes('VOORSTEL_ONDERZOEK') &&
      !next.activeStatuses.includes('ACTIEF')
    ) {
      setQuickFilterMode('ONDERZOEK_PILOT');
    } else if (
      next.activeStatuses.includes('ACTIEF') &&
      !next.activeStatuses.includes('VOORSTEL_ONDERZOEK')
    ) {
      setQuickFilterMode('ACTIEF');
    }
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setQuickFilterMode('ALL');
    setColorMode('status');
    setFocusCommand({ type: 'nl', nonce: Date.now() });
    showToast('Filters en kaartweergave hersteld naar heel Nederland.');
  }, [showToast]);

  const handleSelectLine = useCallback((line: NightBusLine, jumpToMap = false) => {
    setSelectedLine(line);
    setIsRightDrawerOpen(true);
    if (jumpToMap) {
      setViewMode('map');
    }
    setFocusCommand({ type: 'line', line, nonce: Date.now() });
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsLeftSidebarOpen(false);
    }
  }, []);

  const handleFocusStop = useCallback(
    (stop: NightBusStop) => {
      if (!selectedLine) return;
      setViewMode('map');
      setFocusCommand({ type: 'stop', stop, line: selectedLine, nonce: Date.now() });
      showToast(`Haltefocus: ${stop.name} (${stop.passageTime})`);
    },
    [selectedLine, showToast]
  );

  const handleFocusGm1708 = useCallback(() => {
    setViewMode('map');
    setFocusCommand({ type: 'gm1708', nonce: Date.now() });
    const line426 = NIGHT_BUS_LINES.find((l) => l.line_id === 'GD-OV-ONDERZOEK-426');
    if (line426) {
      setSelectedLine(line426);
      setIsRightDrawerOpen(true);
    }
    showToast('Focus op Steenwijkerland (GM1708) & Zuidwest-Drenthe (Lijn 426 / 428)');
  }, [showToast]);

  const handleResetNetherlands = useCallback(() => {
    setViewMode('map');
    setFocusCommand({ type: 'nl', nonce: Date.now() });
  }, []);

  const handleExportCsv = useCallback(() => {
    const csvContent = buildSemicolonCsv(filteredLines);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nachtstreeklijnen_nl_2026_${filteredLines.length}_lijnen.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`CSV gedownload (${filteredLines.length} lijnen, puntkommagescheiden).`);
  }, [filteredLines, showToast]);

  const handleToggleFullscreen = useCallback(() => {
    if (typeof document === 'undefined') return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  const showMobileBackdrop = isMobileViewport && (isLeftSidebarOpen || isRightDrawerOpen);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[var(--bg-main)] text-[var(--text-main)] select-none sm:select-auto">
      <TopNavbar
        search={filters.search}
        onSearchChange={(val) => setFilters((prev) => ({ ...prev, search: val }))}
        viewMode={viewMode}
        onViewModeChange={(mode) => {
          setViewMode(mode);
          if (mode === 'table') {
            setIsRightDrawerOpen(false);
          }
        }}
        totalCount={NIGHT_BUS_LINES.length}
        activeCount={stats.activeCount}
        researchAndPilotCount={stats.proposalCount + stats.pilotCount}
        stoppedCount={stats.stoppedCount}
        quickFilterMode={quickFilterMode}
        onQuickFilter={handleQuickFilter}
        onToggleSidebar={() => {
          setIsLeftSidebarOpen((o) => {
            const next = !o;
            if (next && isMobileViewport) setIsRightDrawerOpen(false);
            return next;
          });
        }}
        onOpenStats={() => setIsStatsOpen(true)}
        onExportCsv={handleExportCsv}
        onRefresh={handleResetFilters}
        onOpenEmbed={() => setIsEmbedOpen(true)}
        isEmbedMode={isEmbedMode}
      />

      <div className="flex-1 flex relative overflow-hidden min-h-0">
        {showMobileBackdrop && (
          <div
            onClick={() => {
              setIsLeftSidebarOpen(false);
              setIsRightDrawerOpen(false);
            }}
            className="fixed inset-0 bg-[#060e0a]/80 backdrop-blur-xs z-30 lg:hidden"
          />
        )}

        <FilterSidebar
          isOpen={isLeftSidebarOpen}
          onClose={() => setIsLeftSidebarOpen(false)}
          colorMode={colorMode}
          onColorModeChange={setColorMode}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onResetFilters={handleResetFilters}
          filteredLines={filteredLines}
          allLines={NIGHT_BUS_LINES}
          selectedLineId={selectedLine?.line_id || null}
          onSelectLine={(line) => handleSelectLine(line, false)}
        />

        <main className="flex-1 relative h-full min-w-0 bg-[var(--bg-main)]">
          {viewMode === 'map' ? (
            <NightBusMap
              allLines={NIGHT_BUS_LINES}
              filteredLines={filteredLines}
              selectedLine={selectedLine}
              colorMode={colorMode}
              focusCommand={focusCommand}
              onSelectLine={(line) => handleSelectLine(line, false)}
              onFocusGm1708={handleFocusGm1708}
              onResetNetherlands={handleResetNetherlands}
            />
          ) : (
            <TableView
              lines={filteredLines}
              sortMode={sortMode}
              onSortModeChange={setSortMode}
              selectedLineId={selectedLine?.line_id || null}
              onSelectLine={handleSelectLine}
            />
          )}

          {toastMessage && (
            <div
              role="status"
              className="absolute bottom-4 right-4 z-30 px-3 py-2 rounded-[4px] bg-[var(--bg-elevated)] border border-[var(--accent-gold)] text-[var(--text-main)] font-mono text-[11px] shadow-2xl"
            >
              {toastMessage}
            </div>
          )}
        </main>

        <DetailDrawer
          line={selectedLine}
          isOpen={isRightDrawerOpen}
          onClose={() => setIsRightDrawerOpen(false)}
          onFocusStop={handleFocusStop}
        />
      </div>

      {/* Compacte Footer */}
      <footer className="min-h-7 px-3 sm:px-4 py-1 bg-[var(--bg-card)] border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2 text-[11px] shrink-0 z-30">
        <div className="flex items-center gap-2 min-w-0">
          <span className="h-4 w-4 rounded-[3px] bg-[#f5f6f4] text-[#060e0a] font-mono font-extrabold text-[8px] flex items-center justify-center border border-[var(--border-subtle)] shrink-0">
            OSL
          </span>
          <span className="font-semibold text-[var(--text-main)] truncate">
            Dataproduct van Onafhankelijk Steenwijkerland
          </span>
          <span className="hidden md:inline text-[var(--text-dim)] font-mono">
            · Bron: Landelijk Dossier Nachtstreeklijnen (Peildatum 26 nov. 2026 · NDOV/CHB &amp; Concessie-overzichten)
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px]">
          <button
            id="footerEmbedBtn"
            type="button"
            onClick={() => setIsEmbedOpen(true)}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] bg-[var(--bg-main)] hover:bg-[var(--bg-card-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-subtle)] cursor-pointer"
          >
            <Code2 className="w-3 h-3 text-[var(--status-blue)]" />
            <span>Insluiten</span>
          </button>
          <button
            id="fullscreenToggleBtn"
            type="button"
            onClick={handleToggleFullscreen}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] bg-[var(--bg-main)] hover:bg-[var(--bg-card-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-subtle)] cursor-pointer"
          >
            <Maximize className="w-3 h-3 text-[var(--accent-gold)]" />
            <span>Volledig scherm</span>
          </button>
        </div>
      </footer>

      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        allLines={NIGHT_BUS_LINES}
        provinceSummaries={PROVINCE_CONCESSION_SUMMARIES}
        onFilterStatuses={(statuses) => {
          setFilters({ ...DEFAULT_FILTERS, activeStatuses: statuses });
          setQuickFilterMode(statuses.includes('ACTIEF') ? 'ACTIEF' : 'ONDERZOEK_PILOT');
          setViewMode('map');
        }}
        onFilterProvince={(province) => {
          setFilters({ ...DEFAULT_FILTERS, provincie: province });
          setQuickFilterMode('ALL');
          setViewMode('map');
          showToast(`Gefilterd op provincie ${province}`);
        }}
      />

      <EmbedModal
        isOpen={isEmbedOpen}
        onClose={() => setIsEmbedOpen(false)}
        allLines={NIGHT_BUS_LINES}
        onExportCsv={handleExportCsv}
      />
    </div>
  );
}
