import type { Metadata } from 'next';
import './globals.css';
import DevTools from '@/components/dev-tools';
export const metadata: Metadata = { title: 'The Software House — Build with confidence', description: 'Unlock development capacity, remove delivery blockers and see your key metrics improve. Software development that delivers tangible outcomes.', icons: { icon: '/images/milten-mark.svg' } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}{process.env.NODE_ENV === 'development' && <DevTools />}</body></html>; }
