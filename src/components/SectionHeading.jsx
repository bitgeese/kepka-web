import React from 'react';

export function SectionHeading({ title }) {
  return (
    <header className="mb-16">
      <h2 className="text-5xl md:text-6xl font-impact uppercase mb-4">{title}</h2>
      <div className="w-24 h-1 bg-electric-red"></div>
    </header>
  );
} 