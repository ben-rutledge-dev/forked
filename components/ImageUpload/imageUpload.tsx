'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
// Components
import { CornerDeleteButton } from '@/components/CornerDeleteButton';

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

  const previewCls = previewSize === 'sm'
    ? 'w-12 h-8 rounded object-cover border border-stone-200'
    : 'w-24 h-16 rounded-lg object-cover border border-stone-200';

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
        <Image src={value} alt="" className={previewCls} />
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
    <label className={`inline-flex items-center gap-2 cursor-pointer rounded-lg border border-dashed border-stone-300 px-4 py-2 text-sm text-stone-500 hover:border-stone-400 hover:text-stone-700 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
        <path fillRule="evenodd" d="M1 8a2 2 0 0 1 2-2h.93a2 2 0 0 0 1.664-.89l.812-1.22A2 2 0 0 1 8.07 3h3.86a2 2 0 0 1 1.664.89l.812 1.22A2 2 0 0 0 16.07 6H17a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8Zm13.5 3a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM10 14a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
      </svg>
      {uploading ? 'Uploading…' : label}
      <input ref={inputRef} type="file" accept="image/*" className="sr-only" onChange={handleChange} />
    </label>
  );
};
