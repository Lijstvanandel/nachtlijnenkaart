import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Layers, MapPin, Maximize2, Scan } from 'lucide-react';
import type { BasemapId, ColorMode, NightBusLine, NightBusStop } from '../types/nightBus';
import {
  CONCESSIEGRENS_DRENTHE_OVERIJSSEL,
  GM1708_STEENWIJKERLAND_OUTLINE,
} from '../data/nightBusLines';
import { getPolylineStyle, STATUS_META } from '../utils/nightBusLogic';

export type MapFocusCommand =
  | { type: 'nl'; nonce: number }
  | { type: 'gm1708'; nonce: number }
  | { type: 'line'; line: NightBusLine; nonce: number }
  | { type: 'stop'; stop: NightBusStop; line: NightBusLine; nonce: number };

interface NightBusMapProps {
  allLines: NightBusLine[];
  filteredLines: NightBusLine[];
  selectedLine: NightBusLine | null;
  colorMode: ColorMode;
  focusCommand: MapFocusCommand | null;
  onSelectLine: (line: NightBusLine) => void;
  onFocusGm1708: () => void;
  onResetNetherlands: () => void;
}

const NL_BOUNDS: L.LatLngBoundsExpression = [
  [50.72, 3.3],
  [53.58, 7.25],
];

