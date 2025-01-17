import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { reduxForm, Field } from 'redux-form';
import { Form } from 'react-bootstrap';

import SubmitButton from '../SubmitButton';
import { TextField } from '../Fields';
import Callout from '../../widgets/Callout';
import { SaveIcon } from '../../icons';

const EditSolutionNoteForm = ({
  onSubmit,
  submitting,
  handleSubmit,
  dirty,
  invalid,
  submitFailed = false,
  submitSucceeded = false,
}) => (
  <Form method="POST" onSubmit={onSubmit}>
    {submitFailed && (
      <Callout variant="danger">
        <FormattedMessage id="app.editSolutionNoteForm.failed" defaultMessage="Cannot save the solution note." />
      </Callout>
    )}

    <Field
      component={TextField}
      name="note"
      maxLength={1024}
      label={<FormattedMessage id="app.editSolutionNoteForm.note" defaultMessage="Note:" />}
      autoFocus
    />

    <hr />

    <div className="text-center">
      <SubmitButton
        id="edit-solution-note"
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
    </div>
  </Form>
);

EditSolutionNoteForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  submitFailed: PropTypes.bool,
  dirty: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  submitting: PropTypes.bool,
  invalid: PropTypes.bool,
};

export default reduxForm({
  form: 'edit-solution-note',
  enableReinitialize: true,
  keepDirtyOnReinitialize: false,
})(EditSolutionNoteForm);
