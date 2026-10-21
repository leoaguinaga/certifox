import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    authInterrupts: true,
  },
  images: {
    remotePatterns: [
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
