import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'redux-form';
import { TextField, CheckboxField } from '../Fields';

const SharedLocalizedFields = ({ prefix, enabled, ignoreDirty = false }) => (
  <>
    <Field
      name={`${prefix}._enabled`}
      component={CheckboxField}
      onOff
      ignoreDirty={ignoreDirty}
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
      maxLength={255}
      disabled={!enabled}
      ignoreDirty={ignoreDirty}
      label={
        <span>
          <FormattedMessage id="generic.name" defaultMessage="Name" />:
        </span>
      }
    />
  </>
);

SharedLocalizedFields.propTypes = {
  prefix: PropTypes.string.isRequired,
  enabled: PropTypes.bool.isRequired,
  ignoreDirty: PropTypes.bool,
};

export default SharedLocalizedFields;
