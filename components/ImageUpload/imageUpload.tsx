'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRef, useState } from 'react';
// Components
import { CornerDeleteButton } from '@/components/CornerDeleteButton';
import { CameraIcon } from '@/components/Icons';

const uploadToApi = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      const [header, data] = dataUrl.split(',');
      const ext = header.split('/')[1]?.split(';')[0] ?? 'jpg';
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, ext }),
      });
      if (!res.ok) {
        reject(new Error('Upload failed'));
        return;
      }
      const { url } = await res.json();
      resolve(url);
    };
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
};

type Props = {
  value: string
  onChange: (url: string) => void
  onError?: (msg: string) => void
  label?: string
  previewSize?: 'sm' | 'md'
};

export const ImageUpload = ({ value, onChange, onError, label = 'Add photo', previewSize = 'md' }: Props) => {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations('common');

  const previewCls = previewSize === 'sm'
    ? 'w-12 h-8 rounded object-cover border border-stone-200 dark:border-stone-700'
    : 'w-24 h-16 rounded-lg object-cover border border-stone-200 dark:border-stone-700';

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToApi(file);
      onChange(url);
    }
    catch {
      onError?.('Image upload failed');
    }
    finally {
      setUploading(false);
    }
  };

  if (value) {
    return (
      <div className="relative inline-block">
        <Image src={value} alt="" width={previewSize === 'sm' ? 48 : 96} height={previewSize === 'sm' ? 32 : 64} className={previewCls} />
        <CornerDeleteButton
          onClick={() => {
            onChange('');
            if (inputRef.current) inputRef.current.value = '';
          }}
          label="Remove photo"
        />
      </div>
    );
  }

  return (
    <label className={`inline-flex items-center gap-2 cursor-pointer rounded-lg border border-dashed border-stone-300 dark:border-stone-600 px-4 py-2 text-sm text-stone-500 dark:text-stone-400 hover:border-stone-400 dark:hover:border-stone-500 hover:text-stone-700 dark:hover:text-stone-200 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
      <CameraIcon className="w-4 h-4 shrink-0" />
      {uploading ? t('uploading') : label}
      <input ref={inputRef} type="file" accept="image/*" className="sr-only" onChange={handleChange} />
    </label>
  );
};
