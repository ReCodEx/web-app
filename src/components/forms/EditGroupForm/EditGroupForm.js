import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { reduxForm, Field, FieldArray } from 'redux-form';
import { Alert } from 'react-bootstrap';
import FormBox from '../../widgets/FormBox';
import SubmitButton from '../SubmitButton';
import LocalizedTextsFormField from '../LocalizedTextsFormField';

import { TextField, CheckboxField } from '../Fields';

const EditGroupForm = ({
  submitting,
  handleSubmit,
  anyTouched,
  submitFailed = false,
  submitSucceeded = false,
  invalid,
  createNew = false,
  formValues: { localizedTexts } = {},
  collapsable = false,
  isOpen = true
}) =>
  <FormBox
    title={
      createNew
        ? <FormattedMessage
            id="app.editGroupForm.titleNew"
            defaultMessage="Create new group"
          />
        : <FormattedMessage
            id="app.editGroupForm.titleEdit"
            defaultMessage="Edit group"
          />
    }
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
            submit: createNew
              ? <FormattedMessage
                  id="app.editGroupForm.successNew"
                  defaultMessage="Group has been created"
                />
              : <FormattedMessage
                  id="app.editGroupForm.set"
                  defaultMessage="Edit group"
                />,
            submitting: (
              <FormattedMessage
                id="app.editGroupForm.processing"
                defaultMessage="Saving ..."
              />
            ),
            success: (
              <FormattedMessage
                id="app.editGroupForm.success"
                defaultMessage="Group settings has been saved."
              />
            )
          }}
        />
      </div>
    }
    collapsable={collapsable}
    isOpen={isOpen}
    unlimitedheight
  >
    {submitFailed &&
      <Alert bsStyle="danger">
        <FormattedMessage
          id="app.editGroupForm.failed"
          defaultMessage="Cannot save group's settings."
        />
      </Alert>}

    <FieldArray
      name="localizedTexts"
      localizedTexts={localizedTexts}
      component={LocalizedTextsFormField}
    />

    <Field
      name="externalId"
      tabIndex={2}
      component={TextField}
      required
      label={
        <FormattedMessage
          id="app.createGroup.externalId"
          defaultMessage="External ID of the group (e. g. ID of the group in the school IS):"
        />
      }
    />

    <Field
      name="isPublic"
      tabIndex={4}
      component={CheckboxField}
      onOff
      label={
        <FormattedMessage
          id="app.createGroup.isPublic"
          defaultMessage="Students can join the group themselves"
        />
      }
      required
    />

    <Field
      name="publicStats"
      tabIndex={5}
      component={CheckboxField}
      onOff
      label={
        <FormattedMessage
          id="app.createGroup.publicStats"
          defaultMessage="Students can see statistics of each other"
        />
      }
      required
    />

    <Field
      name="threshold"
      tabIndex={6}
      component={TextField}
      label={
        <FormattedMessage
          id="app.createGroup.threshold"
          defaultMessage="Minimum percent of the total points count needed to complete the course:"
        />
      }
    />
  </FormBox>;

EditGroupForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  anyTouched: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  submitting: PropTypes.bool,
  invalid: PropTypes.bool,
  formValues: PropTypes.shape({
    localizedTexts: PropTypes.array
  }),
  createNew: PropTypes.bool,
  collapsable: PropTypes.bool,
  isOpen: PropTypes.bool
};

const validate = ({ localizedTexts = [], threshold }) => {
  const errors = {};

  if (threshold) {
    const numericThreshold = Number(threshold);
    if (threshold !== Math.round(numericThreshold).toString()) {
      errors['threshold'] = (
        <FormattedMessage
          id="app.createGroup.validation.thresholdMustBeInteger"
          defaultMessage="Threshold must be an integer."
        />
      );
    } else if (numericThreshold < 0 || numericThreshold > 100) {
      errors['threshold'] = (
        <FormattedMessage
          id="app.createGroup.validation.thresholdBetweenZeroHundred"
          defaultMessage="Threshold must be an integer in between 0 and 100."
        />
      );
    }
  }

  if (localizedTexts.length < 1) {
    errors['_error'] = (
      <FormattedMessage
        id="app.createGroupForm.validation.noLocalizedText"
        defaultMessage="Please add at least one localized text describing the group."
      />
    );
  }

  const localizedTextsErrors = {};
  for (let i = 0; i < localizedTexts.length; ++i) {
    const localeErrors = {};
    if (!localizedTexts[i]) {
      localeErrors['locale'] = (
        <FormattedMessage
          id="app.editGroupForm.validation.localizedText"
          defaultMessage="Please fill localized information."
        />
      );
    } else {
      if (!localizedTexts[i].name) {
        localeErrors['name'] = (
          <FormattedMessage
            id="app.editGroupForm.validation.emptyName"
            defaultMessage="Please fill the name of the group."
          />
        );
      }

      if (!localizedTexts[i].locale) {
        localeErrors['locale'] = (
          <FormattedMessage
            id="app.editGroupForm.validation.localizedText.locale"
            defaultMessage="Please select the language."
          />
        );
      }

      if (!localizedTexts[i].text) {
        localeErrors['text'] = (
          <FormattedMessage
            id="app.editGroupForm.validation.localizedText.text"
            defaultMessage="Please fill the description in this language."
          />
        );
      }

      if (!localizedTexts[i].description) {
        localeErrors['description'] = (
          <FormattedMessage
            id="app.editGroupForm.validation.description"
            defaultMessage="Please fill the description of the group."
          />
        );
      }
    }

    localizedTextsErrors[i] = localeErrors;
  }

  const localeArr = localizedTexts
    .filter(text => text !== undefined)
    .map(text => text.locale);
  for (let i = 0; i < localeArr.length; ++i) {
    if (localeArr.indexOf(localeArr[i]) !== i) {
      if (!localizedTextsErrors[i].locale) {
        localizedTextsErrors[i].locale = (
          <FormattedMessage
            id="app.editGroupForm.validation.sameLocalizedTexts"
            defaultMessage="There are more language variants with the same locale. Please make sure locales are unique."
          />
        );
      }
    }
  }
  errors['localizedTexts'] = localizedTextsErrors;

  return errors;
};

export default reduxForm({
  form: 'editGroup',
  validate
})(EditGroupForm);
