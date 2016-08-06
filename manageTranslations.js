import manageTranslations from 'react-intl-translations-manager';

manageTranslations({
  messagesDirectory: 'build/messages',
  translationsDirectory: 'src/locales/',
  languages: ['en', 'cs'],
});
