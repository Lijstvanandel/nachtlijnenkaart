import React, { useState } from 'react';
import { Check, Code2, Copy, Download, ExternalLink, X } from 'lucide-react';
import type { NightBusLine } from '../types/nightBus';

interface EmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  allLines: NightBusLine[];
  onExportCsv: () => void;
}

export const EmbedModal: React.FC<EmbedModalProps> = ({
  isOpen,
  onClose,
  allLines,
  onExportCsv,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const baseUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : 'https://example.org/';
  const embedUrl = `${baseUrl}?embed=true`;
  const iframeSnippet = `<iframe src="${embedUrl}" title="Nachtstreeklijnen Nederland (Nov. 2026) — Onafhankelijk Steenwijkerland" width="100%" height="680" style="border:1px solid #1b3829;border-radius:6px;background:#060e0a;" loading="lazy"></iframe>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(iframeSnippet);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleExportGeoJson = () => {
    const features = allLines.map((line) => ({
      type: 'Feature',
      properties: {
        line_id: line.line_id,
        lijnnummer: line.lijnnummer,
        naam: line.naam,
        status: line.status,
        provincies: line.provincies,
        concessie: line.concessie,
        vervoerder: line.vervoerder,
        richtingstype: line.richtingstypeLabel,
        tariefRegime: line.tariefRegime,
        tariefLabel: line.tariefLabel,
        chb_ndov_sleutel: line.chb_ndov_sleutel,
        rijnachten: line.rijnachten,
        vertrektijden: line.vertrektijden,
      },
      geometry: {
        type: 'LineString',
        coordinates: line.haltes.map((h) => [h.lon, h.lat]),
      },
    }));

    const geojson = {
      type: 'FeatureCollection',
      name: 'Nachtstreeklijnen_Nederland_2026_11_26',
      features,
    };

    const blob = new Blob([JSON.stringify(geojson, null, 2)], {
      type: 'application/geo+json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nachtstreeklijnen_nederland_2026_11_26.geojson';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      id="embedModal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="embedModalTitle"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-[#060e0a]/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
    >
      <div className="bg-[var(--bg-card)] border border-[var(--border-focus)] rounded-[6px] shadow-2xl max-w-2xl w-full overflow-hidden">
        <div className="px-4 py-3 bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-[var(--status-blue)]" />
            <h2
              id="embedModalTitle"
              className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]"
            >
              Insluiten (&lt;iframe&gt;) &amp; Open Data Export
            </h2>
          </div>
          <button
            id="closeEmbedModalBtn"
            type="button"
            onClick={onClose}
            aria-label="Sluit embed-modal"
            className="p-1.5 rounded-[4px] bg-[var(--bg-main)] hover:bg-[var(--bg-card-hover)] text-[var(--text-muted)] hover:text-[var(--status-crimson)] border border-[var(--border-subtle)] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4 text-xs text-[var(--text-muted)]">
          <p>
            Sluit deze interactieve nachtbuskaart in op een website via de compacte{' '}
            <code className="font-mono text-[var(--accent-gold)]">?embed=true</code> modus, of download de volledige geodata als GeoJSON of puntkommagescheiden CSV.
          </p>

          <div>
            <label
              htmlFor="embedCodeTextarea"
              className="block text-[10px] font-mono uppercase text-[var(--text-dim)] mb-1"
            >
              HTML Iframe Embed-code
            </label>
            <textarea
              id="embedCodeTextarea"
              readOnly
              rows={3}
              value={iframeSnippet}
              className="w-full p-2.5 bg-[var(--bg-main)] text-[var(--text-main)] font-mono text-[11px] border border-[var(--border-subtle)] rounded-[4px] focus:outline-none focus:border-[var(--border-focus)]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="copyEmbedCodeBtn"
              type="button"
              onClick={handleCopy}
              className="gold-cta inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-bold cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Gekopieerd' : 'Kopieer embed-code'}</span>
            </button>

            <a
              href={embedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[var(--bg-elevated)] hover:bg-[var(--bg-card-hover)] text-[var(--text-main)] border border-[var(--border-subtle)] font-mono text-[11px] font-semibold"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[var(--status-blue)]" />
              <span>Open embed-weergave</span>
            </a>

            <button
              type="button"
              onClick={handleExportGeoJson}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[var(--bg-elevated)] hover:bg-[var(--bg-card-hover)] text-[var(--status-emerald)] border border-[var(--border-subtle)] font-mono text-[11px] font-semibold cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download GeoJSON ({allLines.length})</span>
            </button>

            <button
              type="button"
              onClick={onExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[var(--bg-elevated)] hover:bg-[var(--bg-card-hover)] text-[var(--text-main)] border border-[var(--border-subtle)] font-mono text-[11px] font-semibold cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV (;)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
