import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { TabbedArrayField } from '../Fields';
import LocalizedExerciseFormField from './LocalizedExerciseFormField';
import LocalizedGroupFormField from './LocalizedGroupFormField';

const fieldTypes = {
  assignment: LocalizedExerciseFormField,
  exercise: LocalizedExerciseFormField,
  group: LocalizedGroupFormField
};

const LocalizedTextsFormField = ({
  localizedTextsLocales = [],
  fieldType,
  ...props
}) => {
  return (
    <TabbedArrayField
      {...props}
      getTitle={i =>
        localizedTextsLocales && localizedTextsLocales[i]
          ? localizedTextsLocales[i]
          : <FormattedMessage
              id="app.editLocalizedTextForm.newLocale"
              defaultMessage="New language"
            />}
      ContentComponent={fieldTypes[fieldType]}
      isAssignment={fieldType === 'assignment'}
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
    />
  );
};

LocalizedTextsFormField.propTypes = {
  localizedTextsLocales: PropTypes.array,
  fieldType: PropTypes.string.isRequired
};

export default LocalizedTextsFormField;
