/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { usePlant } from '../../../context/PlantContext';
import {
  Power,
  Info,
  CheckCircle,
  X,
  Maximize2,
  Minimize2,
  Activity,
} from 'lucide-react';

interface EquipMeta {
  tag: string;
  name: string;
  cardSide: 'left' | 'right';
  purpose: string;
  designSpec: string;
}

const EQUIPMENT_CATALOG: Record<string, EquipMeta> = {
  'XV-101': {
    tag: 'XV-101',
    name: 'Raw Intake Control Valve',
    cardSide: 'right',
    purpose: 'Automated electro-pneumatic intake valve regulating raw water supply into TK-101.',
    designSpec: 'DN65 Flanged Cast Iron Body, 16 bar rating, 4-20mA smart positioner',
  },
  'TK-101': {
    tag: 'TK-101',
    name: 'Raw Equalization Tank',
    cardSide: 'right',
    purpose: '50 m³ buffer vessel dampening hydraulic shocks and balancing feed water quality.',
    designSpec: 'SS316L Cylindrical Vessel with dual dish heads & LT-101 transmitter',
  },
  'STR-101': {
    tag: 'STR-101',
    name: 'Suction Y-Strainer',
    cardSide: 'right',
    purpose: 'Coarse solids filtration protecting feed pump impellers from large debris.',
    designSpec: 'DN80 Flanged Stainless Steel Y-Pattern with 500µm screen & blowdown valve',
  },
  'P-101': {
    tag: 'P-101',
    name: 'Raw Water Feed Pump',
    cardSide: 'right',
    purpose: 'End-suction centrifugal pump drawing from raw equalization buffer tank.',
    designSpec: 'Grundfos NB 50-200/210, 5.5 kW IE3 Motor, 25 m³/h @ 3.2 bar',
  },
  'P-201': {
    tag: 'P-201',
    name: 'Pre-Treatment Booster Pump',
    cardSide: 'right',
    purpose: 'Inline booster pump elevating hydraulic head through media & cartridge filters.',
    designSpec: 'Grundfos CR 20-3 Vertical In-line Centrifugal, 4.0 kW, 7.0 bar head',
  },
  'F-201': {
    tag: 'F-201',
    name: 'Multi-Media Filter',
    cardSide: 'right',
    purpose: 'Graded sand/anthracite bed removing suspended solids down to 5 microns.',
    designSpec: 'FRP Composite Deep-Bed Pressure Vessel, 5µm rating, automatic backwash',
  },
  'F-202': {
    tag: 'F-202',
    name: 'Activated Carbon Filter',
    cardSide: 'right',
    purpose: 'Adsorbs free residual chlorine and organics, preventing membrane oxidation.',
    designSpec: 'Granular Activated Carbon (GAC) column, 1µm polishing, 1000 IV carbon',
  },
  'CD-201': {
    tag: 'CD-201',
    name: 'Chemical Dosing Unit',
    cardSide: 'left',
    purpose: 'Continuous antiscalant dosing inhibiting mineral precipitation on RO membranes.',
    designSpec: 'Prominent Solenoid Diaphragm Metering Pump, 0-10 L/h, PVDF dosing head',
  },
  'CP-101': {
    tag: 'CP-101',
    name: 'Local Automation Panel',
    cardSide: 'left',
    purpose: 'Supervisory PLC & HMI field enclosure executing PID level control & interlocks.',
    designSpec: 'IP65 Powder-Coated Steel Enclosure, Siemens S7-1500 PLC, 24VDC redundant PSU',
  },
  'P-202': {
    tag: 'P-202',
    name: 'High-Pressure RO Pump',
    cardSide: 'left',
    purpose: 'Multi-stage vertical pump overcoming natural osmotic pressure (~15 bar boost).',
    designSpec: 'Grundfos CRN 15-14 High-Pressure Multi-Stage, 15.0 kW IE4 VFD, 16.5 bar head',
  },
  'RO-201': {
    tag: 'RO-201',
    name: 'RO Membrane Train',
    cardSide: 'left',
    purpose: 'Two-stage 4-vessel reverse osmosis skid separating pure permeate from mineral concentrate.',
    designSpec: '4x CodeLine 80S300 FRP Housings, Dow FILMTEC BW30-400 Elements, 75% Recovery',
  },
  'V-201': {
    tag: 'V-201',
    name: 'Reject Throttle Valve',
    cardSide: 'left',
    purpose: 'Modulating backpressure valve balancing crossflow velocity against system recovery.',
    designSpec: 'DN40 Stainless Needle Globe Valve, Micrometer positioner, 25 bar rating',
  },
  'TK-201': {
    tag: 'TK-201',
    name: 'Permeate Storage Tank',
    cardSide: 'left',
    purpose: '35 m³ finished permeate buffer supplying distribution network and CIP loop.',
    designSpec: 'Food-grade SS316L Tank with hydrophobic sterile air vent & LT-201 transmitter',
  },
};

