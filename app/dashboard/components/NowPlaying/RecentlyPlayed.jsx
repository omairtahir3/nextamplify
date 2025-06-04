'use client';
import Image from 'next/image';
export default function RecentlyPlayed({ recentlyPlayed }) {
  return (
    <section className="section">
      <h2 className="section-heading">Recently Played</h2>
      <div className="card-grid">
        {recentlyPlayed.map((track) => (
          <div key={track.id} className="music-card">
            <Image
              src={track.cover}
              alt={track.title}
              width={200}
              height={200}
              className="album-cover"
            />
            <p className="album-title">{track.title}</p>
            <p className="album-artist">{track.artist}</p>
          </div>
        ))}
      </div>
    </section>
  );
}