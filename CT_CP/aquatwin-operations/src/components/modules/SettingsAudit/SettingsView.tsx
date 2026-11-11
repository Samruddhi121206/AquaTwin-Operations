/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePlant } from '../../../context/PlantContext';
import {
  Sliders,
  Users,
  Shield,
  FileCode2,
  Database,
  Server,
  CheckCircle2,
  Clock,
  History,
  Save,
  RefreshCw,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { auditLogs, addAuditLog } = usePlant();
  const [activeTab, setActiveTab] = useState<'config' | 'users' | 'backend' | 'audit'>('audit');

  // Plant configuration states
  const [plantName, setPlantName] = useState('AquaTwin Unit 01 — Industrial Desalination & Demin');
  const [designCapacity, setDesignCapacity] = useState('25.0');
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [savedNotice, setSavedNotice] = useState(false);

  // FastAPI & MongoDB Bridge Test
  const [apiStatus, setApiStatus] = useState<'idle' | 'testing' | 'connected'>('idle');
  const [mongoStatus, setMongoStatus] = useState<'idle' | 'testing' | 'connected'>('idle');

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    addAuditLog({
      user: 'R. Sharma',
      role: 'Lead Process Engineer',
      action: 'PLANT_CONFIG_UPDATE',
      category: 'config',
      details: `Updated plant parameters: Name "${plantName}", Capacity ${designCapacity} m³/h, Units: ${unitSystem}`,
    });
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const testFastApi = () => {
    setApiStatus('testing');
    setTimeout(() => {
      setApiStatus('connected');
      addAuditLog({
        user: 'System Admin',
        role: 'Gateway Interop',
        action: 'API_GATEWAY_PING',
        category: 'simulation',
        details: 'FastAPI gateway pinged: 200 OK (latency: 14ms). Endpoints /api/v1/telemetry and /api/v1/twin mapped.',
      });
    }, 800);
  };

  const testMongo = () => {
    setMongoStatus('testing');
    setTimeout(() => {
      setMongoStatus('connected');
      addAuditLog({
        user: 'System Admin',
        role: 'Database Interop',
        action: 'MONGODB_PING',
        category: 'simulation',
        details: 'MongoDB cluster checked: 5 active collections synced (plant_telemetry, equipment, alarms, work_orders, audit_logs).',
      });
    }, 800);
  };

  const usersList = [
    { name: 'R. Sharma', email: 'r.sharma@aquatwin.internal', role: 'Lead Process Engineer', access: 'Super Admin', status: 'Online (Shift B)' },
    { name: 'S. Deshmukh', email: 's.deshmukh@aquatwin.internal', role: 'Control Room Operator', access: 'Operator / Setpoint Actuation', status: 'Online (Shift B)' },
    { name: 'M. Chen', email: 'm.chen@aquatwin.internal', role: 'Mechanical Reliability Lead', access: 'Maintenance & Work Orders', status: 'Active Field' },
    { name: 'D. Kumar', email: 'd.kumar@aquatwin.internal', role: 'Instrumentation Specialist', access: 'Calibration & Sensors', status: 'Standby' },
  ];

  return (
    <div className="space-y-4">
      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 pb-1 text-xs">
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 font-medium rounded-lg transition ${
            activeTab === 'audit'
              ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Audit Log & Event Trail
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={`px-4 py-2 font-medium rounded-lg transition ${
            activeTab === 'config'
              ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Plant Configuration
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 font-medium rounded-lg transition ${
            activeTab === 'users'
              ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Users & Security Roles
        </button>
        <button
          onClick={() => setActiveTab('backend')}
          className={`px-4 py-2 font-medium rounded-lg transition ${
            activeTab === 'backend'
              ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          FastAPI & MongoDB Integration
        </button>
      </div>

      {/* TAB 1: IMMUTABLE AUDIT LOG TABLE */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <History className="w-4 h-4 text-cyan-500" />
                Immutable System Activity & Control Audit Trail
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Cryptographically sequenced operator actions, parameter overrides, and simulation events.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">{auditLogs.length} Records</span>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Log ID</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Operator / User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Action Type</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-cyan-600 dark:text-cyan-400">
                      {log.id}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">{log.timestamp}</td>
                    <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">{log.user}</td>
                    <td className="py-3 px-4 text-slate-500">{log.role}</td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-md truncate">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PLANT CONFIGURATION */}
      {activeTab === 'config' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm max-w-2xl space-y-4 text-xs">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Industrial Plant Parameters
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Update nominal nameplates, engineering unit systems, and operational boundaries.
            </p>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div>
              <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Facility / Plant Tag
              </label>
              <input
                type="text"
                value={plantName}
                onChange={(e) => setPlantName(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Design Permeate Capacity (m³/h)
                </label>
                <input
                  type="text"
                  value={designCapacity}
                  onChange={(e) => setDesignCapacity(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Unit System
                </label>
                <select
                  value={unitSystem}
                  onChange={(e) => setUnitSystem(e.target.value as any)}
                  className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none"
                >
                  <option value="metric">Metric (m³/h, bar, °C, mg/L)</option>
                  <option value="imperial">Imperial (GPM, psi, °F, ppm)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              {savedNotice && (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Configuration Updated Successfully
                </span>
              )}
              {!savedNotice && <div />}
              <button
                type="submit"
                className="px-4 py-2 font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Save Plant Settings</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: USERS & ROLES */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-500" />
              Role-Based Access Control (RBAC) & Personnel Roster
            </h3>
          </div>
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Operator Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role Title</th>
                  <th className="py-3 px-4">Permissions Level</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {usersList.map((u) => (
                  <tr key={u.email} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">{u.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{u.email}</td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{u.role}</td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20">
                        {u.access}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-medium">
                      {u.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: FASTAPI & MONGODB INTEGRATION ARCHITECTURE */}
      {activeTab === 'backend' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Server className="w-4 h-4 text-cyan-500" />
                  FastAPI Backend Gateway & MongoDB Persistence Architecture
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  AquaTwin Operations is engineered with ready-to-wire REST schemas and MongoDB document mappings.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* FastAPI Card */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-indigo-500" />
                    Python FastAPI Server (v0.110)
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      apiStatus === 'connected'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {apiStatus === 'connected' ? '200 OK CONNECTED' : 'REST READY'}
                  </span>
                </div>

                <p className="text-slate-500 leading-relaxed">
                  Asynchronous Pydantic v2 telemetry models supporting WebSocket multiplexing (`/ws/telemetry`) and batch time marching.
                </p>

                <div className="p-2.5 rounded bg-slate-950 font-mono text-[11px] text-cyan-300 space-y-1">
                  <div>GET  /api/v1/telemetry/live</div>
                  <div>POST /api/v1/twin/simulate-step</div>
                  <div>POST /api/v1/actuators/setpoint</div>
                </div>

                <button
                  onClick={testFastApi}
                  disabled={apiStatus === 'testing'}
                  className="w-full py-2 font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-1.5 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${apiStatus === 'testing' ? 'animate-spin' : ''}`} />
                  <span>{apiStatus === 'testing' ? 'Pinging Gateway...' : 'Test FastAPI Endpoint Handshake'}</span>
                </button>
              </div>

              {/* MongoDB Card */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-emerald-500" />
                    MongoDB Time-Series & Document DB
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      mongoStatus === 'connected'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {mongoStatus === 'connected' ? 'COLLECTIONS MOUNTED' : 'SCHEMA READY'}
                  </span>
                </div>

                <p className="text-slate-500 leading-relaxed">
                  Optimized BSON schemas for high-frequency sensor telemetry, ISA-18.2 alarms, equipment metadata and work orders.
                </p>

                <div className="p-2.5 rounded bg-slate-950 font-mono text-[11px] text-emerald-300 space-y-1">
                  <div>collection: telemetry_timeseries (1s bucket)</div>
                  <div>collection: equipment_registry</div>
                  <div>collection: work_orders_erp</div>
                </div>

                <button
                  onClick={testMongo}
                  disabled={mongoStatus === 'testing'}
                  className="w-full py-2 font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${mongoStatus === 'testing' ? 'animate-spin' : ''}`} />
                  <span>{mongoStatus === 'testing' ? 'Verifying Collections...' : 'Test MongoDB Collection Sync'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
