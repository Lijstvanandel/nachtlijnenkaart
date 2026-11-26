import type {
  ColorMode,
  FilterState,
  LineStatus,
  NightBusLine,
  SortMode,
} from '../types/nightBus';

export const STATUS_META: Record<
  LineStatus,
  {
    label: string;
    shortLabel: string;
    color: string;
    weight: number;
    dashArray?: string;
  }
> = {
  ACTIEF: {
    label: 'Actief (reguliere dienst)',
    shortLabel: 'ACTIEF',
    color: '#38bdf8',
    weight: 3.2,
  },
  PILOT_ACTIEF: {
    label: 'Pilot actief (tijdelijke proef)',
    shortLabel: 'PILOT',
    color: '#10b981',
    weight: 3.2,
  },
  VOORSTEL_ONDERZOEK: {
    label: 'Voorstel / Onderzoek (o.a. Lijn 426)',
    shortLabel: 'ONDERZOEK',
    color: '#f59e0b',
    weight: 3.4,
    dashArray: '6, 6',
  },
  GESTOPT_OPGESCHORT: {
    label: 'Gestopt / Opgeschort',
    shortLabel: 'GESTOPT',
    color: '#ef4444',
    weight: 2.6,
    dashArray: '2, 6',
  },
};

export function normalizeQuery(text: string): string {
  return (text || '').toLowerCase().trim().replace(/\s+/g, ' ');
}

export function matchesDirectionFilter(line: NightBusLine, directionFilter: string): boolean {
  if (directionFilter === 'ALL') return true;
  if (directionFilter === 'THUISBRENGER') {
    return line.richtingCategorie === 'THUISBRENGER';
  }
  if (directionFilter === 'TWEERICHTING') {
    return line.richtingCategorie === 'TWEERICHTING';
  }
  if (directionFilter === 'GEDEELTELIJK_ASYMMETRISCH') {
    return line.richtingCategorie === 'GEDEELTELIJK_ASYMMETRISCH';
  }
  if (directionFilter === 'ONBEPAALD') {
    return line.richtingCategorie === 'ONBEPAALD';
  }
  return true;
}

