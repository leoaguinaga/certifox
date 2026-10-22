import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    authInterrupts: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.certifox.edu",
      },
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async headers() {
    return [
      {
        // AC-21: /campus/* devuelve no-store para no cachearse en CDN ni proxies intermedios
        source: "/campus/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-store, no-cache, must-revalidate, max-age=0",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/verificar-certificado",
        destination: "/verificar",
        permanent: true,
      },
      {
        source: "/verificar-certificado/:path*",
        destination: "/verificar/:path*",
        permanent: true,
      },
      {
        source: "/mi-aprendizaje",
        destination: "/campus",
        permanent: true,
      },
      {
        source: "/mi-aprendizaje/cursos",
        destination: "/campus/cursos",
        permanent: true,
      },
      {
        source: "/mi-aprendizaje/certificados",
        destination: "/campus/certificados",
        permanent: true,
      },
      {
        source: "/mis-certificados",
        destination: "/campus/certificados",
        permanent: true,
      },
      {
        source: "/mi-aprendizaje/perfil",
        destination: "/campus/perfil",
        permanent: true,
      },
      {
        source: "/perfil",
        destination: "/campus/perfil",
        permanent: true,
      },
      {
        source: "/mi-aprendizaje/ayuda",
        destination: "/campus/mesa-de-ayuda",
        permanent: true,
      },
      {
        source: "/mesa-de-ayuda",
        destination: "/campus/mesa-de-ayuda",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
