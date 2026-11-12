/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PlcDeviceConfig, ExtendedPlcTag, EthernetDiagConnectionRow } from '../types';
import { SEED_ETHERNET_DIAG_ROWS } from '../ioData';
import {
  Activity,
  Server,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Download,
  RotateCw,
  Cpu,
  ShieldCheck,
  Radio,
  Clock,
  Layers,
  Network,
  Info,
} from 'lucide-react';

interface DiagnosticsTabProps {
  device: PlcDeviceConfig;
  tags: ExtendedPlcTag[];
}

export const DiagnosticsTab: React.FC<DiagnosticsTabProps> = ({ device, tags }) => {
  const [diagRows, setDiagRows] = useState<EthernetDiagConnectionRow[]>(SEED_ETHERNET_DIAG_ROWS);
  const [ipDisplayFormat, setIpDisplayFormat] = useState<'DEC' | 'HEX'>('DEC');
  const [portDisplayFormat, setPortDisplayFormat] = useState<'DEC' | 'HEX'>('DEC');
  const [isMonitoring, setIsMonitoring] = useState<boolean>(true);
  const [pingRunning, setPingRunning] = useState<boolean>(false);
  const [pingResult, setPingResult] = useState<string | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState<boolean>(false);

  const handlePing = () => {
    setPingRunning(true);
    setPingResult(null);
    setTimeout(() => {
      setPingRunning(false);
      setPingResult(`PING ${device.host} reply: bytes=64 time=45ms TTL=64 (SLMP 3E Socket Active)`);
    }, 800);
  };

  const handleClearError = () => {
    setDiagRows((prev) =>
      prev.map((r) => ({
        ...r,
        latestErrorCode: '0000',
      }))
    );
  };

  return (
    <div className="space-y-5 font-sans select-none">
      {/* 2-Card Top Overview matching user screenshot Bottom-Right */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Card: Connection Status */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide font-mono pb-3 border-b border-slate-100 dark:border-slate-800">
              Connection Status
            </h4>

            {/* Big Green Check + Title matching screenshot */}
            <div className="my-5 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/15 border-2 border-emerald-500/30 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <div>
                <div className="text-lg font-black text-slate-900 dark:text-white font-mono">
                  PLC Connected
                </div>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  Since: 12:34:12 PM
                </div>
              </div>
            </div>

            {/* Metrics List matching screenshot */}
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Communication</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  : SLMP (3E)
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Response Time</span>
                <span className="font-bold text-cyan-600 dark:text-cyan-400">
                  : 45 ms
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Signal Quality</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  : 100%
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Ping PLC | Test I/O matching screenshot */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <button
              onClick={handlePing}
              disabled={pingRunning}
              className="flex-1 py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 transition flex items-center justify-center gap-2"
            >
              <RotateCw className={`w-3.5 h-3.5 ${pingRunning ? 'animate-spin' : ''}`} />
              <span>{pingRunning ? 'Pinging...' : 'Ping PLC'}</span>
            </button>

            <button
              onClick={() => {
                setPingResult('Test I/O: 16 DI points, 16 DO points, 8 AI channels verified. 0 bus collision.');
              }}
              className="flex-1 py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 transition"
            >
              Test I/O
            </button>
          </div>

          {pingResult && (
            <div className="mt-2 p-2 rounded bg-cyan-500/10 border border-cyan-500/20 text-[11px] font-mono text-cyan-700 dark:text-cyan-300 animate-fadeIn">
              {pingResult}
            </div>
          )}
        </div>

        {/* Right Card: Diagnostics matching user screenshot */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide font-mono pb-3 border-b border-slate-100 dark:border-slate-800">
              Diagnostics
            </h4>

            {/* Diagnostic Parameters matching screenshot */}
            <div className="mt-4 space-y-3 text-xs font-mono">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">PLC Mode</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10">
                  RUN
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Battery</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  OK
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Error Code</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  0x0000 (No Error)
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Scan Time</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  10 ms
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">CPU Load</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  32%
                </span>
              </div>
            </div>
          </div>

          {/* View Details Button matching screenshot */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setDetailsModalOpen(true)}
              className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 transition"
            >
              View Details
            </button>
          </div>
        </div>
      </div>

      {/* Ethernet Diagnostics Window (Matching Mitsubishi GX Works3 Screenshot) */}
      <div className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-750 rounded-xl overflow-hidden shadow-md">
        {/* GX Works Window Bar */}
        <div className="bg-slate-200 dark:bg-slate-800 px-4 py-2 border-b border-slate-300 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-3">
            <Network className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span className="font-bold text-slate-800 dark:text-slate-100">
              Ethernet Diagnostics — Target Module: CPU(M)
            </span>
          </div>

          {/* Radials for Display options matching screenshot */}
          <div className="flex items-center gap-4 text-[11px] text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-1.5">
              <span>Change IP Address Display:</span>
              <label className="flex items-center gap-0.5 cursor-pointer">
                <input
                  type="radio"
                  name="ipDisplay"
                  checked={ipDisplayFormat === 'DEC'}
                  onChange={() => setIpDisplayFormat('DEC')}
                />
                <span>DEC</span>
              </label>
              <label className="flex items-center gap-0.5 cursor-pointer">
                <input
                  type="radio"
                  name="ipDisplay"
                  checked={ipDisplayFormat === 'HEX'}
                  onChange={() => setIpDisplayFormat('HEX')}
                />
                <span>HEX</span>
              </label>
            </div>

            <div className="flex items-center gap-1.5">
              <span>Port No. Display:</span>
              <label className="flex items-center gap-0.5 cursor-pointer">
                <input
                  type="radio"
                  name="portDisplay"
                  checked={portDisplayFormat === 'DEC'}
                  onChange={() => setPortDisplayFormat('DEC')}
                />
                <span>DEC</span>
              </label>
              <label className="flex items-center gap-0.5 cursor-pointer">
                <input
                  type="radio"
                  name="portDisplay"
                  checked={portDisplayFormat === 'HEX'}
                  onChange={() => setPortDisplayFormat('HEX')}
                />
                <span>HEX</span>
              </label>
            </div>

            {/* Monitoring Green Button */}
            <button
              onClick={() => setIsMonitoring(!isMonitoring)}
              className={`px-3 py-1 rounded font-bold text-white transition shadow-xs ${
                isMonitoring ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-slate-600'
              }`}
            >
              {isMonitoring ? 'Monitoring' : 'Stop Monitoring'}
            </button>
          </div>
        </div>

        {/* GX Works Diagnostics Matrix Table */}
        <div className="overflow-x-auto bg-white dark:bg-slate-950 p-2">
          <table className="w-full text-left text-xs font-mono border-collapse border border-slate-300 dark:border-slate-700">
            <thead className="bg-slate-150 dark:bg-slate-850 text-slate-600 dark:text-slate-300 text-[10px]">
              <tr>
                <th className="border border-slate-300 dark:border-slate-700 p-2">
                  Connection No. / Function
                </th>
                <th className="border border-slate-300 dark:border-slate-700 p-2 text-center">
                  Host Station Port No.
                </th>
                <th className="border border-slate-300 dark:border-slate-700 p-2 text-center">
                  Comm Method
                </th>
                <th className="border border-slate-300 dark:border-slate-700 p-2">
                  Destination IP Address
                </th>
                <th className="border border-slate-300 dark:border-slate-700 p-2 text-center">
                  Destination Port
                </th>
                <th className="border border-slate-300 dark:border-slate-700 p-2 text-center">
                  Error Code
                </th>
                <th className="border border-slate-300 dark:border-slate-700 p-2 text-center">
                  Protocol
                </th>
                <th className="border border-slate-300 dark:border-slate-700 p-2 text-center">
                  Open System
                </th>
                <th className="border border-slate-300 dark:border-slate-700 p-2 text-center">
                  TCP Status
                </th>
                <th className="border border-slate-300 dark:border-slate-700 p-2">
                  Remote Password
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-[11px]">
              {diagRows.map((row) => (
                <tr key={row.connectionNo} className="hover:bg-slate-50 dark:hover:bg-slate-900/60">
                  <td className="border border-slate-300 dark:border-slate-800 p-2 font-bold text-slate-800 dark:text-slate-200">
                    {row.connectionNo} - {row.functionName}
                  </td>
                  <td className="border border-slate-300 dark:border-slate-800 p-2 text-center">
                    {portDisplayFormat === 'HEX'
                      ? '0x' + row.hostPort.toString(16).toUpperCase()
                      : row.hostPort}
                  </td>
                  <td className="border border-slate-300 dark:border-slate-800 p-2 text-center font-bold text-cyan-600 dark:text-cyan-400">
                    {row.commMethod}
                  </td>
                  <td className="border border-slate-300 dark:border-slate-800 p-2 font-mono">
                    {ipDisplayFormat === 'HEX' && row.destIp !== '---'
                      ? row.destIp
                          .split('.')
                          .map((x) => Number(x).toString(16).toUpperCase().padStart(2, '0'))
                          .join('.')
                      : row.destIp}
                  </td>
                  <td className="border border-slate-300 dark:border-slate-800 p-2 text-center">
                    {row.destPort === 0
                      ? '---'
                      : portDisplayFormat === 'HEX'
                      ? '0x' + row.destPort.toString(16).toUpperCase()
                      : row.destPort}
                  </td>
                  <td className="border border-slate-300 dark:border-slate-800 p-2 text-center font-bold">
                    <span
                      className={
                        row.latestErrorCode === '0000'
                          ? 'text-emerald-600'
                          : 'text-rose-600'
                      }
                    >
                      {row.latestErrorCode}
                    </span>
                  </td>
                  <td className="border border-slate-300 dark:border-slate-800 p-2 text-center">
                    {row.protocol}
                  </td>
                  <td className="border border-slate-300 dark:border-slate-800 p-2 text-center text-slate-500">
                    {row.openSystem}
                  </td>
                  <td className="border border-slate-300 dark:border-slate-800 p-2 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        row.tcpStatus === 'Established'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {row.tcpStatus}
                    </span>
                  </td>
                  <td className="border border-slate-300 dark:border-slate-800 p-2 text-slate-500 text-[10px]">
                    {row.remotePasswordStatus}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Tool Buttons matching screenshot: PING Test | Clear Latest Error Code */}
        <div className="bg-slate-200 dark:bg-slate-800 px-4 py-2 border-t border-slate-300 dark:border-slate-700 flex items-center justify-between text-xs font-mono">
          <button
            onClick={handlePing}
            className="px-3 py-1 rounded bg-white dark:bg-slate-700 hover:bg-slate-100 border border-slate-300 dark:border-slate-600 font-bold text-slate-800 dark:text-slate-200 transition"
          >
            PING Test
          </button>

          <button
            onClick={handleClearError}
            className="px-3 py-1 rounded bg-white dark:bg-slate-700 hover:bg-slate-100 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 transition"
          >
            Clear Latest Error Code
          </button>
        </div>
      </div>

      {/* View Details Diagnostics Modal */}
      {detailsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 max-w-lg w-full shadow-2xl">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">
              Mitsubishi MELSEC R08CPU Diagnostic Registers
            </h4>
            <div className="space-y-2 text-xs font-mono text-slate-600 dark:text-slate-300 my-4 max-h-60 overflow-y-auto">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span>SD0 (CPU Operating Status):</span>
                <span className="font-bold text-emerald-500">0x0000 (RUN)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span>SD200 (Latest Error Code):</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">0x0000</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span>SD520 (Current Scan Time):</span>
                <span className="font-bold text-cyan-500">10.2 ms</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span>SD521 (Maximum Scan Time):</span>
                <span className="font-bold text-cyan-500">14.8 ms</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span>SD522 (Minimum Scan Time):</span>
                <span className="font-bold text-cyan-500">8.6 ms</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span>Battery Level:</span>
                <span className="font-bold text-emerald-500">3.05 V (Healthy)</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-mono font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
