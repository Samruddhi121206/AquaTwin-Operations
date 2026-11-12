/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AquaTwin Virtual PLC Driver (Industrial Water Simulation Engine)
 */

import { IPLCDriver } from './IPLCDriver';
import { PLCDriverStatus, TagReadResult, TagWriteResult } from '../types';

export class VirtualPLCDriver implements IPLCDriver {
  readonly id = 'VIRTUAL_PLC_DRIVER';
  readonly name = 'AquaTwin In-Memory Physics Virtual PLC Engine';

  private connected = false;
  private simulationInterval: NodeJS.Timeout | null = null;

  // Internal process simulation state
  private tankLevel = 65.2; // %
  private rawFlow = 12.5; // m³/h
  private feedPressure = 3.2; // bar
  private roPressure = 15.4; // bar
  private p101Running = true;
  private p101Trip = false;
  private p201Running = true;
  private xv101Open = true;

  constructor() {
    this.startSimulationLoop();
  }

  async connect(): Promise<boolean> {
    this.connected = true;
    return true;
  }

  async disconnect(): Promise<boolean> {
    this.connected = false;
    return true;
  }

  isConnected(): boolean {
    return this.connected;
  }

  getStatus(): PLCDriverStatus {
    return {
      connected: this.connected,
      mode: 'VIRTUAL',
      host: '127.0.0.1 (Internal Loopback)',
      port: 5007,
      protocol: 'SLMP_3E_SIMULATED',
      lastCommunicationTime: new Date().toLocaleTimeString(),
      scanTimeMs: 10,
      errorCount: 0,
      lastErrorCode: '0000',
      cpuMode: 'RUN',
      batteryStatus: 'OK',
    };
  }

  private startSimulationLoop() {
    if (this.simulationInterval) clearInterval(this.simulationInterval);

    this.simulationInterval = setInterval(() => {
      // Simulate water flow and tank level oscillation
      const delta = (Math.random() - 0.48) * 0.15;
      this.tankLevel = Math.max(10, Math.min(95, this.tankLevel + delta));

      if (this.p101Running) {
        this.rawFlow = 12.0 + (Math.random() - 0.5) * 0.8;
        this.feedPressure = 3.2 + (Math.random() - 0.5) * 0.1;
      } else {
        this.rawFlow = 0;
        this.feedPressure = 0.2;
      }
    }, 500);
  }

  async readTag(tagId: string, address: string): Promise<TagReadResult> {
    let value: number | boolean | string = 0;
    let rawCounts = 0;

    switch (tagId) {
      case 'TK101_LEVEL':
      case 'D100':
        value = Number(this.tankLevel.toFixed(1));
        rawCounts = Math.round((this.tankLevel / 100) * 32000);
        break;

      case 'FT101_FLOW':
      case 'D102':
        value = Number(this.rawFlow.toFixed(1));
        rawCounts = Math.round((this.rawFlow / 25) * 32000);
        break;

      case 'PT101_PRESSURE':
      case 'D104':
        value = Number(this.feedPressure.toFixed(2));
        rawCounts = Math.round((this.feedPressure / 6) * 32000);
        break;

      case 'RO_FEED_PRESS':
      case 'D106':
        value = Number(this.roPressure.toFixed(1));
        rawCounts = Math.round((this.roPressure / 25) * 32000);
        break;

      case 'P101_RUN_FB':
      case 'P101_RUN_CMD':
      case 'X0.0':
      case 'Y0.0':
        value = this.p101Running;
        break;

      case 'P101_TRIP':
      case 'X0.1':
        value = this.p101Trip;
        break;

      case 'TK101_LSH':
      case 'X0.2':
        value = this.tankLevel > 90;
        break;

      case 'TK101_LSL':
      case 'X0.3':
        value = this.tankLevel < 15;
        break;

      case 'XV101_OPEN_FB':
      case 'XV101_OPEN_CMD':
      case 'X0.4':
      case 'Y0.1':
        value = this.xv101Open;
        break;

      case 'P201_RUN_FB':
      case 'P201_RUN_CMD':
      case 'X0.5':
      case 'Y0.2':
        value = this.p201Running;
        break;

      default:
        value = 0;
        break;
    }

    return {
      tagId,
      address,
      value,
      rawCounts,
      quality: 'GOOD',
      timestamp: new Date().toLocaleTimeString(),
    };
  }

  async readBatch(tags: { tagId: string; address: string }[]): Promise<TagReadResult[]> {
    return Promise.all(tags.map((t) => this.readTag(t.tagId, t.address)));
  }

  async writeTag(
    tagId: string,
    address: string,
    value: number | boolean,
    authorizationToken?: string
  ): Promise<TagWriteResult> {
    if (!authorizationToken) {
      return {
        success: false,
        tagId,
        address,
        valueWritten: value,
        message: 'Write rejected: Authorization token required for PLC command.',
        timestamp: new Date().toLocaleTimeString(),
      };
    }

    if (tagId === 'P101_RUN_CMD' || address === 'Y0.0') {
      this.p101Running = Boolean(value);
    } else if (tagId === 'XV101_OPEN_CMD' || address === 'Y0.1') {
      this.xv101Open = Boolean(value);
    } else if (tagId === 'P201_RUN_CMD' || address === 'Y0.2') {
      this.p201Running = Boolean(value);
    }

    return {
      success: true,
      tagId,
      address,
      valueWritten: value,
      confirmedFeedback: true,
      message: `Virtual PLC Tag "${tagId}" updated successfully.`,
      timestamp: new Date().toLocaleTimeString(),
    };
  }

  async ping(): Promise<{ success: boolean; latencyMs: number; message: string }> {
    return {
      success: true,
      latencyMs: 1,
      message: 'Virtual PLC loopback responded in 1ms (Process healthy)',
    };
  }
}
