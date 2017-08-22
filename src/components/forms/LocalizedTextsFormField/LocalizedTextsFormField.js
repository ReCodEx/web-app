import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { TabbedArrayField } from '../Fields';
import LocalizedTextFormField from './LocalizedTextFormField';

const LocalizedTextsFormField = ({ localizedTexts = [], ...props }) => (
  <TabbedArrayField
    {...props}
    getTitle={i =>
      localizedTexts && localizedTexts[i] && localizedTexts[i].locale
        ? localizedTexts[i].locale
        : <FormattedMessage
            id="app.editAssignmentForm.newLocale"
            defaultMessage="New language"
          />}
    ContentComponent={LocalizedTextFormField}
    emptyMessage={
      <FormattedMessage
        id="app.editAssignmentForm.localized.noLanguage"
        defaultMessage="There is currently no text in any language for this assignment."
      />
    }
    addMessage={
      <FormattedMessage
        id="app.editAssignmentForm.addLanguage"
        defaultMessage="Add language variant"
      />
    }
    removeQuestion={
      <FormattedMessage
        id="app.editAssignmentForm.localized.reallyRemoveQuestion"
        defaultMessage="Do you really want to delete the assignmenet in this language?"
      />
    }
    id="localized-assignments"
    add
    remove
  />
);

LocalizedTextsFormField.propTypes = {
  localizedTexts: PropTypes.array
};

export default LocalizedTextsFormField;
