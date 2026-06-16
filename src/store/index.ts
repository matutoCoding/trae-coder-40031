import { create } from 'zustand';
import type {
  Recipe, FeedingRecord, ElectrodeFillRecord, ElectrodeReleaseRecord,
  FurnaceReading, TemperatureReading, TappingRecord, CastingRecord,
  CrushingRecord, GasTestRecord, StorageRecord, PowerStatsRecord
} from '@/types';

const genId = () => Math.random().toString(36).substring(2, 10);

const now = new Date();
const fmt = (d: Date) => d.toISOString().slice(0, 19).replace('T', ' ');
const hoursAgo = (h: number) => fmt(new Date(now.getTime() - h * 3600000));

export const generateInitialData = () => {
  const initialRecipes: Recipe[] = [
    { id: genId(), name: '标准配比A', limeRatio: 0.62, cokeRatio: 0.38, limeWeight: 620, cokeWeight: 380, createdBy: '张工', createdAt: hoursAgo(120), status: 'active' },
    { id: genId(), name: '高焦配比B', limeRatio: 0.58, cokeRatio: 0.42, limeWeight: 580, cokeWeight: 420, createdBy: '李工', createdAt: hoursAgo(96), status: 'active' },
    { id: genId(), name: '低焦配比C', limeRatio: 0.65, cokeRatio: 0.35, limeWeight: 650, cokeWeight: 350, createdBy: '王工', createdAt: hoursAgo(72), status: 'archived' },
  ];

  const initialFeedings: FeedingRecord[] = [
    { id: genId(), batchNo: 'FL-20260616-001', siloNo: '1#石灰仓', material: 'lime', weight: 3100, operator: '赵明', timestamp: hoursAgo(6) },
    { id: genId(), batchNo: 'FL-20260616-002', siloNo: '2#焦炭仓', material: 'coke', weight: 1900, operator: '赵明', timestamp: hoursAgo(5.5) },
    { id: genId(), batchNo: 'FL-20260616-003', siloNo: '1#石灰仓', material: 'lime', weight: 2900, operator: '钱华', timestamp: hoursAgo(3) },
    { id: genId(), batchNo: 'FL-20260616-004', siloNo: '2#焦炭仓', material: 'coke', weight: 2100, operator: '钱华', timestamp: hoursAgo(2.5) },
    { id: genId(), batchNo: 'FL-20260616-005', siloNo: '1#石灰仓', material: 'lime', weight: 3000, operator: '孙磊', timestamp: hoursAgo(1) },
    { id: genId(), batchNo: 'FL-20260616-006', siloNo: '2#焦炭仓', material: 'coke', weight: 1800, operator: '孙磊', timestamp: hoursAgo(0.5) },
  ];

  const initialElectrodeFills: ElectrodeFillRecord[] = [
    { id: genId(), electrodeNo: '1#电极', pasteAmount: 120, operator: '刘强', timestamp: hoursAgo(24) },
    { id: genId(), electrodeNo: '2#电极', pasteAmount: 115, operator: '刘强', timestamp: hoursAgo(23) },
    { id: genId(), electrodeNo: '3#电极', pasteAmount: 118, operator: '周涛', timestamp: hoursAgo(22) },
    { id: genId(), electrodeNo: '1#电极', pasteAmount: 125, operator: '周涛', timestamp: hoursAgo(4) },
    { id: genId(), electrodeNo: '2#电极', pasteAmount: 110, operator: '吴辉', timestamp: hoursAgo(3) },
    { id: genId(), electrodeNo: '3#电极', pasteAmount: 122, operator: '吴辉', timestamp: hoursAgo(2) },
  ];

  const initialElectrodeReleases: ElectrodeReleaseRecord[] = [
    { id: genId(), electrodeNo: '1#电极', releaseAmount: 30, position: 1850, operator: '刘强', timestamp: hoursAgo(48) },
    { id: genId(), electrodeNo: '2#电极', releaseAmount: 28, position: 1820, operator: '刘强', timestamp: hoursAgo(47) },
    { id: genId(), electrodeNo: '3#电极', releaseAmount: 32, position: 1860, operator: '周涛', timestamp: hoursAgo(46) },
    { id: genId(), electrodeNo: '1#电极', releaseAmount: 25, position: 1875, operator: '周涛', timestamp: hoursAgo(8) },
    { id: genId(), electrodeNo: '2#电极', releaseAmount: 30, position: 1850, operator: '吴辉', timestamp: hoursAgo(7) },
    { id: genId(), electrodeNo: '3#电极', releaseAmount: 27, position: 1887, operator: '吴辉', timestamp: hoursAgo(6) },
  ];

  const genFurnaceReadings = (): FurnaceReading[] => {
    const readings: FurnaceReading[] = [];
    for (let i = 23; i >= 0; i--) {
      readings.push({
        id: genId(),
        phaseA: 28000 + Math.round(Math.random() * 4000),
        phaseB: 27500 + Math.round(Math.random() * 4000),
        phaseC: 29000 + Math.round(Math.random() * 4000),
        power: 16500 + Math.round(Math.random() * 3000),
        timestamp: hoursAgo(i),
      });
    }
    return readings;
  };

  const genTemperatureReadings = (): TemperatureReading[] => {
    const readings: TemperatureReading[] = [];
    const points = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8'];
    for (let i = 11; i >= 0; i--) {
      points.forEach(p => {
        const temp = 800 + Math.round(Math.random() * 500);
        readings.push({
          id: genId(),
          pointNo: p,
          temperature: temp,
          isAlarm: temp > 1150,
          timestamp: hoursAgo(i),
        });
      });
    }
    return readings;
  };

  const initialTappings: TappingRecord[] = [
    { id: genId(), tapNo: 'TP-20260616-01', burnThroughMethod: '烧穿器', burnDuration: 12, operator: '郑伟', startTime: hoursAgo(18), endTime: hoursAgo(17.5) },
    { id: genId(), tapNo: 'TP-20260616-02', burnThroughMethod: '烧穿器', burnDuration: 10, operator: '郑伟', startTime: hoursAgo(12), endTime: hoursAgo(11.5) },
    { id: genId(), tapNo: 'TP-20260616-03', burnThroughMethod: '氧管烧穿', burnDuration: 15, operator: '陈刚', startTime: hoursAgo(6), endTime: hoursAgo(5.5) },
    { id: genId(), tapNo: 'TP-20260616-04', burnThroughMethod: '烧穿器', burnDuration: 11, operator: '陈刚', startTime: hoursAgo(1), endTime: hoursAgo(0.5) },
  ];

  const initialCastings: CastingRecord[] = [
    { id: genId(), potNo: '锅-01', liquidWeight: 2800, operator: '郑伟', timestamp: hoursAgo(17.5) },
    { id: genId(), potNo: '锅-02', liquidWeight: 2950, operator: '郑伟', timestamp: hoursAgo(17) },
    { id: genId(), potNo: '锅-03', liquidWeight: 2700, operator: '陈刚', timestamp: hoursAgo(11.5) },
    { id: genId(), potNo: '锅-04', liquidWeight: 2850, operator: '陈刚', timestamp: hoursAgo(11) },
    { id: genId(), potNo: '锅-05', liquidWeight: 2600, operator: '陈刚', timestamp: hoursAgo(5.5) },
    { id: genId(), potNo: '锅-06', liquidWeight: 2900, operator: '陈刚', timestamp: hoursAgo(5) },
    { id: genId(), potNo: '锅-07', liquidWeight: 2750, operator: '陈刚', timestamp: hoursAgo(0.5) },
  ];

  const initialCrushings: CrushingRecord[] = [
    { id: genId(), batchNo: 'CR-20260615-01', coolingHours: 6, particleSize: '50-200mm', crushedWeight: 5400, operator: '马超', timestamp: hoursAgo(30) },
    { id: genId(), batchNo: 'CR-20260615-02', coolingHours: 5, particleSize: '50-200mm', crushedWeight: 5600, operator: '马超', timestamp: hoursAgo(26) },
    { id: genId(), batchNo: 'CR-20260616-01', coolingHours: 6, particleSize: '50-200mm', crushedWeight: 5200, operator: '黄磊', timestamp: hoursAgo(8) },
    { id: genId(), batchNo: 'CR-20260616-02', coolingHours: 5, particleSize: '50-200mm', crushedWeight: 5500, operator: '黄磊', timestamp: hoursAgo(4) },
  ];

  const initialGasTests: GasTestRecord[] = [
    { id: genId(), batchNo: 'CR-20260615-01', gasVolume: 295, isQualified: true, tester: '林敏', testTime: hoursAgo(28) },
    { id: genId(), batchNo: 'CR-20260615-02', gasVolume: 305, isQualified: true, tester: '林敏', testTime: hoursAgo(24) },
    { id: genId(), batchNo: 'CR-20260616-01', gasVolume: 278, isQualified: false, tester: '林敏', testTime: hoursAgo(6) },
    { id: genId(), batchNo: 'CR-20260616-02', gasVolume: 298, isQualified: true, tester: '林敏', testTime: hoursAgo(2) },
  ];

  const initialStorages: StorageRecord[] = [
    { id: genId(), batchNo: 'CR-20260615-01', grade: 'first', quantity: 5400, warehouse: 'A区1号库', operator: '马超', timestamp: hoursAgo(27) },
    { id: genId(), batchNo: 'CR-20260615-02', grade: 'premium', quantity: 5600, warehouse: 'A区1号库', operator: '马超', timestamp: hoursAgo(23) },
    { id: genId(), batchNo: 'CR-20260616-01', grade: 'qualified', quantity: 5200, warehouse: 'B区2号库', operator: '黄磊', timestamp: hoursAgo(5) },
    { id: genId(), batchNo: 'CR-20260616-02', grade: 'first', quantity: 5500, warehouse: 'A区1号库', operator: '黄磊', timestamp: hoursAgo(1) },
  ];

  const initialPowerStats: PowerStatsRecord[] = [];
  const shifts = ['甲班', '乙班', '丙班'];
  for (let d = 6; d >= 0; d--) {
    shifts.forEach((shift) => {
      const prod = 8000 + Math.round(Math.random() * 4000);
      const pc = 30000 + Math.round(Math.random() * 8000);
      initialPowerStats.push({
        id: genId(),
        shift,
        date: new Date(now.getTime() - d * 86400000).toISOString().slice(0, 10),
        powerConsumption: pc,
        production: prod,
        powerPerTon: Math.round(pc / prod * 100) / 100,
      });
    });
  }

  return {
    recipes: initialRecipes,
    feedings: initialFeedings,
    electrodeFills: initialElectrodeFills,
    electrodeReleases: initialElectrodeReleases,
    furnaceReadings: genFurnaceReadings(),
    temperatureReadings: genTemperatureReadings(),
    tappings: initialTappings,
    castings: initialCastings,
    crushings: initialCrushings,
    gasTests: initialGasTests,
    storages: initialStorages,
    powerStats: initialPowerStats,
  };
};

