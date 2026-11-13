/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Realistic Fluctuating Sample Data for Analysis Graphs
 * (Simulated demonstration data with natural industrial variations)
 */

export interface ProcessTrendPoint {
  timestamp: string;
  tankLevelPercent: number;
  permeateFlowM3h: number;
  recoveryPercent: number;
  powerKw: number;
  feedPressureBar: number;
}

export interface WaterQualityTrendPoint {
  timestamp: string;
  tdsMgL: number;
  conductivityUsCm: number;
  ph: number;
  turbidityNtu: number;
  temperatureC: number;
}

export interface EnergyTrendPoint {
  timestamp: string;
  secKwhM3: number;
  totalPowerKw: number;
  pumpLoadPercent: number;
  permeateM3h: number;
}

/**
 * Generates 48 realistic historical sample data points (e.g. 8 hours at 10-minute intervals)
 * with smooth sinusoidal variations and natural noise.
 */
export function generateProcessTrends(count = 48): ProcessTrendPoint[] {
  const points: ProcessTrendPoint[] = [];
  const startHour = 6; // 06:00

  for (let i = 0; i < count; i++) {
    const totalMinutes = startHour * 60 + i * 10;
    const hours = Math.floor(totalMinutes / 60) % 24;
    const mins = totalMinutes % 60;
    const timeStr = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;

    // Slow sinusoidal cycles for tank levels (filling and emptying cycles)
    const tankCycle = Math.sin((i / count) * Math.PI * 3);
    const tankLevel = 73.5 + tankCycle * 4.8 + Math.sin(i * 0.8) * 0.7;

    // Permeate flow with mild process fluctuations
    const flowCycle = Math.cos((i / count) * Math.PI * 2.5);
    const permeateFlow = 13.5 + flowCycle * 0.42 + Math.sin(i * 1.2) * 0.18;

    // RO recovery stable with subtle variations
    const recovery = 75.0 + Math.sin(i * 0.6) * 0.75 + Math.cos(i * 1.5) * 0.25;

    // Power consumption varies with HP pump load and pressure
    const power = 36.2 + Math.sin(i * 0.9) * 1.1 + flowCycle * 0.4;

    // Feed pressure variations
    const pressure = 15.4 + Math.cos(i * 0.7) * 0.45 + Math.sin(i * 1.4) * 0.2;

    points.push({
      timestamp: timeStr,
      tankLevelPercent: Number(tankLevel.toFixed(1)),
      permeateFlowM3h: Number(permeateFlow.toFixed(2)),
      recoveryPercent: Number(recovery.toFixed(1)),
      powerKw: Number(power.toFixed(1)),
      feedPressureBar: Number(pressure.toFixed(2)),
    });
  }

  return points;
}

/**
 * Generates realistic water quality historical sample data
 */
export function generateWaterQualityTrends(count = 36): WaterQualityTrendPoint[] {
  const points: WaterQualityTrendPoint[] = [];
  const startHour = 8; // 08:00

  for (let i = 0; i < count; i++) {
    const totalMinutes = startHour * 60 + i * 15;
    const hours = Math.floor(totalMinutes / 60) % 24;
    const mins = totalMinutes % 60;
    const timeStr = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;

    // Natural fluctuation in permeate salt passage
    const tds = 26.5 + Math.sin(i * 0.5) * 2.8 + Math.cos(i * 1.1) * 0.9;
    const conductivity = tds * 1.58 + Math.sin(i * 0.7) * 0.8;
    const ph = 6.95 + Math.sin(i * 0.4) * 0.12 + Math.cos(i * 0.9) * 0.05;
    const turbidity = 0.045 + Math.abs(Math.sin(i * 0.6)) * 0.025;
    const temp = 24.6 + Math.sin((i / count) * Math.PI) * 0.8;

    points.push({
      timestamp: timeStr,
      tdsMgL: Number(tds.toFixed(1)),
      conductivityUsCm: Number(conductivity.toFixed(1)),
      ph: Number(ph.toFixed(2)),
      turbidityNtu: Number(turbidity.toFixed(3)),
      temperatureC: Number(temp.toFixed(1)),
    });
  }

  return points;
}

/**
 * Generates 24-hour equipment energy & SEC trend data
 */
export function generateEnergyTrends(count = 24): EnergyTrendPoint[] {
  const points: EnergyTrendPoint[] = [];

  for (let i = 0; i < count; i++) {
    const timeStr = `${String(i).padStart(2, '0')}:00`;
    // Diurnal grid tariff / plant throughput cycle
    const dayFactor = Math.sin(((i - 6) / 24) * Math.PI * 2);
    const sec = 1.82 + dayFactor * 0.08 + Math.sin(i * 0.8) * 0.04;
    const power = 36.2 + dayFactor * 1.8 + Math.cos(i * 1.2) * 0.6;
    const load = 88.0 + dayFactor * 4.5 + Math.sin(i * 1.5) * 1.5;
    const permeate = 13.5 + dayFactor * 0.5 + Math.cos(i * 0.7) * 0.2;

    points.push({
      timestamp: timeStr,
      secKwhM3: Number(sec.toFixed(2)),
      totalPowerKw: Number(power.toFixed(1)),
      pumpLoadPercent: Number(load.toFixed(1)),
      permeateM3h: Number(permeate.toFixed(2)),
    });
  }

  return points;
}
