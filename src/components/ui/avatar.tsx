import * as React from 'react';

export function Avatar({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gray-200 ${className}`.trim()} {...props} />;
}

export function AvatarFallback({ className = '', ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={`text-sm font-medium text-gray-700 ${className}`.trim()} {...props} />;
}