const STORAGE_KEY = 'carbide-workshop-data';

const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to load from localStorage', e);
  }
  return null;
};

const saved = loadFromStorage();
const initial = saved || generateInitialData();

interface StoreState {
  recipes: Recipe[];
  feedings: FeedingRecord[];
  electrodeFills: ElectrodeFillRecord[];
  electrodeReleases: ElectrodeReleaseRecord[];
  furnaceReadings: FurnaceReading[];
  temperatureReadings: TemperatureReading[];
  tappings: TappingRecord[];
  castings: CastingRecord[];
  crushings: CrushingRecord[];
  gasTests: GasTestRecord[];
  storages: StorageRecord[];
  powerStats: PowerStatsRecord[];

  addRecipe: (r: Omit<Recipe, 'id'>) => void;
  updateRecipe: (id: string, r: Partial<Recipe>) => void;
  addFeeding: (f: Omit<FeedingRecord, 'id'>) => void;
  addElectrodeFill: (f: Omit<ElectrodeFillRecord, 'id'>) => void;
  addElectrodeRelease: (f: Omit<ElectrodeReleaseRecord, 'id'>) => void;
  addTapping: (t: Omit<TappingRecord, 'id'>) => void;
  addCasting: (c: Omit<CastingRecord, 'id'>) => void;
  addCrushing: (c: Omit<CrushingRecord, 'id'>) => void;
  addGasTest: (g: Omit<GasTestRecord, 'id'>) => void;
  addStorage: (s: Omit<StorageRecord, 'id'>) => void;

