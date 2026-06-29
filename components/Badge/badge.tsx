type Variant = 'success' | 'neutral' | 'primary';

type Props = {
  children: React.ReactNode
  variant?: Variant
  className?: string
};

const variantClasses: Record<Variant, string> = {
  success: 'bg-success-50 text-success-700',
  neutral: 'bg-stone-100 text-stone-500',
  primary: 'bg-primary-50 text-primary-500',
};

export const Badge = ({ children, variant = 'neutral', className = '' }: Props) => (
  <span className={`w-fit rounded squircle px-1.5 py-0.5 ${variantClasses[variant]} ${className}`}>
    {children}
  </span>
);
