const path = require("path");
const webpack = require("webpack");
const nodeExternals = require("webpack-node-externals");

const sourcePath = path.resolve(__dirname, "./src");
const outputPath = path.resolve(__dirname, "./public");

module.exports = {
  mode: "production",
  target: "node",
  entry: {
    apiserver: `${sourcePath}/main/start.ts`,
  },
  output: {
    path: outputPath,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"],
    alias: {
      "@core": path.resolve(__dirname, "src/main/core"),
      "@common": path.resolve(__dirname, "src/main/common"),
      "@controllers": path.resolve(__dirname, "src/main/controllers"),
      "@services": path.resolve(__dirname, "src/main/services"),
    },
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: process.env.NODE_ENV,
    }),
  ],
};
