const getLocalizedX = field => (entity, locale) => {
  const localizedText = entity.localizedTexts.find(
    text => text.locale === locale
  );
  return localizedText ? localizedText[field] : entity[field];
};

export const getLocalizedName = getLocalizedX('name');
export const getLocalizedDescription = getLocalizedX('description');

export const getOtherLocalizedNames = (entity, locale) => {
  const name = getLocalizedName(entity, locale);
  return entity.localizedTexts
    .filter(text => text.name && text.name !== name)
    .map(({ name, locale }) => ({ name, locale }));
};
