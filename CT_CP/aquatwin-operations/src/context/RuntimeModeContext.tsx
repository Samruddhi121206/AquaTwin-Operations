/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState } from 'react';
import { PlcHealth } from '../types/plc';

interface RuntimeModeContextType {
  plcHealth: PlcHealth;
  setMode: (mode: 'VIRTUAL' | 'REAL') => void;
  toggleReadOnly: () => void;
  setProtocol: (protocol: 'VIRTUAL_SCAN' | 'OPC_UA' | 'MODBUS_TCP') => void;
  setConnectionState: (state: 'CONNECTED' | 'RECONNECTING' | 'DISCONNECTED') => void;
}

const RuntimeModeContext = createContext<RuntimeModeContextType | undefined>(undefined);

export const RuntimeModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [plcHealth, setPlcHealth] = useState<PlcHealth>({
    connected: true,
    connectionState: 'CONNECTED',
    mode: 'VIRTUAL',
    protocol: 'VIRTUAL_SCAN',
    ipAddress: '192.168.1.150',
    rack: 0,
    slot: 2,
    firmware: 'SIMATIC S7-1515-2 PN v2.9.2',
    lastHeartbeat: new Date().toLocaleTimeString(),
    latencyMs: 14,
    readOnly: true, // safe industrial default
    activeAlarmsCount: 2,
  });

  const setMode = (mode: 'VIRTUAL' | 'REAL') => {
    setPlcHealth((prev) => ({
      ...prev,
      mode,
      protocol: mode === 'REAL' ? 'OPC_UA' : 'VIRTUAL_SCAN',
      latencyMs: mode === 'REAL' ? 38 : 12,
      // For real PLC, enforce read-only unless specifically unlocked
      readOnly: mode === 'REAL' ? true : prev.readOnly,
    }));
  };

  const toggleReadOnly = () => {
    setPlcHealth((prev) => ({
      ...prev,
      readOnly: !prev.readOnly,
    }));
  };

  const setProtocol = (protocol: 'VIRTUAL_SCAN' | 'OPC_UA' | 'MODBUS_TCP') => {
    setPlcHealth((prev) => ({ ...prev, protocol }));
  };

  const setConnectionState = (connectionState: 'CONNECTED' | 'RECONNECTING' | 'DISCONNECTED') => {
    setPlcHealth((prev) => ({
      ...prev,
      connectionState,
      connected: connectionState === 'CONNECTED',
    }));
  };

  return (
    <RuntimeModeContext.Provider
      value={{
        plcHealth,
        setMode,
        toggleReadOnly,
        setProtocol,
        setConnectionState,
      }}
    >
      {children}
    </RuntimeModeContext.Provider>
  );
};

export const useRuntimeMode = (): RuntimeModeContextType => {
  const context = useContext(RuntimeModeContext);
  if (!context) {
    throw new Error('useRuntimeMode must be used within a RuntimeModeProvider');
  }
  return context;
};

