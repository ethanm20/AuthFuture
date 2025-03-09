
/*
const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  resolve: {
    fallback: {
        os: require.resolve("os-browserify/browser"),
        path: require.resolve("path-browserify")
    }
  }
};

*/

/*

resolve: {
    fallback: {
        "crypto": require.resolve("crypto-browserify")
    }
  }

*/



const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: "./src/index.js", // Adjust this to your entry file
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  mode: "development", // Change to 'production' for optimized builds
  resolve: {
    fallback: {
      crypto: require.resolve("crypto-browserify"),
      buffer: require.resolve("buffer/"),
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
      process: "process/browser",
    }),
  ],
  devServer: {
    static: path.resolve(__dirname, "dist"),
    compress: true,
    port: 9000,
  },
};
