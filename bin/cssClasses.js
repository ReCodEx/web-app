/*
 * Helper script that lists all CSS classes used in ReCodEx.
 */

/* eslint no-console: "off" */
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { glob } from 'glob';
import 'colors';

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

function getClassNameContent(content, fromIndex) {
  let index = fromIndex;
  let level = 1;
  while (index < content.length) {
    if (content[index] === '{') {
      ++level;
    } else if (content[index] === '}') {
      --level;
    }
    if (level === 0) {
      return content.substring(fromIndex, index);
    }
    ++index;
  }
  return null;
}

/**
 * Process a JS file and fix all import and direct export statements.
 * @param {string} file path to the file
 * @returns {Array} tuple [ imports/exports count, modified paths count ]
 */
async function processFile(file) {
  const content = await fsp.readFile(file, 'utf8');
  const res = [];

  // regular string classes
  const regex = /className="([^"]+)"/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    match[1]
      .split(/\s+/)
      .filter(cls => cls)
      .forEach(cls => res.push([cls, `${file}:${match.index}`]));
  }

  const regex2 = /className={/g;
  while ((match = regex2.exec(content)) !== null) {
    let classes = getClassNameContent(content, regex2.lastIndex);
    if (classes.startsWith('classnames(')) {
      // Try to extract as many names from classnames() dict keys
      const subrex = /'([^']+)':/g;
      let submatch;
      while ((submatch = subrex.exec(classes)) !== null) {
        if (/^[-_a-zA-Z0-9]+$/.test(submatch[1])) {
          res.push([submatch[1], `${file}:${match.index}`]);
        }
      }

      const subrex2 = /\[`([^`]+)`\]:/g;
      while ((submatch = subrex2.exec(classes)) !== null) {
        const cls = submatch[1].replaceAll(/\$\{[^}]+\}/g, '*');
        if (/^[-_a-zA-Z0-9*]+$/.test(cls)) {
          res.push([cls, `${file}:${match.index}`]);
        }
      }
    } else if (classes.startsWith('`') && classes.endsWith('`')) {
      // handle `` strings, converting ${} into * as a wildcard replacement
      classes = classes.substring(1, classes.length - 1);
      classes = classes.replaceAll(/\$\{[^}]+\}/g, '*');
      classes
        .split(/\s+/)
        .filter(cls => cls && cls !== '*')
        .forEach(cls => res.push([cls, `${file}:${match.index}`]));
    } else {
      // handle all internal strings in '' as possible class names
      const subrex = /'\s*([^']+)\s*'/g;
      let submatch;
      while ((submatch = subrex.exec(classes)) !== null) {
        submatch[1]
          .split(/\s+/)
          .filter(cls => /^[-_a-zA-Z0-9]+$/.test(cls))
          .forEach(cls => res.push([cls, `${file}:${match.index}`]));
      }
    }
  }

  return res;
}

/**
 * Scan all JS files in given top-level directory.
 * @param {String} dir
 */
async function processDir(dir, res) {
  const searchPattern = `${dir}/**/*.js`;
  const files = await glob(searchPattern, { posix: true });
  const promises = {};

  for (const file of files) {
    promises[file] = await processFile(file);
  }

  for (const file in promises) {
    const classes = await promises[file];
    classes.forEach(([cls, location]) => (res[cls] = [...(res[cls] || []), location]));
  }
}

/**
 * Main function that do all the stuff.
 */
async function main(args) {
  const classes = {};
  for (const arg of args) {
    await processDir(arg, classes);
  }

  //  const classNames = Object.keys(classes);
  //  classNames.sort();

  console.log(JSON.stringify(classes));
}

const args = [...process.argv];
args.shift(); // discard node
args.shift(); // discard script name
main(args).catch(e => console.error(e));
