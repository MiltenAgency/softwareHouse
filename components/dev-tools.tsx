'use client';

import dynamic from 'next/dynamic';

const Agentation = dynamic(
  () => import('agentation').then((module) => module.Agentation),
  { ssr: false },
);

export default function DevTools() {
  return <Agentation />;
}