  resetToInitial: () => void;
  clearAllDemo: () => void;
}

const persist = (state: Partial<StoreState>) => {
  try {
    const data: Record<string, unknown> = {};
    (['recipes', 'feedings', 'electrodeFills', 'electrodeReleases',
      'tappings', 'castings', 'crushings', 'gasTests', 'storages', 'powerStats'] as const).forEach(k => {
      if (k in state) data[k] = state[k as keyof StoreState];
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to persist to localStorage', e);
  }
};

export const useStore = create<StoreState>((set, get) => ({
  ...initial,

  addRecipe: (r) => {
    const newRecipes = [{ ...r, id: genId() }, ...get().recipes];
    set({ recipes: newRecipes });
    persist({ recipes: newRecipes });
  },
  updateRecipe: (id, r) => {
    const newRecipes = get().recipes.map(x => x.id === id ? { ...x, ...r } : x);
    set({ recipes: newRecipes });
    persist({ recipes: newRecipes });
  },
  addFeeding: (f) => {
    const newFeedings = [{ ...f, id: genId() }, ...get().feedings];
    set({ feedings: newFeedings });
    persist({ feedings: newFeedings });
  },
  addElectrodeFill: (f) => {
    const newFills = [{ ...f, id: genId() }, ...get().electrodeFills];
    set({ electrodeFills: newFills });
    persist({ electrodeFills: newFills });
  },
  addElectrodeRelease: (f) => {
    const newRels = [{ ...f, id: genId() }, ...get().electrodeReleases];
    set({ electrodeReleases: newRels });
    persist({ electrodeReleases: newRels });
  },
  addTapping: (t) => {
    const newTaps = [{ ...t, id: genId() }, ...get().tappings];
    set({ tappings: newTaps });
    persist({ tappings: newTaps });
  },
  addCasting: (c) => {
    const newCasts = [{ ...c, id: genId() }, ...get().castings];
    set({ castings: newCasts });
    persist({ castings: newCasts });
  },
  addCrushing: (c) => {
    const newCrush = [{ ...c, id: genId() }, ...get().crushings];
    set({ crushings: newCrush });
    persist({ crushings: newCrush });
  },
  addGasTest: (g) => {
    const newTests = [{ ...g, id: genId() }, ...get().gasTests];
    set({ gasTests: newTests });
    persist({ gasTests: newTests });
  },
  addStorage: (s2) => {
    const newStores = [{ ...s2, id: genId() }, ...get().storages];
    set({ storages: newStores });
    persist({ storages: newStores });
  },

  resetToInitial: () => {
    const fresh = generateInitialData();
    set(fresh);
    persist(fresh);
  },

  clearAllDemo: () => {
    const fresh = generateInitialData();
    const cleared = {
      recipes: fresh.recipes,
      feedings: [] as FeedingRecord[],
      electrodeFills: [] as ElectrodeFillRecord[],
      electrodeReleases: [] as ElectrodeReleaseRecord[],
      furnaceReadings: fresh.furnaceReadings,
      temperatureReadings: fresh.temperatureReadings,
      tappings: [] as TappingRecord[],
      castings: [] as CastingRecord[],
      crushings: [] as CrushingRecord[],
      gasTests: [] as GasTestRecord[],
      storages: [] as StorageRecord[],
      powerStats: fresh.powerStats,
    };
    set(cleared);
    persist(cleared);
  },
}));
