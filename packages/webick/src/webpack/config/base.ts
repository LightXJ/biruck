import { join, resolve} from 'path';
import { Configuration } from 'webpack';
import * as MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { getCwd, loadConfig } from '../../server-utils';
import { Mode } from '../../../types';

const loadModule = require.resolve

const projectRoot: string = getCwd();

const getBaseConfig = (isClient: boolean = false) => {
  const { isDev, css } = loadConfig();
  const mode = process.env.NODE_ENV as Mode;
  const baseConfig: Configuration = {
    mode,
    resolve: {
      extensions: ['.js', '.json', '.ts', '.tsx'],
      alias: {
        '@src': resolve(projectRoot, './src'),
        '@dist': resolve(projectRoot, './dist'),
        '@client': join(projectRoot, './src/client'),
        '@components': join(projectRoot, './src/client/components'),
        'react-dom': loadModule('react-dom'),
        'react-router-dom': loadModule('react-router-dom'),
        'react/jsx-runtime': loadModule('react/jsx-runtime'),
        'react/jsx-dev-runtime': loadModule('react/jsx-dev-runtime'),
      }
    },
    resolveLoader: {
      modules: ['node_modules', 'node_modules/@biruck/webick/node_modules'],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: isDev ? 'static/css/[name].css' : 'static/css/[name].[contenthash:8].css',
        chunkFilename: isDev ? 'static/css/[name].chunk.css' : 'static/css/[name].[contenthash:8].chunk.css',
        ignoreOrder: true,
      }),
    ],
    module: {
      rules: [
        {
          test: /\.tsx|\.ts|\.jsx|\.js$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  '@babel/preset-env',
                  ['@babel/preset-react', {
                    runtime: 'automatic',
                  }],
                  '@babel/preset-typescript',
                ],
                plugins: [
                  '@babel/plugin-transform-runtime',
                  [
                    'babel-plugin-import',
                    {
                      libraryName: 'antd',
                      libraryDirectory: 'lib',
                      style: true,
                    }, 'antd'
                  ],
                  isClient && isDev && require.resolve('react-refresh/babel'),
                ].filter(Boolean),
              },
            },
          ],
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                emit: isClient,
              },
            },
            {
              loader: 'css-loader',
              options: {
                modules: { auto: true },
                importLoaders: 1,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: ['postcss-preset-env'],
                },
              },
            },
          ]
        },
        {
          test: /\.less$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                emit: isClient,
              },
            },
            {
              loader: 'css-loader',
              options: {
                modules: { auto: true },
                importLoaders: 1,
                ...css?.loaderOptions?.cssOptions,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: ['postcss-preset-env'],
                },
              },
            },
            {
              loader: 'less-loader',
              options: {
                lessOptions: {
                  javascriptEnabled: true,
                  ...css?.loaderOptions?.less,
                },
              },
            },
          ]
        },
        {
          test: /.(png|svg|jpg|gif|jpeg)$/,
          type: 'asset/resource',
          generator: {
            filename: 'static/image/[name]_[hash:8][ext][query]',
          },
        }
      ],
    },
  }

  return baseConfig;
}

export {
  getBaseConfig
}