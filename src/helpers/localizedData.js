import React from 'react';
import { FormattedMessage } from 'react-intl';

export const knownLocalesNames = {
  cs: 'Čeština',
  en: 'English',
};

export const knownLocales = Object.keys(knownLocalesNames);

const getLocalizedX = field => (entity, locale) => {
  const localizedText =
    entity &&
    entity.localizedTexts &&
    entity.localizedTexts.length > 0 &&
    (entity.localizedTexts.find(
      text => text && text.locale === locale && text._enabled !== false
    ) ||
      entity.localizedTexts.find(
        text => text && text.locale === 'en' && text._enabled !== false
      ) ||
      entity.localizedTexts.find(text => text && text._enabled !== false));
  return (
    (localizedText && localizedText[field]) || (entity && entity[field]) || ''
  );
};

const getLocalizedResourceX = field => (resource, locale) => {
  const localizedTexts = resource && resource.getIn(['data', 'localizedTexts']);
  const localizedText =
    localizedTexts &&
    localizedTexts.size > 0 &&
    (localizedTexts.find(text => text.get('locale') === locale) ||
      localizedTexts.find(text => text.get('locale') === 'en') ||
      localizedTexts.get(0));
  return (
    (localizedText && localizedText.get(field)) ||
    (resource && resource.getIn(['data', field])) ||
    ''
  );
};

export const getLocalizedName = getLocalizedX('name');
export const getLocalizedDescription = getLocalizedX('description');

export const getLocalizedResourceName = getLocalizedResourceX('name');

export const getOtherLocalizedNames = (entity, locale) => {
  const name = getLocalizedName(entity, locale);
  return (
    entity &&
    entity.localizedTexts &&
    entity.localizedTexts
      .filter(
        text =>
          text && text.name && text.name !== name && text._enabled !== false
      )
      .map(({ name, locale }) => ({ name, locale }))
  );
};

export const getGroupCanonicalLocalizedName = (
  group,
  groupsAccessor,
  locale,
  separator = ' / '
) => {
  if (typeof group === 'string') {
    group = groupsAccessor(group);
    group = group && group.toJS();
  }

  var res =
    group && group.localizedTexts ? getLocalizedName(group, locale) : '??';
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

/**
 * Convert localized texts into redux-form initial values.
 * Each object has _enabled property indicating, whether the locale was present in initial data.
 * @param {array} localizedTexts
 * @param {object} defaults Default values for each locale (used as template for undefined locales
 *  + define editable properties of the locales).
 */
export const getLocalizedTextsInitialValues = (localizedTexts, defaults) => {
  return knownLocales.map(locale => {
    const text = localizedTexts.find(t => t.locale === locale);
    const res = {
      locale,
      _enabled: Boolean(text),
    };
    Object.keys(defaults).forEach(
      prop => (res[prop] = (text && text[prop]) || defaults[prop])
    );
    return res;
  });
};

/**
 * Take form data (localizedTexts array) and convert it back to an array that can be sent to API.
 * @param {array} formData localizedTexts from redux form data
 */
export const transformLocalizedTextsFormData = formData => {
  return formData
    .filter(({ _enabled }) => _enabled)
    .map(({ _enabled, ...data }) => data);
};

/**
 * Global template for localizedTexts validation.
 * Internal validation for different sets of properties is injedted as function.
 * @param errors {object} redux-form validation error object, where errors are collected
 * @param formData {array} localizedTexts form data
 * @param internalValidation {function} injected internal validator called on every enabled localized text
 */
export const validateLocalizedTextsFormData = (
  errors,
  formData,
  internalValidation = null
) => {
  // Ensure that at least one localized text version is enabled.
  const enabledCount = formData.reduce(
    (acc, data) => acc + (data && data._enabled ? 1 : 0),
    0
  );
  if (enabledCount < 1) {
    errors._error = (
      <FormattedMessage
        id="app.localizedTexts.validation.noLocalizedText"
        defaultMessage="Please enable at least one tab of localized texts."
      />
    );
  }

  // Internally validate all enabled verisons...
  const localizedTextsErrors = [];
  let localizedTextsErrorsCount = 0;
  formData
    .filter(({ _enabled }) => _enabled)
    .forEach((data, i) => {
      const localeErrors = internalValidation ? internalValidation(data) : {};
      if (Object.keys(localeErrors).length > 0) {
        localizedTextsErrors[i] = localeErrors;
        localizedTextsErrorsCount++;
      }
    });
  if (localizedTextsErrorsCount > 0) {
    errors.localizedTexts = localizedTextsErrors;
  }

  return errors;
};
