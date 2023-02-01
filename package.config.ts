import { optimizeLodashImports } from "@optimize-lodash/rollup-plugin";
import { defineConfig } from "@sanity/pkg-utils";

export default defineConfig({
  define: {
    __DEV__: false,
  },
  dist: "dist",
  extract: {
    rules: {
      // Disable rules for now
      "ae-forgotten-export": "off",
      "ae-incompatible-release-tags": "off",
      "ae-internal-missing-underscore": "off",
      "ae-missing-release-tag": "off",
    },
  },
  external: [
    "@apollo/client",
    "luxon",
    "cloudinary",
    "@cloudinary/url-gen",
    "jsdom",
    "gray-matter",
    "turndown",
    "prettier",
    "turndown-plugin-gfm",
  ],
  // bundles: [
  //   {
  //     source: "./src/cli.ts",
  //     require: "./dist/cli.js",
  //   },
  //   {
  //     source: "./src/index.ts",
  //     require: "./dist/index.js",
  //   },
  //   {
  //     source: "./src/wordpress/index.ts",
  //     require: "./dist/wordpress/index.js",
  //   },
  // ],
  legacyExports: true,
  rollup: {
    plugins: [optimizeLodashImports()],
  },
  runtime: "node",
});

/* eslint-disable no-sync */
// import fs from 'fs'
// import path from 'path'
// import isBuiltin from 'is-builtin-module'
// import {defineConfig} from '@sanity/pkg-utils'
// import {nodeResolve} from '@rollup/plugin-node-resolve'
// import baseConfig from '../../../package.config'

// const workersDir = path.join(__dirname, 'src', 'workers')

// const workerNames = fs
//   .readdirSync(workersDir)
//   .filter((file) => file.endsWith('.ts'))
//   .map((file) => path.basename(file, '.ts'))

// export default defineConfig({
//   ...baseConfig,

//   // This is a workaround for an issue where the `readable-stream` package imports
//   // from `string_decoder/` instead of `string_decoder` (note the trailing slash),
//   // which _should_ tell rollup not to use the built-in `string_decoder` module,
//   // which it unfortunately does not. Hoping we can get rid of this hack soon:
//   // https://github.com/rollup/plugins/issues/1211
//   // https://github.com/sindresorhus/is-builtin-module/issues/7
//   // https://github.com/sindresorhus/builtin-modules/pull/17
//   rollup: {
//     plugins: (plugins) => [
//       ...plugins.filter((plugin) => plugin.name !== 'node-resolve'),
//       nodeResolve({
//         browser: false,
//         extensions: ['.cjs', '.mjs', '.js', '.jsx', '.json', '.node'],
//         preferBuiltins: false,
//         resolveOnly: (moduleName) => moduleName === 'string_decoder' || !isBuiltin(moduleName),
//       }),
//     ],
//   },

//   bundles: [
//     {
//       source: './src/cli.ts',
//       require: './lib/cli.js',
//     },
//     {
//       source: './src/run.ts',
//       require: './lib/run.js',
//     },

//     ...workerNames.map((name) => ({
//       source: `./src/workers/${name}.ts`,
//       require: `./lib/workers/${name}.js`,
//     })),
//   ],

//   runtime: 'node',
// })
