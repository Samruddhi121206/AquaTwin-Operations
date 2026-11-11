/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePlant } from '../../../context/PlantContext';
import {
  Gauge,
  Sliders,
  Power,
  Info,
  CheckCircle,
  AlertTriangle,
  X,
  Zap,
} from 'lucide-react';

export const PidDiagram: React.FC = () => {
  const {
    telemetry,
    togglePump,
    setPumpSpeed,
    setXv101Opening,
    setXv101Auto,
    setRejectValve,
    equipmentList,
    theme,
  } = usePlant();

  const [selectedTag, setSelectedTag] = useState<string | null>('RO-201');
  const [showControlModal, setShowControlModal] = useState<boolean>(false);

  // Selected equipment data
  const selectedEquip = equipmentList.find((e) => e.tag === selectedTag);

  // Flow conditions
  const hasIntakeFlow = telemetry.xv101_openingPercent > 5;
  const hasRawPumpFlow = telemetry.p101_running && telemetry.p101_flowM3h > 1.0;
  const hasBoosterFlow = telemetry.p201_running && telemetry.p201_flowM3h > 1.0;
  const hasHpFlow = telemetry.p202_running && telemetry.ro_feedFlowM3h > 1.0;
  const hasPermeateFlow = telemetry.ro_permeateFlowM3h > 0.5;
  const hasRejectFlow = telemetry.ro_rejectFlowM3h > 0.5;

  const isDark = theme === 'dark';
  const cTextPrimary = isDark ? '#f8fafc' : '#0f172a';
  const cTextMuted = isDark ? '#94a3b8' : '#475569';
  const cTankFill = isDark ? '#090d16' : '#ffffff';
  const cTankStroke = isDark ? '#334155' : '#cbd5e1';
  const cVesselFill = isDark ? '#0f172a' : '#ffffff';
  const cVesselStroke = isDark ? '#818cf8' : '#4f46e5';
  const cPipeFeed = isDark ? '#38bdf8' : '#0284c7';
  const cPipeHp = isDark ? '#818cf8' : '#4f46e5';
  const cPipePermeate = isDark ? '#34d399' : '#059669';
  const cPipeReject = isDark ? '#fbbf24' : '#d97706';

  return (
    <div className="flex flex-col xl:flex-row gap-4 h-full">
      {/* Main Interactive Diagram Canvas */}
      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col relative overflow-hidden shadow-sm transition-colors">
        {/* Canvas Toolbar & Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 dark:text-slate-200">Process Sequence:</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              Raw Source → XV-101 → TK-101 → STR-101 → P-101 → P-201 → F-201 → F-202 → CD-201 → P-202 → RO-201 → TK-201
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-cyan-500 rounded-full" />
              <span>Feed / Permeate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-amber-500 rounded-full" />
              <span>Reject / Brine</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Running</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
              <span>Standby</span>
            </div>
          </div>
        </div>

        {/* P&ID SVG Viewport */}
        <div className="flex-1 relative min-h-[460px] flex items-center justify-center overflow-x-auto py-2 bg-slate-50/70 dark:bg-slate-950/40 rounded-lg border border-slate-100 dark:border-slate-800/60 my-2">
          <svg
            viewBox="0 0 1180 500"
            className="w-full h-full max-h-[520px] select-none font-sans"
            style={{ minWidth: '980px' }}
          >
            <defs>
              <linearGradient id="tk101Water" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#0891b2" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.45" />
              </linearGradient>
              <linearGradient id="tk201Water" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#059669" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#34d399" stopOpacity="0.45" />
              </linearGradient>
            </defs>

            {/* PIPELINES */}
            {/* 1. Raw Source to XV-101 */}
            <path
              d="M 20 180 L 75 180"
              stroke={cPipeFeed}
              strokeWidth="4"
              fill="none"
              className={hasIntakeFlow ? 'animate-pipe-flow' : ''}
            />
            {/* 2. XV-101 to TK-101 */}
            <path
              d="M 105 180 L 140 180"
              stroke={cPipeFeed}
              strokeWidth="4"
              fill="none"
              className={hasIntakeFlow ? 'animate-pipe-flow' : ''}
            />

            {/* 3. TK-101 bottom outlet to STR-101 */}
            <path
              d="M 180 270 L 180 320 L 230 320"
              stroke={cPipeFeed}
              strokeWidth="4"
              fill="none"
              className={hasRawPumpFlow ? 'animate-pipe-flow' : ''}
            />

            {/* 4. STR-101 to P-101 suction */}
            <path
              d="M 260 320 L 290 320"
              stroke={cPipeFeed}
              strokeWidth="4"
              fill="none"
              className={hasRawPumpFlow ? 'animate-pipe-flow' : ''}
            />

            {/* 5. P-101 discharge to P-201 Booster suction */}
            <path
              d="M 326 320 L 375 320"
              stroke={cPipeFeed}
              strokeWidth="4"
              fill="none"
              className={hasRawPumpFlow ? 'animate-pipe-flow' : ''}
            />

            {/* 6. P-201 to F-201 */}
            <path
              d="M 410 320 L 450 320 L 450 240 L 485 240"
              stroke={cPipeFeed}
              strokeWidth="4"
              fill="none"
              className={hasBoosterFlow ? 'animate-pipe-flow' : ''}
            />

            {/* 7. F-201 to F-202 */}
            <path
              d="M 525 240 L 565 240"
              stroke={cPipeFeed}
              strokeWidth="4"
              fill="none"
              className={hasBoosterFlow ? 'animate-pipe-flow' : ''}
            />

            {/* 8. F-202 to CD-201 injection & P-202 */}
            <path
              d="M 605 240 L 685 240"
              stroke={cPipeFeed}
              strokeWidth="4"
              fill="none"
              className={hasBoosterFlow ? 'animate-pipe-flow' : ''}
            />

            {/* 9. P-202 High Pressure Pump discharge to RO-201 Feed */}
            <path
              d="M 720 240 L 780 240"
              stroke={cPipeHp}
              strokeWidth="5"
              fill="none"
              className={hasHpFlow ? 'animate-pipe-flow-fast' : ''}
            />

            {/* 10. RO-201 Permeate (Top Outlet) to TK-201 */}
            <path
              d="M 910 215 L 960 215 L 960 170 L 1000 170"
              stroke={cPipePermeate}
              strokeWidth="4"
              fill="none"
              className={hasPermeateFlow ? 'animate-pipe-flow' : ''}
            />

            {/* 11. RO-201 Reject / Concentrate (Bottom Outlet) through V-201 to Drain */}
            <path
              d="M 910 265 L 960 265 L 960 370 L 1020 370"
              stroke={cPipeReject}
              strokeWidth="4"
              fill="none"
              className={hasRejectFlow ? 'animate-pipe-flow-reject' : ''}
            />
            <path
              d="M 1050 370 L 1140 370"
              stroke={cPipeReject}
              strokeWidth="4"
              fill="none"
              className={hasRejectFlow ? 'animate-pipe-flow-reject' : ''}
            />

            {/* 12. TK-201 Permeate Distribution Outlet */}
            <path
              d="M 1040 260 L 1040 310 L 1150 310"
              stroke={cPipePermeate}
              strokeWidth="4"
              fill="none"
              className={telemetry.distributionDemandM3h > 0 ? 'animate-pipe-flow' : ''}
            />

            {/* RAW WATER SOURCE INTAKE */}
            <g transform="translate(15, 155)">
              <rect x="0" y="0" width="55" height="50" rx="4" fill={cVesselFill} stroke={cTankStroke} strokeWidth="1.5" />
              <text x="27" y="20" textAnchor="middle" fill={cTextMuted} fontSize="9" fontWeight="600">RAW WATER</text>
              <text x="27" y="34" textAnchor="middle" fill={isDark ? '#38bdf8' : '#0284c7'} fontSize="11" fontWeight="700">SOURCE</text>
            </g>

            {/* XV-101: INLET ACTUATED VALVE */}
            <g
              transform="translate(80, 165)"
              onClick={() => { setSelectedTag('XV-101'); setShowControlModal(true); }}
              className="cursor-pointer group"
            >
              {/* Actuator Diaphragm */}
              <circle cx="10" cy="-6" r="7" fill={isDark ? '#1e293b' : '#f1f5f9'} stroke={telemetry.xv101_openingPercent > 0 ? '#0284c7' : '#94a3b8'} strokeWidth="1.5" />
              <line x1="10" y1="-6" x2="10" y2="15" stroke="#94a3b8" strokeWidth="1.5" />
              {/* Valve Triangles */}
              <polygon points="0,5 20,25 20,5 0,25" fill={telemetry.xv101_openingPercent > 0 ? '#0284c7' : '#94a3b8'} stroke="#cbd5e1" strokeWidth="1" />
              <rect x="-10" y="32" width="40" height="18" rx="3" fill={cVesselFill} stroke={cTankStroke} />
              <text x="10" y="44" textAnchor="middle" fill={cTextPrimary} fontSize="9" fontWeight="700">XV-101</text>
              <text x="10" y="60" textAnchor="middle" fill={isDark ? '#38bdf8' : '#0284c7'} fontSize="9" className="font-mono font-semibold">
                {telemetry.xv101_openingPercent.toFixed(0)}%
              </text>
            </g>

            {/* TK-101: RAW WATER TANK */}
            <g
              transform="translate(140, 120)"
              onClick={() => { setSelectedTag('TK-101'); setShowControlModal(true); }}
              className="cursor-pointer group"
            >
              {/* Tank Shell */}
              <rect x="0" y="0" width="80" height="150" rx="6" fill={cTankFill} stroke={selectedTag === 'TK-101' ? '#0284c7' : cTankStroke} strokeWidth="2" />
              {/* Water Level Fill */}
              <rect
                x="4"
                y={146 - (142 * (telemetry.tk101.currentLevelPercent / 100))}
                width="72"
                height={142 * (telemetry.tk101.currentLevelPercent / 100)}
                fill="url(#tk101Water)"
                rx="3"
                className="transition-all duration-700"
              />
              {/* Level Transmitter LT-101 Top Radar */}
              <circle cx="40" cy="-6" r="6" fill={isDark ? '#1e293b' : '#f8fafc'} stroke="#0284c7" strokeWidth="1.5" />
              <line x1="40" y1="0" x2="40" y2="15" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />
              <text x="40" y="24" textAnchor="middle" fill={cTextPrimary} fontSize="10" fontWeight="700">TK-101</text>
              <text x="40" y="40" textAnchor="middle" fill={cTextMuted} fontSize="8">RAW TANK</text>
              <text x="40" y="85" textAnchor="middle" fill={isDark ? '#ffffff' : '#0f172a'} fontSize="13" fontWeight="700" className="font-mono">
                {telemetry.tk101.currentLevelPercent.toFixed(1)}%
              </text>
              <text x="40" y="100" textAnchor="middle" fill={isDark ? '#7dd3fc' : '#0369a1'} fontSize="9" className="font-mono font-semibold">
                {telemetry.tk101.currentLevelM3} m³
              </text>
              {/* Alarm lines */}
              <line x1="4" y1={146 - (142 * 0.88)} x2="76" y2={146 - (142 * 0.88)} stroke="#ef4444" strokeWidth="1" strokeDasharray="3 2" />
              <line x1="4" y1={146 - (142 * 0.20)} x2="76" y2={146 - (142 * 0.20)} stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 2" />
            </g>

            {/* STR-101: DUPLEX BASKET STRAINER */}
            <g
              transform="translate(230, 295)"
              onClick={() => { setSelectedTag('STR-101'); setShowControlModal(true); }}
              className="cursor-pointer group"
            >
              <polygon points="0,25 15,0 30,25 15,50" fill={isDark ? '#1e293b' : '#f1f5f9'} stroke="#64748b" strokeWidth="1.5" />
              <line x1="5" y1="25" x2="25" y2="25" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="2 2" />
              <text x="15" y="-6" textAnchor="middle" fill={cTextPrimary} fontSize="9" fontWeight="600">STR-101</text>
              <text x="15" y="62" textAnchor="middle" fill={isDark ? '#38bdf8' : '#0284c7'} fontSize="8" className="font-mono font-semibold">
                ΔP: {telemetry.str101_dpBar} bar
              </text>
            </g>

            {/* P-101: RAW FEED PUMP */}
            <g
              transform="translate(290, 295)"
              onClick={() => { setSelectedTag('P-101'); setShowControlModal(true); }}
              className="cursor-pointer group"
            >
              <circle
                cx="25"
                cy="25"
                r="22"
                fill={telemetry.p101_running ? (isDark ? '#083344' : '#e0f2fe') : (isDark ? '#1e293b' : '#f1f5f9')}
                stroke={telemetry.p101_running ? '#0284c7' : '#94a3b8'}
                strokeWidth="2"
              />
              <polygon points="25,5 45,25 25,25" fill={telemetry.p101_running ? '#0284c7' : '#94a3b8'} />
              <text x="25" y="-6" textAnchor="middle" fill={cTextPrimary} fontSize="10" fontWeight="700">P-101</text>
              <text x="25" y="62" textAnchor="middle" fill={isDark ? '#22d3ee' : '#0369a1'} fontSize="9" className="font-mono font-semibold">
                {telemetry.p101_flowM3h} m³/h
              </text>
              <text x="25" y="74" textAnchor="middle" fill={cTextMuted} fontSize="8" className="font-mono">
                {telemetry.p101_pressureBar} bar
              </text>
            </g>

            {/* P-201: RO BOOSTER PUMP */}
            <g
              transform="translate(375, 295)"
              onClick={() => { setSelectedTag('P-201'); setShowControlModal(true); }}
              className="cursor-pointer group"
            >
              <circle
                cx="22"
                cy="25"
                r="20"
                fill={telemetry.p201_running ? (isDark ? '#083344' : '#e0f2fe') : (isDark ? '#1e293b' : '#f1f5f9')}
                stroke={telemetry.p201_running ? '#0284c7' : '#94a3b8'}
                strokeWidth="2"
              />
              <polygon points="22,7 40,25 22,25" fill={telemetry.p201_running ? '#0284c7' : '#94a3b8'} />
              <text x="22" y="-6" textAnchor="middle" fill={cTextPrimary} fontSize="10" fontWeight="700">P-201</text>
              <text x="22" y="62" textAnchor="middle" fill={isDark ? '#22d3ee' : '#0369a1'} fontSize="9" className="font-mono font-semibold">
                {telemetry.p201_pressureBar} bar
              </text>
            </g>

            {/* F-201: 5-MICRON CARTRIDGE GUARD FILTER */}
            <g
              transform="translate(485, 205)"
              onClick={() => { setSelectedTag('F-201'); setShowControlModal(true); }}
              className="cursor-pointer group"
            >
              <rect
                x="0"
                y="0"
                width="40"
                height="70"
                rx="4"
                fill={cVesselFill}
                stroke={telemetry.f201_dpBar > 0.6 ? '#ef4444' : (isDark ? '#38bdf8' : '#0284c7')}
                strokeWidth="1.5"
              />
              <line x1="8" y1="10" x2="8" y2="60" stroke="#94a3b8" strokeWidth="1.5" />
              <line x1="16" y1="10" x2="16" y2="60" stroke="#94a3b8" strokeWidth="1.5" />
              <line x1="24" y1="10" x2="24" y2="60" stroke="#94a3b8" strokeWidth="1.5" />
              <line x1="32" y1="10" x2="32" y2="60" stroke="#94a3b8" strokeWidth="1.5" />
              <text x="20" y="-6" textAnchor="middle" fill={cTextPrimary} fontSize="10" fontWeight="700">F-201</text>
              <text x="20" y="84" textAnchor="middle" fill={telemetry.f201_dpBar > 0.6 ? '#ef4444' : (isDark ? '#7dd3fc' : '#0369a1')} fontSize="8" className="font-mono font-semibold">
                ΔP {telemetry.f201_dpBar} bar
              </text>
              <text x="20" y="96" textAnchor="middle" fill={cTextMuted} fontSize="7">5 µm Guard</text>
            </g>

            {/* F-202: 1-MICRON CARTRIDGE POLISHING FILTER */}
            <g
              transform="translate(565, 205)"
              onClick={() => { setSelectedTag('F-202'); setShowControlModal(true); }}
              className="cursor-pointer group"
            >
              <rect x="0" y="0" width="40" height="70" rx="4" fill={cVesselFill} stroke={isDark ? '#38bdf8' : '#0284c7'} strokeWidth="1.5" />
              <line x1="10" y1="10" x2="10" y2="60" stroke="#94a3b8" strokeWidth="1" />
              <line x1="20" y1="10" x2="20" y2="60" stroke="#94a3b8" strokeWidth="1" />
              <line x1="30" y1="10" x2="30" y2="60" stroke="#94a3b8" strokeWidth="1" />
              <text x="20" y="-6" textAnchor="middle" fill={cTextPrimary} fontSize="10" fontWeight="700">F-202</text>
              <text x="20" y="84" textAnchor="middle" fill={isDark ? '#7dd3fc' : '#0369a1'} fontSize="8" className="font-mono font-semibold">
                ΔP {telemetry.f202_dpBar} bar
              </text>
              <text x="20" y="96" textAnchor="middle" fill={cTextMuted} fontSize="7">1 µm Polish</text>
            </g>

            {/* CD-201: CHEMICAL DOSING SKID INJECTION */}
            <g
              transform="translate(635, 140)"
              onClick={() => { setSelectedTag('CD-201'); setShowControlModal(true); }}
              className="cursor-pointer group"
            >
              <rect x="0" y="0" width="45" height="36" rx="4" fill={isDark ? '#1e1b4b' : '#ede9fe'} stroke="#818cf8" strokeWidth="1.5" />
              <text x="22" y="16" textAnchor="middle" fill={isDark ? '#c7d2fe' : '#4338ca'} fontSize="8" fontWeight="700">CD-201</text>
              <text x="22" y="28" textAnchor="middle" fill={isDark ? '#a5b4fc' : '#4f46e5'} fontSize="8" className="font-mono font-semibold">
                {telemetry.cd201_dosingPpm} ppm
              </text>
              <line x1="22" y1="36" x2="22" y2="100" stroke="#818cf8" strokeWidth="2" strokeDasharray="3 2" />
              <polygon points="22,100 19,92 25,92" fill="#818cf8" />
            </g>

            {/* P-202: HIGH PRESSURE RO PUMP */}
            <g
              transform="translate(685, 215)"
              onClick={() => { setSelectedTag('P-202'); setShowControlModal(true); }}
              className="cursor-pointer group"
            >
              <circle
                cx="25"
                cy="25"
                r="24"
                fill={telemetry.p202_running ? (isDark ? '#1e1b4b' : '#ede9fe') : (isDark ? '#1e293b' : '#f1f5f9')}
                stroke={telemetry.p202_running ? '#6366f1' : '#94a3b8'}
                strokeWidth="2.5"
              />
              <polygon points="25,5 47,25 25,25" fill={telemetry.p202_running ? '#6366f1' : '#94a3b8'} />
              <text x="25" y="-8" textAnchor="middle" fill={cTextPrimary} fontSize="10" fontWeight="700">P-202</text>
              <text x="25" y="64" textAnchor="middle" fill={isDark ? '#818cf8' : '#4338ca'} fontSize="10" fontWeight="700" className="font-mono">
                {telemetry.p202_pressureBar} bar
              </text>
              <text x="25" y="78" textAnchor="middle" fill={cTextMuted} fontSize="8" className="font-mono">
                HP RO Feed
              </text>
            </g>

            {/* RO-201: REVERSE OSMOSIS MEMBRANE RACK */}
            <g
              transform="translate(780, 185)"
              onClick={() => { setSelectedTag('RO-201'); setShowControlModal(true); }}
              className="cursor-pointer group"
            >
              {/* Pressure Vessel 1 */}
              <rect x="0" y="0" width="130" height="40" rx="6" fill={cVesselFill} stroke={cVesselStroke} strokeWidth="2" />
              <line x1="20" y1="20" x2="110" y2="20" stroke={cPipeFeed} strokeWidth="1.5" strokeDasharray="4 2" />
              {/* Pressure Vessel 2 */}
              <rect x="0" y="55" width="130" height="40" rx="6" fill={cVesselFill} stroke={cVesselStroke} strokeWidth="2" />
              <line x1="20" y1="75" x2="110" y2="75" stroke={cPipeFeed} strokeWidth="1.5" strokeDasharray="4 2" />

              {/* Headers Connectors */}
              <rect x="-10" y="10" width="10" height="75" fill="#64748b" rx="2" />
              <rect x="130" y="10" width="10" height="30" fill="#059669" rx="2" />
              <rect x="130" y="60" width="10" height="30" fill="#d97706" rx="2" />

              <text x="65" y="-8" textAnchor="middle" fill={cTextPrimary} fontSize="11" fontWeight="700">RO-201 MEMBRANE RACK</text>
              <text x="65" y="24" textAnchor="middle" fill={cTextPrimary} fontSize="9" fontWeight="600">STAGE 1 & 2 ARRAY</text>
              <text x="65" y="78" textAnchor="middle" fill={isDark ? '#34d399' : '#059669'} fontSize="9" className="font-mono font-bold">
                Recovery: {telemetry.ro_recoveryPercent}%
              </text>

              {/* Badges on Permeate and Reject outlets */}
              <text x="145" y="28" fill={isDark ? '#34d399' : '#059669'} fontSize="9" fontWeight="700">PERMEATE ({telemetry.ro_permeateFlowM3h} m³/h)</text>
              <text x="145" y="80" fill={isDark ? '#fbbf24' : '#b45309'} fontSize="9" fontWeight="700">REJECT ({telemetry.ro_rejectFlowM3h} m³/h)</text>
            </g>

            {/* V-201: REJECT THROTTLE VALVE */}
            <g
              transform="translate(1020, 355)"
              onClick={() => { setSelectedTag('V-201'); setShowControlModal(true); }}
              className="cursor-pointer group"
            >
              <polygon points="0,5 20,25 20,5 0,25" fill="#d97706" stroke="#fcd34d" strokeWidth="1" />
              <text x="10" y="-4" textAnchor="middle" fill={isDark ? '#fbbf24' : '#b45309'} fontSize="8" fontWeight="700">V-201</text>
              <text x="10" y="38" textAnchor="middle" fill={isDark ? '#fef08a' : '#92400e'} fontSize="8" className="font-mono font-bold">
                {telemetry.v201_rejectValvePercent.toFixed(0)}%
              </text>
            </g>

            {/* REJECT BRINE DRAIN HEADER */}
            <g transform="translate(1140, 350)">
              <rect x="0" y="0" width="35" height="40" rx="3" fill={isDark ? '#451a03' : '#fef3c7'} stroke="#b45309" strokeWidth="1.5" />
              <text x="17" y="16" textAnchor="middle" fill={isDark ? '#fde68a' : '#78350f'} fontSize="7" fontWeight="700">BRINE</text>
              <text x="17" y="28" textAnchor="middle" fill={isDark ? '#fbbf24' : '#92400e'} fontSize="7">DRAIN</text>
            </g>

            {/* TK-201: TREATED PERMEATE PRODUCT TANK */}
            <g
              transform="translate(1000, 110)"
              onClick={() => { setSelectedTag('TK-201'); setShowControlModal(true); }}
              className="cursor-pointer group"
            >
              <rect x="0" y="0" width="75" height="150" rx="6" fill={cTankFill} stroke={selectedTag === 'TK-201' ? '#059669' : cTankStroke} strokeWidth="2" />
              <rect
                x="4"
                y={146 - (142 * (telemetry.tk201.currentLevelPercent / 100))}
                width="67"
                height={142 * (telemetry.tk201.currentLevelPercent / 100)}
                fill="url(#tk201Water)"
                rx="3"
                className="transition-all duration-700"
              />
              <circle cx="37" cy="-6" r="6" fill={isDark ? '#1e293b' : '#f8fafc'} stroke="#059669" strokeWidth="1.5" />
              <line x1="37" y1="0" x2="37" y2="15" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />
              <text x="37" y="24" textAnchor="middle" fill={cTextPrimary} fontSize="10" fontWeight="700">TK-201</text>
              <text x="37" y="38" textAnchor="middle" fill={cTextMuted} fontSize="8">PERMEATE</text>
              <text x="37" y="85" textAnchor="middle" fill={isDark ? '#ffffff' : '#0f172a'} fontSize="13" fontWeight="700" className="font-mono">
                {telemetry.tk201.currentLevelPercent.toFixed(1)}%
              </text>
              <text x="37" y="100" textAnchor="middle" fill={isDark ? '#a7f3d0' : '#047857'} fontSize="9" className="font-mono font-semibold">
                {telemetry.tk201.currentLevelM3} m³
              </text>
            </g>

            {/* DISTRIBUTION OUTLET HEADER */}
            <g transform="translate(1145, 290)">
              <rect x="0" y="0" width="35" height="40" rx="3" fill={isDark ? '#064e3b' : '#d1fae5'} stroke="#059669" strokeWidth="1.5" />
              <text x="17" y="16" textAnchor="middle" fill={isDark ? '#a7f3d0' : '#065f46'} fontSize="7" fontWeight="700">PLANT</text>
              <text x="17" y="28" textAnchor="middle" fill={isDark ? '#6ee7b7' : '#047857'} fontSize="7">DISTRIB</text>
            </g>
          </svg>
        </div>

        {/* Real-time Telemetry Strip below Diagram */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
          <div className="bg-slate-50 dark:bg-slate-950/60 p-2 rounded-lg border border-slate-200 dark:border-slate-800/80">
            <span className="text-[10px] text-slate-500 dark:text-slate-400">RO Feed Pressure</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-sm font-semibold font-mono text-cyan-600 dark:text-cyan-400">{telemetry.ro_feedPressureBar}</span>
              <span className="text-[10px] text-slate-400">bar</span>
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950/60 p-2 rounded-lg border border-slate-200 dark:border-slate-800/80">
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Permeate Flow</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-sm font-semibold font-mono text-emerald-600 dark:text-emerald-400">{telemetry.ro_permeateFlowM3h}</span>
              <span className="text-[10px] text-slate-400">m³/h</span>
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950/60 p-2 rounded-lg border border-slate-200 dark:border-slate-800/80">
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Reject Flow</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-sm font-semibold font-mono text-amber-600 dark:text-amber-400">{telemetry.ro_rejectFlowM3h}</span>
              <span className="text-[10px] text-slate-400">m³/h</span>
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950/60 p-2 rounded-lg border border-slate-200 dark:border-slate-800/80">
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Recovery Ratio</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-sm font-semibold font-mono text-cyan-700 dark:text-cyan-300">{telemetry.ro_recoveryPercent}</span>
              <span className="text-[10px] text-slate-400">%</span>
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950/60 p-2 rounded-lg border border-slate-200 dark:border-slate-800/80">
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Permeate TDS</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-sm font-semibold font-mono text-emerald-600 dark:text-emerald-300">{telemetry.permeateQuality.tdsMgL}</span>
              <span className="text-[10px] text-slate-400">mg/L</span>
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950/60 p-2 rounded-lg border border-slate-200 dark:border-slate-800/80">
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Active Power</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-sm font-semibold font-mono text-indigo-600 dark:text-indigo-400">{telemetry.totalPowerKw}</span>
              <span className="text-[10px] text-slate-400">kW</span>
            </div>
          </div>
        </div>
      </div>

      {/* Equipment Inspector & Direct Control Panel */}
      <div className="w-full xl:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col shrink-0 shadow-sm transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-900/40 text-cyan-800 dark:text-cyan-300 font-mono">
                {selectedTag || 'SELECT'}
              </span>
              <span className="text-xs text-slate-500">Inspector</span>
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">
              {selectedEquip?.name || 'Equipment Details'}
            </h3>
          </div>
        </div>

        {selectedEquip ? (
          <div className="flex-1 py-3 space-y-4 overflow-y-auto text-xs">
            {/* Quick Status Pill & Stage */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400">Process Stage:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{selectedEquip.stage}</span>
            </div>

            {/* Health Score */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500 dark:text-slate-400">Health Index</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                  {selectedEquip.healthScore}% Nominal
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${selectedEquip.healthScore}%` }}
                />
              </div>
            </div>

            {/* Interactive Controls based on Tag */}
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                <Sliders className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-500" />
                <span>Operator Actuation Controls</span>
              </div>

              {selectedTag === 'P-101' || selectedTag === 'P-201' || selectedTag === 'P-202' ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-300">Pump Power State:</span>
                    <button
                      onClick={() => togglePump(selectedTag as 'P-101' | 'P-201' | 'P-202')}
                      className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition ${
                        (selectedTag === 'P-101' && telemetry.p101_running) ||
                        (selectedTag === 'P-201' && telemetry.p201_running) ||
                        (selectedTag === 'P-202' && telemetry.p202_running)
                          ? 'bg-rose-500 hover:bg-rose-600 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>
                        {(selectedTag === 'P-101' && telemetry.p101_running) ||
                        (selectedTag === 'P-201' && telemetry.p201_running) ||
                        (selectedTag === 'P-202' && telemetry.p202_running)
                          ? 'Stop Pump'
                          : 'Start Pump'}
                      </span>
                    </button>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-500">VFD Speed Setpoint:</span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {selectedTag === 'P-101'
                          ? telemetry.p101_speedPercent
                          : selectedTag === 'P-201'
                          ? telemetry.p201_speedPercent
                          : telemetry.p202_speedPercent}
                        %
                      </span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="100"
                      value={
                        selectedTag === 'P-101'
                          ? telemetry.p101_speedPercent
                          : selectedTag === 'P-201'
                          ? telemetry.p201_speedPercent
                          : telemetry.p202_speedPercent
                      }
                      onChange={(e) =>
                        setPumpSpeed(
                          selectedTag as 'P-101' | 'P-201' | 'P-202',
                          Number(e.target.value)
                        )
                      }
                      className="w-full accent-cyan-600 cursor-pointer"
                    />
                  </div>
                </>
              ) : selectedTag === 'XV-101' ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-300">Level Mode:</span>
                    <button
                      onClick={() => setXv101Auto(!telemetry.xv101_auto)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold ${
                        telemetry.xv101_auto
                          ? 'bg-cyan-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {telemetry.xv101_auto ? 'AUTO (PID Active)' : 'MANUAL'}
                    </button>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-500">Valve Stroke:</span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {telemetry.xv101_openingPercent.toFixed(1)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={telemetry.xv101_openingPercent}
                      disabled={telemetry.xv101_auto}
                      onChange={(e) => setXv101Opening(Number(e.target.value))}
                      className="w-full accent-cyan-600 cursor-pointer disabled:opacity-40"
                    />
                  </div>
                </>
              ) : selectedTag === 'V-201' ? (
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-500">Reject Throttle:</span>
                    <span className="font-mono font-semibold text-amber-600 dark:text-amber-500">
                      {telemetry.v201_rejectValvePercent.toFixed(0)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="80"
                    value={telemetry.v201_rejectValvePercent}
                    onChange={(e) => setRejectValve(Number(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    Throttling valve increases backpressure & RO recovery ratio.
                  </p>
                </div>
              ) : (
                <p className="text-slate-500 dark:text-slate-400 text-center py-1">
                  Operating nominally under automated supervisory interlocks.
                </p>
              )}
            </div>

            {/* Equipment Spec Metadata */}
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-2">
                Engineering Specifications
              </span>
              <dl className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded border border-slate-200 dark:border-slate-800">
                  <dt className="text-slate-500 dark:text-slate-400">Manufacturer</dt>
                  <dd className="font-medium text-slate-800 dark:text-slate-200">{selectedEquip.manufacturer}</dd>
                </div>
                <div className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded border border-slate-200 dark:border-slate-800">
                  <dt className="text-slate-500 dark:text-slate-400">Model</dt>
                  <dd className="font-medium text-slate-800 dark:text-slate-200 truncate">{selectedEquip.model}</dd>
                </div>
                {Object.entries(selectedEquip.specs).map(([key, val]) => (
                  <div key={key} className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded border border-slate-200 dark:border-slate-800">
                    <dt className="text-slate-500 dark:text-slate-400 truncate">{key}</dt>
                    <dd className="font-medium text-slate-800 dark:text-slate-200 truncate font-mono">{val}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/30 p-2.5 rounded border border-slate-200 dark:border-slate-800">
              {selectedEquip.description}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <Info className="w-8 h-8 text-slate-400 mb-2" />
            <p className="text-xs">Click any equipment or valve on the P&ID diagram to inspect telemetry and adjust controls.</p>
          </div>
        )}
      </div>
    </div>
  );
};
