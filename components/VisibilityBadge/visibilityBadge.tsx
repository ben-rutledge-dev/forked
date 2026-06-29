import { useTranslations } from 'next-intl';
// Components
import { Badge } from '@/components/Badge';

type Props = {
  isPublic: boolean
  className?: string
};

export const VisibilityBadge = ({ isPublic, className }: Props) => {
  const t = useTranslations('common');
  return (
    <Badge variant={isPublic ? 'success' : 'neutral'} className={className}>
      {isPublic ? t('public') : t('private')}
    </Badge>
  );
};
