import React from 'react';

type IconProps = {
  className?: string
};

// ─── Recipe / Content ──────────────────────────────────────────────────────

export const RecipeIcon = ({ className }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
    />
  </svg>
);

export const BookIcon = ({ className }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
    />
  </svg>
);

export const HeartIcon = ({ className, filled }: IconProps & { filled?: boolean }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth={filled ? 0 : 1.75}
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
    />
  </svg>
);

// ─── Actions ───────────────────────────────────────────────────────────────

export const EditIcon = ({ className }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 0l.172.172a2 2 0 010 2.828L12 16H9v-3z"
    />
  </svg>
);

export const DotsHorizontalIcon = ({ className }: IconProps) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="5" cy="12" r="1.5" />
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="19" cy="12" r="1.5" />
  </svg>
);

export const XIcon = ({ className }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 10 10"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <line x1="2" y1="2" x2="8" y2="8" />
    <line x1="8" y1="2" x2="2" y2="8" />
  </svg>
);

// ─── Navigation / UI ───────────────────────────────────────────────────────

export const ChevronLeftIcon = ({ className }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

export const ChevronDownIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const FilterIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// ─── Status / Feedback ─────────────────────────────────────────────────────

export const CheckIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M2 7l3.5 3.5L12 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const SmallCheckIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 10 10" fill="none" aria-hidden="true">
    <path d="M2 5l2.5 2.5L8 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CircleCheckIcon = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
      clipRule="evenodd"
    />
  </svg>
);

export const CircleXIcon = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z"
      clipRule="evenodd"
    />
  </svg>
);

// ─── Media ─────────────────────────────────────────────────────────────────

export const CameraIcon = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M1 8a2 2 0 0 1 2-2h.93a2 2 0 0 0 1.664-.89l.812-1.22A2 2 0 0 1 8.07 3h3.86a2 2 0 0 1 1.664.89l.812 1.22A2 2 0 0 0 16.07 6H17a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8Zm13.5 3a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM10 14a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
      clipRule="evenodd"
    />
  </svg>
);

export const SpeakerWaveIcon = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
    <path d="M10.5 3.75a.75.75 0 0 0-1.264-.546L5.203 7H2.667a.75.75 0 0 0-.75.75v4.5c0 .414.336.75.75.75h2.536l4.033 3.796a.75.75 0 0 0 1.264-.546V3.75ZM13.463 4.6a.75.75 0 0 1 1.06.038 9 9 0 0 1 0 12.723.75.75 0 0 1-1.098-1.022 7.5 7.5 0 0 0 0-10.678.75.75 0 0 1 .038-1.061Zm-1.92 2.31a.75.75 0 0 1 1.06.04 6 6 0 0 1 0 8.497.75.75 0 1 1-1.1-1.02 4.5 4.5 0 0 0 0-6.456.75.75 0 0 1 .04-1.06Z" />
  </svg>
);

export const StopSquareIcon = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
    <path d="M5.25 3A2.25 2.25 0 0 0 3 5.25v9.5A2.25 2.25 0 0 0 5.25 17h9.5A2.25 2.25 0 0 0 17 14.75v-9.5A2.25 2.25 0 0 0 14.75 3h-9.5Z" />
  </svg>
);

// ─── Profile / Social ──────────────────────────────────────────────────────

export const UserIcon = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
      clipRule="evenodd"
    />
  </svg>
);

export const GlobeIcon = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM4.332 8.027a6.012 6.012 0 0 1 1.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 0 1 9 7.5V8a2 2 0 0 0 4 0 2 2 0 0 1 1.523-1.943A5.977 5.977 0 0 1 16 10c0 .34-.028.675-.083 1H15a2 2 0 0 0-2 2v2.197A5.973 5.973 0 0 1 10 16v-2a2 2 0 0 0-2-2 2 2 0 0 1-2-2 2 2 0 0 0-1.668-1.973Z"
      clipRule="evenodd"
    />
  </svg>
);

export const TwitterXIcon = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export const InstagramIcon = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
  </svg>
);

export const YouTubeIcon = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

// ─── Branding ──────────────────────────────────────────────────────────────

export const ForkBrandIcon = ({ className }: IconProps) => (
  <svg viewBox="-57 0 160 160" fill="none" className={className} aria-hidden="true">
    <g clipPath="url(#fork-brand-clip)">
      <path
        fill="currentColor"
        d="M23.262 53.462c.31-3.556.827-7.107.896-10.667.23-11.895.29-23.795.45-35.692.009-1.231.156-2.457.437-3.656a2.915 2.915 0 0 1 2.908-2.37 2.99 2.99 0 0 1 2.996 2.288c.312 1.192.44 2.425.38 3.656-.22 13.021-.41 26.043-.783 39.06-.093 3.216-.816 6.419-1.321 10.155a8.73 8.73 0 0 0 2.683-3.833 34.2 34.2 0 0 0 2.668-12.428c.298-9.874.46-19.756.73-29.628.024-1.792.216-3.577.573-5.332A3.87 3.87 0 0 1 39.4 1.87a4 4 0 0 1 3.83 2.756c.366.941.594 1.93.677 2.937.776 11.436 1.275 22.897-.114 34.298a52 52 0 0 1-3.39 12.597c-2.463 6.246-6.108 9.236-14.243 12.876.175 3.446.34 7.004.54 10.56.593 10.646 1.361 21.285 1.762 31.938.536 14.246.805 28.503 1.145 42.756 0 1.227-.148 2.451-.44 3.643-.386 1.745-1.706 2.613-3.356 2.881-1.479.24-3.316-1.011-3.837-2.727a14.9 14.9 0 0 1-.529-3.977c-.17-8.082-.188-16.168-.436-24.247-.296-9.648-.853-19.288-1.148-28.937-.282-9.09-.38-18.184-.552-27.277-.025-1.328-.004-2.656-.004-4.04-.999-.351-1.706-.65-2.44-.853-7.361-2.02-12.124-6.807-13.973-14.087A68 68 0 0 1 .96 39.348c-.415-9.302-.73-18.63.443-27.917.225-1.781.432-3.57.782-5.327.556-2.792 1.838-4.015 3.836-3.86 2.021.157 3 1.524 3 4.463 0 4.491-.1 8.982-.138 13.473-.076 9.096.61 18.181 2.05 27.162.59 3.703 1.616 7.245 4.66 9.799q.866.616 1.79 1.14c-4.143-8.949-3.728-17.965-3.736-26.894-.007-7.745.271-15.487.433-23.23q.013-1.346.166-2.685c.17-1.354.843-2.398 2.309-2.454 1.686-.065 2.297 1.126 2.523 2.589q.1.665.126 1.34c.432 11.102.815 22.207 1.312 33.307.2 4.472.636 8.936 2.018 13.231z"
      />
    </g>
    <defs>
      <clipPath id="fork-brand-clip">
        <path fill="none" d="M.54.463h44.631v158.834H.541z" />
      </clipPath>
    </defs>
  </svg>
);
