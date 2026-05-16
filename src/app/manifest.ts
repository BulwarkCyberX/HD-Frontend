import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'HackersDeal',
    short_name: 'HackersDeal',
    description: 'Cybersecurity freelance marketplace',
    start_url: '/',
    display: 'standalone',
    background_color: '#020617',
    theme_color: '#097c87',
    icons: [],
  };
}
