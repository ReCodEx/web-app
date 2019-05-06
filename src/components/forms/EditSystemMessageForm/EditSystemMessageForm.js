import React from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field, FieldArray } from 'redux-form';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { Alert, Modal } from 'react-bootstrap';
import moment from 'moment';

import { SelectField, DatetimeField } from '../Fields';
import SubmitButton from '../SubmitButton';
import Button from '../../widgets/FlatButton';
import LocalizedTextsFormField from '../LocalizedTextsFormField';
import { validateLocalizedTextsFormData } from '../../../helpers/localizedData';
import withLinks from '../../../helpers/withLinks';
import { CloseIcon } from '../../icons';
import { roleLabelsSimpleMessages } from '../../helpers/usersRoles';

const typeOptions = [
  { key: 'success', name: 'Success' },
  { key: 'info', name: 'Info' },
  { key: 'warning', name: 'Warning' },
  { key: 'danger', name: 'Danger' },
];

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
        options={typeOptions}
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

        <Button bsStyle="default" onClick={onClose}>
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

const validate = ({ localizedTexts, type, role, visibleFrom, visibleTo }) => {
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

  if (!visibleFrom) {
    errors['visibleFrom'] = (
      <FormattedMessage
        id="app.editSystemMessageForm.validation.visibleFromEmpty"
        defaultMessage="The visible from date must be set."
      />
    );
  }

  if (!visibleTo) {
    errors['visibleTo'] = (
      <FormattedMessage
        id="app.editSystemMessageForm.validation.visibleToEmpty"
        defaultMessage="The visible to date must be set."
      />
    );
  }

  if (visibleTo.isBefore(moment.unix(Date.now() / 1000))) {
    errors['visibleTo'] = (
      <FormattedMessage
        id="app.editSystemMessageForm.validation.visibleToInHistory"
        defaultMessage="The visible to date cannot be in the past."
      />
    );
  }

  if (visibleTo.isBefore(visibleFrom)) {
    errors['visibleFrom'] = (
      <FormattedMessage
        id="app.editSystemMessageForm.validation.visibleFromBeforeTo"
        defaultMessage="The visible from date cannot be after visible to date."
      />
    );
  }

  if (!type) {
    errors['type'] = (
      <FormattedMessage
        id="app.editSystemMessageForm.validation.typeEmpty"
        defaultMessage="Type of the notification must be set."
      />
    );
  }

  if (!role) {
    errors['role'] = (
      <FormattedMessage
        id="app.editSystemMessageForm.validation.roleEmpty"
        defaultMessage="Base user role of the notification muset be set."
      />
    );
  }

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
