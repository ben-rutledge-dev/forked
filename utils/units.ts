// Unit conversion utilities for recipe ingredients

export type UnitSystem = 'metric' | 'imperial';
export type UnitCategory = 'volume' | 'weight';

export type UnitMeta = {
  label: string
  abbreviation: string
  system: UnitSystem
  category: UnitCategory
};

// Maps UnitType enum values (as strings) to metadata
export const UNIT_META: Record<string, UnitMeta> = {
  // Volume — metric
  ML: { label: 'Millilitre', abbreviation: 'ml', system: 'metric', category: 'volume' },
  L: { label: 'Litre', abbreviation: 'l', system: 'metric', category: 'volume' },
  // Volume — imperial
  TSP: { label: 'Teaspoon', abbreviation: 'tsp', system: 'imperial', category: 'volume' },
  TBSP: { label: 'Tablespoon', abbreviation: 'tbsp', system: 'imperial', category: 'volume' },
  FL_OZ: { label: 'Fluid ounce', abbreviation: 'fl oz', system: 'imperial', category: 'volume' },
  CUP: { label: 'Cup', abbreviation: 'cup', system: 'imperial', category: 'volume' },
  PT: { label: 'Pint', abbreviation: 'pt', system: 'imperial', category: 'volume' },
  QT: { label: 'Quart', abbreviation: 'qt', system: 'imperial', category: 'volume' },
  GAL: { label: 'Gallon', abbreviation: 'gal', system: 'imperial', category: 'volume' },
  // Weight — metric
  G: { label: 'Gram', abbreviation: 'g', system: 'metric', category: 'weight' },
  KG: { label: 'Kilogram', abbreviation: 'kg', system: 'metric', category: 'weight' },
  // Weight — imperial
  OZ: { label: 'Ounce', abbreviation: 'oz', system: 'imperial', category: 'weight' },
  LB: { label: 'Pound', abbreviation: 'lb', system: 'imperial', category: 'weight' },
};

// Conversion factors relative to base unit (ml for volume, g for weight)
const VOLUME_IN_ML: Record<string, number> = {
  ML: 1,
  L: 1000,
  TSP: 4.92892,
  TBSP: 14.7868,
  FL_OZ: 29.5735,
  CUP: 236.588,
  PT: 473.176,
  QT: 946.353,
  GAL: 3785.41,
};

const WEIGHT_IN_G: Record<string, number> = {
  G: 1,
  KG: 1000,
  OZ: 28.3495,
  LB: 453.592,
};

const conversionFactor = (unit: string): number => {
  if (unit in VOLUME_IN_ML) return VOLUME_IN_ML[unit];
  if (unit in WEIGHT_IN_G) return WEIGHT_IN_G[unit];
  throw new Error(`Unknown unit: ${unit}`);
};

export const convertQuantity = (qty: number, from: string, to: string): number => {
  const fromFactor = conversionFactor(from);
  const toFactor = conversionFactor(to);
  return (qty * fromFactor) / toFactor;
};

export const smartRound = (value: number): number => {
  if (value < 10) return Math.round(value * 10) / 10;
  if (value < 100) return Math.round(value / 5) * 5;
  if (value < 500) return Math.round(value / 10) * 10;
  return Math.round(value / 25) * 25;
};

export const getTargetUnit = (from: string, targetSystem: UnitSystem): string => {
  const meta = UNIT_META[from];
  if (!meta) return from;

  // Already in the right system — no conversion needed
  if (meta.system === targetSystem) return from;

  if (meta.category === 'weight') {
    if (targetSystem === 'imperial') {
      // metric → imperial: threshold at 900g
      return from === 'KG' || (from === 'G' && /* resolved at call site */ false) ? 'LB' : 'OZ';
    }
    // imperial → metric
    return 'G'; // caller applies smartRound and may switch to KG
  }

  // Volume
  if (targetSystem === 'imperial') {
    // metric (ML or L) → imperial: threshold by ml value resolved at call site
    // Return a sentinel; caller must use getTargetVolumeImperial
    return '__VOLUME_ML_TO_IMPERIAL__';
  }

  // imperial → metric
  return '__VOLUME_IMPERIAL_TO_METRIC__';
};

/**
 * Full conversion: given a quantity + source unitKey + target system,
 * returns { quantity, unitKey } after conversion, rounding, and threshold logic.
 * Returns null for units without a unitKey (custom/free-text).
 */
