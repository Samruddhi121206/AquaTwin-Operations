/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CommandState =
  | 'REQUESTED'
  | 'VALIDATED'
  | 'REJECTED_VALIDATION'
  | 'SENT_TO_PLC'
  | 'PLC_ACCEPTED'
  | 'PLC_REJECTED'
  | 'FEEDBACK_CONFIRMED'
  | 'FEEDBACK_TIMEOUT'
  | 'FAILED';

export interface Command {
  id: string; // "CMD-1042"
  tagId: string; // e.g. "P101.RUN_CMD", "XV101.DEMAND_PCT"
  equipmentTag: string; // e.g. "P-101", "XV-101"
  actionName: string; // e.g. "START_PUMP", "STOP_PUMP", "SET_VALVE_POS"
  targetValue: number | boolean;
  previousValue: number | boolean;
  user: string;
  role: 'operator' | 'supervisor' | 'engineer' | 'admin' | 'system';
  state: CommandState;
  timestamps: Partial<Record<CommandState, string>>;
  reason?: string;
  rejectionMessage?: string;
  feedbackTagId?: string; // e.g. "P101.RUN_FB"
  feedbackReceived?: boolean;
}

export interface CommandValidationResult {
  valid: boolean;
  reason?: string;
}

