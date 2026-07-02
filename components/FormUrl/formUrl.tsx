import React from 'react';
// Components
import { TextInput } from '@/components/TextInput';

const normalizeUrl = (value: string): string => {
  const v = value.trim();
  if (!v) return '';
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
};

type FormUrlProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'size'> & {
  value: string
  onChange: (value: string) => void
};

export const FormUrl: React.FC<FormUrlProps> = (props) => {
  const { value, onChange, onBlur, ...rest } = props;
  return (
    <TextInput
      type="url"
      value={value}
      onChange={e => onChange(e.target.value)}
      onBlur={(e) => {
        const normalized = normalizeUrl(e.target.value);
        if (normalized !== e.target.value) onChange(normalized);
        if (typeof onBlur === 'function') onBlur(e);
      }}
      {...rest}
    />
  );
};
