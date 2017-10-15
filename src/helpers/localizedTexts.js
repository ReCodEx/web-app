export const getLocalizedName = (texts, locale, defaultName) => {
  const localizedText = texts.find(text => text.locale === locale);
  return localizedText ? localizedText.shortText : defaultName;
};
