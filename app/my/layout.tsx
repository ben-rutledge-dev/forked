import { redirect } from 'next/navigation';
// Lib
import { auth } from '@/lib/auth';

const MyLayout = async ({
  children,
}: {
  children: React.ReactNode
}) => {
  const session = await auth();
  if (!session) redirect('/auth/signin');
  return <>{children}</>;
};

export default MyLayout;
