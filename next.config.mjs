import withPlugins from 'next-compose-plugins';
import withBundleAnalyzer from '@next/bundle-analyzer';
import withPWA from 'next-pwa';
import TerserPlugin from 'terser-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const pwa = [
  withPWA,
  {
    pwa: {
      dest: 'public',
      disable: process.env.NODE_ENV === 'development',
    },
  },
];

export default withPlugins([bundleAnalyzer, pwa], {
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    EMAIL: process.env.SMTP_USER,
    EMAIL_PASSWORD: process.env.SMTP_PASS,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SESSION_SECRET: process.env.SESSION_SECRET,
  },
  images: {
    domains: ['www.freelancedevelopmentagency.com', 'res.cloudinary.com'],
  },
  webpack(config, { isServer }) {
    if (!isServer) {
      config.optimization.minimizer.push(
        new TerserPlugin({
          parallel: true,
        })
      );
      config.optimization.minimizer.push(new CssMinimizerPlugin());
    }
    config.module.rules.push({
      test: /\.(png|jpe?g|gif|svg|webp)$/,
      use: [
        {
          loader: 'image-webpack-loader',
          options: {
            bypassOnDebug: true,
            disable: true,
          },
        },
      ],
    });
    return config;
  },
});