export function filterNightBusLines(lines: NightBusLine[], filters: FilterState): NightBusLine[] {
  const activeStatusSet = new Set(filters.activeStatuses);
  const query = normalizeQuery(filters.search);

  return lines.filter((line) => {
    if (!activeStatusSet.has(line.status)) return false;

    if (filters.provincie !== 'ALL' && !line.provincies.includes(filters.provincie)) {
      return false;
    }

    if (filters.vervoerder !== 'ALL') {
      const target = filters.vervoerder.toLowerCase();
      const hayV = `${line.vervoerder} ${line.concessie}`.toLowerCase();
      if (!hayV.includes(target)) return false;
    }

    if (!matchesDirectionFilter(line, filters.richting)) {
      return false;
    }

    if (filters.tarief !== 'ALL' && line.tariefRegime !== filters.tarief) {
      return false;
    }

    if (query) {
      const stopsText = line.haltes
        .map((h) => `${h.name} ${h.ndovCode || ''}`)
        .join(' ');
      const haystack = [
        line.line_id,
        line.lijnnummer,
        line.naam,
        line.concessie,
        line.vervoerder,
        line.regioCluster,
        line.provincies.join(' '),
        line.richtingsomschrijving,
        line.tariefLabel,
        line.chb_ndov_sleutel || '',
        line.bijzonderheden,
        line.verificatieOpmerking || '',
        stopsText,
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    return true;
  });
}

const STATUS_RANK: Record<LineStatus, number> = {
  VOORSTEL_ONDERZOEK: 1,
  PILOT_ACTIEF: 2,
  ACTIEF: 3,
  GESTOPT_OPGESCHORT: 4,
};

export function sortNightBusLines(lines: NightBusLine[], sortMode: SortMode): NightBusLine[] {
  const copy = [...lines];
  copy.sort((a, b) => {
    if (sortMode === 'LINE_ASC') {
      return a.lijnnummer.localeCompare(b.lijnnummer, 'nl', { numeric: true });
    }
    if (sortMode === 'PROV_ASC') {
      const pa = a.provincies[0] || '';
      const pb = b.provincies[0] || '';
      const cmp = pa.localeCompare(pb, 'nl');
      return cmp !== 0 ? cmp : a.lijnnummer.localeCompare(b.lijnnummer, 'nl', { numeric: true });
    }
    if (sortMode === 'VERVOERDER_ASC') {
      const cmp = a.vervoerder.localeCompare(b.vervoerder, 'nl');
      return cmp !== 0 ? cmp : a.lijnnummer.localeCompare(b.lijnnummer, 'nl', { numeric: true });
    }
    // Default 'STATUS': Steenwijkerland-relevante + onderzoek eerst of statusrang
    const ra = STATUS_RANK[a.status];
    const rb = STATUS_RANK[b.status];
    if (ra !== rb) return ra - rb;
    if (Boolean(a.isSteenwijkerlandRelevant) !== Boolean(b.isSteenwijkerlandRelevant)) {
      return a.isSteenwijkerlandRelevant ? -1 : 1;
    }
    return a.lijnnummer.localeCompare(b.lijnnummer, 'nl', { numeric: true });
  });
  return copy;
}

export interface PolylineVisualStyle {
  color: string;
  weight: number;
  opacity: number;
  dashArray?: string;
}

export function getPolylineStyle(
  line: NightBusLine,
  colorMode: ColorMode,
  isFilteredOut: boolean,
  isSelected: boolean
): PolylineVisualStyle {
  const baseMeta = STATUS_META[line.status];
  let color = baseMeta.color;

  if (colorMode === 'tarief') {
    if (line.tariefRegime === 'REGULIER_OVPAY') color = '#10b981';
    else if (line.tariefRegime === 'NACHTTOESLAG') color = '#f59e0b';
    else color = '#a855f7';
  } else if (colorMode === 'richting') {
    if (line.richtingCategorie === 'THUISBRENGER') color = '#f59e0b';
    else if (line.richtingCategorie === 'TWEERICHTING') color = '#10b981';
    else if (line.richtingCategorie === 'GEDEELTELIJK_ASYMMETRISCH') color = '#22d3ee';
    else color = '#60756a';
  }

  if (isFilteredOut) {
    return {
      color: '#1b3829',
      weight: 1.4,
      opacity: 0.22,
      dashArray: baseMeta.dashArray,
    };
  }

  return {
    color: isSelected ? '#fbbf24' : color,
    weight: isSelected ? baseMeta.weight + 2.4 : baseMeta.weight,
    opacity: isSelected ? 1 : line.status === 'GESTOPT_OPGESCHORT' ? 0.78 : 0.9,
    dashArray: baseMeta.dashArray,
  };
}

export interface NightBusStats {
  totalLines: number;
  activeCount: number;
  activePrimaryOutsideRetHwgo: number;
  pilotCount: number;
  proposalCount: number;
  stoppedCount: number;
  regulierOvpayCount: number;
  nachttoeslagCount: number;
  tariefOnbepaaldCount: number;
  thuisbrengerCount: number;
  tweerichtingCount: number;
  asymmetrischCount: number;
  richtingOnbepaaldCount: number;
}

export function computeNightBusStats(lines: NightBusLine[]): NightBusStats {
  let activeCount = 0;
  let activePrimaryOutsideRetHwgo = 0;
  let pilotCount = 0;
  let proposalCount = 0;
  let stoppedCount = 0;
  let regulierOvpayCount = 0;
  let nachttoeslagCount = 0;
  let tariefOnbepaaldCount = 0;
  let thuisbrengerCount = 0;
  let tweerichtingCount = 0;
  let asymmetrischCount = 0;
  let richtingOnbepaaldCount = 0;

  for (const line of lines) {
    if (line.status === 'ACTIEF') {
      activeCount++;
      const isRet = line.line_id.startsWith('ZH-RET-');
      const isHwgoSec = line.bronType === 'SECUNDAIR';
      const isTwenteBorder = line.line_id === 'OV-ARRIVA-9';
      if (!isRet && !isHwgoSec && !isTwenteBorder) {
        activePrimaryOutsideRetHwgo++;
      }
    } else if (line.status === 'PILOT_ACTIEF') {
      pilotCount++;
    } else if (line.status === 'VOORSTEL_ONDERZOEK') {
      proposalCount++;
    } else if (line.status === 'GESTOPT_OPGESCHORT') {
      stoppedCount++;
    }

    if (line.tariefRegime === 'REGULIER_OVPAY') regulierOvpayCount++;
    else if (line.tariefRegime === 'NACHTTOESLAG') nachttoeslagCount++;
    else tariefOnbepaaldCount++;

    if (line.richtingCategorie === 'THUISBRENGER') thuisbrengerCount++;
    else if (line.richtingCategorie === 'TWEERICHTING') tweerichtingCount++;
    else if (line.richtingCategorie === 'GEDEELTELIJK_ASYMMETRISCH') asymmetrischCount++;
    else richtingOnbepaaldCount++;
  }

  return {
    totalLines: lines.length,
    activeCount,
    activePrimaryOutsideRetHwgo,
    pilotCount,
    proposalCount,
    stoppedCount,
    regulierOvpayCount,
    nachttoeslagCount,
    tariefOnbepaaldCount,
    thuisbrengerCount,
    tweerichtingCount,
    asymmetrischCount,
    richtingOnbepaaldCount,
  };
}

export function buildSemicolonCsv(lines: NightBusLine[]): string {
  const headers = [
    'Line_ID',
    'Lijnnummer',
    'Naam',
    'Status',
    'Provincies',
    'Concessie',
    'Vervoerder',
    'Richtingstype',
    'Rijnachten',
    'Vertrektijden',
    'Tariefregime',
    'Tarief_omschrijving',
    'CHB_NDOV_sleutel',
    'Haltereeks',
    'Bijzonderheden',
    'Bron_URL',
  ];

  const esc = (v: unknown): string =>
    `"${(v == null ? '' : String(v)).replace(/"/g, '""')}"`;

  const rows = lines.map((l) =>
    [
      l.line_id,
      l.lijnnummer,
      l.naam,
      l.status,
      l.provincies.join(', '),
      l.concessie,
      l.vervoerder,
      l.richtingstypeLabel,
      l.rijnachten.join(', '),
      l.bekende_tijden,
      l.tariefRegime,
      l.tariefLabel,
      l.chb_ndov_sleutel || '',
      l.haltes.map((h) => `${h.name} (${h.passageTime})`).join(' -> '),
      l.verificatieOpmerking ? `${l.bijzonderheden} | ${l.verificatieOpmerking}` : l.bijzonderheden,
      l.bronUrl,
    ]
      .map(esc)
      .join(';')
  );

  return '\uFEFF' + [headers.join(';'), ...rows].join('\n');
}

export interface TimelineNode {
  x: number;
  y: number;
  name: string;
  minOffset: number;
  passageTime: string;
  isHub: boolean;
}

export function buildRideTimelinePoints(line: NightBusLine): {
  nodes: TimelineNode[];
  totalMinutes: number;
  polylinePoints: string;
  areaPath: string;
} {
  const stops = line.haltes;
  if (!stops.length) {
    return { nodes: [], totalMinutes: 0, polylinePoints: '', areaPath: '' };
  }
  const maxMin = Math.max(1, stops[stops.length - 1].minOffset);
  const left = 18;
  const width = 244;
  const baselineY = 58;
  const topY = 18;

  const nodes: TimelineNode[] = stops.map((s, idx) => {
    const ratio = stops.length === 1 ? 0.5 : s.minOffset / maxMin;
    const x = Math.round((left + ratio * width) * 10) / 10;
    // Lichte oplopende curve volgens cumulatieve rijtijd
    const y = Math.round((baselineY - 8 - ratio * (baselineY - topY - 12)) * 10) / 10;
    return {
      x,
      y,
      name: s.name,
      minOffset: s.minOffset,
      passageTime: s.passageTime,
      isHub: Boolean(s.isHub || idx === 0 || idx === stops.length - 1),
    };
  });

  const polylinePoints = nodes.map((n) => `${n.x},${n.y}`).join(' ');
  const first = nodes[0];
  const last = nodes[nodes.length - 1];
  const areaPath = `M${first.x},${baselineY} ${nodes.map((n) => `L${n.x},${n.y}`).join(' ')} L${last.x},${baselineY} Z`;

  return {
    nodes,
    totalMinutes: maxMin,
    polylinePoints,
    areaPath,
  };
}
