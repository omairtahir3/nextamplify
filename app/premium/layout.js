import Navbar from './components/Navbar';

export const metadata = {
  title: 'Amplify Premium - Get Premium Access',
  description: 'Get Amplify Premium for ad-free music, offline playback, and more',
};

export default function PremiumLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}