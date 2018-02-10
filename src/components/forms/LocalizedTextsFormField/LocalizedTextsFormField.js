import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { TabbedArrayField } from '../Fields';
import LocalizedExerciseFormField from './LocalizedExerciseFormField';
import LocalizedGroupFormField from './LocalizedGroupFormField';

const LocalizedTextsFormField = ({
  localizedTextsLocales = [],
  isGroup = false,
  ...props
}) =>
  <TabbedArrayField
    {...props}
    getTitle={i =>
      localizedTextsLocales && localizedTextsLocales[i]
        ? localizedTextsLocales[i]
        : <FormattedMessage
            id="app.editLocalizedTextForm.newLocale"
            defaultMessage="New language"
          />}
    ContentComponent={
      isGroup ? LocalizedGroupFormField : LocalizedExerciseFormField
    }
    emptyMessage={
      <FormattedMessage
        id="app.editLocalizedTextForm.localized.noLanguage"
        defaultMessage="There is currently no text in any language."
      />
    }
    addMessage={
      <FormattedMessage
        id="app.editLocalizedTextForm.addLanguage"
        defaultMessage="Add language variant"
      />
    }
    removeQuestion={
      <FormattedMessage
        id="app.editLocalizedTextForm.localized.reallyRemoveQuestion"
        defaultMessage="Do you really want to delete this localization?"
      />
    }
    id="localized-texts"
    add
    remove
  />;

LocalizedTextsFormField.propTypes = {
  localizedTextsLocales: PropTypes.array,
  isGroup: PropTypes.bool
};

export default LocalizedTextsFormField;
