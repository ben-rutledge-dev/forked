'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
// Components
import { Button } from '@/components/Button';
import { Checkbox } from '@/components/Checkbox';
import { CornerDeleteButton } from '@/components/CornerDeleteButton';
import { FormBanner } from '@/components/FormBanner';
import { FormField } from '@/components/FormField';
import { FormUrl } from '@/components/FormUrl';
import { Textarea } from '@/components/Textarea';
import { TextInput } from '@/components/TextInput';
import { Toast } from '@/components/Toast';
import { SectionHeading } from '@/components/Typography';
// Types
import { UserProfile } from '@/types';

const uploadImage = async (file: File): Promise<string> => {
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

export const ProfileForm = ({ user }: { user: UserProfile }) => {
  const router = useRouter();
  const t = useTranslations('myProfile');

  const [fields, setFields] = useState({
    username: user.username ?? '',
    bio: user.bio ?? '',
    isPublic: user.isPublic,
    avatarUrl: user.avatarUrl ?? '',
    coverImageUrl: user.coverImageUrl ?? '',
    websiteUrl: user.websiteUrl ?? '',
    twitterHandle: user.twitterHandle ?? '',
    instagramHandle: user.instagramHandle ?? '',
    youtubeUrl: user.youtubeUrl ?? '',
    showName: user.showName,
  });
  const setField = <K extends keyof typeof fields>(key: K, value: (typeof fields)[K]) =>
    setFields(prev => ({ ...prev, [key]: value }));

  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      setField('avatarUrl', await uploadImage(file));
    }
    catch {
      setErrorMsg(t('avatarUploadFailed'));
      setStatus('error');
    }
    finally {
      setAvatarUploading(false);
    }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverUploading(true);
    try {
      setField('coverImageUrl', await uploadImage(file));
    }
    catch {
      setErrorMsg(t('coverUploadFailed'));
      setStatus('error');
    }
    finally {
      setCoverUploading(false);
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('saving');
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: fields.username.trim() || null,
          bio: fields.bio.trim() || null,
          isPublic: fields.isPublic,
          showName: fields.showName,
          avatarUrl: fields.avatarUrl || null,
          coverImageUrl: fields.coverImageUrl || null,
          websiteUrl: fields.websiteUrl.trim() || null,
          twitterHandle: fields.twitterHandle.trim() || null,
          instagramHandle: fields.instagramHandle.trim() || null,
          youtubeUrl: fields.youtubeUrl.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setErrorMsg(data.error ?? t('uploadFailed'));
        setStatus('error');
        return;
      }
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 4000);
      router.refresh();
    }
    finally {
      setStatus(s => s === 'saving' ? 'idle' : s);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {status === 'error' && <FormBanner type="error" message={errorMsg} />}
      {status === 'saved' && <Toast message={t('saved')} />}

      {/* Photos */}
      <div className="space-y-5">
        {/* Cover photo */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">{t('coverPhotoLabel')}</label>
          {fields.coverImageUrl
            ? (
                <div className="relative block h-32">
                  <div className="absolute inset-0 rounded-xl overflow-hidden border border-stone-200">
                    <Image src={fields.coverImageUrl} alt={t('coverPhotoAlt')} fill className="object-cover" sizes="100vw" />
                  </div>
                  <CornerDeleteButton
                    onClick={() => {
                      setField('coverImageUrl', '');
                      if (coverInputRef.current) coverInputRef.current.value = '';
                    }}
                    label="Remove cover photo"
                  />
                </div>
              )
            : (
                <label className={`flex items-center gap-2 cursor-pointer rounded-xl border border-dashed border-stone-300 px-4 py-3 text-sm text-stone-500 hover:border-stone-400 hover:text-stone-700 transition-colors ${coverUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
                    <path fillRule="evenodd" d="M1 8a2 2 0 0 1 2-2h.93a2 2 0 0 0 1.664-.89l.812-1.22A2 2 0 0 1 8.07 3h3.86a2 2 0 0 1 1.664.89l.812 1.22A2 2 0 0 0 16.07 6H17a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8Zm13.5 3a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM10 14a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
                  </svg>
                  {coverUploading ? t('uploading') : t('addCoverPhoto')}
                  <input ref={coverInputRef} type="file" accept="image/*" className="sr-only" onChange={handleCoverChange} />
                </label>
              )}
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            {fields.avatarUrl
              ? (
                  <>
                    <Image src={fields.avatarUrl} alt={t('avatarAlt')} width={64} height={64} className="w-16 h-16 rounded-full object-cover border border-stone-200" />
                    <CornerDeleteButton
                      onClick={() => {
                        setField('avatarUrl', '');
                        if (avatarInputRef.current) avatarInputRef.current.value = '';
                      }}
                      label="Remove profile photo"
                      positionClassName="-top-1 -right-1"
                    />
                  </>
                )
              : (
                  <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
          </div>
          <label className={`cursor-pointer text-sm text-stone-500 hover:text-stone-700 transition-colors ${avatarUploading ? 'opacity-50 pointer-events-none' : ''}`}>
            {avatarUploading ? t('uploading') : fields.avatarUrl ? t('changeProfilePhoto') : t('addProfilePhoto')}
            <input ref={avatarInputRef} type="file" accept="image/*" className="sr-only" onChange={handleAvatarChange} />
          </label>
        </div>
      </div>

      {/* Identity */}
      <div className="space-y-4">
        <FormField
          htmlFor="username"
          label={(
            <>
              {t('usernameLabel')}
              <span className="text-stone-400 font-normal">{t('usernameHint')}</span>
            </>
          )}
          hint={t('usernameFormat')}
        >
          <TextInput
            id="username"
            type="text"
            value={fields.username}
            onChange={e => setField('username', e.target.value)}
            placeholder={t('usernamePlaceholder')}
            prefix={t('usernamePrefix')}
          />
        </FormField>

        <FormField htmlFor="bio" label={t('bioLabel')}>
          <Textarea
            id="bio"
            value={fields.bio}
            onChange={e => setField('bio', e.target.value)}
            rows={3}
            placeholder={t('bioPlaceholder')}
          />
        </FormField>

        <Checkbox
          checked={fields.showName}
          onChange={e => setField('showName', e.target.checked)}
          label={t('showNameLabel')}
          description={t('showNameDescription')}
        />
      </div>

      {/* Social links */}
      <div className="space-y-4">
        <SectionHeading>
          {t('linksHeading')}
          {' '}
          <span className="text-sm font-normal text-stone-400">{t('linksOptional')}</span>
        </SectionHeading>
        <FormField htmlFor="websiteUrl" label={t('websiteLabel')}>
          <FormUrl
            id="websiteUrl"
            value={fields.websiteUrl}
            onChange={v => setField('websiteUrl', v)}
            placeholder={t('websitePlaceholder')}
          />
        </FormField>
        <FormField htmlFor="twitter" label={t('twitterLabel')}>
          <TextInput
            id="twitter"
            type="text"
            value={fields.twitterHandle}
            onChange={e => setField('twitterHandle', e.target.value)}
            placeholder={t('handlePlaceholder')}
            prefix="@"
          />
        </FormField>
        <FormField htmlFor="instagram" label={t('instagramLabel')}>
          <TextInput
            id="instagram"
            type="text"
            value={fields.instagramHandle}
            onChange={e => setField('instagramHandle', e.target.value)}
            placeholder={t('handlePlaceholder')}
            prefix="@"
          />
        </FormField>
        <FormField htmlFor="youtube" label={t('youtubeLabel')}>
          <FormUrl
            id="youtube"
            value={fields.youtubeUrl}
            onChange={v => setField('youtubeUrl', v)}
            placeholder={t('youtubePlaceholder')}
          />
        </FormField>
      </div>

      {/* Visibility */}
      <div>
        <SectionHeading className="mb-3">{t('visibilityHeading')}</SectionHeading>
        <Checkbox
          checked={fields.isPublic}
          onChange={e => setField('isPublic', e.target.checked)}
          label={t('makePublicLabel')}
          description={t('makePublicDescription')}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="neutral" size="lg" shape="pill" disabled={status === 'saving'}>
          {status === 'saving' ? t('saving') : t('saveProfile')}
        </Button>
        <Button type="button" variant="secondary" size="lg" shape="pill" onClick={() => router.back()}>
          {t('cancel')}
        </Button>
      </div>
    </form>
  );
};
