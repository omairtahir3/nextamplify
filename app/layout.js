import './globals.css';
import { Poppins, Montserrat, Bebas_Neue, Playfair_Display } from 'next/font/google';
// Configure Poppins
const poppins = Poppins({
  weight: '600',
  subsets: ['latin'],
  variable: '--font-poppins'
});

// Configure Montserrat
const montserrat = Montserrat({
  weight: '700',
  subsets: ['latin'],
  variable: '--font-montserrat'
});

// Configure Bebas Neue
const bebas = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas'
});

// Configure Playfair Display
const playfair = Playfair_Display({
  weight: '700',
  subsets: ['latin'],
  variable: '--font-playfair'
});

export const metadata = {
  title: 'Amplify - Home',
  description: 'Stream your favorite songs',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${poppins.variable} ${montserrat.variable} ${bebas.variable} ${playfair.variable}`}>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}