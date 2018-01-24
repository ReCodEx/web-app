const getLocalizedX = field => (entity, locale) => {
  const localizedText = entity.localizedTexts.find(
    text => text.locale === locale
  );
  return localizedText ? localizedText[field] : entity[field];
};

const getLocalizedResourceX = field => (resource, locale) => {
  const localizedTexts = resource && resource.getIn(['data', 'localizedTexts']);
  const localizedText =
    localizedTexts &&
    localizedTexts.find(text => text.get('locale') === locale);
  return localizedText
    ? localizedText.get(field)
    : resource ? resource.getIn(['data', field]) : undefined;
};

export const getLocalizedName = getLocalizedX('name');
export const getLocalizedDescription = getLocalizedX('description');

export const getLocalizedResourceName = getLocalizedResourceX('name');

export const getOtherLocalizedNames = (entity, locale) => {
  const name = getLocalizedName(entity, locale);
  return entity.localizedTexts
    .filter(text => text.name && text.name !== name)
    .map(({ name, locale }) => ({ name, locale }));
};

export const getGroupCanonicalLocalizedName = (
  group,
  groupsAccessor,
  locale,
  separator = ' / '
) => {
  var res = getLocalizedName(group, locale);
  if (group.parentGroupsIds && groupsAccessor) {
    const parentRes = group.parentGroupsIds
      .filter((_, i) => i > 0) // skip the first one (the root group)
      .map(groupsAccessor) // get the group object
      .map(g => g && g.toJS()) // convert to normal JS (from immutable)
      .map(g => (g && g.localizedTexts ? getLocalizedName(g, locale) : '??'))
      .join(separator);
    if (parentRes) {
      res = parentRes + separator + res;
    }
  }
  return res;
};
