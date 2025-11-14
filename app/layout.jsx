import './globals.css';

export const metadata = {
  title: 'Ignite Client Portal',
  description: 'Your engagement hub for proposals and deliverables',
  // Favicon handled via inline lucide-react Handshake icon in UI
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

