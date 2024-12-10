import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { reduxForm, Field } from 'redux-form';

import FormBox from '../../widgets/FormBox';
import SubmitButton from '../SubmitButton';
import Button, { TheButtonGroup } from '../../widgets/TheButton';
import Callout from '../../widgets/Callout';
import { InfoIcon, SaveIcon, RefreshIcon } from '../../icons';

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
}) => (
  <FormBox
    id="hwgroup-form"
    title={<FormattedMessage id="app.editHardwareGroupForm.title" defaultMessage="Select Hardware Group" />}
    type={submitSucceeded ? 'success' : undefined}
    footer={
      <div className="text-center">
        <TheButtonGroup>
          {dirty && !submitting && !submitSucceeded && (
            <Button type="reset" onClick={reset} variant="danger">
              <RefreshIcon gapRight={2} />
              <FormattedMessage id="generic.reset" defaultMessage="Reset" />
            </Button>
          )}
          <SubmitButton
            id="edit-hardware-groups"
            handleSubmit={handleSubmit}
            submitting={submitting}
            dirty={dirty}
            hasSucceeded={submitSucceeded}
            hasFailed={submitFailed}
            invalid={invalid}
            defaultIcon={<SaveIcon gapRight={2} />}
            messages={{
              submit: <FormattedMessage id="generic.save" defaultMessage="Save" />,
              submitting: <FormattedMessage id="generic.saving" defaultMessage="Saving..." />,
              success: <FormattedMessage id="generic.saved" defaultMessage="Saved" />,
            }}
          />
        </TheButtonGroup>
      </div>
    }>
    <p className="text-body-secondary small">
      <InfoIcon gapRight={2} />
      <FormattedMessage
        id="app.editHardwareGroupForm.about"
        defaultMessage="Hardware group is a group of backend workers on which the exercise can be evaluated. The workers are bound to explicit hardware; thus, changing the hardware group of an exercise may affect the performance results. Furthermore, the workers in the group share configuration which implies the constraints for memory and time limits."
      />
    </p>

    {submitFailed && (
      <Callout variant="danger">
        <FormattedMessage
          id="app.editHardwareGroupForm.failed"
          defaultMessage="Cannot change the hardware group of the exercise."
        />
      </Callout>
    )}

    <Field
      name="hardwareGroup"
      component={SelectField}
      options={
        hardwareGroups.map(hwg => ({ key: hwg.id, name: hwg.name })).sort((a, b) => a.key.localeCompare(b.key)) // intentionally no locale (key is our identifier)
      }
      addEmptyOption={addEmptyOption}
      label={<FormattedMessage id="app.editHardwareGroupForm.hwGroupSelect" defaultMessage="Hardware Group:" />}
    />
  </FormBox>
);

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
  warnDropLimits: PropTypes.func.isRequired,
};

const validate = ({ hardwareGroup }) => {
  const errors = {};
  if (!hardwareGroup) {
    errors.hardwareGroup = (
      <FormattedMessage
        id="app.editHardwareGroupForm.validationFailed"
        defaultMessage="Hardware group must be selected."
      />
    );
  }

  return errors;
};

const warn = ({ hardwareGroup }, { warnDropLimits }) => {
  const warnings = {};
  if (warnDropLimits(hardwareGroup)) {
    warnings.hardwareGroup = (
      <FormattedMessage
        id="app.editHardwareGroupForm.warnLimitsDrop"
        defaultMessage="Limits of some environments do not meet the constraints of the selected hardware group. These limits will be saturated or even removed when the hardware group is changed."
      />
    );
  }
  return warnings;
};

export default reduxForm({
  form: 'editHardwareGroup',
  enableReinitialize: true,
  keepDirtyOnReinitialize: false,
  validate,
  warn,
})(EditHardwareGroupForm);
