/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePlant } from '../../../context/PlantContext';
import {
  Cpu,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Activity,
  Layers,
  ArrowRight,
  TrendingUp,
  Gauge,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const DigitalTwinView: React.FC = () => {
  const {
    telemetry,
    isSimulating,
    toggleSimulation,
    simulationSpeed,
    setSimulationSpeed,
    resetSimulation,
    updateTk101Pid,
    setPumpSpeed,
    togglePump,
    setXv101Opening,
    setRejectValve,
    setDosingRate,
    setDistributionDemand,
    activeScenario,
    applyScenario,
  } = usePlant();

  const [activeTab, setActiveTab] = useState<'model' | 'pid' | 'scenarios'>('model');

  // Mass balance math calculations
  const balanceErrorFlow = Math.abs(
    telemetry.ro_feedFlowM3h - (telemetry.ro_permeateFlowM3h + telemetry.ro_rejectFlowM3h)
  );

  return (
    <div className="space-y-4">
      {/* Simulation Control & Disclaimer Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-slate-800 dark:text-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 dark:border-cyan-500/30">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Digital Twin Virtual Plant Core</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-50 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30 font-medium">
                FIRST-PRINCIPLES MASS BALANCE
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Simulated real-time physics engine evaluating conservation of mass, osmotic pressure, and PID response.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSimulation}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              isSimulating
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isSimulating ? 'Pause Engine' : 'Run Engine'}</span>
          </button>

          <button
            onClick={resetSimulation}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Baseline</span>
          </button>

          <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
            {[1, 2, 5].map((spd) => (
              <button
                key={spd}
                onClick={() => setSimulationSpeed(spd)}
                className={`px-2 py-0.5 text-xs font-mono rounded ${
                  simulationSpeed === spd
                    ? 'bg-cyan-600 text-white dark:bg-cyan-500 dark:text-slate-950 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1 text-xs">
        <button
          onClick={() => setActiveTab('model')}
          className={`px-4 py-2 font-medium rounded-lg transition ${
            activeTab === 'model'
              ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Mass Balance & RO Dynamics
        </button>
        <button
          onClick={() => setActiveTab('pid')}
          className={`px-4 py-2 font-medium rounded-lg transition ${
            activeTab === 'pid'
              ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          TK-101 PID Level Controller Lab
        </button>
        <button
          onClick={() => setActiveTab('scenarios')}
          className={`px-4 py-2 font-medium rounded-lg transition ${
            activeTab === 'scenarios'
              ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          What-If Scenario Sandbox
        </button>
      </div>

      {/* TAB 1: MASS BALANCE & RO DYNAMICS */}
      {activeTab === 'model' && (
        <div className="space-y-4">
          {/* Strict Mass Balance Equation Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-cyan-500" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Reverse Osmosis Mass & Solute Conservation Model
                </h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Continuity Balance Error: {balanceErrorFlow.toFixed(3)} m³/h (Nominal)
              </span>
            </div>

            {/* Mass Balance Diagram Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
              {/* Feed Stream */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Feed Water (Q_feed)</span>
                  <span className="font-mono text-cyan-500">RO-201 Inlet</span>
                </div>
                <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
                  {telemetry.ro_feedFlowM3h} <span className="text-xs font-normal text-slate-500">m³/h</span>
                </div>
                <div className="mt-3 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Pressure:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">{telemetry.ro_feedPressureBar} bar</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Salinity (TDS):</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">{telemetry.rawQuality.tdsMgL} mg/L</span>
                  </div>
                </div>
              </div>

              {/* Permeate Stream */}
              <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
                <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 mb-2">
                  <span className="font-semibold">Purified Permeate (Q_perm)</span>
                  <span className="font-mono">TK-201 Buffer</span>
                </div>
                <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {telemetry.ro_permeateFlowM3h} <span className="text-xs font-normal text-slate-500">m³/h</span>
                </div>
                <div className="mt-3 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Recovery (R):</span>
                    <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      {telemetry.ro_recoveryPercent}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Permeate TDS:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">{telemetry.permeateQuality.tdsMgL} mg/L</span>
                  </div>
                </div>
              </div>

              {/* Reject Brine Stream */}
              <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40">
                <div className="flex items-center justify-between text-xs text-amber-700 dark:text-amber-400 mb-2">
                  <span className="font-semibold">Concentrate Reject (Q_rej)</span>
                  <span className="font-mono">Brine Header</span>
                </div>
                <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
                  {telemetry.ro_rejectFlowM3h} <span className="text-xs font-normal text-slate-500">m³/h</span>
                </div>
                <div className="mt-3 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Reject Backpress:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">{telemetry.ro_rejectPressureBar} bar</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reject TDS:</span>
                    <span className="font-mono text-amber-600 dark:text-amber-400">{telemetry.rejectQuality.tdsMgL} mg/L</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Formula Proof Bar */}
            <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-300 text-xs font-mono flex flex-wrap items-center justify-between gap-3 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-cyan-700 dark:text-cyan-400 font-semibold">Q_feed ({telemetry.ro_feedFlowM3h})</span>
                <span className="text-slate-400 dark:text-slate-500">=</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Q_perm ({telemetry.ro_permeateFlowM3h})</span>
                <span className="text-slate-400 dark:text-slate-500">+</span>
                <span className="text-amber-700 dark:text-amber-400 font-semibold">Q_rej ({telemetry.ro_rejectFlowM3h})</span>
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400">
                Salt Rejection: <span className="text-cyan-700 dark:text-cyan-300 font-semibold">{telemetry.ro_saltRejectionPercent}%</span> · Membrane Flux:{' '}
                <span className="text-cyan-700 dark:text-cyan-300 font-semibold">{telemetry.ro_fluxLmh} LMH</span>
              </div>
            </div>
          </div>

          {/* Interactive Operating Knobs Grid */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-500" />
              Adjustable Plant Operating Parameters
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
              {/* Knob 1: P-101 Feed Pump Speed */}
              <div className="space-y-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-700 dark:text-slate-200">P-101 VFD Speed:</span>
                  <span className="font-mono font-semibold text-cyan-600 dark:text-cyan-400">
                    {telemetry.p101_speedPercent}%
                  </span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="100"
                  value={telemetry.p101_speedPercent}
                  onChange={(e) => setPumpSpeed('P-101', Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Min 40%</span>
                  <span>Discharge: {telemetry.p101_pressureBar} bar</span>
                  <span>Max 100%</span>
                </div>
              </div>

              {/* Knob 2: P-202 HP Pump Speed */}
              <div className="space-y-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-700 dark:text-slate-200">P-202 HP RO Pump:</span>
                  <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                    {telemetry.p202_speedPercent}%
                  </span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="100"
                  value={telemetry.p202_speedPercent}
                  onChange={(e) => setPumpSpeed('P-202', Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Feed Pressure:</span>
                  <span className="font-mono font-bold text-indigo-400">{telemetry.ro_feedPressureBar} bar</span>
                </div>
              </div>

              {/* Knob 3: V-201 Reject Throttle Valve */}
              <div className="space-y-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-700 dark:text-slate-200">V-201 Reject Valve:</span>
                  <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
                    {telemetry.v201_rejectValvePercent}%
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="70"
                  value={telemetry.v201_rejectValvePercent}
                  onChange={(e) => setRejectValve(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Tighter throttle → higher recovery %</span>
                </div>
              </div>

              {/* Knob 4: Chemical Dosing */}
              <div className="space-y-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-700 dark:text-slate-200">Antiscalant Dosing:</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {telemetry.cd201_dosingPpm} ppm
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="0.5"
                  value={telemetry.cd201_dosingPpm}
                  onChange={(e) => setDosingRate(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Prevents silica/calcite membrane fouling</span>
                </div>
              </div>

              {/* Knob 5: Distribution Demand Flow */}
              <div className="space-y-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-700 dark:text-slate-200">Plant Usage Demand:</span>
                  <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    {telemetry.distributionDemandM3h} m³/h
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="1"
                  value={telemetry.distributionDemandM3h}
                  onChange={(e) => setDistributionDemand(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Outflow from TK-201 product buffer</span>
                </div>
              </div>

              {/* Knob 6: Raw Water Inlet Manual Stroke */}
              <div className="space-y-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-700 dark:text-slate-200">XV-101 Manual Valve:</span>
                  <span className="font-mono font-semibold text-cyan-600 dark:text-cyan-400">
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
                  className="w-full accent-cyan-500 cursor-pointer disabled:opacity-40"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>{telemetry.xv101_auto ? 'Controlled by PID' : 'Manual Override Active'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TK-101 PID LEVEL CONTROLLER LAB */}
      {activeTab === 'pid' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Closed-Loop Discrete PID Tank Level Control (TK-101)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manipulates XV-101 inlet valve position to maintain tank level at setpoint against variable P-101 outflow.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Controller Loop:</span>
              <button
                onClick={() => updateTk101Pid({ enabled: !telemetry.tk101.pidControlEnabled })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  telemetry.tk101.pidControlEnabled
                    ? 'bg-cyan-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {telemetry.tk101.pidControlEnabled ? 'AUTOMATIC (ACTIVE)' : 'MANUAL (BYPASS)'}
              </button>
            </div>
          </div>

          {/* Control Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 block mb-1">Process Variable (PV)</span>
              <span className="text-xl font-bold font-mono text-cyan-600 dark:text-cyan-400">
                {telemetry.tk101.currentLevelPercent}%
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 block mb-1">Setpoint (SP)</span>
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
                {telemetry.tk101.pidSetpointPercent}%
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 block mb-1">Error e(t) = SP - PV</span>
              <span
                className={`text-xl font-bold font-mono ${
                  Math.abs(telemetry.tk101.pidSetpointPercent - telemetry.tk101.currentLevelPercent) > 5
                    ? 'text-amber-500'
                    : 'text-emerald-500'
                }`}
              >
                {(telemetry.tk101.pidSetpointPercent - telemetry.tk101.currentLevelPercent).toFixed(1)}%
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 block mb-1">Manipulated Output (MV)</span>
              <span className="text-xl font-bold font-mono text-cyan-600 dark:text-cyan-400">
                {telemetry.tk101.pidOutput}%
              </span>
            </div>
          </div>

          {/* PID Parameter Tuning Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/60 text-xs">
            {/* Setpoint Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Level Setpoint (SP):</span>
                <span className="font-mono text-cyan-500">{telemetry.tk101.pidSetpointPercent}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="90"
                value={telemetry.tk101.pidSetpointPercent}
                onChange={(e) => updateTk101Pid({ setpoint: Number(e.target.value) })}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            {/* Proportional Gain Kp */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Gain Kp:</span>
                <span className="font-mono text-slate-900 dark:text-slate-100">{telemetry.tk101.pidKp}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.1"
                value={telemetry.tk101.pidKp}
                onChange={(e) => updateTk101Pid({ kp: Number(e.target.value) })}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">Speed of immediate corrective response</span>
            </div>

            {/* Integral Time Ki */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Reset Ki:</span>
                <span className="font-mono text-slate-900 dark:text-slate-100">{telemetry.tk101.pidKi}</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.5"
                step="0.01"
                value={telemetry.tk101.pidKi}
                onChange={(e) => updateTk101Pid({ ki: Number(e.target.value) })}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">Eliminates steady-state level offset</span>
            </div>

            {/* Derivative Time Kd */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Rate Kd:</span>
                <span className="font-mono text-slate-900 dark:text-slate-100">{telemetry.tk101.pidKd}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.5"
                step="0.05"
                value={telemetry.tk101.pidKd}
                onChange={(e) => updateTk101Pid({ kd: Number(e.target.value) })}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">Dampens sudden inflow surges</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WHAT-IF SCENARIO SANDBOX */}
      {activeTab === 'scenarios' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Industrial Fault Injection & Optimization Scenarios
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Simulate edge-case disturbances in the Digital Twin without endangering physical membrane assets.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                {
                  id: 'baseline',
                  title: 'Nominal Steady State',
                  tag: 'Standard Operation',
                  desc: 'Clean 1,420 mg/L feed TDS, F-201 DP 0.38 bar, 75% recovery, stable 13.5 m³/h permeate output.',
                },
                {
                  id: 'salinity_spike',
                  title: 'High Salinity Feed Intrusion',
                  tag: 'Water Quality Disturbance',
                  desc: 'Feed TDS surges +80% to 2,550 mg/L. Increases osmotic pressure requirement and reject brine concentration.',
                },
                {
                  id: 'filter_fouling',
                  title: 'Pre-RO Cartridge Fouling',
                  tag: 'Mechanical Degradation',
                  desc: 'Particulate build-up doubles differential pressure across F-201 to 0.77 bar, threatening pump suction cavitation.',
                },
                {
                  id: 'pump_trip',
                  title: 'High Pressure Pump P-202 Trip',
                  tag: 'Emergency Trip',
                  desc: 'P-202 motor overtemperature trip isolates high pressure feed; permeate production collapses to near zero.',
                },
                {
                  id: 'high_recovery',
                  title: 'High Recovery Optimization (80%)',
                  tag: 'Efficiency Mode',
                  desc: 'Reject throttle valve constricted to reach 80.0% recovery, lowering brine reject volume at higher scaling risk.',
                },
              ].map((sc) => {
                const isActive = activeScenario === sc.id;
                return (
                  <button
                    key={sc.id}
                    onClick={() => applyScenario(sc.id)}
                    className={`p-4 rounded-xl text-left border transition-all ${
                      isActive
                        ? 'bg-cyan-500/10 border-cyan-500 text-slate-900 dark:text-slate-100 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold font-mono text-cyan-600 dark:text-cyan-400">{sc.tag}</span>
                      {isActive && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-cyan-500 text-white">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">{sc.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{sc.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
