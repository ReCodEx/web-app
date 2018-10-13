import manageTranslations from 'react-intl-translations-manager';
import fs from 'fs'

const translationsDirectory = './src/locales/';

manageTranslations({
  messagesDirectory: './tmp/messages',
  translationsDirectory,
  languages: ['en', 'cs'],
  detectDuplicateIds: false
});

const enData = JSON.parse(fs.readFileSync(translationsDirectory + 'en.json', 'utf8'));
const whiteList = Object.keys(enData);
fs.writeFileSync(translationsDirectory + 'whitelist_en.json', JSON.stringify(whiteList, null, 2));
