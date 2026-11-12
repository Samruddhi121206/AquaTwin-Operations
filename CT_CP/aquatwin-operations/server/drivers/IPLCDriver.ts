/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AquaTwin Industrial PLC Driver Interface
 */

import { PLCDriverStatus, TagReadResult, TagWriteResult } from '../types';

export interface IPLCDriver {
  readonly id: string;
  readonly name: string;

  connect(): Promise<boolean>;
  disconnect(): Promise<boolean>;
  isConnected(): boolean;
  getStatus(): PLCDriverStatus;

  readTag(tagId: string, address: string): Promise<TagReadResult>;
  readBatch(tags: { tagId: string; address: string }[]): Promise<TagReadResult[]>;

  writeTag(
    tagId: string,
    address: string,
    value: number | boolean,
    authorizationToken?: string
  ): Promise<TagWriteResult>;

  ping(): Promise<{ success: boolean; latencyMs: number; message: string }>;
}
