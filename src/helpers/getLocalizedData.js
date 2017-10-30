const getLocalizedX = field => (entity, locale) => {
  const localizedText = entity.localizedTexts.find(
    text => text.locale === locale
  );
  return localizedText ? localizedText[field] : entity[field];
};

export const getLocalizedName = getLocalizedX('name');
export const getLocalizedDescription = getLocalizedX('description');
