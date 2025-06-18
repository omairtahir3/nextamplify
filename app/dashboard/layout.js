// app/layout.js
import { Poppins } from 'next/font/google';
import './globals.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
const poppins = Poppins({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-poppins',
});

export const metadata = {
  title: 'Amplify - Playlists',
  description: 'Log in to your Amplify account',
};

export default function DashboardLayout({ children }) {
  return (
    <div className={`dashboard-body ${poppins.variable}`}>
      <div className="dashboard-container">
        <link
          rel="stylesheet"
           href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
        {children}
      </div>
    </div>
  );
}
