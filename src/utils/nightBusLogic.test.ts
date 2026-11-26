import test from 'node:test';
import assert from 'node:assert/strict';
import { NIGHT_BUS_LINES, PROVINCE_CONCESSION_SUMMARIES } from '../data/nightBusLines';
import {
  buildRideTimelinePoints,
  buildSemicolonCsv,
  computeNightBusStats,
  filterNightBusLines,
  getPolylineStyle,
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

test('all stop coordinates lie within Netherlands WGS84 bounds', () => {
  for (const line of NIGHT_BUS_LINES) {
    assert.ok(line.haltes.length >= 2, `${line.line_id} should have at least 2 stops`);
    for (const stop of line.haltes) {
      assert.ok(stop.lat >= 50.75 && stop.lat <= 53.55, `lat out of bounds for ${stop.name}`);
      assert.ok(stop.lon >= 3.35 && stop.lon <= 7.22, `lon out of bounds for ${stop.name}`);
    }
  }
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
