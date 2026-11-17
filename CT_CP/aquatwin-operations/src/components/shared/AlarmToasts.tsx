/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';
import { usePlant } from '../../context/PlantContext';
import { AlarmItem } from '../../types/plant';

const TONE: Record<AlarmItem['severity'], string> = {
  critical: 'border-rose-500/50 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-200',
  warning: 'border-amber-500/50 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-200',
  advisory: 'border-cyan-500/50 bg-cyan-50 dark:bg-navy text-cyan-700 dark:text-cyan-200',
};

export const AlarmToasts: React.FC = () => {
  const { alarms, setActiveModule } = usePlant();
  const [toasts, setToasts] = useState<AlarmItem[]>([]);
  const seen = useRef<Set<string>>(new Set(alarms.map((a) => a.id)));

  useEffect(() => {
    const fresh = alarms.filter((a) => !seen.current.has(a.id));
    if (fresh.length === 0) return;
    fresh.forEach((a) => seen.current.add(a.id));
    setToasts((prev) => [...prev, ...fresh].slice(-3));

    const timers = fresh.map((a) =>
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== a.id)), 5000)
    );
    return () => timers.forEach(clearTimeout);
  }, [alarms]);

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <div className="fixed top-16 right-4 z-50 flex flex-col gap-2 w-[320px] pointer-events-none">
      <AnimatePresence initial={false}>
        {toasts.map((a) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={() => {
              setActiveModule('alarms');
              dismiss(a.id);
            }}
            className={`pointer-events-auto cursor-pointer rounded-xl border shadow-lg px-3 py-2.5 flex items-start gap-2.5 ${TONE[a.severity]}`}
          >
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold uppercase tracking-wider opacity-80">
                {a.severity} · {a.tag}
              </div>
              <div className="text-xs font-semibold truncate">{a.message}</div>
              <div className="text-[11px] opacity-70 font-mono">{a.value}</div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                dismiss(a.id);
              }}
              className="opacity-60 hover:opacity-100 transition shrink-0"
              aria-label="Dismiss alarm notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
