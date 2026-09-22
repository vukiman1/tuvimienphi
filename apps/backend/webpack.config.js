const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const RUNTIME_EXTERNALS =
  /^(@sentry|@opentelemetry)\/|^google-auth-library(\/|$)|^(require-in-the-middle|import-in-the-middle)$/;

const UNUSED_GRAPHQL_FEATURES =
  /^@apollo\/(gateway|subgraph)(\/|$)|^@as-integrations\/fastify$|^ts-morph$/;

module.exports = (_env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    externals: [
      {
        '@nestjs/terminus': 'commonjs @nestjs/terminus',
        '@nestjs/throttler': 'commonjs @nestjs/throttler',
        express: 'commonjs express',
      },
      ({ request }, callback) =>
        RUNTIME_EXTERNALS.test(request) || UNUSED_GRAPHQL_FEATURES.test(request)
          ? callback(null, `commonjs ${request}`)
          : callback(),
    ],
    ignoreWarnings: [{ module: /standardwebhooks/, message: /Failed to parse source map/ }],
    output: {
      path: join(__dirname, 'dist'),
      clean: true,
      ...(!isProduction && {
        devtoolModuleFilenameTemplate: '[absolute-resource-path]',
      }),
    },
    plugins: [
      new NxAppWebpackPlugin({
        target: 'node',
        compiler: 'tsc',
        main: './src/main.ts',
        tsConfig: './tsconfig.app.json',
        assets: ['./src/assets', { input: './config', glob: '**/*', output: './config' }],
        optimization: false,
        outputHashing: 'none',
        externalDependencies: 'all',
        mergeExternals: true,
        generatePackageJson: false,
        sourceMap: true,
      }),
    ],
    module: {
      rules: [{ test: /\.ya?ml$/, type: 'asset/source' }],
    },
    resolve: {
      conditionNames: ['@org/source', 'require', 'node', 'import', 'default'],
      mainFields: ['main', 'module'],
      plugins: [
        new TsconfigPathsPlugin({
          configFile: join(__dirname, 'tsconfig.app.json'),
        }),
      ],
    },
  };
};
