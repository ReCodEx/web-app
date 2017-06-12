import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { reduxForm, Field } from 'redux-form';
import FormBox from '../../widgets/FormBox';
import { Alert } from 'react-bootstrap';
import { TextField, MarkdownTextAreaField, CheckboxField } from '../Fields';
import { validateAddGroup } from '../../../redux/modules/groups';
import SubmitButton from '../SubmitButton';

const CreateGroupForm = ({
  title = (
    <FormattedMessage
      id="app.createGroupForm.title"
      defaultMessage="Create new group"
    />
  ),
  handleSubmit,
  submitSucceeded = false,
  submitFailed = false,
  anyTouched = false,
  asyncValidating = false,
  invalid = false,
  submitting = false,
  reset
}) =>
  <FormBox
    title={title}
    type={submitSucceeded ? 'success' : undefined}
    unlimitedHeight
    collapsable
    isOpen={false}
    footer={
      <div className="text-center">
        <SubmitButton
          id="createGroup"
          handleSubmit={handleSubmit}
          tabIndex={3}
          submitting={submitting}
          invalid={invalid}
          dirty={anyTouched}
          hasFailed={submitFailed}
          hasSuceeded={submitSucceeded}
          asyncValidating={asyncValidating}
          reset={reset}
          messages={{
            success: (
              <FormattedMessage
                id="app.createGroupForm.success"
                defaultMessage="Group has been created"
              />
            ),
            submit: (
              <FormattedMessage
                id="app.createGroupForm.createGroup"
                defaultMessage="Create new group"
              />
            ),
            submitting: (
              <FormattedMessage
                id="app.createGroupForm.processing"
                defaultMessage="Group is being created ..."
              />
            )
          }}
        />
      </div>
    }
  >
    {submitFailed &&
      <Alert bsStyle="danger">
        <FormattedMessage
          id="app.createGroupForm.failed"
          defaultMessage="We are sorry but we weren't able to create a new group."
        />
      </Alert>}

    <Field
      name="name"
      tabIndex={1}
      component={TextField}
      required
      label={
        <FormattedMessage
          id="app.createGroup.groupName"
          defaultMessage="Name:"
        />
      }
    />

    <Field
      name="externalId"
      tabIndex={2}
      component={TextField}
      required
      label={
        <FormattedMessage
          id="app.createGroup.externalId"
          defaultMessage="External ID (e. g. ID of the group in the school IS):"
        />
      }
    />

    <Field
      name="description"
      tabIndex={3}
      component={MarkdownTextAreaField}
      required
      label={
        <FormattedMessage
          id="app.createGroup.groupDescription"
          defaultMessage="Description:"
        />
      }
    />

    <Field
      name="publicStats"
      tabIndex={4}
      component={CheckboxField}
      label={
        <FormattedMessage
          id="app.createGroup.publicStats"
          defaultMessage="Students can see statistics of each other"
        />
      }
    />
  </FormBox>;

CreateGroupForm.propTypes = {
  title: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) })
  ]),
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  anyTouched: PropTypes.bool,
  asyncValidating: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  invalid: PropTypes.bool,
  submitting: PropTypes.bool,
  parentGroupId: PropTypes.string
};

const validate = ({ name, description }) => {
  const errors = {};

  if (!name || name.length === 0) {
    errors['name'] = (
      <FormattedMessage
        id="app.createGroup.validation.emptyName"
        defaultMessage="Group name cannot be empty."
      />
    );
  }

  if (!description || description.length === 0) {
    errors['description'] = (
      <FormattedMessage
        id="app.createGroup.validation.emptyDescription"
        defaultMessage="Group description cannot be empty."
      />
    );
  }

  return errors;
};

const asyncValidate = (
  { name },
  dispatch,
  { instanceId, parentGroupId = undefined }
) =>
  dispatch(validateAddGroup(name, instanceId, parentGroupId))
    .then(res => res.value)
    .then(({ groupNameIsFree }) => {
      var errors = {};

      if (!groupNameIsFree) {
        errors['name'] = (
          <FormattedMessage
            id="app.createGroup.validation.nameCollision"
            defaultMessage="The name &quot;{name}&quot; is already used, please choose a different one."
            values={{ name }}
          />
        );
      }

      if (Object.keys(errors).length > 0) {
        throw errors;
      }
    });

export default reduxForm({
  form: 'createGroup',
  validate,
  asyncValidate,
  asyncBlurFields: ['name']
})(CreateGroupForm);