const GM1708_BOUNDS: L.LatLngBoundsExpression = [
  [52.65, 5.86],
  [52.91, 6.42],
];

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export const NightBusMap: React.FC<NightBusMapProps> = ({
  allLines,
  filteredLines,
  selectedLine,
  colorMode,
  focusCommand,
  onSelectLine,
  onFocusGm1708,
  onResetNetherlands,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayersRef = useRef<Record<BasemapId, L.TileLayer> | null>(null);
  const routesLayerRef = useRef<L.LayerGroup | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const boundaryLayerRef = useRef<L.LayerGroup | null>(null);

  const onSelectLineRef = useRef(onSelectLine);
  onSelectLineRef.current = onSelectLine;

  const [basemap, setBasemap] = useState<BasemapId>('pdok');
  const [showRoutes, setShowRoutes] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);
  const [showBoundary, setShowBoundary] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(8);

  // Initialiseer Leaflet-kaart eenmalig (zonder carto.com)
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [52.25, 5.45],
      zoom: 8,
      minZoom: 7,
      maxZoom: 18,
      zoomControl: true,
    });

    const pdokLayer = L.tileLayer(
      'https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0/grijs/EPSG:3857/{z}/{x}/{y}.png',
      {
        maxZoom: 19,
        className: 'dark-forensic-tiles',
        attribution: 'Kaartgegevens © Kadaster / PDOK BRT',
      }
    );

    const osmLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      className: 'dark-forensic-tiles',
      attribution: '© OpenStreetMap-bijdragers',
    });

    const esriLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 19,
        attribution: '© Esri / Maxar / Earthstar Geographics',
      }
    );

    pdokLayer.addTo(map);
    tileLayersRef.current = { pdok: pdokLayer, osm: osmLayer, esri: esriLayer };

    boundaryLayerRef.current = L.layerGroup().addTo(map);
    routesLayerRef.current = L.layerGroup().addTo(map);
    markersLayerRef.current = L.layerGroup().addTo(map);

    map.on('zoomend', () => {
      setZoomLevel(map.getZoom());
    });

    map.fitBounds(NL_BOUNDS, { padding: [24, 24] });
    mapRef.current = map;

    const ro = new ResizeObserver(() => {
      map.invalidateSize({ animate: false });
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Schakel basiskaart
  useEffect(() => {
    const map = mapRef.current;
    const layers = tileLayersRef.current;
    if (!map || !layers) return;

    (Object.keys(layers) as BasemapId[]).forEach((key) => {
      if (key === basemap) {
        if (!map.hasLayer(layers[key])) layers[key].addTo(map);
      } else if (map.hasLayer(layers[key])) {
        map.removeLayer(layers[key]);
      }
    });
  }, [basemap]);

  // Regiogrens GM1708 Steenwijkerland & concessiegrens Drenthe–Overijssel
  useEffect(() => {
    const layer = boundaryLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    if (!showBoundary) return;

    const polygon = L.polygon(GM1708_STEENWIJKERLAND_OUTLINE, {
      color: '#38bdf8',
      weight: 2,
      dashArray: '5, 5',
      fillColor: '#38bdf8',
      fillOpacity: 0.08,
    });
    polygon.bindTooltip(
      '<div style="font-family:JetBrains Mono,monospace;font-size:11px;"><strong>GM1708 Steenwijkerland</strong><br/>0 actieve nachtstreeklijnen (focusregio)</div>',
      { sticky: true }
    );
    polygon.addTo(layer);

    const border = L.polyline(CONCESSIEGRENS_DRENTHE_OVERIJSSEL, {
      color: '#f59e0b',
      weight: 2.5,
      dashArray: '8, 4',
      opacity: 0.9,
    });
    border.bindTooltip(
      '<div style="font-family:JetBrains Mono,monospace;font-size:11px;"><strong>Concessiegrens Drenthe ↔ Overijssel</strong><br/>OV-bureau GD (Qbuzz) vs. IJssel-Vecht RRReis</div>',
      { sticky: true }
    );
    border.addTo(layer);

    const gmPin = L.marker([52.772, 5.955], {
      interactive: false,
      icon: L.divIcon({
        className: 'forensic-pin',
        html: `<span style="background:#0b1a13;border:1px solid #38bdf8;color:#38bdf8;padding:2px 6px;border-radius:3px;display:inline-block;">GM1708 · 0 nachtlijnen</span>`,
        iconSize: [148, 22],
        iconAnchor: [74, 11],
      }),
    });
    gmPin.addTo(layer);
  }, [showBoundary]);

  // Routelijnen (polylines) en klikbare halte-/hubmarkers
  useEffect(() => {
    const routesLayer = routesLayerRef.current;
    const markersLayer = markersLayerRef.current;
    if (!routesLayer || !markersLayer) return;

    routesLayer.clearLayers();
    markersLayer.clearLayers();

    const filteredSet = new Set(filteredLines.map((l) => l.line_id));
    const selectedId = selectedLine?.line_id || null;

    // Sorteer tekenvolgorde: weggefilterd onderaan -> actief/matched -> geselecteerde lijn bovenaan
    const orderedLines = [...allLines].sort((a, b) => {
      const aSel = a.line_id === selectedId ? 2 : filteredSet.has(a.line_id) ? 1 : 0;
      const bSel = b.line_id === selectedId ? 2 : filteredSet.has(b.line_id) ? 1 : 0;
      return aSel - bSel;
    });

    if (showRoutes) {
      for (const line of orderedLines) {
        if (line.haltes.length < 2) continue;
        const isMatched = filteredSet.has(line.line_id);
        const isSelected = line.line_id === selectedId;
        const style = getPolylineStyle(line, colorMode, !isMatched, isSelected);
        const latLngs: L.LatLngExpression[] = line.haltes.map((h) => [h.lat, h.lon]);

        // Subtiele donkere halo achter geselecteerde lijn voor maximaal contrast
        if (isSelected) {
          L.polyline(latLngs, {
            color: '#060e0a',
            weight: style.weight + 4,
            opacity: 0.85,
            interactive: false,
          }).addTo(routesLayer);
        }

        const polyline = L.polyline(latLngs, {
          color: style.color,
          weight: style.weight,
          opacity: style.opacity,
          dashArray: style.dashArray,
          lineCap: 'round',
          lineJoin: 'round',
        });

        const statusMeta = STATUS_META[line.status];
        const popupHtml = `
          <div style="padding:12px 14px;min-width:240px;max-width:300px;font-family:Inter,sans-serif;line-height:1.45;">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:6px;padding-right:22px;">
              <span style="background:#f59e0b;color:#060e0a;font-family:JetBrains Mono,monospace;font-weight:800;font-size:11px;padding:2px 6px;border-radius:3px;">Lijn ${escapeHtml(line.lijnnummer)}</span>
              <span style="border:1px solid ${statusMeta.color}66;background:${statusMeta.color}22;color:${statusMeta.color};font-family:JetBrains Mono,monospace;font-weight:700;font-size:10px;padding:1px 5px;border-radius:3px;">${escapeHtml(statusMeta.shortLabel)}</span>
            </div>
            <div style="font-weight:700;font-size:13px;color:#f5f6f4;margin-bottom:4px;">${escapeHtml(line.naam)}</div>
            <div style="font-family:JetBrains Mono,monospace;font-size:10px;color:#9bb0a4;margin-bottom:6px;">
              ${escapeHtml(line.vervoerder)} · ${escapeHtml(line.provincies.join(' / '))}
            </div>
            <div style="font-size:11px;color:#d6e2dc;border-top:1px solid #1b3829;padding-top:6px;">
              <div><strong>Tarief:</strong> ${escapeHtml(line.tariefLabel)}</div>
              <div><strong>Rijnachten:</strong> ${escapeHtml(line.rijnachten.join(', ') || 'Onderzoek')}</div>
              <div><strong>Haltes:</strong> ${line.haltes.length} kernen/hubs</div>
            </div>
          </div>
        `;

        polyline.bindPopup(popupHtml);
        polyline.bindTooltip(
          `<span style="font-family:JetBrains Mono,monospace;font-size:11px;font-weight:700;">Lijn ${escapeHtml(line.lijnnummer)}</span> · ${escapeHtml(line.naam)}`,
          { sticky: true }
        );

        polyline.on('click', () => {
          onSelectLineRef.current(line);
        });

        polyline.on('mouseover', () => {
          if (!isSelected && isMatched) {
            polyline.setStyle({ weight: style.weight + 2, opacity: 1 });
          }
        });

        polyline.on('mouseout', () => {
          if (!isSelected && isMatched) {
            polyline.setStyle({ weight: style.weight, opacity: style.opacity });
          }
        });

        polyline.addTo(routesLayer);
      }
    }

    // Halte- & hubmarkers
    if (showMarkers) {
      const detailedThreshold = zoomLevel >= 10 || filteredLines.length <= 14;
      const drawnHubKeys = new Set<string>();

      for (const line of filteredLines) {
        const isSelected = line.line_id === selectedId;
        const style = getPolylineStyle(line, colorMode, false, isSelected);

        line.haltes.forEach((stop, idx) => {
          const isTerminal = idx === 0 || idx === line.haltes.length - 1;
          const shouldRender = isSelected || isTerminal || (stop.isHub && detailedThreshold) || detailedThreshold;
          if (!shouldRender) return;

          // Voorkom dubbele niet-geselecteerde cirkelmarkers op exact dezelfde hub
          const key = `${stop.lat.toFixed(4)}_${stop.lon.toFixed(4)}`;
          if (!isSelected && drawnHubKeys.has(key)) return;
          if (!isSelected) drawnHubKeys.add(key);

          const marker = L.circleMarker([stop.lat, stop.lon], {
            radius: isSelected ? (stop.isHub || isTerminal ? 6.5 : 4.5) : stop.isHub || isTerminal ? 4.2 : 3.2,
            color: '#060e0a',
            weight: isSelected ? 2 : 1.3,
            fillColor: isSelected && (stop.isHub || isTerminal) ? '#fbbf24' : style.color,
            fillOpacity: isSelected ? 1 : 0.88,
          });

          const stopPopup = `
            <div style="padding:12px 14px;min-width:210px;font-family:Inter,sans-serif;line-height:1.45;">
              <div style="font-family:JetBrains Mono,monospace;font-size:10px;color:#fbbf24;font-weight:700;padding-right:22px;">
                Lijn ${escapeHtml(line.lijnnummer)} · +${stop.minOffset} min (${escapeHtml(stop.passageTime)})
              </div>
              <div style="font-weight:700;font-size:13px;color:#f5f6f4;margin:3px 0;">
                ${escapeHtml(stop.name)}
              </div>
              <div style="font-family:JetBrains Mono,monospace;font-size:10px;color:#9bb0a4;">
                ${stop.lat.toFixed(4)}, ${stop.lon.toFixed(4)}
                ${stop.ndovCode ? `<br/>NDOV/CHB: <span style="color:#38bdf8;">${escapeHtml(stop.ndovCode)}</span>` : ''}
              </div>
              ${stop.note ? `<div style="font-size:11px;color:#d6e2dc;margin-top:5px;border-top:1px solid #1b3829;padding-top:5px;">${escapeHtml(stop.note)}</div>` : ''}
            </div>
          `;

          marker.bindPopup(stopPopup);
          marker.bindTooltip(
            `<span style="font-family:JetBrains Mono,monospace;font-size:10px;">${escapeHtml(stop.name)} (${escapeHtml(stop.passageTime)})</span>`,
            { direction: 'top' }
          );
          marker.on('click', () => {
            onSelectLineRef.current(line);
          });
          marker.addTo(markersLayer);
        });

        // Lijnnummer-badge op ankerhalte van de geselecteerde lijn
        if (isSelected && line.haltes.length > 0) {
          const anchorStop = line.haltes[line.haltes.length - 1];
          const badge = L.marker([anchorStop.lat, anchorStop.lon], {
            interactive: false,
            icon: L.divIcon({
              className: 'forensic-pin',
              html: `<span style="background:#f59e0b;color:#060e0a;padding:2px 6px;border-radius:3px;font-weight:800;display:inline-block;">Lijn ${escapeHtml(line.lijnnummer)}</span>`,
              iconSize: [74, 20],
              iconAnchor: [37, -8],
            }),
          });
          badge.addTo(markersLayer);
        }
      }
    }
  }, [allLines, filteredLines, selectedLine, colorMode, showRoutes, showMarkers, zoomLevel]);

  // Verwerk focuscommando's (GM1708, Nederland, Lijn, Halte)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focusCommand) return;

    if (focusCommand.type === 'nl') {
      map.flyToBounds(NL_BOUNDS, { padding: [24, 24], duration: 0.7 });
    } else if (focusCommand.type === 'gm1708') {
      map.flyToBounds(GM1708_BOUNDS, { padding: [28, 28], duration: 0.75, maxZoom: 11 });
    } else if (focusCommand.type === 'line') {
      const stops = focusCommand.line.haltes;
      if (stops.length >= 2) {
        const bounds = L.latLngBounds(stops.map((s) => [s.lat, s.lon] as [number, number]));
        map.flyToBounds(bounds, { padding: [46, 46], duration: 0.65, maxZoom: 12 });
      } else if (stops.length === 1) {
        map.flyTo([stops[0].lat, stops[0].lon], 12, { duration: 0.65 });
      }
    } else if (focusCommand.type === 'stop') {
      map.flyTo([focusCommand.stop.lat, focusCommand.stop.lon], 13, { duration: 0.55 });
    }
  }, [focusCommand]);

  return (
    <div id="mapViewContainer" className="w-full h-full relative">
      <div ref={containerRef} id="map" className="w-full h-full z-10" />

      {/* Bovenste zwevende kaartbalk: links snelacties, rechts basiskaart & lagen (nooit overlappend) */}
      <div className="absolute top-3 left-12 right-3 z-20 flex flex-wrap items-start justify-between gap-2 pointer-events-none">
        <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto">
          <button
            id="focusGm1708Btn"
            type="button"
            onClick={onFocusGm1708}
            title="Zoom naar referentiegemeente Steenwijkerland (GM1708) & Zuidwest-Drenthe (Lijn 426/428)"
            className="bg-[var(--bg-card)]/95 backdrop-blur-xs hover:bg-[var(--bg-card-hover)] text-[var(--text-main)] border border-[var(--status-blue)]/60 rounded-[4px] px-2.5 py-1.5 text-xs font-medium shadow-xl inline-flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
          >
            <span className="w-2 h-2 rounded-[2px] bg-[#38bdf8] shrink-0" />
            <span className="font-mono text-[11px] font-bold text-[#38bdf8]">GM1708</span>
            <span className="hidden sm:inline">Steenwijkerland / ZW-Dr.</span>
          </button>

          <button
            id="resetNetherlandsBtn"
            type="button"
            onClick={onResetNetherlands}
            title="Toon heel Nederland"
            className="bg-[var(--bg-card)]/95 backdrop-blur-xs hover:bg-[var(--bg-card-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-subtle)] rounded-[4px] px-2.5 py-1.5 text-xs font-medium shadow-xl inline-flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
          >
            <Maximize2 className="w-3.5 h-3.5 text-[var(--accent-gold)] shrink-0" />
            <span className="hidden sm:inline">Nederland</span>
          </button>
        </div>

        <div className="flex flex-col items-end gap-2 pointer-events-auto ml-auto">
          <div className="bg-[var(--bg-card)]/95 backdrop-blur-xs border border-[var(--border-subtle)] rounded-[5px] p-1 shadow-xl flex items-center gap-1">
            {(
              [
                { id: 'pdok', label: 'PDOK Grijs' },
                { id: 'osm', label: 'OSM Dark' },
                { id: 'esri', label: 'Esri Satelliet' },
              ] as { id: BasemapId; label: string }[]
            ).map((bm) => (
              <button
                key={bm.id}
                type="button"
                data-basemap={bm.id}
                onClick={() => setBasemap(bm.id)}
                className={`px-2 py-1 rounded-[3px] text-[11px] font-mono font-semibold transition cursor-pointer whitespace-nowrap ${
                  basemap === bm.id
                    ? 'bg-[var(--bg-elevated)] text-[var(--accent-gold-bright)] border border-[var(--border-focus)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] border border-transparent'
                }`}
              >
                {bm.label}
              </button>
            ))}
          </div>

          <div className="bg-[var(--bg-card)]/95 backdrop-blur-xs border border-[var(--border-subtle)] rounded-[5px] p-2 shadow-xl space-y-1.5 text-[11px]">
            <label className="flex items-center justify-between gap-3 cursor-pointer text-[var(--text-main)]">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[var(--status-emerald)]" />
                <span>Routelijnen ({filteredLines.length})</span>
              </span>
              <input
                id="layerRoutesToggle"
                type="checkbox"
                checked={showRoutes}
                onChange={(e) => setShowRoutes(e.target.checked)}
                className="accent-[#f59e0b]"
              />
            </label>
            <label className="flex items-center justify-between gap-3 cursor-pointer text-[var(--text-main)]">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
                <span>Halte- &amp; hubmarkers</span>
              </span>
              <input
                id="layerMarkersToggle"
                type="checkbox"
                checked={showMarkers}
                onChange={(e) => setShowMarkers(e.target.checked)}
                className="accent-[#f59e0b]"
              />
            </label>
            <label className="flex items-center justify-between gap-3 cursor-pointer text-[var(--text-main)]">
              <span className="flex items-center gap-1.5">
                <Scan className="w-3.5 h-3.5 text-[var(--status-blue)]" />
                <span>Regiogrens GM1708</span>
              </span>
              <input
                id="layerGm1708Toggle"
                type="checkbox"
                checked={showBoundary}
                onChange={(e) => setShowBoundary(e.target.checked)}
                className="accent-[#f59e0b]"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Linksonder: Zwevende Legenda */}
      <div
        id="floatingLegend"
        className="absolute bottom-4 left-3 z-20 bg-[var(--bg-card)]/95 backdrop-blur-xs border border-[var(--border-subtle)] rounded-[5px] p-3 shadow-xl max-w-[285px]"
      >
        <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] mb-2 flex items-center justify-between gap-2">
          <span>
            Legenda ·{' '}
            {colorMode === 'status'
              ? 'Lijnstatus 2026'
              : colorMode === 'tarief'
              ? 'Tariefregime'
              : 'Richtingstype'}
          </span>
          <span className="text-[var(--accent-gold)] font-bold">26 NOV</span>
        </div>

        {colorMode === 'status' && (
          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-5 h-0.5 bg-[#38bdf8] shrink-0" />
              <span className="text-[var(--text-main)]">Actief (reguliere dienst)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-0.5 bg-[#10b981] shrink-0" />
              <span className="text-[var(--text-main)]">Pilot actief (tijdelijke proef)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 border-t-2 border-dashed border-[#f59e0b] shrink-0" />
              <span className="text-[var(--text-main)]">Voorstel / Onderzoek (o.a. 426)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 border-t-2 border-dotted border-[#ef4444] shrink-0" />
              <span className="text-[var(--text-main)]">Gestopt / Opgeschort</span>
            </div>
          </div>
        )}

        {colorMode === 'tarief' && (
          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-5 h-0.5 bg-[#10b981] shrink-0" />
              <span className="text-[var(--text-main)]">Regulier OVpay / dagtarief</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-0.5 bg-[#f59e0b] shrink-0" />
              <span className="text-[var(--text-main)]">Nachttoeslag (€ 5,00 – € 7,80)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-0.5 bg-[#a855f7] shrink-0" />
              <span className="text-[var(--text-main)]">Onbepaald / Onderzoek</span>
            </div>
          </div>
        )}

        {colorMode === 'richting' && (
          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-5 h-0.5 bg-[#f59e0b] shrink-0" />
              <span className="text-[var(--text-main)]">Eenrichting thuisbrenger</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-0.5 bg-[#10b981] shrink-0" />
              <span className="text-[var(--text-main)]">Tweerichting</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-0.5 bg-[#22d3ee] shrink-0" />
              <span className="text-[var(--text-main)]">Gedeeltelijk / Asymmetrisch</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-0.5 bg-[#60756a] shrink-0" />
              <span className="text-[var(--text-muted)]">Niet gespecificeerd</span>
            </div>
          </div>
        )}

        <div className="mt-2 pt-2 border-t border-[var(--border-subtle)] text-[10px] font-mono text-[var(--text-dim)] flex items-center justify-between gap-2">
          <span>Blauw kader: GM1708</span>
          <span>Oranje stippel: Concessiegrens</span>
        </div>
      </div>
    </div>
  );
};
