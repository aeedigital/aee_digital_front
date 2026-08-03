/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // A Lambda de producao tem concorrencia reservada baixa. Limitar os workers
  // evita que a exportacao estatica derrube as proprias leituras publicas.
  experimental: {
    cpus: 1,
  },
};

export default nextConfig;
