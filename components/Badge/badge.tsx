type Variant = 'success' | 'neutral' | 'primary';

type BadgeProps = {
  children: React.ReactNode
  variant?: Variant
  className?: string
};

const variantClasses: Record<Variant, string> = {
  success: 'bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300',
  neutral: 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400',
  primary: 'bg-primary-50 dark:bg-primary-700 text-primary-500 dark:text-primary-100',
};

export const Badge: React.FC<BadgeProps> = (props) => {
  const { children, variant = 'neutral', className = '' } = props;
  return (
    <span className={`w-fit rounded squircle px-1.5 py-0.5 ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};
