'use client';
import Image from 'next/image';

export default function ArtistInfo({ artist }) {
  return (
    <div className="artist-section">
      <div className="artist-info">
        <Image
          src={artist.image}
          alt={artist.name}
          width={150}
          height={150}
          className="artist-image"
        />
        <div className="artist-stats">
          <h2>{artist.name}</h2>
          <p>{artist.listeners}</p>
          <p>{artist.followers}</p>
        </div>
      </div>
      <div className="artist-bio">
        <h3>About</h3>
        <p>{artist.bio}</p>
      </div>
    </div>
  );
}