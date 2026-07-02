import { useTranslations } from 'next-intl';
// Components
import { Badge } from '@/components/Badge';

type VisibilityBadgeProps = {
  isPublic: boolean
  className?: string
};

export const VisibilityBadge: React.FC<VisibilityBadgeProps> = (props) => {
  const { isPublic, className } = props;
  const t = useTranslations('common');
  return (
    <Badge variant={isPublic ? 'success' : 'neutral'} className={className}>
      {isPublic ? t('public') : t('private')}
    </Badge>
  );
};
