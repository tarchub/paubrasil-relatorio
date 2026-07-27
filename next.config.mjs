/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Imagens de conteúdo vêm de fontes externas variadas; permitimos https.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  // Bibliotecas usadas apenas no servidor (coleta/IA) fora do bundle do cliente.
  serverExternalPackages: ["rss-parser", "@anthropic-ai/sdk", "openai"],
};

export default nextConfig;
