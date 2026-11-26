import React from 'react';
import { ExternalLink, FileSearch, MapPin, Route, X } from 'lucide-react';
import type {
  NightBusLine,
  NightBusStop,
  PrivateNightBusLine,
  PrivateNightBusStop,
} from '../types/nightBus';
import {
  buildRideTimelinePoints,
  PRIVATE_STATUS_META,
  STATUS_META,
} from '../utils/nightBusLogic';

interface DetailDrawerProps {
  line: NightBusLine | null;
  privateLine: PrivateNightBusLine | null;
  isOpen: boolean;
  onClose: () => void;
  onFocusStop: (stop: NightBusStop) => void;
  onFocusPrivateStop: (stop: PrivateNightBusStop) => void;
}

export const DetailDrawer: React.FC<DetailDrawerProps> = ({
  line,
  privateLine,
  isOpen,
  onClose,
  onFocusStop,
  onFocusPrivateStop,
}) => {
  if (!line && !privateLine) return null;

  if (privateLine) {
    const pMeta = PRIVATE_STATUS_META[privateLine.status];
    const exactStopsCount = privateLine.stops.filter(
      (s) => s.nauwkeurigheid === 'EXACTE_HALTE'
    ).length;

    return (
      <aside
        id="rightDetailDrawer"
        aria-label="Particulier lijndossier en haltereeks"
        className={`fixed lg:static inset-y-0 right-0 z-40 w-[90vw] max-w-[360px] xl:max-w-[380px] bg-[var(--bg-card)] border-l border-[var(--border-subtle)] flex flex-col shrink-0 transition-transform duration-200 ${
          isOpen ? 'translate-x-0 lg:flex' : 'translate-x-full lg:hidden'
        }`}
      >
        <div className="px-3.5 py-2.5 bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <FileSearch className="w-3.5 h-3.5 text-[#a855f7]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Particulier Lijndossier (27 nov. 2026)
            </h2>
          </div>
          <button
            id="closeRightDrawerBtn"
            type="button"
            onClick={onClose}
            aria-label="Sluit detailpaneel"
            title="Sluit detailpaneel"
            className="p-1 rounded-[4px] text-[var(--text-muted)] hover:text-[var(--status-crimson)] hover:bg-[var(--bg-card-hover)] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <div className="bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-[5px] p-3">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span
                className="px-2 py-0.5 rounded-[3px] border font-mono text-[10px] font-bold"
                style={{
                  backgroundColor: `${pMeta.color}20`,
                  color: pMeta.color,
                  borderColor: `${pMeta.color}66`,
                }}
              >
                {privateLine.status}
              </span>
              <span className="font-mono text-[10px] text-[var(--text-dim)]">
                {privateLine.line_id}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="px-1.5 py-0.5 rounded-[3px] bg-[#a855f7] text-[#060e0a] font-mono text-[11px] font-extrabold whitespace-nowrap shrink-0 mt-0.5">
                PARTICULIER
              </span>
              <h3 className="text-[15px] font-extrabold text-[var(--text-main)] leading-snug">
                {privateLine.naam_verbinding}
              </h3>
            </div>
            <div className="text-xs text-[var(--text-main)] mt-1.5">{privateLine.corridor}</div>
            <div className="text-[11px] font-mono text-[var(--text-muted)] mt-1">
              {privateLine.provincies.join(' / ')} · {privateLine.bediende_gemeenten}
            </div>
            <div className="text-[11px] font-mono text-[var(--text-dim)] mt-0.5">
              Vervoerder: <span className="text-[var(--text-main)]">{privateLine.vervoerder}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-[5px] p-2.5 col-span-2">
              <div className="text-[10px] font-mono uppercase text-[var(--text-dim)]">
                Frequentie &amp; Exploitatie
              </div>
              <div className="text-xs font-semibold text-[var(--text-main)] mt-0.5">
                {privateLine.frequentie}
              </div>
            </div>
            <div className="bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-[5px] p-2.5">
              <div className="text-[10px] font-mono uppercase text-[var(--text-dim)]">Heenrit</div>
              <div className="text-[11px] font-mono text-[#fbbf24] mt-0.5">
                {privateLine.tijden_heen}
              </div>
            </div>
            <div className="bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-[5px] p-2.5">
              <div className="text-[10px] font-mono uppercase text-[var(--text-dim)]">Terugrit</div>
              <div className="text-[11px] font-mono text-[#22d3ee] mt-0.5">
                {privateLine.tijden_terug}
              </div>
            </div>
            <div className="bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-[5px] p-2.5 col-span-2">
              <div className="text-[10px] font-mono uppercase text-[var(--text-dim)]">Tarief</div>
              <div className="text-xs font-bold font-mono text-[var(--accent-gold)] mt-0.5">
                {privateLine.tarief}
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-[5px] p-3 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
              <Route className="w-3 h-3 text-[#a855f7]" />
              <span>Wegennet-routering &amp; Dossier</span>
            </div>
            <p className="text-[11px] font-mono text-[var(--text-main)] leading-relaxed">
              {privateLine.route_verloop_wegen}
            </p>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed border-t border-[var(--border-subtle)] pt-2">
              {privateLine.toelichting_en_historie}
            </p>

            {privateLine.bron_url && (
              <a
                href={privateLine.bron_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[var(--bg-elevated)] hover:bg-[var(--bg-card-hover)] text-[var(--text-main)] border border-[var(--border-focus)] font-mono text-[11px] font-semibold transition"
              >
                <span>Open bronvermelding</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <div className="bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-[5px] p-3 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Haltereeks ({privateLine.stops.length} haltes · {exactStopsCount} exact)
              </span>
              <span className="text-[10px] font-mono text-[var(--text-dim)]">Klik halte → zoom</span>
            </div>

            <div className="relative pl-4 border-l border-[var(--border-focus)] space-y-2.5">
              {privateLine.stops.map((stop) => {
                const isExact = stop.nauwkeurigheid === 'EXACTE_HALTE';
                return (
                  <button
                    key={`${stop.volgnr}-${stop.haltenaam}`}
                    type="button"
                    onClick={() => onFocusPrivateStop(stop)}
                    className="w-full text-left group relative block rounded-[4px] p-1.5 -ml-1.5 hover:bg-[var(--bg-card-hover)] transition cursor-pointer"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-[2px] absolute -left-[15.5px] top-2.5 border"
                      style={{
                        backgroundColor: isExact ? '#fbbf24' : pMeta.color,
                        borderColor: isExact ? '#fef3c7' : '#060e0a',
                      }}
                    />
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[var(--text-main)] group-hover:text-[var(--accent-gold-bright)] truncate">
                        {stop.volgnr}. {stop.haltenaam}
                      </span>
                      <span
                        className={`px-1 py-0.5 rounded-[2px] font-mono text-[9px] font-bold shrink-0 ${
                          isExact
                            ? 'bg-[#f59e0b]/20 text-[#fbbf24] border border-[#f59e0b]/40'
                            : 'bg-[var(--bg-elevated)] text-[var(--text-dim)] border border-[var(--border-subtle)]'
                        }`}
                      >
                        {stop.nauwkeurigheid}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5 text-[10px] font-mono text-[var(--text-dim)]">
                      <span>
                        {stop.woonplaats} ({stop.gemeente}) · {stop.lat.toFixed(4)}, {stop.lon.toFixed(4)}
                      </span>
                    </div>
                    {(stop.tijd_heen || stop.tijd_terug) && (
                      <div className="mt-0.5 text-[10px] font-mono text-[#fbbf24]">
                        {stop.tijd_heen ? `Heen: ${stop.tijd_heen}` : ''}
                        {stop.tijd_heen && stop.tijd_terug ? ' · ' : ''}
                        {stop.tijd_terug ? `Terug: ${stop.tijd_terug}` : ''}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </aside>
    );
  }

  if (!line) return null;

  const meta = STATUS_META[line.status];
  const timeline = buildRideTimelinePoints(line);

  const tariefColor =
    line.tariefRegime === 'REGULIER_OVPAY'
      ? 'text-[#10b981]'
      : line.tariefRegime === 'NACHTTOESLAG'
      ? 'text-[#fbbf24]'
      : 'text-[var(--text-muted)]';

  const richtingColor =
    line.richtingCategorie === 'TWEERICHTING'
      ? 'text-[#10b981]'
      : line.richtingCategorie === 'THUISBRENGER'
      ? 'text-[#fbbf24]'
      : line.richtingCategorie === 'GEDEELTELIJK_ASYMMETRISCH'
      ? 'text-[#22d3ee]'
      : 'text-[var(--text-muted)]';

  return (
    <aside
      id="rightDetailDrawer"
      aria-label="Lijndossier en haltereeks"
      className={`fixed lg:static inset-y-0 right-0 z-40 w-[90vw] max-w-[360px] xl:max-w-[380px] bg-[var(--bg-card)] border-l border-[var(--border-subtle)] flex flex-col shrink-0 transition-transform duration-200 ${
        isOpen ? 'translate-x-0 lg:flex' : 'translate-x-full lg:hidden'
      }`}
    >
      {/* Header */}
      <div className="px-3.5 py-2.5 bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <FileSearch className="w-3.5 h-3.5 text-[var(--status-blue)]" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Lijndossier 2026
          </h2>
        </div>
        <button
          id="closeRightDrawerBtn"
          type="button"
          onClick={onClose}
          aria-label="Sluit detailpaneel"
          title="Sluit detailpaneel"
          className="p-1 rounded-[4px] text-[var(--text-muted)] hover:text-[var(--status-crimson)] hover:bg-[var(--bg-card-hover)] cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Lijnheader */}
        <div className="bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-[5px] p-3">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span
              className="px-2 py-0.5 rounded-[3px] border font-mono text-[10px] font-bold"
              style={{
                backgroundColor: `${meta.color}20`,
                color: meta.color,
                borderColor: `${meta.color}66`,
              }}
            >
              {line.status}
            </span>
            <span className="font-mono text-[11px] text-[var(--text-dim)]">{line.line_id}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="px-1.5 py-0.5 rounded-[3px] bg-[var(--accent-gold)] text-[#060e0a] font-mono text-xs font-extrabold whitespace-nowrap shrink-0 mt-0.5">
              Lijn {line.lijnnummer}
            </span>
            <h3 className="text-[15px] font-extrabold text-[var(--text-main)] leading-snug">
              {line.naam}
            </h3>
          </div>
          <div className="text-[11px] font-mono text-[var(--text-muted)] mt-1.5">
            {line.provincies.join(' / ')} · {line.concessie}
          </div>
          <div className="text-[11px] font-mono text-[var(--text-dim)] mt-0.5">
            Vervoerder: <span className="text-[var(--text-main)]">{line.vervoerder}</span> · CHB/NDOV:{' '}
            <span className="text-[var(--status-blue)]">{line.chb_ndov_sleutel || 'null (geen)'}</span>
          </div>
        </div>

        {/* 2x2 Metrische kaartjes */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-[5px] p-2.5">
            <div className="text-[10px] font-mono uppercase text-[var(--text-dim)]">Rijnachten</div>
            <div className="text-xs font-bold font-mono text-[var(--text-main)] mt-0.5">
              {line.rijnachten.length > 0 ? line.rijnachten.join(', ') : 'Geen (onderzoek)'}
            </div>
          </div>
          <div className="bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-[5px] p-2.5">
            <div className="text-[10px] font-mono uppercase text-[var(--text-dim)]">Richtingstype</div>
            <div className={`text-xs font-bold font-mono mt-0.5 ${richtingColor}`}>
              {line.richtingstypeLabel}
            </div>
          </div>
          <div className="bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-[5px] p-2.5 col-span-2">
            <div className="text-[10px] font-mono uppercase text-[var(--text-dim)]">Tariefregime 2026</div>
            <div className={`text-xs font-bold font-mono mt-0.5 ${tariefColor}`}>
              {line.tariefLabel}
            </div>
          </div>
        </div>

        {/* Vertrektijden & Verificatie */}
        <div className="bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-[5px] p-3 space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Vertrektijden &amp; Operationeel Regime
          </div>
          <div className="flex flex-wrap gap-1.5">
            {line.vertrektijden.map((vt, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-[3px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] font-mono text-[11px] font-semibold text-[var(--accent-gold-bright)]"
              >
                {vt}
              </span>
            ))}
          </div>
          <p className="text-xs text-[var(--text-main)] leading-relaxed">{line.bekende_tijden}</p>
          {line.routeVerloopWegen && (
            <div className="flex items-start gap-1.5 text-[11px] font-mono text-[#38bdf8] bg-[var(--bg-elevated)]/70 border border-[var(--border-subtle)] rounded-[4px] px-2 py-1.5">
              <Route className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>Corridor / wegennet: {line.routeVerloopWegen}</span>
            </div>
          )}
          <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">{line.bijzonderheden}</p>

          {line.verificatieOpmerking && (
            <div className="p-2 rounded-[4px] bg-[#f59e0b]/10 border border-[#f59e0b]/40 text-[11px] text-[#fbbf24]">
              <strong>Verificatie:</strong> {line.verificatieOpmerking}
            </div>
          )}

          {line.bronUrl && (
            <a
              href={line.bronUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[var(--bg-elevated)] hover:bg-[var(--bg-card-hover)] text-[var(--text-main)] border border-[var(--border-focus)] font-mono text-[11px] font-semibold transition"
            >
              <span>Open primaire bron</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {/* Inline SVG Tijdlijn / Rijtijdprofiel */}
        <div className="bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-[5px] p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono uppercase text-[var(--text-muted)]">
              SVG-Tijdlijn / Rijtijdprofiel
            </span>
            <span className="text-[10px] font-mono font-bold text-[var(--accent-gold)]">
              {timeline.totalMinutes} min · {line.haltes.length} haltes
            </span>
          </div>
          <svg
            viewBox="0 0 280 78"
            className="w-full h-20 overflow-visible"
            role="img"
            aria-label={`Rijtijdprofiel voor lijn ${line.lijnnummer}`}
          >
            <defs>
              <linearGradient id="rideProfileGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={meta.color} stopOpacity="0.35" />
                <stop offset="100%" stopColor={meta.color} stopOpacity="0.03" />
              </linearGradient>
            </defs>
            <line x1="16" y1="58" x2="264" y2="58" stroke="#1b3829" strokeWidth="1" />
            <line
              x1="16"
              y1="26"
              x2="264"
              y2="26"
              stroke="#1b3829"
              strokeDasharray="3 3"
              strokeWidth="1"
            />
            {timeline.areaPath && <path d={timeline.areaPath} fill="url(#rideProfileGrad)" />}
            {timeline.polylinePoints && (
              <polyline
                points={timeline.polylinePoints}
                fill="none"
                stroke={meta.color}
                strokeWidth="2"
                strokeDasharray={meta.dashArray ? '5,4' : undefined}
              />
            )}
            {timeline.nodes.map((node, idx) => (
              <g key={`${node.name}-${idx}`}>
                <line
                  x1={node.x}
                  y1={node.y}
                  x2={node.x}
                  y2={58}
                  stroke="#1b3829"
                  strokeWidth="1"
                />
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.isHub ? 3.8 : 2.6}
                  fill={node.isHub ? '#f59e0b' : meta.color}
                  stroke="#060e0a"
                  strokeWidth="1.2"
                >
                  <title>{`${node.name} (+${node.minOffset} min · ${node.passageTime})`}</title>
                </circle>
              </g>
            ))}
            <text x="16" y="71" fill="#9bb0a4" fontSize="8" fontFamily="JetBrains Mono">
              +0m ({line.haltes[0]?.passageTime || 'Start'})
            </text>
            <text
              x="140"
              y="71"
              fill="#60756a"
              fontSize="7.5"
              fontFamily="JetBrains Mono"
              textAnchor="middle"
            >
              {line.haltes.length} kernen/haltes
            </text>
            <text
              x="264"
              y="71"
              fill="#fbbf24"
              fontSize="8"
              fontFamily="JetBrains Mono"
              textAnchor="end"
            >
              +{timeline.totalMinutes}m
            </text>
          </svg>
        </div>

        {/* Complete Haltereeks met Passagetijden */}
        <div className="bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-[5px] p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Haltereeks &amp; Passagetijden
            </span>
            <span className="text-[10px] font-mono text-[var(--text-dim)]">Klik halte → zoom</span>
          </div>

          <div className="relative pl-4 border-l border-[var(--border-focus)] space-y-2.5">
            {line.haltes.map((stop, idx) => (
              <button
                key={`${stop.name}-${idx}`}
                type="button"
                onClick={() => onFocusStop(stop)}
                className="w-full text-left group relative block rounded-[4px] p-1.5 -ml-1.5 hover:bg-[var(--bg-card-hover)] transition cursor-pointer"
              >
                <span
                  className="w-2.5 h-2.5 rounded-[2px] absolute -left-[15.5px] top-2.5 border border-[#060e0a]"
                  style={{
                    backgroundColor: stop.isHub ? '#f59e0b' : meta.color,
                  }}
                />
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-xs font-semibold text-[var(--text-main)] group-hover:text-[var(--accent-gold-bright)] truncate">
                      {stop.name}
                    </span>
                    {stop.isHub && (
                      <span className="px-1 py-0.2 rounded-[2px] bg-[#f59e0b]/20 text-[#fbbf24] font-mono text-[9px] font-bold shrink-0">
                        HUB
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-[11px] font-bold text-[var(--accent-gold)] shrink-0">
                    {stop.passageTime}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 mt-0.5 text-[10px] font-mono text-[var(--text-dim)]">
                  <span>
                    +{stop.minOffset} min · {stop.lat.toFixed(4)}, {stop.lon.toFixed(4)}
                  </span>
                  {stop.ndovCode && (
                    <span className="text-[var(--status-blue)] font-semibold">{stop.ndovCode}</span>
                  )}
                </div>
                {stop.note && (
                  <div className="text-[10px] text-[var(--text-muted)] mt-0.5 flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5 text-[var(--accent-gold)] shrink-0" />
                    <span>{stop.note}</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};
