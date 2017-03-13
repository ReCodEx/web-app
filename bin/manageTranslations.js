import manageTranslations from 'react-intl-translations-manager';

manageTranslations({
  messagesDirectory: '../tmp/messages',
  translationsDirectory: '../src/locales/',
  languages: ['en', 'cs']
});
