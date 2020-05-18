import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, FormattedMessage, defineMessages, intlShape } from 'react-intl';
import { Alert } from 'react-bootstrap';
import { reduxForm, Field } from 'redux-form';

import FormBox from '../../widgets/FormBox';
import { SelectField } from '../Fields';
import SubmitButton from '../SubmitButton';
import { WarningIcon } from '../../../components/icons';

import withLinks from '../../../helpers/withLinks';

const messages = defineMessages({
  emptyOption: {
    id: 'app.createExerciseForm.selectGroupFirst',
    defaultMessage: '... select group of residence first ...',
  },
});

class CreateExerciseForm extends Component {
  render() {
    const {
      submitting,
      handleSubmit,
      submitFailed,
      submitSucceeded,
      invalid,
      groups,
      intl: { formatMessage },
    } = this.props;

    return (
      <FormBox
        title={<FormattedMessage id="app.createExerciseForm.title" defaultMessage="Create New Exercise" />}
        type={submitSucceeded ? 'success' : undefined}>
        <React.Fragment>
          <table>
            <tr>
              <td className="valign-top full-width">
                <Field
                  name="groupId"
                  component={SelectField}
                  label=""
                  ignoreDirty
                  addEmptyOption
                  emptyOptionCaption={formatMessage(messages.emptyOption)}
                  options={groups}
                />
              </td>
              <td className="valign-top">
                <SubmitButton
                  id="createExercise"
                  disabled={invalid}
                  submitting={submitting}
                  hasSucceeded={submitSucceeded}
                  hasFailed={submitFailed}
                  handleSubmit={handleSubmit}
                  messages={{
                    submit: <FormattedMessage id="generic.create" defaultMessage="Create" />,
                    submitting: <FormattedMessage id="generic.creating" defaultMessage="Creating..." />,
                    success: <FormattedMessage id="generic.created" defaultMessage="Created" />,
                  }}
                />
              </td>
            </tr>
          </table>

          {submitFailed && (
            <Alert bsStyle="danger">
              <WarningIcon gapRight />
              <FormattedMessage id="generic.creationFailed" defaultMessage="Creation failed. Please try again later." />
            </Alert>
          )}
        </React.Fragment>
      </FormBox>
    );
  }
}

CreateExerciseForm.propTypes = {
  submitting: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  invalid: PropTypes.bool,
  handleSubmit: PropTypes.func.isRequired,
  groups: PropTypes.array.isRequired,
  intl: intlShape,
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
  })(injectIntl(CreateExerciseForm))
);
