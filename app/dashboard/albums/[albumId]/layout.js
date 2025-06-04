// app/dashboard/albums/[albumId]/layout.js
import './globals.css';

export default function AlbumLayout({ children }) {
  return (
    <div className="dashboard-container">
      <div className="album-page-container">
        {children}
      </div>
    </div>
  );
}