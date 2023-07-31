/* eslint no-console: "off" */
import fs from 'fs';
import { extract } from '@formatjs/cli-lib';
import { globSync } from 'glob';
import 'colors';

// global config parameters
const searchPattern = './src/**/*.js';
const refLanguage = 'en'; // the language stored in default messages
const otherLanguages = ['cs']; // translations
const translationsDirectory = './src/locales/';

/**
 * Use formatjs to extract messages from all source files.
 * @returns {object} where keys are IDs and values are messages
 */
async function extractMessages() {
  // extract messages from all src files
  const files = globSync(searchPattern, { posix: true });
  console.log(`Extracting messages from ${files.length} files...`);
  const extractedAsString = await extract(files, {});
  const extractedJson = JSON.parse(extractedAsString);
  console.log(`Total ${Object.keys(extractedJson).length} messages extracted.`);

  const extracted = {};
  Object.keys(extractedJson).forEach(key => {
    extracted[key] = extractedJson[key].defaultMessage;
  });
  return extracted;
}

/**
 * Load messages from existing json file
 * @param {string} language (en, cs ...)
 * @returns {object} where keys are IDs and values are messages
 */
function loadMessages(language) {
  const fileName = `${translationsDirectory}/${language}.json`;
  if (!fs.existsSync(fileName)) {
    console.warn(`File ${fileName} does not exist!`);
    return {};
  }

  const rawData = fs.readFileSync(fileName, 'utf8');
  return JSON.parse(rawData);
}

/**
 * Save messages into json language file.
 * @param {string} language
 * @param {object} messages where keys are IDs and values are messages
 */
function saveMessages(language, messages) {
  const fileName = `${translationsDirectory}/${language}.json`;
  const sortedMessages = {};
  Object.keys(messages)
    .sort()
    .forEach(key => {
      sortedMessages[key] = messages[key];
    });

  fs.writeFileSync(fileName, JSON.stringify(sortedMessages, null, 2));
}

/**
 * Load whitelist (list of not-translated keys).
 * @param {string} language
 * @returns {Set} of whitelisted message IDs
 */
function loadWhitelist(language) {
  const fileName = `${translationsDirectory}/whitelist_${language}.json`;
  const whitelist = new Set();

  if (fs.existsSync(fileName)) {
    const rawData = fs.readFileSync(fileName, 'utf8');
    JSON.parse(rawData).forEach(key => {
      whitelist.add(key);
    });
  } else {
    console.warn(`File ${fileName} does not exist!`);
  }

  return whitelist;
}

/**
 * Save whitelist into json file.
 * @param {string} language
 * @param {Set} whitelist
 */
function saveWhitelist(language, whitelist) {
  const fileName = `${translationsDirectory}/whitelist_${language}.json`;
  const whitelistArray = Array.from(whitelist).sort();
  fs.writeFileSync(fileName, JSON.stringify(whitelistArray, null, 2));
}

/**
 * Compare extracted messages with existing messages and create lists of newly created keys, modified keys
 * deleted keys, and possibly keys that were not translated yet.
 * If whitelist is present, noTranslated list is constructed and modified list is not.
 * I.e., ref language is diff-ed without whitelist, other languages with whitelist.
 * @param {object} extracted messages from source code
 * @param {object} existing messages loaded from json file
 * @param {Set|null} whitelist keys that are ignored when not translated
 * @param {string[]} modifiedRef initial modified list (othre languages are given modified list of ref. language).
 * @returns
 */
function diff(extracted, existing, whitelist = null, modifiedRef = []) {
  const created = [];
  let modified = [...modifiedRef];
  const notTranslated = [];
  const deleted = [];

  Object.keys(extracted).forEach(key => {
    if (existing[key] === undefined) {
      created.push(key);
    } else if (existing[key] !== extracted[key] && !whitelist) {
      modified.push(key);
    } else if (existing[key] === extracted[key] && whitelist && !whitelist.has(key)) {
      notTranslated.push(key);
    }
  });

  Object.keys(existing).forEach(key => {
    if (extracted[key] === undefined) {
      deleted.push(key);
    }
  });

  created.sort();
  modified = modified.filter(key => existing[key] !== undefined).sort();
  deleted.sort();
  return { created, modified, notTranslated, deleted };
}

/**
 * Use diff results to modify the messages and the whitelist.
 * @param {object} messages to be updated inplace
 * @param {object} extracted messages from the sources (read only)
 * @param {Set} whitelist to be updated inplace
 * @param {object} result of the previous diff operation
 */
function applyDiff(messages, extracted, whitelist, { created, deleted }) {
  created.forEach(key => {
    messages[key] = extracted[key];
  });
  deleted.forEach(key => {
    delete messages[key];
    whitelist.delete(key);
  });
}

/**
 * Helper function that prints out one colored list with caption
 * @param {string[]} list
 * @param {string} caption
 * @param {string} color
 */
function _printInfo(list, caption, color) {
  if (list.length > 0) {
    console.log(`\t${caption}:`);
    list.forEach(key => console.log(`\t\t${key}`[color]));
    console.log();
  }
}

/**
 * Print results of a diff in human-readable format.
 * @param {string} language
 * @param {object} result of previous diff operation
 */
function printDiffInfo(language, { created = [], modified = [], notTranslated = [], deleted = [] }) {
  console.log(`[${language}] translations:`.brightWhite.bold);

  _printInfo(created, 'Newly created messages', 'brightGreen');
  _printInfo(modified, 'Modified', 'brightYellow');
  _printInfo(notTranslated, 'Not translated', 'yellow');
  _printInfo(deleted, 'Deleted', 'red');

  if (created.length + modified.length + notTranslated.length + deleted.length === 0) {
    console.log();
    console.log('\tNo modifications.'.brightGreen);
    console.log();
  }
}

/**
 * Main function that do all the stuff.
 */
async function processTranslations() {
  const extracted = await extractMessages();
  const refMessages = loadMessages(refLanguage);
  const refDiffRes = diff(extracted, refMessages);
  printDiffInfo(refLanguage, refDiffRes);
  saveMessages(refLanguage, extracted);

  otherLanguages.forEach(lang => {
    const messages = loadMessages(lang);
    const whitelist = loadWhitelist(lang);
    const diffRes = diff(extracted, messages, whitelist, refDiffRes.modified);
    printDiffInfo(lang, diffRes);
    applyDiff(messages, extracted, whitelist, diffRes);
    saveMessages(lang, messages);
    saveWhitelist(lang, whitelist);
  });
}

processTranslations().catch(e => console.error(e));
