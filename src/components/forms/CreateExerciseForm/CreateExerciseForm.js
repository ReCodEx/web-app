import React from 'react';
import PropTypes from 'prop-types';
import { useIntl, FormattedMessage, defineMessages } from 'react-intl';
import { reduxForm, Field } from 'redux-form';

import Callout from '../../widgets/Callout';
import FormBox from '../../widgets/FormBox';
import { SelectField } from '../Fields';
import SubmitButton from '../SubmitButton';
import { SendIcon, WarningIcon } from '../../../components/icons';

import withLinks from '../../../helpers/withLinks.js';

const messages = defineMessages({
  emptyOption: {
    id: 'app.createExerciseForm.selectGroupFirst',
    defaultMessage: '... select group of residence first ...',
  },
});

const CreateExerciseForm = ({ submitting, handleSubmit, submitFailed, submitSucceeded, invalid, groups }) => {
  const { formatMessage } = useIntl();
  return (
    <FormBox
      title={<FormattedMessage id="app.createExerciseForm.title" defaultMessage="Create New Exercise" />}
      type={submitSucceeded ? 'success' : undefined}>
      <>
        <Field
          name="groupId"
          component={SelectField}
          label=""
          ignoreDirty
          addEmptyOption
          emptyOptionCaption={formatMessage(messages.emptyOption)}
          options={groups}
          append={
            <SubmitButton
              id="createExercise"
              disabled={invalid}
              submitting={submitting}
              hasSucceeded={submitSucceeded}
              hasFailed={submitFailed}
              handleSubmit={handleSubmit}
              noShadow
              defaultIcon={<SendIcon gapRight={2} />}
              messages={{
                submit: <FormattedMessage id="generic.create" defaultMessage="Create" />,
                submitting: <FormattedMessage id="generic.creating" defaultMessage="Creating..." />,
                success: <FormattedMessage id="generic.created" defaultMessage="Created" />,
              }}
            />
          }
        />

        {submitFailed && (
          <Callout variant="danger">
            <WarningIcon gapRight={2} />
            <FormattedMessage id="generic.creationFailed" defaultMessage="Creation failed. Please try again later." />
          </Callout>
        )}
      </>
    </FormBox>
  );
};

CreateExerciseForm.propTypes = {
  submitting: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  invalid: PropTypes.bool,
  handleSubmit: PropTypes.func.isRequired,
  groups: PropTypes.array.isRequired,
  links: PropTypes.object,
};
const validate = ({ groupId }) => {
  // the error is actually not displayed, but it prevents form submission
  const errors = {};
  if (!groupId) {
    errors._error = (
      <FormattedMessage
        id="app.createExerciseForm.validation.noGroupSelected"
        defaultMessage="No group of residence has been selected."
      />
    );
  }
  return errors;
};

export default withLinks(
  reduxForm({
    form: 'createExercise',
    validate,
    enableReinitialize: true,
    keepDirtyOnReinitialize: false,
  })(CreateExerciseForm)
);
