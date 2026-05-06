'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FormEvent, useRef, useState } from 'react';
// Components
import { Button } from '@/components/Button';
import { CornerDeleteButton } from '@/components/CornerDeleteButton';
import { FormBanner } from '@/components/FormBanner';
import { Toast } from '@/components/Toast';
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
  const [username, setUsername] = useState(user.username ?? '');
  const [bio, setBio] = useState(user.bio ?? '');
  const [isPublic, setIsPublic] = useState(user.isPublic);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? '');
  const [coverImageUrl, setCoverImageUrl] = useState(user.coverImageUrl ?? '');
  const [websiteUrl, setWebsiteUrl] = useState(user.websiteUrl ?? '');
  const [twitterHandle, setTwitterHandle] = useState(user.twitterHandle ?? '');
  const [instagramHandle, setInstagramHandle] = useState(user.instagramHandle ?? '');
  const [youtubeUrl, setYoutubeUrl] = useState(user.youtubeUrl ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [showName, setShowName] = useState(user.showName);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const normalizeUrl = (value: string): string => {
    const v = value.trim();
    if (!v) return '';
    return /^https?:\/\//i.test(v) ? v : `https://${v}`;
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      setAvatarUrl(await uploadImage(file));
    }
    catch {
      setError('Avatar upload failed');
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
      setCoverImageUrl(await uploadImage(file));
    }
    catch {
      setError('Cover photo upload failed');
    }
    finally {
      setCoverUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim() || null,
          bio: bio.trim() || null,
          isPublic,
          showName,
          avatarUrl: avatarUrl || null,
          coverImageUrl: coverImageUrl || null,
          websiteUrl: websiteUrl.trim() || null,
          twitterHandle: twitterHandle.trim() || null,
          instagramHandle: instagramHandle.trim() || null,
          youtubeUrl: youtubeUrl.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Something went wrong');
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
      router.refresh();
    }
    finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500';

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && <FormBanner type="error" message={error} />}
      {saved && <Toast message="Profile saved!" />}

      {/* Photos */}
      <div className="space-y-5">
        {/* Cover photo */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Cover photo</label>
          {coverImageUrl
            ? (
                <div className="relative block h-32 rounded-xl overflow-hidden border border-stone-200">
                  <Image src={coverImageUrl} alt="Cover" fill className="object-cover" sizes="100vw" />
                  <CornerDeleteButton
                    onClick={() => {
                      setCoverImageUrl('');
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
                  {coverUploading ? 'Uploading…' : 'Add cover photo'}
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
                    <Image src={avatarUrl} alt="Avatar" width={64} height={64} className="w-16 h-16 rounded-full object-cover border border-stone-200" />
                    <CornerDeleteButton
                      onClick={() => {
                        setAvatarUrl('');
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
            {avatarUploading ? 'Uploading…' : avatarUrl ? 'Change profile photo' : 'Add profile photo'}
            <input ref={avatarInputRef} type="file" accept="image/*" className="sr-only" onChange={handleAvatarChange} />
          </label>
        </div>
      </div>

      {/* Identity */}
      <div className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-stone-700 mb-1">
            Username
            <span className="text-stone-400 font-normal">(required to have a public profile)</span>
          </label>
          <div className="flex items-center">
            <span className="px-3 py-2 text-sm text-stone-400 border border-r-0 border-stone-300 rounded-l-lg bg-stone-50">forked.app/u/</span>
            <input
              id="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="your_username"
              className="flex-1 rounded-l-none rounded-r-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
            />
          </div>
          <p className="mt-1 text-xs text-stone-400">Letters, numbers and underscores only. 3–30 characters.</p>
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-stone-700 mb-1">Bio</label>
          <textarea
            id="bio"
            value={bio}
            onChange={e => setBio(e.target.value)}
            rows={3}
            placeholder="Tell people a bit about yourself…"
            className={inputClass + ' resize-none'}
          />
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={showName}
            onChange={e => setShowName(e.target.checked)}
            className="mt-0.5 rounded border-stone-300"
          />
          <div>
            <span className="text-sm text-stone-700">Show my full name publicly</span>
            <p className="text-xs text-stone-400 mt-0.5">Display your name on your public profile. Uncheck to show only your username.</p>
          </div>
        </label>
      </div>

      {/* Social links */}
      <div className="space-y-4">
        <h2 className="font-medium text-stone-900">
          Links
          <span className="text-sm font-normal text-stone-400">— all optional</span>
        </h2>
        <div>
          <label htmlFor="websiteUrl" className="block text-sm font-medium text-stone-700 mb-1">Website</label>
          <input id="websiteUrl" type="url" value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} onBlur={e => setWebsiteUrl(normalizeUrl(e.target.value))} placeholder="https://yoursite.com" className={inputClass} />
        </div>
        <div>
          <label htmlFor="twitter" className="block text-sm font-medium text-stone-700 mb-1">X / Twitter handle</label>
          <div className="flex items-center">
            <span className="px-3 py-2 text-sm text-stone-400 border border-r-0 border-stone-300 rounded-l-lg bg-stone-50">@</span>
            <input id="twitter" type="text" value={twitterHandle} onChange={e => setTwitterHandle(e.target.value)} placeholder="username" className="flex-1 rounded-l-none rounded-r-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500" />
          </div>
        </div>
        <div>
          <label htmlFor="instagram" className="block text-sm font-medium text-stone-700 mb-1">Instagram handle</label>
          <div className="flex items-center">
            <span className="px-3 py-2 text-sm text-stone-400 border border-r-0 border-stone-300 rounded-l-lg bg-stone-50">@</span>
            <input id="instagram" type="text" value={instagramHandle} onChange={e => setInstagramHandle(e.target.value)} placeholder="username" className="flex-1 rounded-l-none rounded-r-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500" />
          </div>
        </div>
        <div>
          <label htmlFor="youtube" className="block text-sm font-medium text-stone-700 mb-1">YouTube</label>
          <input id="youtube" type="url" value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} onBlur={e => setYoutubeUrl(normalizeUrl(e.target.value))} placeholder="https://youtube.com/@yourchannel" className={inputClass} />
        </div>
      </div>

      {/* Visibility */}
      <div>
        <h2 className="font-medium text-stone-900 mb-3">Profile visibility</h2>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={e => setIsPublic(e.target.checked)}
            className="mt-0.5 rounded border-stone-300"
          />
          <div>
            <span className="text-sm text-stone-700">Make profile public</span>
            <p className="text-xs text-stone-400 mt-0.5">Your profile page will be visible to anyone. Requires a username.</p>
          </div>
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="neutral" size="lg" shape="pill" disabled={saving}>
          {saving ? 'Saving…' : 'Save profile'}
        </Button>
        <Button type="button" variant="secondary" size="lg" shape="pill" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
