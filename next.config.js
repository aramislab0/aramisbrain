/** @type {import('next').NextConfig} */
const nextConfig = {
    compress: true,

    experimental: {
        optimizePackageImports: ['@tanstack/react-query'],
    },

    // Headers optimisés pour cache API
    async headers() {
        return [
            {
                source: '/api/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, s-maxage=60, stale-while-revalidate=300',
                    },
                ],
            },
        ];
    },
};

module.exports = nextConfig;
