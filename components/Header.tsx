
import React from 'react';

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="bg-sky-700 text-white p-4 shadow-md">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
    </header>
  );
};
    