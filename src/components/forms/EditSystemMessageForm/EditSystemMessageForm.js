import React from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field, FieldArray } from 'redux-form';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { Alert, Modal, Button } from 'react-bootstrap';

import { SelectField, DatetimeField } from '../Fields';

import SubmitButton from '../SubmitButton';
import LocalizedTextsFormField from '../LocalizedTextsFormField';
import { validateLocalizedTextsFormData } from '../../../helpers/localizedData';
import withLinks from '../../../helpers/withLinks';
import { CloseIcon } from '../../icons';
import { roleLabelsSimpleMessages } from '../../helpers/usersRoles';

const EditSystemMessageForm = ({
  initialValues,
  error,
  dirty,
  submitting,
  handleSubmit,
  submitFailed,
  submitSucceeded,
  invalid,
  asyncValidating,
  isOpen,
  onClose,
  intl: { formatMessage },
}) => (
  <Modal show={isOpen} backdrop="static" size="lg" onHide={onClose}>
    <Modal.Header closeButton>
      <Modal.Title>
        <FormattedMessage id="app.editSystemMessageForm.title" defaultMessage="Edit System Message" />
      </Modal.Title>
    </Modal.Header>
    <Modal.Body>
      {submitFailed && (
        <Alert bsStyle="danger">
          <FormattedMessage id="generic.savingFailed" defaultMessage="Saving failed. Please try again later." />
        </Alert>
      )}

      <FieldArray name="localizedTexts" component={LocalizedTextsFormField} fieldType="systemMessage" />

      <Field
        name="type"
        component={SelectField}
        options={[
          { key: 'info', name: 'Info' },
          { key: 'warning', name: 'Warning' },
          { key: 'danger', name: 'Danger' },
        ]}
        addEmptyOption
        label={<FormattedMessage id="app.editSystemMessageForm.type" defaultMessage="Type of the notification." />}
      />

      <Field
        name="role"
        component={SelectField}
        options={Object.keys(roleLabelsSimpleMessages).map(role => ({
          key: role,
          name: formatMessage(roleLabelsSimpleMessages[role]),
        }))}
        addEmptyOption
        label={
          <FormattedMessage
            id="app.editSystemMessageForm.role"
            defaultMessage="Users with this role and its children can see notification."
          />
        }
      />

      <Field
        name="visibleFrom"
        component={DatetimeField}
        label={
          <FormattedMessage
            id="app.editSystemMessageForm.visibleFrom"
            defaultMessage="Date from which is notification visible."
          />
        }
      />

      <Field
        name="visibleTo"
        component={DatetimeField}
        label={
          <FormattedMessage
            id="app.editSystemMessageForm.isLocked"
            defaultMessage="Date to which is notification visible."
          />
        }
      />

      {error && dirty && <Alert bsStyle="danger">{error}</Alert>}
    </Modal.Body>
    <Modal.Footer>
      <div className="text-center">
        <SubmitButton
          id="editSystemMessage"
          invalid={invalid}
          submitting={submitting}
          dirty={dirty}
          hasSucceeded={submitSucceeded}
          hasFailed={submitFailed}
          handleSubmit={handleSubmit}
          asyncValidating={asyncValidating}
          messages={{
            submit: <FormattedMessage id="generic.save" defaultMessage="Save" />,
            submitting: <FormattedMessage id="generic.saving" defaultMessage="Saving..." />,
            success: <FormattedMessage id="generic.saved" defaultMessage="Saved" />,
            validating: <FormattedMessage id="generic.validating" defaultMessage="Validating..." />,
          }}
        />

        <Button bsStyle="default" className="btn-flat" onClick={onClose}>
          <CloseIcon gapRight />
          <FormattedMessage id="generic.close" defaultMessage="Close" />
        </Button>
      </div>
    </Modal.Footer>
  </Modal>
);

EditSystemMessageForm.propTypes = {
  error: PropTypes.any,
  initialValues: PropTypes.object.isRequired,
  values: PropTypes.object,
  handleSubmit: PropTypes.func.isRequired,
  dirty: PropTypes.bool,
  submitting: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  invalid: PropTypes.bool,
  asyncValidating: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  links: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

const validate = ({ localizedTexts }) => {
  const errors = {};
  validateLocalizedTextsFormData(errors, localizedTexts, ({ text }) => {
    const textErrors = {};
    if (!text.trim()) {
      textErrors.text = (
        <FormattedMessage
          id="app.editSystemMessageForm.validation.localizedText.text"
          defaultMessage="Please fill the description."
        />
      );
    }

    return textErrors;
  });

  return errors;
};

export default withLinks(
  reduxForm({
    form: 'editSystemMessage',
    validate,
    enableReinitialize: true,
    keepDirtyOnReinitialize: false,
  })(injectIntl(EditSystemMessageForm))
);
