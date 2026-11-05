import * as React from 'react';

const TabsContext = React.createContext<{ value: string; onValueChange: (value: string) => void } | null>(null);

export function Tabs({ defaultValue, className = '', children }: { defaultValue?: string; className?: string; children: React.ReactNode }) {
  const [value, setValue] = React.useState(defaultValue ?? '');

  return (
    <TabsContext.Provider value={{ value, onValueChange: setValue }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <div className={`flex rounded-md border border-gray-200 bg-gray-100 p-1 ${className}`.trim()}>{children}</div>;
}

export function TabsTrigger({ value, className = '', children }: { value: string; className?: string; children: React.ReactNode }) {
  const context = React.useContext(TabsContext);
  const active = context?.value === value;

  return (
    <button
      type="button"
      className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${active ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'} ${className}`.trim()}
      onClick={() => context?.onValueChange(value)}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className = '', children }: { value: string; className?: string; children: React.ReactNode }) {
  const context = React.useContext(TabsContext);
  if (context?.value !== value) return null;
  return <div className={className}>{children}</div>;
}
