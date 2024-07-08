/*
 * The hooks fix ESM imports to handle not-fully qualified paths (missing .js and /index.js).
 * It also bypasses module loading for CJS modules that are not desired for testing.
 * Currently only file-saver module is bypassed.
 */

import fs from 'fs';
import fsp from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const extensions = ['mjs', 'js']; // appended if missing
const prefixes = ['./', '../']; // only includes with these prefixes are modified
const indexFiles = extensions.map(e => `index.${e}`);
const postfixes = extensions.map(e => `.${e}`).concat(indexFiles.map(p => `/${p}`));

/**
 * Retuns suitable postfix to given import specifier (like a missing .js extension or an index file for dir).
 */
const findPostfix = (specifier, context) =>
  (specifier.endsWith('/') ? indexFiles : postfixes).find(p =>
    fs.existsSync(
      specifier.startsWith('/') ? specifier + p : join(dirname(fileURLToPath(context.parentURL)), specifier + p)
    )
  );

/**
 * Resolve hook translates module import paths into qualified URLs.
 * Check nodejs module documentation for more details.
 */
export function resolve(specifier, context, nextResolve) {
  const fullPath = join(dirname(fileURLToPath(context.parentURL)), specifier);
  const postfix =
    (prefixes.some(p => specifier.startsWith(p)) &&
      (!fs.existsSync(fullPath) || fs.lstatSync(fullPath).isDirectory()) &&
      findPostfix(specifier, context)) ||
    '';

  return nextResolve(specifier + postfix, context);
}

/**
 * Loader hook loads urls and returns source codes.
 * Check nodejs module documentation for more details.
 */
export async function load(url, context, nextLoad) {
  const result = await nextLoad(url, context);
  if (result.format === 'commonjs') {
    if (url.includes('/node_modules/file-saver/')) {
      /*
       * This is an ugly hack !!!
       * We need to avoid loading file-saver (CJS) module, so we just erase its source.
       * This needs to be refactored, if additional modules require bypassing.
       */
      result.source = '';
    } else if (!result.source) {
      result.source ??= await fsp.readFile(new URL(result.responseURL ?? url));
    }
  }
  return result;
}
