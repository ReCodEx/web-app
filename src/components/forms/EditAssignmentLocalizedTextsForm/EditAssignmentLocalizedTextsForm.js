import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, FieldArray } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { lruMemoize } from 'reselect';

import { RefreshIcon, WarningIcon } from '../../icons';
import LocalizedTextsFormField from '../LocalizedTextsFormField';
import SubmitButton from '../SubmitButton';
import Callout from '../../widgets/Callout';
import Button, { TheButtonGroup } from '../../widgets/TheButton';
import {
  getLocalizedTextsInitialValues,
  validateLocalizedTextsFormData,
  transformLocalizedTextsFormData,
  replaceLinkKeysWithUrls,
} from '../../../helpers/localizedData.js';

const localizedTextDefaults = {
  name: '',
  text: '',
  link: '',
};

const previewPreprocessor = lruMemoize(
  localizedTextsLinks => text => replaceLinkKeysWithUrls(text, localizedTextsLinks)
);

/**
 * Create initial values for the form. It expects one object as input argument.
 * If the object is assignment object, it correctly prepares editing form.
 * If the object holds `groups` property, it prepares multi-assign form.
 */
export const prepareInitialValues = lruMemoize(({ localizedTexts = null }) => ({
  localizedTexts: localizedTexts && getLocalizedTextsInitialValues(localizedTexts, localizedTextDefaults),
}));

export const transformSubmittedData = ({ localizedTexts = null }) => {
  const res = {
    localizedTexts: transformLocalizedTextsFormData(localizedTexts),
  };
  return res;
};

const SUBMIT_BUTTON_MESSAGES_DEFAULT = {
  submit: <FormattedMessage id="generic.save" defaultMessage="Save" />,
  submitting: <FormattedMessage id="generic.saving" defaultMessage="Saving..." />,
  success: <FormattedMessage id="generic.saved" defaultMessage="Saved" />,
};

class EditAssignmentLocalizedTextsForm extends Component {
  /**
   * Wraps the onSubmit callback passed from the parent component.
   * (note that submitHandler in which this function is used is redux-form internal routine to handle submits)
   */
  onSubmitWrapper = formData => {
    const { onSubmit } = this.props;
    return onSubmit(transformSubmittedData(formData));
  };

  render() {
    const {
      localizedTextsLinks,
      dirty,
      submitting,
      handleSubmit,
      reset,
      submitFailed,
      submitSucceeded,
      asyncValidating = false,
      invalid,
      error,
      warning,
      submitButtonMessages = SUBMIT_BUTTON_MESSAGES_DEFAULT,
    } = this.props;

    return (
      <>
        <Callout variant="info" icon={<WarningIcon />}>
          <FormattedMessage
            id="app.editAssignmentLocalizedTextsForm.localized.assignmentSyncInfo"
            defaultMessage="Please note that the localized texts below are overwritten by the most recent data from the exercise when update of the assignment is invoked (if the exercise has been modified after the assignment). If you wish to make permanent changes, update the localized text in the exercise and then synchronize the assignment."
          />
        </Callout>

        <FieldArray
          name="localizedTexts"
          component={LocalizedTextsFormField}
          fieldType="assignmentExercise"
          previewPreprocessor={previewPreprocessor(localizedTextsLinks)}
        />
        {error && <Callout variant="danger">{error}</Callout>}

        {warning && !error && <Callout variant="warning">{warning}</Callout>}

        <div className="text-center">
          <TheButtonGroup>
            {dirty && (
              <Button type="reset" onClick={reset} variant="danger">
                <RefreshIcon gapRight={2} />
                <FormattedMessage id="generic.reset" defaultMessage="Reset" />
              </Button>
            )}
            <SubmitButton
              id="editAssignmentLocalizedTextsForm"
              invalid={invalid}
              submitting={submitting}
              dirty={dirty}
              hasSucceeded={submitSucceeded}
              hasFailed={submitFailed}
              handleSubmit={handleSubmit(this.onSubmitWrapper)}
              asyncValidating={asyncValidating}
              messages={submitButtonMessages}
            />
          </TheButtonGroup>

          {submitFailed && (
            <span className="ms-4 text-danger">
              <WarningIcon gapRight={2} />
              <FormattedMessage id="generic.savingFailed" defaultMessage="Saving failed. Please try again later." />
            </span>
          )}
        </div>
      </>
    );
  }
}

EditAssignmentLocalizedTextsForm.propTypes = {
  localizedTextsLinks: PropTypes.object,
  initialValues: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  error: PropTypes.object,
  warning: PropTypes.object,
  dirty: PropTypes.bool,
  submitting: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  asyncValidating: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  invalid: PropTypes.bool,
  reset: PropTypes.func.isRequired,
  submitButtonMessages: PropTypes.object,
};

const validate = ({ localizedTexts }) => {
  const errors = {};

  validateLocalizedTextsFormData(errors, localizedTexts, ({ name, text, link }) => {
    const textErrors = {};
    if (!name.trim()) {
      textErrors.name = (
        <FormattedMessage
          id="app.editAssignmentForm.validation.emptyName"
          defaultMessage="Please fill the name of the assignment."
        />
      );
    }

    if (!text.trim() && !link.trim()) {
      textErrors.text = (
        <FormattedMessage
          id="app.editAssignmentForm.validation.localizedText.text"
          defaultMessage="Please fill the description or provide an external link below."
        />
      );
    }

    return textErrors;
  });

  return errors;
};

export default reduxForm({
  validate,
  enableReinitialize: true,
  keepDirtyOnReinitialize: false,
})(EditAssignmentLocalizedTextsForm);
