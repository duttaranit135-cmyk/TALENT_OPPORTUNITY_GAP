import * as React from 'react';

export function Card({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-xl border border-gray-200 bg-white shadow-sm ${className}`.trim()} {...props} />;
}
