import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { reduxForm, Field } from 'redux-form';
import { Alert } from 'react-bootstrap';
import FormBox from '../../AdminLTE/FormBox';
import SubmitButton from '../SubmitButton';

import { TextField, CheckboxField, MarkdownTextAreaField } from '../Fields';

const EditGroupForm = ({
  submitting,
  handleSubmit,
  anyTouched,
  submitFailed = false,
  submitSucceeded = false,
  invalid
}) => (
  <FormBox
    title={<FormattedMessage id="app.editGroupForm.title" defaultMessage="Edit group" />}
    type={submitSucceeded ? 'success' : undefined}
    footer={
      <div className="text-center">
        <SubmitButton
          id="editGroup"
          handleSubmit={handleSubmit}
          submitting={submitting}
          dirty={anyTouched}
          hasSucceeded={submitSucceeded}
          hasFailed={submitFailed}
          invalid={invalid}
          messages={{
            submit: <FormattedMessage id="app.editGroupForm.set" defaultMessage="Edit group" />,
            submitting: <FormattedMessage id="app.editGroupForm.processing" defaultMessage="Saving ..." />,
            success: <FormattedMessage id="app.editGroupForm.success" defaultMessage="Group settings has been saved." />
          }} />
      </div>
    }>
    {submitFailed && (
      <Alert bsStyle="danger">
        <FormattedMessage id="app.editGroupForm.failed" defaultMessage="Cannot save group's settings." />
      </Alert>)}

      <Field
        name="name"
        tabIndex={1}
        component={TextField}
        required
        label={<FormattedMessage id="app.createGroup.groupName" defaultMessage="Name:" />} />

      <Field
        name="externalId"
        tabIndex={2}
        component={TextField}
        required
        label={<FormattedMessage id="app.createGroup.externalId" defaultMessage="External ID of the group (e. g. ID of the group in the school IS):" />} />

      <Field
        name="description"
        tabIndex={3}
        component={MarkdownTextAreaField}
        required
        label={<FormattedMessage id="app.createGroup.groupDescription" defaultMessage="Description:" />} />

      <Field
        name="isPublic"
        tabIndex={4}
        component={CheckboxField}
        onOff
        label={<FormattedMessage id="app.createGroup.isPublic" defaultMessage="Students can join the group themselves" />}
        required />

      <Field
        name="publicStats"
        tabIndex={5}
        component={CheckboxField}
        onOff
        label={<FormattedMessage id="app.createGroup.publicStats" defaultMessage="Students can see statistics of each other" />}
        required />

      <Field
        name="threshold"
        tabIndex={6}
        component={TextField}
        label={<FormattedMessage id="app.createGroup.threshold" defaultMessage="Minimum percent of the total points count needed to complete the course:" />} />
  </FormBox>
);

EditGroupForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  anyTouched: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  submitting: PropTypes.bool,
  invalid: PropTypes.bool
};

const validate = ({ name, description, threshold }) => {
  const errors = {};

  if (!name || name.length === 0) {
    errors['name'] = <FormattedMessage id="app.createGroup.validation.emptyName" defaultMessage="Group name cannot be empty." />;
  }

  if (!description || description.length === 0) {
    errors['description'] = <FormattedMessage id="app.createGroup.validation.emptyDescription" defaultMessage="Group description cannot be empty." />;
  }

  if (threshold) {
    const numericThreshold = Number(threshold);
    if (threshold !== Math.round(numericThreshold).toString()) {
      errors['threshold'] = <FormattedMessage id="app.createGroup.validation.thresholdMustBeInteger" defaultMessage="Threshold must be an integer." />;
    } else if (numericThreshold < 0 || numericThreshold > 100) {
      errors['threshold'] = <FormattedMessage id="app.createGroup.validation.thresholdBetweenZeroHundred" defaultMessage="Threshold must be an integer in between 0 and 100." />;
    }
  }

  return errors;
};

export default reduxForm({
  form: 'edit-group',
  validate
})(EditGroupForm);
