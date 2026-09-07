import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
        source: "/mi-aprendizaje/certificados",
        destination: "/mis-certificados",
        permanent: false,
      },
      {
        source: "/mi-aprendizaje/perfil",
        destination: "/perfil",
        permanent: false,
      },
      {
        source: "/mi-aprendizaje/ayuda",
        destination: "/mesa-de-ayuda",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
