import * as React from 'react';

export function Select({ value, onValueChange, children, className = '', ...props }: any) {
  const options: string[] = [];
  const optionLabels: Record<string, string> = {};

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child) || child.type !== SelectContent) return;
    React.Children.forEach(child.props.children, (item) => {
      if (!React.isValidElement(item) || item.type !== SelectItem) return;
      const optionValue = String(item.props.value ?? '');
      optionLabels[optionValue] = String(item.props.children ?? optionValue);
      options.push(optionValue);
    });
  });

  return (
    <select
      value={value ?? ''}
      onChange={(event) => onValueChange?.(event.target.value)}
      className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none ${className}`.trim()}
      {...props}
    >
      {!value && <option value="">Select an option</option>}
      {options.map((option) => (
        <option key={option} value={option}>
          {optionLabels[option] ?? option}
        </option>
      ))}
    </select>
  );
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function SelectItem({ value, children }: { value: string; children: React.ReactNode }) {
  return <option value={value}>{children}</option>;
}

export function SelectTrigger({ children, className = '', ...props }: any) {
  return <div className={`relative ${className}`.trim()} {...props}>{children}</div>;
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  return <span>{placeholder ?? 'Select'}</span>;
}
