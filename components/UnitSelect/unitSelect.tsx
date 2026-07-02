'use client';

// Components
import { TextInput } from '@/components/TextInput';
// Utils
import { UNIT_META } from '@/utils/units';

type UnitValue = { unitKey: string | null, unit: string | null };

type UnitSelectProps = {
  unitKey: string | null
  unit: string | null
  onChange: (value: UnitValue) => void
  disabled?: boolean
  customPlaceholder?: string
  customLabel?: string
  ariaLabel?: string
};

const CUSTOM_SENTINEL = '__custom__';
const NONE_SENTINEL = '';

const volumeKeys = ['ML', 'L', 'TSP', 'TBSP', 'FL_OZ', 'CUP', 'PT', 'QT', 'GAL'] as const;
const weightKeys = ['G', 'KG', 'OZ', 'LB'] as const;

const selectClass
  = 'rounded-lg border border-stone-300 dark:border-stone-600 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:border-stone-500 dark:focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 px-2 py-1.5 text-sm w-28 bg-white dark:bg-stone-800';

export const UnitSelect: React.FC<UnitSelectProps> = (props) => {
  const { unitKey, unit, onChange, disabled, customPlaceholder, customLabel, ariaLabel } = props;
  // Derived directly from props — no local state needed
  // unit === '' means custom mode with nothing typed yet; unit === null means no unit selected
  const hasCustomUnit = unit !== null;
  let selectValue = NONE_SENTINEL;
  if (unitKey) selectValue = unitKey;
  else if (hasCustomUnit) selectValue = CUSTOM_SENTINEL;

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === NONE_SENTINEL) {
      onChange({ unitKey: null, unit: null });
    }
    else if (val === CUSTOM_SENTINEL) {
      // Always clear unit when first switching to custom to avoid leaking a structured abbreviation
      onChange({ unitKey: null, unit: '' });
    }
    else {
      onChange({ unitKey: val, unit: null });
    }
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ unitKey: null, unit: e.target.value });
  };

  const isCustom = selectValue === CUSTOM_SENTINEL;

  return (
    <div className={isCustom ? 'flex flex-col gap-1 w-28' : ''}>
      <select
        value={selectValue}
        onChange={handleSelectChange}
        disabled={disabled}
        className={selectClass}
        aria-label={ariaLabel}
      >
        <option value={NONE_SENTINEL}>—</option>
        <optgroup label="Volume">
          {volumeKeys.map(k => (
            <option key={k} value={k}>
              {UNIT_META[k].abbreviation}
            </option>
          ))}
          <option value={CUSTOM_SENTINEL}>{customLabel}</option>
        </optgroup>
        <optgroup label="Weight">
          {weightKeys.map(k => (
            <option key={k} value={k}>
              {UNIT_META[k].abbreviation}
            </option>
          ))}
          <option value={CUSTOM_SENTINEL}>{customLabel}</option>
        </optgroup>
      </select>
      {isCustom && (
        <TextInput
          type="text"
          value={unit ?? ''}
          onChange={handleCustomChange}
          placeholder={customPlaceholder}
          size="sm"
          fullWidth={false}
          className="w-28"
          disabled={disabled}
          autoFocus
        />
      )}
    </div>
  );
};
