import test from 'node:test';
import assert from 'node:assert/strict';
import { NIGHT_BUS_LINES, PROVINCE_CONCESSION_SUMMARIES } from '../data/nightBusLines';
import { PRIVATE_NIGHT_BUS_LINES } from '../data/privateNightBusLines';
import {
  buildRideTimelinePoints,
  buildSemicolonCsv,
  computeNightBusStats,
  filterNightBusLines,
  filterPrivateNightBusLines,
  getPolylineStyle,
  getPrivatePolylineStyle,
  sortNightBusLines,
} from './nightBusLogic';
import type { FilterState } from '../types/nightBus';

const DEFAULT_FILTERS: FilterState = {
  search: '',
  provincie: 'ALL',
  vervoerder: 'ALL',
  richting: 'ALL',
  tarief: 'ALL',
  activeStatuses: ['ACTIEF', 'PILOT_ACTIEF', 'VOORSTEL_ONDERZOEK', 'GESTOPT_OPGESCHORT'],
};

test('dataset includes all 12 provinces and Lijn 426 research case', () => {
  assert.equal(PROVINCE_CONCESSION_SUMMARIES.length, 12);
  const line426 = NIGHT_BUS_LINES.find((l) => l.line_id === 'GD-OV-ONDERZOEK-426');
  assert.ok(line426, 'Lijn 426 must exist in NIGHT_BUS_LINES');
  assert.equal(line426.status, 'VOORSTEL_ONDERZOEK');
  assert.ok(line426.haltes.some((h) => h.ndovCode === 'NL:S:16530020'));
});

test('all stop and routeWaypoints coordinates lie within Netherlands WGS84 bounds', () => {
  for (const line of NIGHT_BUS_LINES) {
    assert.ok(line.haltes.length >= 2, `${line.line_id} should have at least 2 stops`);
    for (const stop of line.haltes) {
      assert.ok(stop.lat >= 50.75 && stop.lat <= 53.55, `lat out of bounds for ${stop.name}`);
      assert.ok(stop.lon >= 3.35 && stop.lon <= 7.22, `lon out of bounds for ${stop.name}`);
    }
    if (line.routeWaypoints) {
      assert.ok(line.routeWaypoints.length >= 2, `${line.line_id} routeWaypoints must have >= 2 points`);
      for (const [lat, lon] of line.routeWaypoints) {
        assert.ok(lat >= 50.75 && lat <= 53.55, `waypoint lat out of bounds for ${line.line_id}`);
        assert.ok(lon >= 3.35 && lon <= 7.22, `waypoint lon out of bounds for ${line.line_id}`);
      }
    }
  }
});

