'use client';
import Image from 'next/image';

export default function QueueItem({ track, onClick}) {
  return (
    <li className="queue-item" onClick={onClick}>
      <Image
        src={track.cover}
        alt={track.title}
        width={40}
        height={40}
        className="queue-cover"
        onClick={() => onClick(track)}
      />
      <div className="queue-details">
        <p className="queue-title">{track.title}</p>
        <p className="queue-artist">{track.artist}</p>
      </div>
    </li>
  );
}