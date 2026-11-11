/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface SimulatedBadgeProps {
  verified?: boolean;
  text?: string;
  className?: string;
}

export const SimulatedBadge: React.FC<SimulatedBadgeProps> = ({
  verified = false,
  text = 'SIMULATED / UNVERIFIED',
  className = '',
}) => {
  if (verified) {
    return (
      <span
        className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 ${className}`}
        title="Verified against approved site electrical drawings and P&ID"
      >
        <span>VERIFIED</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 ${className}`}
      title="Engineering drawing pending verification - currently utilizing simulated model"
    >
      <AlertCircle className="w-2.5 h-2.5" />
      <span>{text}</span>
    </span>
  );
};

