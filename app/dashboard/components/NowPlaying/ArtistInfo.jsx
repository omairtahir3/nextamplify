'use client'; 

import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function ArtistInfo({ artist }) {
  const router = useRouter();

  if (!artist) return null;

  const handleArtistClick = () => {
    if (artist._id || artist.id) {
      router.push(`/dashboard/artists/${artist._id || artist.id}`);
    }
  };

  return (
    <div className="artist-info">
      <div className="artist-image-container">
        <div 
          className="artist-image-wrapper"
          onClick={handleArtistClick}
          style={{ cursor: 'pointer' }}
        >
          <Image
            src={artist.image || '/default-artist.jpg'}
            alt={artist.name || 'Artist'}
            width={100}
            height={100}
            className="artist-image"
          />
        </div>
      </div>
      <div className="artist-details">
        <h4 className="artist-name">{artist.name || 'Unknown Artist'}</h4>
        {artist.bio && (
          <p className="artist-bio">{artist.bio}</p>
        )}
        {artist.genres?.length > 0 && (
          <div className="artist-genres">
            <span>Genres: </span>
            {artist.genres.map((genre, index) => (
              <span key={index}>
                {genre}
                {index < artist.genres.length - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}