export const convertIngredient = (
  qty: number,
  fromKey: string,
  targetSystem: UnitSystem,
): { quantity: number, unitKey: string } => {
  const meta = UNIT_META[fromKey];
  if (!meta) return { quantity: qty, unitKey: fromKey };
  if (meta.system === targetSystem) return { quantity: qty, unitKey: fromKey };

  if (meta.category === 'weight') {
    if (targetSystem === 'imperial') {
      // Convert to grams first
      const grams = convertQuantity(qty, fromKey, 'G');
      const toUnit = grams < 900 ? 'OZ' : 'LB';
      return { quantity: smartRound(convertQuantity(qty, fromKey, toUnit)), unitKey: toUnit };
    }
    // imperial → metric
    const grams = convertQuantity(qty, fromKey, 'G');
    const toUnit = grams < 1000 ? 'G' : 'KG';
    return { quantity: smartRound(convertQuantity(qty, fromKey, toUnit)), unitKey: toUnit };
  }

  // Volume
  if (targetSystem === 'imperial') {
    // Convert to ml to determine threshold
    const ml = convertQuantity(qty, fromKey, 'ML');
    let toUnit: string;
    if (ml < 15) toUnit = 'TSP';
    else if (ml < 60) toUnit = 'TBSP';
    else if (ml < 240) toUnit = 'FL_OZ';
    else if (ml < 960) toUnit = 'CUP';
    else if (ml < 1893) toUnit = 'PT';
    else if (ml < 3785) toUnit = 'QT';
    else toUnit = 'GAL';
    return { quantity: smartRound(convertQuantity(qty, fromKey, toUnit)), unitKey: toUnit };
  }

  // imperial → metric
  const ml = convertQuantity(qty, fromKey, 'ML');
  let toUnit: string;
  if (['TSP', 'TBSP'].includes(fromKey)) {
    toUnit = 'ML';
  }
  else if (fromKey === 'FL_OZ') {
    toUnit = ml < 100 ? 'ML' : 'L';
  }
  else if (fromKey === 'CUP') {
    toUnit = ml < 1000 ? 'ML' : 'L';
  }
  else {
    // PT, QT, GAL → L
    toUnit = 'L';
  }
  return { quantity: smartRound(convertQuantity(qty, fromKey, toUnit)), unitKey: toUnit };
};

// Vulgar fraction map
const VULGAR_FRACTIONS: [number, string][] = [
  [0.25, '¼'],
  [0.5, '½'],
  [0.75, '¾'],
  [1 / 3, '⅓'],
  [2 / 3, '⅔'],
];

export const formatQuantity = (qty: number): string => {
  if (qty === 0) return '0';
  const whole = Math.floor(qty);
  const frac = qty - whole;

  // Check for vulgar fraction (with small tolerance)
  for (const [val, glyph] of VULGAR_FRACTIONS) {
    if (Math.abs(frac - val) < 0.01) {
      return whole > 0 ? `${whole}${glyph}` : glyph;
    }
  }

  // Whole number
  if (frac < 0.01) return String(whole);

  // One decimal place
  return qty.toFixed(1);
};

// Fraction string mappings for parsing
const UNICODE_FRACTIONS: Record<string, number> = {
  '¼': 0.25,
  '½': 0.5,
  '¾': 0.75,
  '⅓': 1 / 3,
  '⅔': 2 / 3,
  '⅛': 0.125,
  '⅜': 0.375,
  '⅝': 0.625,
  '⅞': 0.875,
};

export const parseQuantity = (input: string): number | null => {
  if (!input || !input.trim()) return null;
  const s = input.trim();

  // Unicode fraction only, e.g. "½"
  if (UNICODE_FRACTIONS[s] !== undefined) return UNICODE_FRACTIONS[s];

  // Mixed: whole + unicode fraction, e.g. "1½"
  for (const [glyph, val] of Object.entries(UNICODE_FRACTIONS)) {
    if (s.endsWith(glyph)) {
      const wholePart = s.slice(0, -glyph.length).trim();
      if (wholePart === '') return val;
      const w = Number(wholePart);
      if (!Number.isNaN(w)) return w + val;
    }
  }

  // Mixed: "1 1/2"
  const mixedMatch = s.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (mixedMatch) {
    return Number(mixedMatch[1]) + Number(mixedMatch[2]) / Number(mixedMatch[3]);
  }

  // Fraction: "1/2"
  const fracMatch = s.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (fracMatch) {
    const denom = Number(fracMatch[2]);
    if (denom === 0) return null;
    return Number(fracMatch[1]) / denom;
  }

  // Plain number or decimal
  const n = Number(s);
  if (!Number.isNaN(n)) return n;

  return null;
};
