// Components
import { Badge } from '@/components/Badge';

type Props = {
  role: string
  className?: string
};

export const UserBadge = ({ role, className = '' }: Props) => {
  const baseClass = 'text-xs font-medium';
  const combinedClass = className ? `${baseClass} ${className}` : baseClass;

  return (
    <Badge
      variant={role.toLowerCase() === 'owner' ? 'primary' : 'neutral'}
      className={combinedClass}
    >
      {role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()}
    </Badge>
  );
};
