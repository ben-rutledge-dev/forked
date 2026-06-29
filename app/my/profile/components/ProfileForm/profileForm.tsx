'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
// Components
import { Button } from '@/components/Button';
import { Checkbox } from '@/components/Checkbox';
import { CornerDeleteButton } from '@/components/CornerDeleteButton';
import { FormBanner } from '@/components/FormBanner';
import { FormField } from '@/components/FormField';
import { FormUrl } from '@/components/FormUrl';
import { CameraIcon, UserIcon } from '@/components/Icons';
import { Textarea } from '@/components/Textarea';
import { TextInput } from '@/components/TextInput';
import { Toast } from '@/components/Toast';
import { SectionHeading } from '@/components/Typography';
// Types
import { UserProfile } from '@/types';

const isValidUrl = (v: string) => {
  if (!v) return true;
  try { new URL(v); return true; }
  catch { return false; }
};

const profileSchema = z.object({
  username: z.string(),
  bio: z.string(),
  isPublic: z.boolean(),
  avatarUrl: z.string(),
  coverImageUrl: z.string(),
  websiteUrl: z.string().refine(isValidUrl, 'Enter a valid URL'),
  twitterHandle: z.string(),
  instagramHandle: z.string(),
  youtubeUrl: z.string().refine(isValidUrl, 'Enter a valid URL'),
  showName: z.boolean(),
});
type ProfileFormValues = z.infer<typeof profileSchema>;

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

  const [saved, setSaved] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    mode: 'onBlur',
    defaultValues: {
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
    },
  });

  const avatarUrl = watch('avatarUrl');
  const coverImageUrl = watch('coverImageUrl');

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      setValue('avatarUrl', await uploadImage(file));
    }
    catch {
      setError('root', { message: t('avatarUploadFailed') });
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
      setValue('coverImageUrl', await uploadImage(file));
    }
    catch {
      setError('root', { message: t('coverUploadFailed') });
    }
    finally {
      setCoverUploading(false);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: data.username.trim() || null,
        bio: data.bio.trim() || null,
        isPublic: data.isPublic,
        showName: data.showName,
        avatarUrl: data.avatarUrl || null,
        coverImageUrl: data.coverImageUrl || null,
        websiteUrl: data.websiteUrl.trim() || null,
        twitterHandle: data.twitterHandle.trim() || null,
        instagramHandle: data.instagramHandle.trim() || null,
        youtubeUrl: data.youtubeUrl.trim() || null,
      }),
    });
    if (!res.ok) {
      const d = await res.json();
      setError('root', { message: d.error ?? t('uploadFailed') });
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 4000);
    router.refresh();
  };

  const registerUsername = register('username');
  const registerBio = register('bio');
  const registerTwitter = register('twitterHandle');
  const registerInstagram = register('instagramHandle');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {saved && <Toast message={t('saved')} />}

      {/* Photos */}
      <div className="space-y-5">
        {/* Cover photo */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">{t('coverPhotoLabel')}</label>
          {coverImageUrl
            ? (
                <div className="relative block h-32">
                  <div className="absolute inset-0 rounded-xl overflow-hidden border border-stone-200">
                    <Image src={coverImageUrl} alt={t('coverPhotoAlt')} fill className="object-cover" sizes="100vw" />
                  </div>
                  <CornerDeleteButton
                    onClick={() => {
                      setValue('coverImageUrl', '');
                      if (coverInputRef.current) coverInputRef.current.value = '';
                    }}
                    label="Remove cover photo"
                  />
                </div>
              )
            : (
                <label className={`flex items-center gap-2 cursor-pointer rounded-xl border border-dashed border-stone-300 px-4 py-3 text-sm text-stone-500 hover:border-stone-400 hover:text-stone-700 transition-colors ${coverUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                  <CameraIcon className="w-4 h-4 shrink-0" />
                  {coverUploading ? t('uploading') : t('addCoverPhoto')}
                  <input ref={coverInputRef} type="file" accept="image/*" className="sr-only" onChange={handleCoverChange} />
                </label>
              )}
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            {avatarUrl
              ? (
                  <>
                    <Image src={avatarUrl} alt={t('avatarAlt')} width={64} height={64} className="w-16 h-16 rounded-full object-cover border border-stone-200" />
                    <CornerDeleteButton
                      onClick={() => {
                        setValue('avatarUrl', '');
                        if (avatarInputRef.current) avatarInputRef.current.value = '';
                      }}
                      label="Remove profile photo"
                      positionClassName="-top-1 -right-1"
                    />
                  </>
                )
              : (
                  <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                    <UserIcon className="w-8 h-8" />
                  </div>
                )}
          </div>
          <label className={`cursor-pointer text-sm text-stone-500 hover:text-stone-700 transition-colors ${avatarUploading ? 'opacity-50 pointer-events-none' : ''}`}>
            {avatarUploading ? t('uploading') : avatarUrl ? t('changeProfilePhoto') : t('addProfilePhoto')}
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
          error={errors.username?.message}
        >
          <TextInput
            id="username"
            type="text"
            placeholder={t('usernamePlaceholder')}
            prefix={t('usernamePrefix')}
            {...registerUsername}
          />
        </FormField>

        <FormField htmlFor="bio" label={t('bioLabel')} error={errors.bio?.message}>
          <Textarea
            id="bio"
            rows={3}
            placeholder={t('bioPlaceholder')}
            {...registerBio}
          />
        </FormField>

        <Controller
          name="showName"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Checkbox
              checked={value}
              onChange={e => onChange(e.target.checked)}
              label={t('showNameLabel')}
              description={t('showNameDescription')}
            />
          )}
        />
      </div>

      {/* Social links */}
      <div className="space-y-4">
        <SectionHeading>
          {t('linksHeading')}
          {' '}
          <span className="text-sm font-normal text-stone-400">{t('linksOptional')}</span>
        </SectionHeading>
        <FormField htmlFor="websiteUrl" label={t('websiteLabel')} error={errors.websiteUrl?.message}>
          <Controller
            name="websiteUrl"
            control={control}
            render={({ field: { value, onChange, onBlur } }) => (
              <FormUrl
                id="websiteUrl"
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                placeholder={t('websitePlaceholder')}
              />
            )}
          />
        </FormField>
        <FormField htmlFor="twitter" label={t('twitterLabel')} error={errors.twitterHandle?.message}>
          <TextInput
            id="twitter"
            type="text"
            placeholder={t('handlePlaceholder')}
            prefix="@"
            {...registerTwitter}
          />
        </FormField>
        <FormField htmlFor="instagram" label={t('instagramLabel')} error={errors.instagramHandle?.message}>
          <TextInput
            id="instagram"
            type="text"
            placeholder={t('handlePlaceholder')}
            prefix="@"
            {...registerInstagram}
          />
        </FormField>
        <FormField htmlFor="youtube" label={t('youtubeLabel')} error={errors.youtubeUrl?.message}>
          <Controller
            name="youtubeUrl"
            control={control}
            render={({ field: { value, onChange, onBlur } }) => (
              <FormUrl
                id="youtube"
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                placeholder={t('youtubePlaceholder')}
              />
            )}
          />
        </FormField>
      </div>

      {/* Visibility */}
      <div>
        <SectionHeading className="mb-3">{t('visibilityHeading')}</SectionHeading>
        <Controller
          name="isPublic"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Checkbox
              checked={value}
              onChange={e => onChange(e.target.checked)}
              label={t('makePublicLabel')}
              description={t('makePublicDescription')}
            />
          )}
        />
      </div>

      {errors.root && <FormBanner type="error" message={errors.root.message ?? ''} />}
      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="neutral" size="lg" disabled={isSubmitting}>
          {isSubmitting ? t('saving') : t('saveProfile')}
        </Button>
        <Button type="button" variant="secondary" size="lg" onClick={() => router.back()}>
          {t('cancel')}
        </Button>
      </div>
    </form>
  );
};