test('geodata dossier corrections: 409/410, 417/418, 422 (26 stops), N40 (13 stops), 13 RET N-lines, and HWGO N36/N60/N67', () => {
  const line409 = NIGHT_BUS_LINES.find((l) => l.line_id === 'GD-QBUZZ-409')!;
  const line410 = NIGHT_BUS_LINES.find((l) => l.line_id === 'GD-QBUZZ-410')!;
  assert.equal(line409.haltes.length, 2);
  assert.ok(line409.routeWaypoints && line409.routeWaypoints.length >= 4);
  assert.ok(line410.haltes.some((h) => h.name.includes('De Punt')));
  assert.ok(line410.haltes.some((h) => h.name.includes('Vries')));
  assert.ok(line410.haltes.some((h) => h.name.includes('Ubbena')));
  assert.ok(!line410.haltes.some((h) => h.name.includes('Zuidlaren')));

  const line417 = NIGHT_BUS_LINES.find((l) => l.line_id === 'GD-QBUZZ-417')!;
  const line418 = NIGHT_BUS_LINES.find((l) => l.line_id === 'GD-QBUZZ-418')!;
  assert.ok(line417.haltes.some((h) => h.name.includes('Peize')));
  assert.ok(line417.haltes.some((h) => h.name.includes('Roden')));
  assert.ok(line417.haltes.some((h) => h.name.includes('Leek')));
  assert.ok(line418.haltes.some((h) => h.name.includes('Haren')));
  assert.ok(line418.haltes.some((h) => h.name.includes('Zuidlaren')));
  assert.ok(line418.haltes.some((h) => h.name.includes('Gieten')));

  const line422 = NIGHT_BUS_LINES.find((l) => l.line_id === 'GD-QBUZZ-422')!;
  assert.equal(line422.haltes.length, 26);
  assert.ok(line422.haltes.some((h) => h.ndovCode === 'NL:S:15000120'));

  const lineN40 = NIGHT_BUS_LINES.find((l) => l.line_id === 'ZH-QBUZZ-N40')!;
  assert.equal(lineN40.haltes.length, 13);
  assert.equal(lineN40.richtingCategorie, 'TWEERICHTING');
  assert.ok(lineN40.haltes.some((h) => h.ndovCode === 'NL:S:54440270'));
  assert.ok(lineN40.haltes.some((h) => h.ndovCode === 'NL:S:54446630'));

  const retLines = NIGHT_BUS_LINES.filter((l) => l.line_id.startsWith('ZH-RET-'));
  assert.equal(retLines.length, 13);
  assert.ok(retLines.some((l) => l.line_id === 'ZH-RET-N1'));
  assert.ok(retLines.some((l) => l.line_id === 'ZH-RET-N13'));
  assert.ok(retLines.some((l) => l.line_id === 'ZH-RET-N19'));

  const hwgo36 = NIGHT_BUS_LINES.find((l) => l.line_id === 'ZH-TRANSDEV-N36')!;
  const hwgo60 = NIGHT_BUS_LINES.find((l) => l.line_id === 'ZH-TRANSDEV-N60')!;
  const hwgo67 = NIGHT_BUS_LINES.find((l) => l.line_id === 'ZH-TRANSDEV-N67')!;
  assert.ok(hwgo36.haltes.some((h) => h.name.includes('Melissant')));
  assert.ok(hwgo36.haltes.some((h) => h.name.includes('Dirksland')));
  assert.ok(hwgo60.haltes.some((h) => h.name.includes('Goudswaard')));
  assert.ok(hwgo67.haltes.some((h) => h.name.includes('Strijen')));

  const stats = computeNightBusStats(NIGHT_BUS_LINES);
  assert.equal(stats.activePrimaryOutsideRetHwgo, 58);
});

test('filterNightBusLines filters by tariff regime, direction, status, and search', () => {
  const regulier = filterNightBusLines(NIGHT_BUS_LINES, {
    ...DEFAULT_FILTERS,
    tarief: 'REGULIER_OVPAY',
  });
  assert.ok(regulier.length > 0);
  assert.ok(regulier.every((l) => l.tariefRegime === 'REGULIER_OVPAY'));

  const thuisbrengers = filterNightBusLines(NIGHT_BUS_LINES, {
    ...DEFAULT_FILTERS,
    richting: 'THUISBRENGER',
  });
  assert.ok(thuisbrengers.some((l) => l.lijnnummer === '422'));
  assert.ok(!thuisbrengers.some((l) => l.lijnnummer === '432'));

  const search426 = filterNightBusLines(NIGHT_BUS_LINES, {
    ...DEFAULT_FILTERS,
    search: 'Giethoorn',
  });
  assert.equal(search426.length, 1);
  assert.equal(search426[0].lijnnummer, '426');
});

test('getPolylineStyle distinguishes active, proposal dashed, and stopped dotted styles', () => {
  const active = NIGHT_BUS_LINES.find((l) => l.status === 'ACTIEF')!;
  const proposal = NIGHT_BUS_LINES.find((l) => l.status === 'VOORSTEL_ONDERZOEK')!;
  const stopped = NIGHT_BUS_LINES.find((l) => l.status === 'GESTOPT_OPGESCHORT')!;

  const sActive = getPolylineStyle(active, 'status', false, false);
  const sProposal = getPolylineStyle(proposal, 'status', false, false);
  const sStopped = getPolylineStyle(stopped, 'status', false, false);

  assert.equal(sActive.dashArray, undefined);
  assert.equal(sProposal.dashArray, '6, 6');
  assert.equal(sStopped.dashArray, '2, 6');
});

