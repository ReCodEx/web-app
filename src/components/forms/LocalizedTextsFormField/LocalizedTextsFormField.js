import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'redux-form';
import {
  TabbedArrayField,
  MarkdownTextAreaField,
  LanguageSelectField
} from '../Fields';

const LocalizedTextsFormField = ({ fields, localizedTexts = [] }) => (
  <TabbedArrayField
    fields={fields}
    localizedTexts={localizedTexts}
    getTitle={i =>
      localizedTexts && localizedTexts[i] && localizedTexts[i].locale
        ? localizedTexts[i].locale
        : <FormattedMessage
            id="app.editAssignmentForm.newLocale"
            defaultMessage="New language"
          />}
    ContentComponent={({ prefix, i }) => (
      <div>
        <Field
          name={`${prefix}.locale`}
          component={LanguageSelectField}
          label={
            <FormattedMessage
              id="app.editAssignmentForm.localized.locale"
              defaultMessage="The language:"
            />
          }
        />

        <Field
          name={`${prefix}.text`}
          component={MarkdownTextAreaField}
          label={
            <FormattedMessage
              id="app.editAssignmentForm.localized.assignment"
              defaultMessage="Description for the students:"
            />
          }
        />
      </div>
    )}
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
  fields: PropTypes.object,
  localizedTexts: PropTypes.array
};

export default LocalizedTextsFormField;
