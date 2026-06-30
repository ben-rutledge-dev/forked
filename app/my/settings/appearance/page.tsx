import type { Metadata } from 'next';
// Components
import { AppearanceForm } from './components/AppearanceForm';

export const metadata: Metadata = { title: 'Settings — Appearance' };

const AppearancePage = () => <AppearanceForm />;

export default AppearancePage;