test('computeNightBusStats computes accurate totals and buildSemicolonCsv emits valid CSV', () => {
  const stats = computeNightBusStats(NIGHT_BUS_LINES);
  assert.equal(stats.totalLines, NIGHT_BUS_LINES.length);
  assert.equal(stats.proposalCount, 3);
  assert.equal(stats.stoppedCount, 3);

  const sorted = sortNightBusLines(NIGHT_BUS_LINES, 'STATUS');
  assert.equal(sorted[0].status, 'VOORSTEL_ONDERZOEK');

  const csv = buildSemicolonCsv(sorted.slice(0, 3));
  assert.ok(csv.startsWith('\uFEFFLine_ID;Lijnnummer;'));
  assert.equal(csv.split('\n').length, 4);
});

test('buildRideTimelinePoints calculates increasing x coordinates along stops', () => {
  const line426 = NIGHT_BUS_LINES.find((l) => l.line_id === 'GD-OV-ONDERZOEK-426')!;
  const timeline = buildRideTimelinePoints(line426);
  assert.equal(timeline.nodes.length, line426.haltes.length);
  assert.equal(timeline.totalMinutes, 52);
  assert.ok(timeline.nodes[timeline.nodes.length - 1].x > timeline.nodes[0].x);
});

test('PRIVATE_NIGHT_BUS_LINES contains all 8 verified lines within Netherlands WGS84 bounds', () => {
  assert.equal(PRIVATE_NIGHT_BUS_LINES.length, 8);

  for (const line of PRIVATE_NIGHT_BUS_LINES) {
    assert.ok(line.stops.length >= 3, `${line.line_id} should have at least 3 stops`);
    assert.ok(line.route_waypoints.length >= line.stops.length, `${line.line_id} must have waypoints`);
    for (const stop of line.stops) {
      assert.ok(stop.lat >= 50.75 && stop.lat <= 53.55, `stop lat out of bounds for ${stop.haltenaam}`);
      assert.ok(stop.lon >= 3.35 && stop.lon <= 7.22, `stop lon out of bounds for ${stop.haltenaam}`);
    }
    for (const [lat, lon] of line.route_waypoints) {
      assert.ok(lat >= 50.75 && lat <= 53.55, `waypoint lat out of bounds for ${line.line_id}`);
      assert.ok(lon >= 3.35 && lon <= 7.22, `waypoint lon out of bounds for ${line.line_id}`);
    }
  }

  const fne = PRIVATE_NIGHT_BUS_LINES.find((l) => l.line_id === 'PART-FL-REGEGO-FNE')!;
  assert.equal(fne.stops.filter((s) => s.nauwkeurigheid === 'EXACTE_HALTE').length, 5);
  assert.equal(fne.stops[5].nauwkeurigheid, 'KERN_CENTROID');
});

test('filterPrivateNightBusLines maps Friesland to Fryslân and matches Steenwijkerland search', () => {
  const friesland = filterPrivateNightBusLines(PRIVATE_NIGHT_BUS_LINES, 'Friesland', '');
  assert.equal(friesland.length, 1);
  assert.equal(friesland[0].line_id, 'PART-FL-REGEGO-LLNL');

  const swl = filterPrivateNightBusLines(PRIVATE_NIGHT_BUS_LINES, 'ALL', 'Steenwijkerland');
  assert.equal(swl.length, 1);
  assert.equal(swl[0].line_id, 'PART-OV-REGEGO-BORREL');
});

test('getPrivatePolylineStyle distinguishes active, seasonal dashed, and stopped dotted styles', () => {
  const active = PRIVATE_NIGHT_BUS_LINES.find((l) => l.status === 'PARTICULIER_ACTIEF')!;
  const seasonal = PRIVATE_NIGHT_BUS_LINES.find(
    (l) => l.status === 'PARTICULIER_SEIZOEN_MAANDELIJKS'
  )!;
  const stopped = PRIVATE_NIGHT_BUS_LINES.find(
    (l) => l.status === 'PARTICULIER_GESTOPT_2022_2026'
  )!;

  assert.equal(getPrivatePolylineStyle(active, false, false).dashArray, undefined);
  assert.equal(getPrivatePolylineStyle(seasonal, false, false).dashArray, '7, 5');
  assert.equal(getPrivatePolylineStyle(stopped, false, false).dashArray, '2, 6');
});

