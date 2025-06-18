import Image from "next/image";
import Link from "next/link";
import Footer from './components/footer';
const trendingSongs = [
  {
    id: 1,
    title: "blue",
    artist: "yung kai",
    cover: "https://i.scdn.co/image/ab67616d0000b273373c63a4666fb7193febc167",
  },
  {
    id: 2,
    title: "luther (with SZA)",
    artist: "Kendrick Lamar, SZA",
    cover: "https://i.scdn.co/image/ab67616d0000b27309d6ed214f03fbb663e46531",
  },
  {
    id: 3,
    title: "Not Like Us",
    artist: "Kendrick Lamar",
    cover: "https://i.scdn.co/image/ab67616d0000b2731ea0c62b2339cbf493a999ad",
  },
  {
    id: 4,
    title: "Yellow",
    artist: "Coldplay",
    cover: "https://i.scdn.co/image/ab67616d0000b2739164bafe9aaa168d93f4816a",
  },
  {
    id: 5,
    title: "WILDFLOWER",
    artist: "Billie Eilish",
    cover: "https://i.scdn.co/image/ab67616d0000b27371d62ea7ea8a5be92d3c1f62",
  },
];

const playlists = [
  {
    id: 1,
    title: "Top Hits 2025",
    cover:
      "https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da846419aff9fea391f2f4cbc81d",
  },
  {
    id: 2,
    title: "WORKOUT",
    cover:
      "https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da846255cd2b9a007bd8b236000e",
  },
  {
    id: 3,
    title: "Road Trip",
    cover:
      "https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da84230d00f639c926d581b3fe4f",
  },
  {
    id: 4,
    title: "Travel",
    cover:
      "https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da84969f97a408f38f092b878782",
  },
  {
    id: 5,
    title: "Moody Lofi",
    cover:
      "https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da84e6ffcddab140cacca8f17852",
  },
];

const artists = [
  {
    id: 1,
    name: "Kendrick Lamar",
    cover: "https://i.scdn.co/image/ab6761610000e5eb39ba6dcd4355c03de0b50918",
  },
  {
    id: 2,
    name: "Billie Eilish",
    cover: "https://i.scdn.co/image/ab67616d0000b2732a038d3bf875d23e4aeaa84e",
  },
  {
    id: 3,
    name: "The Weekend",
    cover: "https://i.scdn.co/image/ab6761610000e5eb9e528993a2820267b97f6aae",
  },
  {
    id: 4,
    name: "Arctic Monkeys",
    cover: "https://i.scdn.co/image/ab6761610000e5eb7da39dea0a72f581535fb11f",
  },
  {
    id: 5,
    name: "Bruno Mars",
    cover: "https://i.scdn.co/image/ab6761610000e5ebc36dd9eb55fb0db4911f25dd",
  },
];

const albums = [
  {
    id: 1,
    title: "Sour",
    cover: "https://i.scdn.co/image/ab67616d0000b273a91c10fe9472d9bd89802e5a",
  },
  {
    id: 2,
    title: "Starboy",
    cover: "https://i.scdn.co/image/ab67616d0000b273e0450ba3fd83cf9048446477",
  },
  {
    id: 3,
    title: "good kid, m.A.A.d city",
    cover: "https://i.scdn.co/image/ab67616d00001e02d58e537cea05c2156792c53d",
  },
  {
    id: 4,
    title: "Hurry Up Tomorrow",
    cover: "https://i.scdn.co/image/ab67616d0000b273982320da137d0de34410df61",
  },
  {
    id: 5,
    title: "SOS",
    cover: "https://i.scdn.co/image/ab67616d0000b27370dbc9f47669d120ad874ec1",
  },
];

export default function Home() {
  return (
    <main>
      <nav className="navbar">
        <Image
          src="https://cdn.pixabay.com/photo/2022/09/25/03/20/music-7477530_1280.png"
          alt="Logo"
          width={50}
          height={50}
        />
        <h1>Amplify</h1>

        <div className="nav-center">
          <ul className="nav-links">
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/signup">Explore</Link>
            </li>
            <li>
              <Link href="/signup">Playlists</Link>
            </li>
            <li>
              <Link href="/signup">Profile</Link>
            </li>
          </ul>
        </div>

        <div className="auth-buttons">
          <Link href="/signin" className="sign-in">Sign In</Link>
          <Link href="/signup" className="sign-up">Sign Up</Link>
        </div>
      </nav>
      {/* Hero Section */}
      <section className="hero">
        <h2>Discover Your Next Favorite Song</h2>
        <p>Stream millions of songs and create your own playlists.</p>
        <div className="premium-btn">
          <Link href="/premium">
            <button className="cta">Get Premium</button>
          </Link>
        </div>
        <div className="hero-background"></div>
      </section>

      {/* Trending Songs */}
      <div className="main-section">
        {/* Trending Songs Section */}
        <Section title="Trending Songs" link="signup">
          {trendingSongs.map((song) => (
            <Link 
              className="card" 
              key={song.id}
              href="/signup"
            >
              <Image
                src={song.cover}
                alt="Song Cover"
                width={200}
                height={200}
                className="cover-image"
              />
              <h4>{song.title}</h4>
              <p>{song.artist}</p>
            </Link>
          ))}
        </Section>

        {/* Playlists Section */}
        <Section title="Top Playlists" link="/signup">
          {playlists.map((playlist) => (
            <Link 
              key={playlist.id} 
              href="/signup" 
              className="card"
            >
              <Image
                src={playlist.cover}
                alt="Playlist Cover"
                width={200}
                height={200}
                className="cover-image"
              />
              <h4>{playlist.title}</h4>
            </Link>
          ))}
        </Section>

        {/* Artists Section */}
        <Section title="Popular Artists" link="/signup">
          {artists.map((artist) => (
            <Link 
              className="card" 
              key={artist.id} 
              href="/signup"
            >
              <Image
                src={artist.cover}
                alt="Artist Image"
                width={200}
                height={200}
                className="cover-image"
              />
              <h4>{artist.name}</h4>
            </Link>
          ))}
        </Section>

        {/* Albums Section */}
        <Section title="Top Albums" link="signup">
          {albums.map((album) => (
            <div className="card" key={album.id}>
              <Image
                src={album.cover}
                alt="Album Cover"
                width={200}
                height={200}
                className="cover-image"
              />
              <h4>{album.title}</h4>
            </div>
          ))}
        </Section>
      </div>
      <Footer />
    </main>
  );
}

function Section({ title, link, children }) {
  return (
    <section className="section">
      <div className="heading">
        <h3>{title}</h3>
        <Link href="/signup">Show all</Link>
      </div>
      <div className="grid">{children}</div>
    </section>
  );
}
