import type { Metadata } from 'next';
import './globals.css';
import DevTools from '@/components/dev-tools';
export const metadata: Metadata = { applicationName: 'Milten Studio', title: 'Milten Studio — Build with confidence', description: 'Milten Studio brings strategy, design, and engineering together to turn your product ambitions into reliable software.', icons: { icon: '/images/milten-mark.svg' } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}{process.env.NODE_ENV === 'development' && <DevTools />}</body></html>; }
