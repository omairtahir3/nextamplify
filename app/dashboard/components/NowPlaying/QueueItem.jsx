'use client';
import Image from 'next/image';

export default function QueueItem({ track }) {
  return (
    <li className="queue-item">
      <Image
        src={track.cover}
        alt={track.title}
        width={40}
        height={40}
        className="queue-cover"
      />
      <div className="queue-details">
        <p className="queue-title">{track.title}</p>
        <p className="queue-artist">{track.artist}</p>
      </div>
    </li>
  );
}