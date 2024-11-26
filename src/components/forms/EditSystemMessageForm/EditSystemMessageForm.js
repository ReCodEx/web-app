import React from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field, FieldArray } from 'redux-form';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Modal } from 'react-bootstrap';
import { lruMemoize } from 'reselect';

import { SelectField, DatetimeField } from '../Fields';
import SubmitButton from '../SubmitButton';
import Button, { TheButtonGroup } from '../../widgets/TheButton';
import Callout from '../../widgets/Callout';
import LocalizedTextsFormField from '../LocalizedTextsFormField';
import { validateLocalizedTextsFormData } from '../../../helpers/localizedData.js';
import withLinks from '../../../helpers/withLinks.js';
import { CloseIcon, SaveIcon } from '../../icons';
import { roleLabelsSimpleMessages } from '../../helpers/usersRoles.js';

const typeOptions = [
  { key: 'success', name: 'Success' },
  { key: 'info', name: 'Info' },
  { key: 'warning', name: 'Warning' },
  { key: 'danger', name: 'Danger' },
];

const getRoleOptions = lruMemoize(formatMessage =>
  Object.keys(roleLabelsSimpleMessages).map(role => ({
    key: role,
    name: formatMessage(roleLabelsSimpleMessages[role]),
  }))
);

const EditSystemMessageForm = ({
  error,
  dirty,
  submitting,
  handleSubmit,
  submitFailed,
  submitSucceeded,
  invalid,
  isOpen,
  onClose,
  createNew = false,
  intl: { formatMessage },
}) => (
  <Modal show={isOpen} backdrop="static" size="lg" onHide={onClose}>
    <Modal.Header closeButton>
      <Modal.Title>
        {createNew ? (
          <FormattedMessage id="app.systemMessages.newSystemMessage" defaultMessage="New System Message" />
        ) : (
          <FormattedMessage id="app.editSystemMessageForm.title" defaultMessage="Edit System Message" />
        )}
      </Modal.Title>
    </Modal.Header>
    <Modal.Body>
      {submitFailed && (
        <Callout variant="danger">
          <FormattedMessage id="generic.savingFailed" defaultMessage="Saving failed. Please try again later." />
        </Callout>
      )}

      <FieldArray name="localizedTexts" component={LocalizedTextsFormField} fieldType="systemMessage" />

      <Field
        name="type"
        component={SelectField}
        options={typeOptions}
        label={<FormattedMessage id="app.editSystemMessageForm.type" defaultMessage="Type of the notification." />}
      />

      <Field
        name="role"
        component={SelectField}
        options={getRoleOptions(formatMessage)}
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
            id="app.editSystemMessageForm.visibleTo"
            defaultMessage="Date to which is notification visible."
          />
        }
      />

      {error && dirty && <Callout variant="danger">{error}</Callout>}
    </Modal.Body>
    <Modal.Footer>
      <TheButtonGroup>
        <SubmitButton
          id="editSystemMessage"
          invalid={invalid}
          submitting={submitting}
          dirty={dirty}
          hasSucceeded={submitSucceeded}
          hasFailed={submitFailed}
          handleSubmit={handleSubmit}
          defaultIcon={<SaveIcon gapRight={2} />}
          messages={{
            submit: <FormattedMessage id="generic.save" defaultMessage="Save" />,
            submitting: <FormattedMessage id="generic.saving" defaultMessage="Saving..." />,
            success: <FormattedMessage id="generic.saved" defaultMessage="Saved" />,
            validating: <FormattedMessage id="generic.validating" defaultMessage="Validating..." />,
          }}
        />

        <Button variant="secondary" onClick={onClose}>
          <CloseIcon gapRight={2} />
          <FormattedMessage id="generic.close" defaultMessage="Close" />
        </Button>
      </TheButtonGroup>
    </Modal.Footer>
  </Modal>
);

EditSystemMessageForm.propTypes = {
  error: PropTypes.any,
  handleSubmit: PropTypes.func.isRequired,
  dirty: PropTypes.bool,
  submitting: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  invalid: PropTypes.bool,
  links: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  createNew: PropTypes.bool,
  intl: PropTypes.object.isRequired,
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
    errors.visibleFrom = (
      <FormattedMessage
        id="app.editSystemMessageForm.validation.visibleFromEmpty"
        defaultMessage="The visible from date must be set."
      />
    );
  }

  if (!visibleTo) {
    errors.visibleTo = (
      <FormattedMessage
        id="app.editSystemMessageForm.validation.visibleToEmpty"
        defaultMessage="The visible to date must be set."
      />
    );
  }

  if (visibleTo && visibleTo.isBefore(visibleFrom)) {
    errors.visibleFrom = (
      <FormattedMessage
        id="app.editSystemMessageForm.validation.visibleFromBeforeTo"
        defaultMessage="The visible from date cannot be after visible to date."
      />
    );
  }

  if (!type) {
    errors.type = (
      <FormattedMessage
        id="app.editSystemMessageForm.validation.typeEmpty"
        defaultMessage="Type of the notification must be set."
      />
    );
  }

  if (!role) {
    errors.role = (
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
