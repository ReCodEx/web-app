import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, intlShape, injectIntl } from 'react-intl';
import { reduxForm, Field } from 'redux-form';
import { Alert } from 'react-bootstrap';
import isInt from 'validator/lib/isInt';
import FormBox from '../../widgets/FormBox';
import SubmitButton from '../SubmitButton';
import Button from '../../widgets/FlatButton';
import { RefreshIcon } from '../../icons';

import { SelectField } from '../Fields';

const EditHardwareGroupForm = ({
  handleSubmit,
  submitting,
  submitFailed,
  submitSucceeded,
  dirty,
  invalid,
  reset,
  hardwareGroups,
  addEmptyOption = true,
  intl: { locale }
}) =>
  <FormBox
    title={
      <FormattedMessage
        id="app.editHardwareGroupForm.title"
        defaultMessage="Select Hardware Group"
      />
    }
    type={submitSucceeded ? 'success' : undefined}
    footer={
      <div className="text-center">
        {dirty &&
          !submitting &&
          !submitSucceeded &&
          <span>
            <Button
              type="reset"
              onClick={reset}
              bsStyle={'danger'}
              className="btn-flat"
            >
              <RefreshIcon /> &nbsp;
              <FormattedMessage id="generic.reset" defaultMessage="Reset" />
            </Button>{' '}
          </span>}
        <SubmitButton
          id="edit-hardware-groups"
          handleSubmit={handleSubmit}
          submitting={submitting}
          dirty={dirty}
          hasSucceeded={submitSucceeded}
          hasFailed={submitFailed}
          invalid={invalid}
          messages={{
            submit: (
              <FormattedMessage id="generic.save" defaultMessage="Save" />
            ),
            submitting: (
              <FormattedMessage
                id="generic.saving"
                defaultMessage="Saving ..."
              />
            ),
            success: (
              <FormattedMessage id="generic.saved" defaultMessage="Saved" />
            )
          }}
        />
      </div>
    }
  >
    {submitFailed &&
      <Alert bsStyle="danger">
        <FormattedMessage
          id="app.editHardwareGroupForm.failed"
          defaultMessage="Cannot change the hardware group of the exercise."
        />
      </Alert>}

    <Field
      name="hardwareGroup"
      component={SelectField}
      options={hardwareGroups
        .map(hwg => ({ key: hwg.id, name: hwg.name }))
        .sort((a, b) => a.name.localeCompare(b.name, locale))}
      addEmptyOption={addEmptyOption}
      label={
        <FormattedMessage
          id="app.editHardwareGroupForm.hwGroupSelect"
          defaultMessage="Hardware Group:"
        />
      }
    />
  </FormBox>;

EditHardwareGroupForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  submitFailed: PropTypes.bool,
  dirty: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  submitting: PropTypes.bool,
  invalid: PropTypes.bool,
  reset: PropTypes.func.isRequired,
  hardwareGroups: PropTypes.array.isRequired,
  addEmptyOption: PropTypes.bool,
  intl: intlShape.isRequired
};

const validate = ({ bonusPoints }) => {
  const errors = {};
  if (!isInt(String(bonusPoints))) {
    errors['bonusPoints'] = (
      <FormattedMessage
        id="app.bonusPointsForm.validation.points"
        defaultMessage="The bonus must be an integer."
      />
    );
  }

  return errors;
};

export default reduxForm({
  form: 'editHardwareGroup',
  enableReinitialize: true,
  keepDirtyOnReinitialize: false,
  validate
})(injectIntl(EditHardwareGroupForm));
