import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = { title: 'Stallion · Columbia bathroom finder', description: 'Find a restroom on Columbia Morningside, with honest access and verification details.' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><main>{children}</main><footer className="site-footer shell">Independent student project. Not affiliated with or endorsed by Columbia University. Locations and access information may change.</footer></body></html>;
}
