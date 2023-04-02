const { createLoader } = require("simple-functional-loader");

const path = require("path");
const fs = require("fs");

const externals = {
  "fs-extra": "self.fsextra",
  resolve: "self.resolve",
  "fs.realpath": "self.fsrealpath",
  purgecss: "self.purgecss",
  chokidar: "self.chokidar",
  tmp: "self.tmp",
  "vscode-emmet-helper-bundled": "null",
};

const moduleOverrides = {
  colorette: path.resolve(__dirname, "src/modules/colorette.js"),
  fs: path.resolve(__dirname, "src/modules/fs.js"),
  "is-glob": path.resolve(__dirname, "src/modules/is-glob.js"),
  "glob-parent": path.resolve(__dirname, "src/modules/glob-parent.js"),
  "fast-glob": path.resolve(__dirname, "src/modules/fast-glob.js"),
};

function getExternal({ context, request }, callback) {
  if (/node_modules/.test(context) && externals[request]) {
    return callback(null, externals[request]);
  }
  callback();
}

const files = [
  {
    pattern: /preflight/,
    tailwindVersion: 3,
    file: path.resolve(
      __dirname,
      "node_modules/tailwindcss/lib/css/preflight.css"
    ),
  },
];

function createReadFileReplaceLoader(tailwindVersion) {
  return createLoader(function (source) {
    return source.replace(
      /_fs\.default\.readFileSync\(.*?(['"])utf8\1\)/g,
      (m) => {
        for (let i = 0; i < files.length; i++) {
          if (
            files[i].pattern.test(m) &&
            (!files[i].tailwindVersion ||
              files[i].tailwindVersion === tailwindVersion)
          ) {
            return JSON.stringify(fs.readFileSync(files[i].file, "utf8"));
          }
        }
        return m;
      }
    );
  });
}

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  webpack: (config, { isServer, webpack, dev }) => {
    config.resolve.alias = { ...config.resolve.alias, ...moduleOverrides };

    if (!isServer) {
      if (config.externals) {
        config.externals.push(getExternal);
      } else {
        config.externals = [getExternal];
      }
    }
    config.module.rules.push({
      test: /tailwindcss\/lib\/corePlugins\.js/,
      use: [createReadFileReplaceLoader(3)],
    });

    return config;
  },
};
