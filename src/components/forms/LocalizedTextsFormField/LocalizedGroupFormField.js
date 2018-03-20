import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'redux-form';
import {
  MarkdownTextAreaField,
  LanguageSelectField,
  TextField
} from '../Fields';

const LocalizedGroupFormField = ({ prefix }) =>
  <div>
    <Field
      name={`${prefix}.name`}
      component={TextField}
      label={
        <span>
          <FormattedMessage id="generic.name" defaultMessage="Name" />:
        </span>
      }
    />

    <Field
      name={`${prefix}.locale`}
      component={LanguageSelectField}
      label={
        <FormattedMessage
          id="app.editGroupForm.localized.locale"
          defaultMessage="The language:"
        />
      }
    />

    <Field
      name={`${prefix}.description`}
      component={MarkdownTextAreaField}
      label={
        <FormattedMessage
          id="app.editGroupForm.description"
          defaultMessage="Group description:"
        />
      }
    />
  </div>;

LocalizedGroupFormField.propTypes = {
  prefix: PropTypes.string.isRequired
};

export default LocalizedGroupFormField;
