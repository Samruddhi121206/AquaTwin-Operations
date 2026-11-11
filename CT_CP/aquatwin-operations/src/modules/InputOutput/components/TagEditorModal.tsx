/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ExtendedPlcTag } from '../types';
import { X, Check, Sliders, ShieldCheck } from 'lucide-react';

interface TagEditorModalProps {
  tag: ExtendedPlcTag;
  onSave: (updated: ExtendedPlcTag) => void;
  onClose: () => void;
}

export const TagEditorModal: React.FC<TagEditorModalProps> = ({ tag, onSave, onClose }) => {
  const [formData, setFormData] = useState<ExtendedPlcTag>({ ...tag });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono">
                Edit Tag: {formData.id}
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 font-mono">
                {formData.type}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Engineering calibration, linear scaling, and alarm threshold configuration
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-slate-500 text-[11px] mb-1 font-bold">
              Tag Description / Field Instrument
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 text-[11px] mb-1 font-bold">
                PLC Device Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold text-cyan-600 dark:text-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-500 text-[11px] mb-1 font-bold">
                Cabinet Terminal Strip Ref
              </label>
              <input
                type="text"
                value={formData.terminal}
                onChange={(e) => setFormData({ ...formData, terminal: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Scaling Fields if Analog */}
          {(formData.type === 'AI' || formData.type === 'AO') && (
            <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                Linear Scaling Formula Parameters (4-20mA Transmitter)
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 text-[10px] mb-0.5">Raw Min (Counts)</label>
                  <input
                    type="number"
                    value={formData.scaling.rawMin}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        scaling: { ...formData.scaling, rawMin: Number(e.target.value) },
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] mb-0.5">Raw Max (Counts)</label>
                  <input
                    type="number"
                    value={formData.scaling.rawMax}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        scaling: { ...formData.scaling, rawMax: Number(e.target.value) },
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] mb-0.5">Eng Min (Process Val)</label>
                  <input
                    type="number"
                    step={0.1}
                    value={formData.scaling.engMin}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        scaling: { ...formData.scaling, engMin: Number(e.target.value) },
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] mb-0.5">Eng Max (Process Val)</label>
                  <input
                    type="number"
                    step={0.1}
                    value={formData.scaling.engMax}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        scaling: { ...formData.scaling, engMax: Number(e.target.value) },
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] mb-0.5">Engineering Unit</label>
                <input
                  type="text"
                  value={formData.scaling.unit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      scaling: { ...formData.scaling, unit: e.target.value },
                    })
                  }
                  className="w-full px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          )}

          {/* Verification Status */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                Verification Status
              </span>
              <span className="text-[10px] text-slate-400">
                Marking VERIFIED indicates real hardware online confirmation
              </span>
            </div>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="CONFIGURED">CONFIGURED</option>
              <option value="VERIFIED">VERIFIED</option>
              <option value="UNAVAILABLE">UNAVAILABLE</option>
              <option value="DISABLED">DISABLED</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Save Tag Calibration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
