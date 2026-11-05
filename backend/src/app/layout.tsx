import React from 'react';

export const metadata = {
  title: 'SkillBridge Backend API',
  description: 'Backend API service for SkillBridge platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
        {children}
      </body>
    </html>
  );
}
