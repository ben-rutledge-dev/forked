'use client';

import type { z } from 'zod';
import { InviteForm, type RoleOption } from './invites';

export type InviteModalProps<TRole extends string> = {
  heading: string
  schema: z.ZodType<{ username: string, role: TRole }, { username: string, role: TRole }>
  roles: RoleOption<TRole>[]
  defaultRole: TRole
  onSubmit: (username: string, role: TRole) => Promise<void>
  onConfirm: (value: true | null) => void
};

export const InviteModal = <TRole extends string>({ heading, schema, roles, defaultRole, onSubmit, onConfirm }: InviteModalProps<TRole>) => (
  <div className="p-6 space-y-4">
    <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">{heading}</h2>
    <InviteForm
      schema={schema}
      roles={roles}
      defaultRole={defaultRole}
      onSubmit={async (username, role) => {
        await onSubmit(username, role);
        onConfirm(true);
      }}
      onCancel={() => onConfirm(null)}
    />
  </div>
);