export const PidDiagram: React.FC = () => {
  const {
    telemetry,
    togglePump,
    setPumpSpeed,
    setXv101Opening,
    setXv101Auto,
    setRejectValve,
    theme,
  } = usePlant();

  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const selectedEquip = selectedTag ? EQUIPMENT_CATALOG[selectedTag] : null;

  // ---- Correct telemetry field references ----
  const tk101Level = telemetry.tk101.currentLevelPercent;
  const tk101Sp    = telemetry.tk101.pidSetpointPercent;
  const tk101Auto  = telemetry.tk101.pidControlEnabled;
  const tk101M3    = telemetry.tk101.currentLevelM3;
  const tk201Level = telemetry.tk201.currentLevelPercent;
  const tk201M3    = telemetry.tk201.currentLevelM3;
  const permTds    = telemetry.permeateQuality.tdsMgL;

  // Flow conditions
  const hasIntakeFlow  = telemetry.xv101_openingPercent > 5;
  const hasFeedFlow    = telemetry.p101_running && telemetry.p101_flowM3h > 1;
  const hasBoostFlow   = telemetry.p201_running && telemetry.p201_flowM3h > 1;
  const hasHpFlow      = telemetry.p202_running && telemetry.ro_feedFlowM3h > 1;
  const hasPermeate    = hasHpFlow && telemetry.ro_permeateFlowM3h > 0.5;
  const hasReject      = hasHpFlow && telemetry.ro_rejectFlowM3h > 0.5;

  // SVG water level calculations (tank body: y=175 to y=405, height=230)
  const TK_TOP = 175; const TK_BOT = 405; const TK_H = TK_BOT - TK_TOP;
  const tk101WaterY  = TK_BOT - (tk101Level / 100) * TK_H;
  const tk101WaterH  = (tk101Level / 100) * TK_H;
  const tk101SpY     = TK_BOT - (tk101Sp   / 100) * TK_H;
  const tk201WaterY  = TK_BOT - (tk201Level / 100) * TK_H;
  const tk201WaterH  = (tk201Level / 100) * TK_H;

  const isDark = theme === 'dark';

  return (
    <div
      ref={containerRef}
      className={`relative w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : ''
      }`}
    >
      {/* ── SCADA Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs shrink-0 select-none">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="font-bold text-slate-900 dark:text-slate-100 text-sm tracking-tight">
            AquaTwin Skid 01
          </span>
          <span className="px-2 py-0.5 text-[10px] font-bold font-mono tracking-wider bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800 rounded">
            FRONT ELEVATION DIGITAL TWIN
          </span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            Direct Equipment Actuation &amp; PID Level Loop
          </span>
        </div>

        <div className="flex items-center gap-4 flex-wrap text-xs text-slate-600 dark:text-slate-300 font-medium">
          {[
            { color: '#0284c7', label: 'Feed Line' },
            { color: '#6366f1', label: 'HP RO Feed (15bar)' },
            { color: '#10b981', label: 'Permeate Line' },
            { color: '#f59e0b', label: 'Reject / Brine' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: color }} />
              <span>{label}</span>
            </div>
          ))}

          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isFullscreen ? 'Exit Full Screen' : 'Full Screen'}</span>
          </button>
        </div>
      </div>

      {/* ── SVG Viewport ── */}
      <div className={`relative flex-1 min-h-[500px] w-full flex items-center justify-center p-2 overflow-x-auto overflow-y-hidden ${isDark ? 'bg-[#070b14]' : 'bg-slate-50'}`}>
        <svg
          viewBox="0 0 1140 480"
          className="w-full h-full max-h-[560px] select-none"
          style={{ minWidth: '1000px', fontFamily: 'system-ui, sans-serif' }}
        >
          <defs>
            <pattern id="hazard" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
              <rect width="8" height="16" fill="#eab308" />
              <rect x="8" width="8" height="16" fill="#1e293b" />
            </pattern>

            <linearGradient id="tankGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f1f5f9" />
              <stop offset="30%" stopColor="#ffffff" />
              <stop offset="70%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
            <linearGradient id="tk101water" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="tk201water" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="filterGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="40%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
            <linearGradient id="roGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>
            <clipPath id="tk101clip">
              <path d="M152,175 C152,148 258,148 258,175 L258,385 C258,412 152,412 152,385 Z" />
            </clipPath>
            <clipPath id="tk201clip">
              <path d="M907,175 C907,148 1013,148 1013,175 L1013,385 C1013,412 907,412 907,385 Z" />
            </clipPath>
          </defs>

          {/* ── Floor & Skid Base ── */}
          <rect x="0" y="445" width="1140" height="35" fill={isDark ? '#0f172a' : '#e2e8f0'} />
          <rect x="40" y="430" width="1060" height="15" rx="1.5" fill="#1e293b" />
          <rect x="40" y="440" width="1060" height="6" fill="url(#hazard)" />
          {[65,210,355,490,595,710,830,960,1075].map(x => (
            <rect key={x} x={x} y="446" width="22" height="5" fill="#0f172a" rx="1" />
          ))}

          {/* ── PIPING ── */}

          {/* Feed: Inlet → XV-101 → TK-101 top */}
          <path d="M100,210 L138,210 M148,210 L148,142 L185,142 L185,158"
            fill="none" stroke="#0284c7" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          {hasIntakeFlow && (
            <path d="M100,210 L148,210 L148,142 L185,142 L185,158"
              fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round"
              strokeLinejoin="round" className="animate-pipe-flow" strokeOpacity="0.7" />
          )}

          {/* Feed: TK-101 bottom → STR-101 → P-101 */}
          <path d="M205,408 L205,423 L340,423"
            fill="none" stroke="#0284c7" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          {hasFeedFlow && (
            <path d="M205,408 L205,423 L340,423"
              fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round"
              className="animate-pipe-flow" strokeOpacity="0.7" />
          )}

          {/* Feed: P-101 → P-201 */}
          <path d="M368,423 L420,423"
            fill="none" stroke="#0284c7" strokeWidth="7" strokeLinecap="round" />
          {hasFeedFlow && (
            <path d="M368,423 L420,423"
              fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round"
              className="animate-pipe-flow" strokeOpacity="0.7" />
          )}

          {/* Feed: P-201 → up to F-201 → F-202 → down → header */}
          <path d="M448,423 L468,423 L468,255 L485,255 M505,405 L505,255 L535,255 M555,405 L555,423 L642,423"
            fill="none" stroke="#0284c7" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          {hasBoostFlow && (
            <path d="M448,423 L468,423 L468,255 L485,255 M505,405 L505,255 L535,255 M555,405 L555,423 L642,423"
              fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round"
              strokeLinejoin="round" className="animate-pipe-flow" strokeOpacity="0.7" />
          )}

          {/* Chemical dosing injection */}
          <path d="M618,360 L618,423" fill="none" stroke="#a855f7" strokeWidth="3.5" strokeLinecap="round" />
          <polygon points="614,418 622,418 618,423" fill="#a855f7" />

          {/* HP: P-202 outlet → RO feed manifold (left side) */}
          <path d="M656,340 L688,340 L688,225 L702,225 M688,340 L688,268 L702,268 M688,268 L688,312 L702,312 M688,312 L688,355 L702,355"
            fill="none" stroke="#6366f1" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          {hasHpFlow && (
            <path d="M656,340 L688,340 L688,225 L702,225 M688,268 L702,268 M688,312 L702,312 M688,355 L702,355"
              fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round"
              strokeLinejoin="round" className="animate-pipe-flow-fast" strokeOpacity="0.7" />
          )}

          {/* Permeate: RO right → header → TK-201 top */}
          <path d="M830,225 L845,225 L845,158 L940,158 L940,172 M830,268 L845,268 M830,312 L845,312 M830,355 L845,355"
            fill="none" stroke="#10b981" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          {hasPermeate && (
            <path d="M830,225 L845,225 L845,158 L940,158 L940,172 M830,268 L845,268 M830,312 L845,312 M830,355 L845,355"
              fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round"
              strokeLinejoin="round" className="animate-pipe-flow" strokeOpacity="0.7" />
          )}

          {/* Reject: RO right manifold → V-201 → drain */}
          <path d="M830,235 L860,235 L860,380 L878,380 M892,380 L905,380 L905,430"
            fill="none" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          {hasReject && (
            <path d="M830,235 L860,235 L860,380 L878,380 M892,380 L905,380 L905,430"
              fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"
              strokeLinejoin="round" className="animate-pipe-flow-reject" strokeOpacity="0.7" />
          )}

          {/* Permeate tank outlet */}
          <path d="M960,408 L960,423 L1055,423"
            fill="none" stroke="#10b981" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          {tk201Level > 5 && (
            <path d="M960,408 L960,423 L1055,423"
              fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round"
              className="animate-pipe-flow" strokeOpacity="0.7" />
          )}

          {/* ── XV-101 INTAKE VALVE ── */}
          <g className="cursor-pointer" onClick={() => setSelectedTag('XV-101')}>
            <rect x="25" y="195" width="80" height="30" rx="6"
              fill={isDark ? '#1e293b' : '#fff'} stroke="#0284c7" strokeWidth="2" />
            <text x="65" y="214" textAnchor="middle" fill="#0284c7" fontSize="8.5" fontWeight="bold">RAW WATER INLET</text>

            {/* Valve triangles */}
            <line x1="117" y1="203" x2="117" y2="217" stroke="#0f172a" strokeWidth="2.5" />
            <line x1="133" y1="203" x2="133" y2="217" stroke="#0f172a" strokeWidth="2.5" />
            <polygon points="117,203 125,210 117,217"
              fill={telemetry.xv101_openingPercent > 0 ? '#0284c7' : '#94a3b8'}
              stroke="#0f172a" strokeWidth="1.2" />
            <polygon points="133,203 125,210 133,217"
              fill={telemetry.xv101_openingPercent > 0 ? '#0284c7' : '#94a3b8'}
              stroke="#0f172a" strokeWidth="1.2" />
            <line x1="125" y1="210" x2="125" y2="197" stroke="#0f172a" strokeWidth="2" />
            <circle cx="125" cy="193" r="7"
              fill={tk101Auto ? '#0284c7' : '#38bdf8'} stroke="#0f172a" strokeWidth="1.5" />
            <circle cx="125" cy="193" r="2.5" fill="#fff" />

            <text x="125" y="230" textAnchor="middle" fill={isDark ? '#94a3b8' : '#334155'} fontSize="9" fontWeight="bold">XV-101</text>
            <text x="125" y="241" textAnchor="middle" fill="#0284c7" fontSize="8.5" fontWeight="bold" fontFamily="monospace">
              {telemetry.xv101_openingPercent.toFixed(0)}%
            </text>
          </g>

          {/* ── TK-101 RAW TANK ── */}
          <g className="cursor-pointer" onClick={() => setSelectedTag('TK-101')}>
            {/* Legs */}
            <rect x="165" y="395" width="8" height="35" fill="#475569" rx="1" />
            <rect x="237" y="395" width="8" height="35" fill="#475569" rx="1" />
            <rect x="160" y="427" width="18" height="4" fill="#1e293b" rx="1" />
            <rect x="232" y="427" width="18" height="4" fill="#1e293b" rx="1" />
            {/* Shell */}
            <path d="M152,175 C152,148 258,148 258,175 L258,385 C258,412 152,412 152,385 Z"
              fill="url(#tankGrad)" stroke="#94a3b8" strokeWidth="2.5" />
            {/* Water fill */}
            <g clipPath="url(#tk101clip)">
              <rect x="152" y={tk101WaterY} width="106" height={tk101WaterH} fill="url(#tk101water)" />
              <line x1="152" y1={tk101WaterY} x2="258" y2={tk101WaterY} stroke="#38bdf8" strokeWidth="2.5" />
              {/* Setpoint line */}
              <line x1="152" y1={tk101SpY} x2="258" y2={tk101SpY}
                stroke="#eab308" strokeWidth="2" strokeDasharray="5 3" />
            </g>
            {/* LT-101 badge */}
            <rect x="190" y="132" width="30" height="14" rx="4" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.2" />
            <text x="205" y="142" textAnchor="middle" fill="#0284c7" fontSize="8" fontWeight="bold">LT-101</text>
            <line x1="205" y1="146" x2="205" y2="152" stroke="#0284c7" strokeWidth="2" />
            {/* Overlay card */}
            <rect x="163" y="215" width="84" height="78" rx="6"
              fill={isDark ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.92)'}
              stroke={isDark ? '#334155' : '#cbd5e1'} strokeWidth="1" />
            <text x="205" y="231" textAnchor="middle" fill={isDark ? '#94a3b8' : '#334155'} fontSize="8.5" fontWeight="bold">TK-101 RAW TANK</text>
            <text x="205" y="255" textAnchor="middle" fill="#0284c7" fontSize="21" fontWeight="bold" fontFamily="monospace">
              {tk101Level.toFixed(1)}%
            </text>
            <text x="205" y="269" textAnchor="middle" fill={isDark ? '#64748b' : '#475569'} fontSize="8">
              {tk101M3.toFixed(1)} m³ / 50 m³
            </text>
            <rect x="170" y="275" width="70" height="12" rx="3" fill={isDark ? '#042f2e' : '#dcfce7'} stroke={isDark ? '#065f46' : '#86efac'} strokeWidth="1" />
            <text x="205" y="284" textAnchor="middle" fill={isDark ? '#34d399' : '#15803d'} fontSize="7" fontWeight="bold">
              PID SP: {tk101Sp.toFixed(0)}% • {tk101Auto ? 'AUTO' : 'MANUAL'}
            </text>
            {/* Sight glass */}
            <rect x="260" y="190" width="5" height="190" rx="2" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
            <rect x="261" y={Math.max(190, tk101WaterY)} width="3"
              height={Math.max(0, 380 - Math.max(190, tk101WaterY))} fill="#0284c7" />
          </g>

          {/* ── STR-101 Y-STRAINER ── */}
          <g className="cursor-pointer" onClick={() => setSelectedTag('STR-101')}>
            <rect x="280" y="415" width="20" height="16" fill="#64748b" rx="2" />
            <polygon points="290,423 302,434 296,438 285,426" fill="#475569" stroke="#334155" strokeWidth="1" />
            <circle cx="299" cy="436" r="3" fill="#cbd5e1" stroke="#334155" strokeWidth="1" />
            <text x="290" y="408" textAnchor="middle" fill={isDark ? '#94a3b8' : '#334155'} fontSize="8" fontWeight="bold">STR-101</text>
            <text x="290" y="444" textAnchor="middle" fill="#64748b" fontSize="7" fontFamily="monospace">
              ΔP {telemetry.str101_dpBar.toFixed(2)} bar
            </text>
          </g>

          {/* ── P-101 FEED PUMP ── */}
          <g className="cursor-pointer" onClick={() => setSelectedTag('P-101')}>
            {/* Gauge */}
            <line x1="355" y1="416" x2="355" y2="393" stroke="#64748b" strokeWidth="2" />
            <circle cx="355" cy="383" r="11" fill={isDark ? '#1e293b' : '#fff'} stroke="#475569" strokeWidth="1.5" />
            <line x1="355" y1="383" x2="361" y2="378" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="355" cy="383" r="1.5" fill="#0f172a" />
            <text x="355" y="368" textAnchor="middle" fill="#0284c7" fontSize="8" fontWeight="bold" fontFamily="monospace">
              {telemetry.p101_pressureBar.toFixed(1)} bar
            </text>
            {/* Body */}
            <circle cx="355" cy="423" r="11" fill={telemetry.p101_running ? '#0284c7' : '#94a3b8'} stroke="#0f172a" strokeWidth="2" />
            <rect x="332" y="416" width="15" height="14" rx="2" fill={telemetry.p101_running ? '#38bdf8' : '#cbd5e1'} stroke="#0f172a" strokeWidth="1.5" />
            <line x1="335" y1="416" x2="335" y2="430" stroke="#0f172a" strokeWidth="1" />
            <line x1="339" y1="416" x2="339" y2="430" stroke="#0f172a" strokeWidth="1" />
            <line x1="343" y1="416" x2="343" y2="430" stroke="#0f172a" strokeWidth="1" />
            <text x="355" y="443" textAnchor="middle" fill={isDark ? '#94a3b8' : '#334155'} fontSize="8.5" fontWeight="bold">P-101</text>
          </g>

          {/* ── P-201 BOOSTER PUMP ── */}
          <g className="cursor-pointer" onClick={() => setSelectedTag('P-201')}>
            {/* Gauge */}
            <line x1="435" y1="416" x2="435" y2="393" stroke="#64748b" strokeWidth="2" />
            <circle cx="435" cy="383" r="11" fill={isDark ? '#1e293b' : '#fff'} stroke="#475569" strokeWidth="1.5" />
            <line x1="435" y1="383" x2="442" y2="379" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="435" cy="383" r="1.5" fill="#0f172a" />
            <text x="435" y="368" textAnchor="middle" fill="#0284c7" fontSize="8" fontWeight="bold" fontFamily="monospace">
              {telemetry.p201_pressureBar.toFixed(1)} bar
            </text>
            {/* Body */}
            <circle cx="435" cy="423" r="11" fill={telemetry.p201_running ? '#0284c7' : '#94a3b8'} stroke="#0f172a" strokeWidth="2" />
            <rect x="412" y="416" width="15" height="14" rx="2" fill={telemetry.p201_running ? '#38bdf8' : '#cbd5e1'} stroke="#0f172a" strokeWidth="1.5" />
            <line x1="415" y1="416" x2="415" y2="430" stroke="#0f172a" strokeWidth="1" />
            <line x1="419" y1="416" x2="419" y2="430" stroke="#0f172a" strokeWidth="1" />
            <line x1="423" y1="416" x2="423" y2="430" stroke="#0f172a" strokeWidth="1" />
            <text x="435" y="443" textAnchor="middle" fill={isDark ? '#94a3b8' : '#334155'} fontSize="8.5" fontWeight="bold">P-201</text>
          </g>

          {/* ── F-201 MEDIA FILTER ── */}
          <g className="cursor-pointer" onClick={() => setSelectedTag('F-201')}>
            <path d="M485,268 C485,250 520,250 520,268 L520,405 C520,415 485,415 485,405 Z"
              fill="url(#filterGrad)" stroke="#94a3b8" strokeWidth="2" />
            <line x1="492" y1="270" x2="492" y2="405" stroke="#cbd5e1" strokeWidth="1.5" />
            <line x1="499" y1="270" x2="499" y2="405" stroke="#e2e8f0" strokeWidth="1.5" />
            <line x1="506" y1="270" x2="506" y2="405" stroke="#cbd5e1" strokeWidth="1.5" />
            <line x1="513" y1="270" x2="513" y2="405" stroke="#cbd5e1" strokeWidth="1.5" />
            <text x="502" y="246" textAnchor="middle" fill={isDark ? '#94a3b8' : '#334155'} fontSize="8.5" fontWeight="bold">F-201</text>
            <rect x="484" y="426" width="37" height="11" rx="2" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1" />
            <text x="502" y="434" textAnchor="middle" fill="#0284c7" fontSize="7" fontWeight="bold" fontFamily="monospace">
              ΔP {telemetry.f201_dpBar.toFixed(2)} bar
            </text>
            <text x="502" y="444" textAnchor="middle" fill="#64748b" fontSize="7">5µm Sand</text>
          </g>

          {/* ── F-202 CARBON FILTER ── */}
          <g className="cursor-pointer" onClick={() => setSelectedTag('F-202')}>
            <path d="M535,268 C535,250 570,250 570,268 L570,405 C570,415 535,415 535,405 Z"
              fill="url(#filterGrad)" stroke="#94a3b8" strokeWidth="2" />
            <line x1="542" y1="270" x2="542" y2="405" stroke="#cbd5e1" strokeWidth="1.5" />
            <line x1="549" y1="270" x2="549" y2="405" stroke="#e2e8f0" strokeWidth="1.5" />
            <line x1="556" y1="270" x2="556" y2="405" stroke="#cbd5e1" strokeWidth="1.5" />
            <line x1="563" y1="270" x2="563" y2="405" stroke="#cbd5e1" strokeWidth="1.5" />
            <text x="552" y="246" textAnchor="middle" fill={isDark ? '#94a3b8' : '#334155'} fontSize="8.5" fontWeight="bold">F-202</text>
            <rect x="534" y="426" width="37" height="11" rx="2" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1" />
            <text x="552" y="434" textAnchor="middle" fill="#0284c7" fontSize="7" fontWeight="bold" fontFamily="monospace">
              ΔP {telemetry.f202_dpBar.toFixed(2)} bar
            </text>
            <text x="552" y="444" textAnchor="middle" fill="#64748b" fontSize="7">1µm Carbon</text>
          </g>

          {/* ── CD-201 CHEMICAL DOSING ── */}
          <g className="cursor-pointer" onClick={() => setSelectedTag('CD-201')}>
            <rect x="589" y="278" width="32" height="12" rx="3" fill="#f3e8ff" stroke="#a855f7" strokeWidth="1" />
            <text x="605" y="287" textAnchor="middle" fill="#7e22ce" fontSize="7.5" fontWeight="bold">CD-201</text>
            <rect x="593" y="294" width="24" height="65" rx="3" fill={isDark ? '#1e1033' : '#faf5ff'} stroke="#c084fc" strokeWidth="1.5" />
            <rect x="595" y="312" width="20" height="45" rx="2" fill="#c084fc" fillOpacity="0.45" />
            <line x1="595" y1="312" x2="615" y2="312" stroke="#a855f7" strokeWidth="1.5" />
            <text x="605" y="372" textAnchor="middle" fill="#7e22ce" fontSize="7" fontWeight="bold">
              {telemetry.cd201_dosingPpm.toFixed(1)} ppm
            </text>
            <text x="605" y="380" textAnchor="middle" fill="#6b21a8" fontSize="6.5">Antiscalant</text>
          </g>

          {/* ── CP-101 AUTOMATION PANEL ── */}
          <g className="cursor-pointer" onClick={() => setSelectedTag('CP-101')}>
            <line x1="605" y1="240" x2="605" y2="258" stroke="#64748b" strokeWidth="2.5" />
            <rect x="585" y="180" width="40" height="58" rx="4"
              fill={isDark ? '#1e293b' : '#f1f5f9'} stroke="#94a3b8" strokeWidth="2" />
            <rect x="590" y="186" width="30" height="22" rx="2" fill="#0f172a" />
            <text x="605" y="196" textAnchor="middle" fill="#fff" fontSize="6" fontWeight="bold">AquaTwin</text>
            <text x="605" y="204" textAnchor="middle" fill="#38bdf8" fontSize="5.5" fontWeight="bold" letterSpacing="0.5">ONLINE</text>
            <circle cx="594" cy="216" r="2.5" fill="#22c55e" />
            <circle cx="605" cy="216" r="2.5" fill="#eab308" />
            <circle cx="616" cy="216" r="2.5" fill="#ef4444" />
            <text x="605" y="228" textAnchor="middle" fill={isDark ? '#64748b' : '#475569'} fontSize="6" fontWeight="bold">CP-101</text>
            <text x="605" y="234" textAnchor="middle" fill="#64748b" fontSize="5">PLC 24VDC</text>
          </g>

          {/* ── P-202 HIGH-PRESSURE PUMP ── */}
          <g className="cursor-pointer" onClick={() => setSelectedTag('P-202')}>
            {/* Gauge above */}
            <line x1="655" y1="232" x2="655" y2="210" stroke="#475569" strokeWidth="2" />
            <circle cx="655" cy="200" r="11" fill={isDark ? '#1e293b' : '#fff'} stroke="#475569" strokeWidth="1.5" />
            <line x1="655" y1="200" x2="662" y2="196" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="655" cy="200" r="1.5" fill="#0f172a" />
            <text x="655" y="185" textAnchor="middle" fill="#6366f1" fontSize="8" fontWeight="bold" fontFamily="monospace">
              {telemetry.p202_pressureBar.toFixed(1)} bar
            </text>
            {/* Motor */}
            <rect x="644" y="237" width="24" height="38" rx="3" fill="#312e81" stroke="#1e1b4b" strokeWidth="2" />
            {[244,250,256,262,268].map(y => (
              <line key={y} x1="644" y1={y} x2="668" y2={y} stroke="#4338ca" strokeWidth="1" />
            ))}
            <text x="656" y="232" textAnchor="middle" fill="#fff" fontSize="7.5" fontWeight="bold">P-202</text>
            {/* Coupling */}
            <rect x="650" y="275" width="12" height="8" fill="#64748b" stroke="#334155" strokeWidth="1" />
            {/* Multi-stage column */}
            <rect x="647" y="283" width="18" height="140" fill="#e2e8f0" stroke="#475569" strokeWidth="2" />
            {[295,310,325,340,355,370,385,400,415].map(y => (
              <line key={y} x1="647" y1={y} x2="665" y2={y} stroke="#94a3b8" strokeWidth="1.5" />
            ))}
            <rect x="642" y="423" width="28" height="6" fill="#1e293b" rx="1" />
            <text x="656" y="440" textAnchor="middle" fill="#6366f1" fontSize="6.5" fontFamily="monospace">
              {telemetry.p202_powerKw.toFixed(1)} kW
            </text>
          </g>

          {/* ── RO-201 MEMBRANE TRAIN ── */}
          <g className="cursor-pointer" onClick={() => setSelectedTag('RO-201')}>
            {/* Structural frame */}
            <rect x="696" y="170" width="8" height="260" fill="#1e293b" />
            <rect x="836" y="170" width="8" height="260" fill="#1e293b" />
            <rect x="696" y="170" width="148" height="12" fill="#1e293b" />
            <rect x="704" y="172" width="132" height="10" fill="#0f172a" rx="1" />
            <text x="770" y="180" textAnchor="middle" fill="#fff" fontSize="6.5" fontWeight="bold" letterSpacing="0.6">
              AQUATWIN OPERATIONS – RO SKID 01
            </text>
            {/* Cross bracing */}
            <line x1="704" y1="182" x2="836" y2="425" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="836" y1="182" x2="704" y2="425" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="770" cy="303" r="5" fill="#94a3b8" stroke="#475569" strokeWidth="1" />

            <text x="770" y="197" textAnchor="middle" fill={isDark ? '#94a3b8' : '#334155'} fontSize="8" fontWeight="bold">
              RO-201 MEMBRANE TRAIN
            </text>

            {/* 4 horizontal vessels */}
            {[
              { label: 'Stage 1 – Vessel A', y: 215 },
              { label: 'Stage 1 – Vessel B', y: 258 },
              { label: 'Stage 2 – Vessel C', y: 302 },
              { label: 'Stage 2 – Vessel D', y: 345 },
            ].map(v => (
              <g key={v.label}>
                <rect x="712" y={v.y} width="112" height="22" rx="4"
                  fill="url(#roGrad)" stroke="#94a3b8" strokeWidth="1.8" />
                <rect x="708" y={v.y - 1} width="5" height="24" rx="1.5" fill="#64748b" />
                <rect x="823" y={v.y - 1} width="5" height="24" rx="1.5" fill="#64748b" />
                <text x="768" y={v.y + 15} textAnchor="middle" fill="#334155" fontSize="7.5" fontWeight="600">{v.label}</text>
              </g>
            ))}

            {/* Recovery stats */}
            <text x="770" y="383" textAnchor="middle" fill="#0284c7" fontSize="8" fontWeight="bold">
              Recovery: {telemetry.ro_recoveryPercent.toFixed(1)}% • Rejection: {telemetry.ro_saltRejectionPercent.toFixed(1)}%
            </text>

            {/* V-201 Reject Valve */}
            <g className="cursor-pointer" onClick={e => { e.stopPropagation(); setSelectedTag('V-201'); }}>
              <polygon points="878,375 885,381 878,387" fill="#f59e0b" stroke="#0f172a" strokeWidth="1" />
              <polygon points="892,375 885,381 892,387" fill="#f59e0b" stroke="#0f172a" strokeWidth="1" />
              <line x1="885" y1="381" x2="885" y2="371" stroke="#0f172a" strokeWidth="1.5" />
              <circle cx="885" cy="368" r="4" fill="#f59e0b" stroke="#0f172a" strokeWidth="1" />
              <text x="885" y="398" textAnchor="middle" fill="#d97706" fontSize="7" fontWeight="bold">V-201</text>
              <text x="885" y="406" textAnchor="middle" fill="#d97706" fontSize="6.5" fontFamily="monospace">
                {telemetry.v201_rejectValvePercent.toFixed(0)}%
              </text>
            </g>
          </g>

          {/* ── TK-201 PERMEATE TANK ── */}
          <g className="cursor-pointer" onClick={() => setSelectedTag('TK-201')}>
            {/* Legs */}
            <rect x="920" y="395" width="8" height="35" fill="#475569" rx="1" />
            <rect x="992" y="395" width="8" height="35" fill="#475569" rx="1" />
            <rect x="915" y="427" width="18" height="4" fill="#1e293b" rx="1" />
            <rect x="987" y="427" width="18" height="4" fill="#1e293b" rx="1" />
            {/* Shell */}
            <path d="M907,175 C907,148 1013,148 1013,175 L1013,385 C1013,412 907,412 907,385 Z"
              fill="url(#tankGrad)" stroke="#94a3b8" strokeWidth="2.5" />
            {/* Water fill */}
            <g clipPath="url(#tk201clip)">
              <rect x="907" y={tk201WaterY} width="106" height={tk201WaterH} fill="url(#tk201water)" />
              <line x1="907" y1={tk201WaterY} x2="1013" y2={tk201WaterY} stroke="#34d399" strokeWidth="2.5" />
            </g>
            {/* LT-201 badge */}
            <rect x="945" y="132" width="30" height="14" rx="4" fill="#dcfce7" stroke="#10b981" strokeWidth="1.2" />
            <text x="960" y="142" textAnchor="middle" fill="#059669" fontSize="8" fontWeight="bold">LT-201</text>
            <line x1="960" y1="146" x2="960" y2="152" stroke="#10b981" strokeWidth="2" />
            {/* Overlay card */}
            <rect x="919" y="225" width="84" height="78" rx="6"
              fill={isDark ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.92)'}
              stroke={isDark ? '#334155' : '#cbd5e1'} strokeWidth="1" />
            <text x="961" y="241" textAnchor="middle" fill={isDark ? '#94a3b8' : '#334155'} fontSize="8.5" fontWeight="bold">TK-201 PERMEATE</text>
            <text x="961" y="264" textAnchor="middle" fill="#059669" fontSize="21" fontWeight="bold" fontFamily="monospace">
              {tk201Level.toFixed(1)}%
            </text>
            <text x="961" y="278" textAnchor="middle" fill={isDark ? '#64748b' : '#475569'} fontSize="8">
              {tk201M3.toFixed(1)} m³ / 35 m³
            </text>
            <text x="961" y="291" textAnchor="middle" fill="#047857" fontSize="7.5" fontWeight="bold">
              TDS: {permTds.toFixed(0)} mg/L
            </text>

            {/* Distribution box */}
            <rect x="1055" y="208" width="30" height="36" rx="4"
              fill={isDark ? '#042f2e' : '#dcfce7'} stroke="#10b981" strokeWidth="1.5" />
            <text x="1070" y="224" textAnchor="middle" fill="#059669" fontSize="6.5" fontWeight="bold">PLANT</text>
            <text x="1070" y="234" textAnchor="middle" fill="#059669" fontSize="6.5" fontWeight="bold">DISTRIB</text>
          </g>
        </svg>

        {/* ── EQUIPMENT FACEPLATE CARD ── */}
        {selectedEquip && (
          <div
            className={`absolute top-6 ${
              selectedEquip.cardSide === 'right' ? 'right-5' : 'left-5'
            } w-80 bg-white/96 dark:bg-slate-900/96 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-4 text-xs z-30`}
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{selectedEquip.name}</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {selectedEquip.tag}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">Digital Twin Live Actuator</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedTag(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Purpose & Spec */}
            <p className="text-[11px] text-slate-600 dark:text-slate-300 mb-2 leading-relaxed">{selectedEquip.purpose}</p>
            <div className="p-2 mb-3 bg-slate-50 dark:bg-slate-800/40 rounded border border-slate-200 dark:border-slate-700 text-[10px] text-slate-500 font-mono">
              {selectedEquip.designSpec}
            </div>

            {/* Live Telemetry Readings */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {selectedEquip.tag === 'TK-101' && (<>
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[10px] text-slate-400 block">Level</span>
                  <span className="font-bold font-mono text-cyan-600 text-sm">{tk101Level.toFixed(1)}%</span>
                </div>
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[10px] text-slate-400 block">Volume</span>
                  <span className="font-bold font-mono text-slate-700 dark:text-slate-200 text-sm">{tk101M3.toFixed(1)} m³</span>
                </div>
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[10px] text-slate-400 block">PID Setpoint</span>
                  <span className="font-bold font-mono text-amber-500 text-sm">{tk101Sp.toFixed(0)}%</span>
                </div>
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[10px] text-slate-400 block">Controller Out</span>
                  <span className="font-bold font-mono text-indigo-500 text-sm">{telemetry.tk101.pidOutput.toFixed(1)}%</span>
                </div>
              </>)}
              {selectedEquip.tag === 'TK-201' && (<>
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[10px] text-slate-400 block">Level</span>
                  <span className="font-bold font-mono text-emerald-600 text-sm">{tk201Level.toFixed(1)}%</span>
                </div>
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[10px] text-slate-400 block">Volume</span>
                  <span className="font-bold font-mono text-slate-700 dark:text-slate-200 text-sm">{tk201M3.toFixed(1)} m³</span>
                </div>
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[10px] text-slate-400 block">Permeate TDS</span>
                  <span className="font-bold font-mono text-emerald-600 text-sm">{permTds.toFixed(0)} mg/L</span>
                </div>
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[10px] text-slate-400 block">Inflow</span>
                  <span className="font-bold font-mono text-slate-700 dark:text-slate-200 text-sm">{telemetry.tk201.inflowM3h.toFixed(1)} m³/h</span>
                </div>
              </>)}
              {(selectedEquip.tag === 'P-101') && (<>
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[10px] text-slate-400 block">Flow</span>
                  <span className="font-bold font-mono text-cyan-600 text-sm">{telemetry.p101_flowM3h.toFixed(1)} m³/h</span>
                </div>
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[10px] text-slate-400 block">Discharge P</span>
                  <span className="font-bold font-mono text-slate-700 dark:text-slate-200 text-sm">{telemetry.p101_pressureBar.toFixed(1)} bar</span>
                </div>
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[10px] text-slate-400 block">Speed</span>
                  <span className="font-bold font-mono text-indigo-500 text-sm">{telemetry.p101_speedPercent.toFixed(0)}%</span>
                </div>
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[10px] text-slate-400 block">Power</span>
                  <span className="font-bold font-mono text-amber-500 text-sm">{telemetry.p101_powerKw.toFixed(1)} kW</span>
                </div>
              </>)}
              {(selectedEquip.tag === 'P-201') && (<>
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[10px] text-slate-400 block">Flow</span>
                  <span className="font-bold font-mono text-cyan-600 text-sm">{telemetry.p201_flowM3h.toFixed(1)} m³/h</span>
                </div>
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[10px] text-slate-400 block">Discharge P</span>
                  <span className="font-bold font-mono text-slate-700 dark:text-slate-200 text-sm">{telemetry.p201_pressureBar.toFixed(1)} bar</span>
                </div>
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[10px] text-slate-400 block">Speed</span>
                  <span className="font-bold font-mono text-indigo-500 text-sm">{telemetry.p201_speedPercent.toFixed(0)}%</span>
                </div>
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[10px] text-slate-400 block">Power</span>
                  <span className="font-bold font-mono text-amber-500 text-sm">{telemetry.p201_powerKw.toFixed(1)} kW</span>
                </div>
              </>)}
              {(selectedEquip.tag === 'P-202') && (<>
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[10px] text-slate-400 block">Feed Pressure</span>
                  <span className="font-bold font-mono text-indigo-600 text-sm">{telemetry.p202_pressureBar.toFixed(1)} bar</span>
                </div>
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[10px] text-slate-400 block">Power Draw</span>
                  <span className="font-bold font-mono text-amber-500 text-sm">{telemetry.p202_powerKw.toFixed(1)} kW</span>
                </div>
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[10px] text-slate-400 block">Flow</span>
                  <span className="font-bold font-mono text-cyan-600 text-sm">{telemetry.p202_flowM3h.toFixed(1)} m³/h</span>
                </div>
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[10px] text-slate-400 block">Speed</span>
                  <span className="font-bold font-mono text-indigo-500 text-sm">{telemetry.p202_speedPercent.toFixed(0)}%</span>
                </div>
              </>)}
              {selectedEquip.tag === 'RO-201' && (<>
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[10px] text-slate-400 block">Permeate Flow</span>
                  <span className="font-bold font-mono text-emerald-600 text-sm">{telemetry.ro_permeateFlowM3h.toFixed(1)} m³/h</span>
                </div>
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[10px] text-slate-400 block">Recovery</span>
                  <span className="font-bold font-mono text-cyan-600 text-sm">{telemetry.ro_recoveryPercent.toFixed(1)}%</span>
                </div>
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[10px] text-slate-400 block">Feed Pressure</span>
                  <span className="font-bold font-mono text-indigo-600 text-sm">{telemetry.ro_feedPressureBar.toFixed(1)} bar</span>
                </div>
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[10px] text-slate-400 block">Rejection</span>
                  <span className="font-bold font-mono text-emerald-600 text-sm">{telemetry.ro_saltRejectionPercent.toFixed(1)}%</span>
                </div>
              </>)}
              {!['TK-101','TK-201','P-101','P-201','P-202','RO-201'].includes(selectedEquip.tag) && (<>
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[10px] text-slate-400 block">Status</span>
                  <span className="font-bold text-emerald-600 text-xs flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Nominal</span>
                </div>
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[10px] text-slate-400 block">Bus</span>
                  <span className="font-bold font-mono text-slate-700 dark:text-slate-200 text-xs">PROFINET OK</span>
                </div>
              </>)}
            </div>

            {/* Controls */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2.5">
              <span className="font-semibold text-slate-700 dark:text-slate-200 block text-[11px]">Actuator Controls</span>

              {['P-101','P-201','P-202'].includes(selectedEquip.tag) && (<>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Motor Power:</span>
                  <button
                    onClick={() => togglePump(selectedEquip.tag as 'P-101' | 'P-201' | 'P-202')}
                    className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition ${
                      (selectedEquip.tag === 'P-101' && telemetry.p101_running) ||
                      (selectedEquip.tag === 'P-201' && telemetry.p201_running) ||
                      (selectedEquip.tag === 'P-202' && telemetry.p202_running)
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    <Power className="w-3 h-3" />
                    {(selectedEquip.tag === 'P-101' && telemetry.p101_running) ||
                     (selectedEquip.tag === 'P-201' && telemetry.p201_running) ||
                     (selectedEquip.tag === 'P-202' && telemetry.p202_running)
                      ? 'Stop Pump' : 'Start Pump'}
                  </button>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-500">VFD Speed:</span>
                    <span className="font-mono font-semibold text-cyan-600">
                      {selectedEquip.tag === 'P-101' ? telemetry.p101_speedPercent
                        : selectedEquip.tag === 'P-201' ? telemetry.p201_speedPercent
                        : telemetry.p202_speedPercent}%
                    </span>
                  </div>
                  <input type="range" min="30" max="100"
                    value={selectedEquip.tag === 'P-101' ? telemetry.p101_speedPercent
                      : selectedEquip.tag === 'P-201' ? telemetry.p201_speedPercent
                      : telemetry.p202_speedPercent}
                    onChange={e => setPumpSpeed(selectedEquip.tag as 'P-101' | 'P-201' | 'P-202', Number(e.target.value))}
                    className="w-full accent-cyan-600 cursor-pointer" />
                </div>
              </>)}

              {['XV-101','TK-101'].includes(selectedEquip.tag) && (<>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Level Mode:</span>
                  <button
                    onClick={() => setXv101Auto(!telemetry.tk101.pidControlEnabled)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold ${
                      tk101Auto ? 'bg-cyan-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {tk101Auto ? 'AUTO (PID Active)' : 'MANUAL'}
                  </button>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-500">Intake Stroke:</span>
                    <span className="font-mono font-semibold text-cyan-600">{telemetry.xv101_openingPercent.toFixed(1)}%</span>
                  </div>
                  <input type="range" min="0" max="100"
                    value={telemetry.xv101_openingPercent}
                    disabled={tk101Auto}
                    onChange={e => setXv101Opening(Number(e.target.value))}
                    className="w-full accent-cyan-600 cursor-pointer disabled:opacity-40" />
                </div>
              </>)}

              {selectedEquip.tag === 'V-201' && (
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-500">Reject Throttle:</span>
                    <span className="font-mono font-semibold text-amber-600">{telemetry.v201_rejectValvePercent.toFixed(0)}%</span>
                  </div>
                  <input type="range" min="15" max="80"
                    value={telemetry.v201_rejectValvePercent}
                    onChange={e => setRejectValve(Number(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer" />
                  <p className="text-[10px] text-slate-400 mt-1">Throttling increases backpressure &amp; RO recovery.</p>
                </div>
              )}

              {!['P-101','P-201','P-202','XV-101','TK-101','V-201'].includes(selectedEquip.tag) && (
                <p className="text-slate-400 text-center py-1 text-[11px]">
                  <Info className="w-3.5 h-3.5 inline mr-1" />
                  Operating under automated supervisory PLC loop.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
