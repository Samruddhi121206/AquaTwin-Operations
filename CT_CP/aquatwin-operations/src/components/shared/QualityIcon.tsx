/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DataQuality } from '../../types/plc';
import { CheckCircle2, AlertTriangle, XCircle, Clock, Cpu } from 'lucide-react';

interface QualityIconProps {
  quality: DataQuality;
  timestamp?: string;
  className?: string;
  showText?: boolean;
}

export const QualityIcon: React.FC<QualityIconProps> = ({
  quality,
  timestamp,
  className = '',
  showText = false,
}) => {
  const configs: Record<
    DataQuality,
    { label: string; color: string; icon: React.ElementType; desc: string }
  > = {
    GOOD: {
      label: 'GOOD',
      color: 'text-emerald-500',
      icon: CheckCircle2,
      desc: 'Telemetry signal within valid physical range & healthy',
    },
    UNCERTAIN: {
      label: 'UNCERTAIN',
      color: 'text-amber-500',
      icon: AlertTriangle,
      desc: 'Value derived, substituted, or near threshold limits',
    },
    BAD: {
      label: 'BAD',
      color: 'text-rose-500',
      icon: XCircle,
      desc: 'Sensor wire break, short circuit, or hardware fault',
    },
    STALE: {
      label: 'STALE',
      color: 'text-slate-400',
      icon: Clock,
      desc: 'Telemetry heartbeat lost, value has not refreshed',
    },
    SIMULATED: {
      label: 'SIMULATED',
      color: 'text-cyan-500',
      icon: Cpu,
      desc: 'Synthesized via Virtual PLC physics model',
    },
  };

  const current = configs[quality] || configs.GOOD;
  const Icon = current.icon;

  return (
    <div
      className={`inline-flex items-center gap-1 text-[11px] font-mono ${current.color} ${className}`}
      title={`${current.label}: ${current.desc}${timestamp ? ` (${timestamp})` : ''}`}
    >
      <Icon className="w-3 h-3 shrink-0" />
      {showText && <span>{current.label}</span>}
    </div>
  );
};

