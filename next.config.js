// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      // Pixabay Configuration
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
        pathname: '/photo/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn-images.dzcdn.net',
        pathname: '/**',
      },
      // Spotify Image CDNs
      {
        protocol: 'https',
        hostname: '*.scdn.co', // Wildcard for all subdomains
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'image-cdn-ak.spotifycdn.com', // Alternative Spotify CDN
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.spotifycdn.com', // Catch-all for all Spotify CDN variations
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
        pathname: '/photo/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn1.iconfinder.com',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: '*.scdn.co',
      },
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
      },
      {
        protocol: 'https',
        hostname: 'pickasso.spotifycdn.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
      },
      {
        protocol: 'https',
        hostname: '*.gstatic.com',
        pathname: '/**',
      }
    ],
  }
}
