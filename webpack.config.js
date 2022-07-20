import path from "path";
import { fileURLToPath } from "url";
import HtmlWebpackPlugin from "html-webpack-plugin";
import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import OptimizeCssAssetsPlugin from "optimize-css-assets-webpack-plugin";

const target = "browserslist:browserslist config, not maintained node versions";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (env, { mode }) => {
  const isDev = mode === "development";

  return {
    target,
    entry: { main: "./src/root.jsx", style: "./src/assets/scss/style.scss" },

    output: {
      clean: true,
      path: path.resolve(__dirname + "/dist"),
      filename: isDev
        ? "assets/js/[name].js"
        : "assets/js/[name].[contenthash].js",
      chunkFilename: isDev
        ? "assets/js/[name].js"
        : "assets/js/[contenthash].js",
    },

    devtool: isDev ? "eval-cheap-module-source-map" : "source-map",

    devServer: {
      compress: true,
      hot: true,
      client: {
        overlay: false,
      },
      port: 3000,
      static: "./dist",
    },

    stats: {
      assets: false,
      entrypoints: false,
      modules: false,
    },

    performance: {
      hints: false,
    },

    resolve: {
      alias: {
        lodash: path.resolve("./node_modules/lodash-es"),
      },
      extensions: ["*", ".js", ".jsx", ".scss"],
    },

    optimization: {
      runtimeChunk: true,
      splitChunks: {
        chunks: "all",
      },
      minimizer: ["...", new CssMinimizerPlugin()],
    },

    module: {
      strictExportPresence: true,
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: "babel-loader",
              options: {
                plugins: [isDev && "react-refresh/babel"].filter(Boolean),
              },
            },
            {
              loader: "@linaria/webpack5-loader",
              options: { preprocessor: "none" },
            },
          ],
        },
        {
          test: /\.css$/i,
          exclude: /node_modules/,
          use: [
            "style-loader",
            {
              loader: "css-loader",
              options: {
                modules: true,
              },
            },
          ],
        },

        {
          test: /\.module\.s(a|c)ss$/,
          use: [
            isDev ? "style-loader" : MiniCssExtractPlugin.loader,
            {
              loader: "css-loader",
              options: {
                modules: true,
                sourceMap: isDev,
              },
            },
            {
              loader: "postcss-loader",
              options: {
                postcssOptions: {
                  plugins: ["autoprefixer"],
                },
              },
            },
            {
              loader: "sass-loader",
              options: {
                sourceMap: isDev,
              },
            },
          ],
        },
        {
          test: /\.s(a|c)ss$/,
          exclude: /\.module.(s(a|c)ss)$/,
          use: [
            isDev ? "style-loader" : MiniCssExtractPlugin.loader,
            "css-loader",
            {
              loader: "postcss-loader",
              options: {
                postcssOptions: {
                  plugins: ["autoprefixer"],
                },
              },
            },
            {
              loader: "sass-loader",
              options: {
                sourceMap: isDev,
              },
            },
          ],
        },
        {
          test: /\.(woff|woff2|eot|ttf|svg)$/,
          use: {
            loader: "url-loader",
          },
        },
        {
          test: /\.(jpe?g|png|gif|svg)$/i,
          use: [
            {
              loader: "file-loader",
              options: {
                limit: 8000,
                name: "assets/images/[name]-[hash].[ext]",
              },
            },
          ],
        },
      ],
    },

    plugins: [
        new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: "./src/index.html",
      }),
      isDev && new ReactRefreshWebpackPlugin({ overlay: false }),
      !isDev &&
        new MiniCssExtractPlugin({
          filename: "assets/css/[contenthash].css",
          chunkFilename: "assets/css/[contenthash].css",
          ignoreOrder: true,
        }),
      !isDev &&
        new OptimizeCssAssetsPlugin({
          cssProcessorPluginOptions: {
            preset: ["default", { discardComments: { removeAll: true } }],
          },
        }),
    ].filter(Boolean),
  };
};
