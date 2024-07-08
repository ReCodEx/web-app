/*
 * Helper script that converts import (and direct export) specifiers (paths).
 * It adds missing '.js' to files and optionally missing '/index.js' to dir imports.
 */

/* eslint no-console: "off" */
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { glob } from 'glob';
import 'colors';

// global config
const fixMissingExtension = true;
const addIndex = false;

/**
 * Fix import path.
 * @param {string} path
 * @param {string} basePath to which the path is relative
 * @returns {string} fixed path
 */
function patchImportPath(path, basePath) {
  if (!path.startsWith('.')) {
    return path; // our paths (to be fixed) begins with . or ..
  }

  const absPath = basePath + '/' + path;

  if (fixMissingExtension && !fs.existsSync(absPath)) {
    const missingExt = '.js';
    if (
      !absPath.endsWith(missingExt) &&
      fs.existsSync(absPath + missingExt) &&
      !fs.lstatSync(absPath + missingExt).isDirectory()
    ) {
      return path + missingExt;
    } else {
      console.log(`${path} ${basePath}`.red);
    }
  }

  if (addIndex && fs.lstatSync(absPath).isDirectory()) {
    const indexJs = '/index.js';
    if (fs.existsSync(absPath + indexJs) && !fs.lstatSync(absPath + indexJs).isDirectory()) {
      return path + indexJs;
    } else {
      console.log(`${path} dir does not have 'index.js'`.red);
    }
  }

  return path;
}

/**
 * Process a JS file and fix all import and direct export statements.
 * @param {string} file path to the file
 * @returns {Array} tuple [ imports/exports count, modified paths count ]
 */
async function processFile(file) {
  const basePath = path.dirname(file);
  const content = await fsp.readFile(file, 'utf8');

  let imports = 0;
  let modified = 0;

  const newContent = content.replace(
    /^((?:import|export)[^;]+from[^;]+['"])([^;'"]+)(['"];)/gms,
    (_, prefix, path, suffix) => {
      ++imports;
      const newPath = patchImportPath(path, basePath);
      if (path !== newPath) {
        ++modified;
      }
      return prefix + newPath + suffix;
    }
  );

  await fsp.writeFile(file, newContent, 'utf8');

  return [imports, modified];
}

/**
 * Scan all JS files in given top-level directory and fix them.
 * @param {String} dir
 * @returns {Array} tuple [files count, changed files count, imports/exports count, changed paths count]
 */
async function processDir(dir) {
  const searchPattern = `${dir}/**/*.js`;
  const files = await glob(searchPattern, { posix: true });
  const promises = {};
  let totalImports = 0;
  let totalChanges = 0;
  let changedFiles = 0;

  for (const file of files) {
    promises[file] = processFile(file);
  }

  for (const file in promises) {
    const [imports, changes] = await promises[file];
    totalImports += imports;
    console.log(`${file} (${changes} imports fixed)`[changes ? 'brightGreen' : 'gray']);
    if (changes > 0) {
      ++changedFiles;
      totalChanges += changes;
    }
  }

  return [files.length, changedFiles, totalImports, totalChanges];
}

/**
 * Main function that do all the stuff.
 */
async function main(args) {
  let files = 0;
  let changedFiles = 0;
  let imports = 0;
  let changedImports = 0;
  for (const arg of args) {
    const [_files, _changedFiles, _imports, _changedImports] = await processDir(arg);
    files += _files;
    changedFiles += _changedFiles;
    imports += _imports;
    changedImports += _changedImports;
  }

  console.log(
    `${files} files scanned, ${changedFiles} files modified, ${imports} import statements scanned, ${changedImports} imports fixed.`
      .yellow
  );
}

const args = [...process.argv];
args.shift(); // discard node
args.shift(); // discard script name
main(args).catch(e => console.error(e));
