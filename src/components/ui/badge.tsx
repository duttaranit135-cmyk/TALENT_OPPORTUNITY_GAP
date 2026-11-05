import * as React from 'react';

type BadgeVariant = 'default' | 'secondary' | 'outline';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'border-gray-200 bg-gray-100 text-gray-700',
  secondary: 'border-gray-200 bg-gray-100 text-gray-700',
  outline: 'border-gray-300 bg-white text-gray-700',
};

export function Badge({ className = '', variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${variantClasses[variant]} ${className}`.trim()}
      {...props}
    />
  );
}
