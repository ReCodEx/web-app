import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'redux-form';
import { TextField, CheckboxField } from '../Fields';

const SharedLocalizedFields = ({ prefix, enabled }) =>
  <React.Fragment>
    <Field
      name={`${prefix}._enabled`}
      component={CheckboxField}
      onOff
      label={
        <FormattedMessage
          id="app.editLocalizedTextForm.localeEnabledCheckbox"
          defaultMessage="Enable this localization"
        />
      }
    />

    <Field
      name={`${prefix}.name`}
      component={TextField}
      disabled={!enabled}
      label={
        <span>
          <FormattedMessage id="generic.name" defaultMessage="Name" />:
        </span>
      }
    />
  </React.Fragment>;

SharedLocalizedFields.propTypes = {
  prefix: PropTypes.string.isRequired,
  enabled: PropTypes.bool.isRequired
};

export default SharedLocalizedFields;
