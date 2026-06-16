export interface Recipe {
  id: string;
  name: string;
  limeRatio: number;
  cokeRatio: number;
  limeWeight: number;
  cokeWeight: number;
  createdBy: string;
  createdAt: string;
  status: 'active' | 'archived';
}

export interface FeedingRecord {
  id: string;
  batchNo: string;
  siloNo: string;
  material: 'lime' | 'coke';
  weight: number;
  operator: string;
  timestamp: string;
}

export interface ElectrodeFillRecord {
  id: string;
  electrodeNo: string;
  pasteAmount: number;
  operator: string;
  timestamp: string;
}

export interface ElectrodeReleaseRecord {
  id: string;
  electrodeNo: string;
  releaseAmount: number;
  position: number;
  operator: string;
  timestamp: string;
}

export interface FurnaceReading {
  id: string;
  phaseA: number;
  phaseB: number;
  phaseC: number;
  power: number;
  timestamp: string;
}

export interface TemperatureReading {
  id: string;
  pointNo: string;
  temperature: number;
  isAlarm: boolean;
  timestamp: string;
}

export interface TappingRecord {
  id: string;
  tapNo: string;
  burnThroughMethod: string;
  burnDuration: number;
  operator: string;
  startTime: string;
  endTime: string;
}

export interface CastingRecord {
  id: string;
  potNo: string;
  liquidWeight: number;
  operator: string;
  timestamp: string;
}

export interface CrushingRecord {
  id: string;
  batchNo: string;
  coolingHours: number;
  particleSize: string;
  crushedWeight: number;
  operator: string;
  timestamp: string;
}

export interface GasTestRecord {
  id: string;
  batchNo: string;
  gasVolume: number;
  isQualified: boolean;
  tester: string;
  testTime: string;
}

export interface StorageRecord {
  id: string;
  batchNo: string;
  grade: 'premium' | 'first' | 'qualified' | 'offgrade';
  quantity: number;
  warehouse: string;
  operator: string;
  timestamp: string;
}

export interface PowerStatsRecord {
  id: string;
  shift: string;
  date: string;
  powerConsumption: number;
  production: number;
  powerPerTon: number;
}
