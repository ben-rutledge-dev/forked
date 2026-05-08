import type { Meta } from '@storybook/nextjs-vite';
import React from 'react';
import { AlertConfirm, AlertConfirmType } from '.';

const meta: Meta<typeof AlertConfirm> = {
  title: 'Shared/Components/AlertConfirm',
  component: AlertConfirm,
  tags: ['autodocs'],
};

export default meta;

export const AlertConfirmBasic = () => {
  return (
    <AlertConfirm text="foobar" onConfirm={() => null} />
  );
};

export const AlertConfirmTypeConfirm = () => {
  return (
    <AlertConfirm type={AlertConfirmType.confirm} text="foobar" onConfirm={() => null} />
  );
};

export const AlertConfirmWithProps = () => {
  return (
    <AlertConfirm text="foobar" colour="primary" icon="info" onConfirm={() => null} />
  );
};

export const AlertConfirmWithCustomButtonText = () => {
  return (
    <AlertConfirm text="foobar" confirmButtonText="Custom confirm" onConfirm={() => null} />
  );
};
