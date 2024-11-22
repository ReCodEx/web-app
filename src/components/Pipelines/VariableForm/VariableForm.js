import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { connect } from 'react-redux';
import { reduxForm, Field, FieldArray, formValueSelector } from 'redux-form';

import { TextField, SelectField, ExpandingTextField, CheckboxField } from '../../forms/Fields';
import { Modal } from 'react-bootstrap';
import Button, { TheButtonGroup } from '../../widgets/TheButton';
import Callout from '../../widgets/Callout';
import SubmitButton from '../../forms/SubmitButton';
import { CloseIcon, SaveIcon, RefreshIcon } from '../../../components/icons';
import { KNOWN_DATA_TYPES, isArrayType } from '../../../helpers/pipelines.js';

export const newVariableInitialData = {
  name: '',
  type: '',
  value: '',
  values: [],
  external: false,
};

const variableTypeOptions = KNOWN_DATA_TYPES.map(type => ({ key: type, name: type }));

class VariableForm extends Component {
  render() {
    const {
      show,
      editing = null,
      isExternal = false,
      selectedType = null,
      handleSubmit,
      submitSucceeded = false,
      dirty = false,
      invalid = false,
      submitting = false,
      reset,
      onHide,
    } = this.props;

    return (
      <Modal show={show} onHide={onHide} keyboard size="lg">
        <Modal.Header closeButton>
          <h5>
            {editing ? (
              <FormattedMessage
                id="app.pipelines.variableForm.titleEditting"
                defaultMessage="Editting Variable <strong>{editing}</strong>"
                values={{ editing, strong: content => <strong className="ms-1">{content}</strong> }}
              />
            ) : (
              <FormattedMessage id="app.pipelines.variableForm.titleNew" defaultMessage="Add New Variable" />
            )}
          </h5>
        </Modal.Header>

        <Modal.Body>
          <Field
            name="name"
            tabIndex={1}
            component={TextField}
            maxLength={255}
            label={
              <span>
                <FormattedMessage id="generic.name" defaultMessage="Name" />:
              </span>
            }
          />

          <Field
            name="type"
            tabIndex={2}
            component={SelectField}
            options={variableTypeOptions}
            addEmptyOption
            label={<FormattedMessage id="app.pipelines.variableForm.type" defaultMessage="Data type:" />}
          />

          <Field
            name="external"
            component={CheckboxField}
            onOff
            label={
              <FormattedMessage
                id="app.pipelines.variableForm.external"
                defaultMessage="External variable reference ($)"
              />
            }
          />

          {!selectedType && !isExternal ? (
            <Callout variant="info">
              <FormattedMessage
                id="app.pipelines.variableForm.selectTypeFirst"
                defaultMessage="You need to select the data type of the variable first."
              />
            </Callout>
          ) : isArrayType(selectedType) && !isExternal ? (
            <FieldArray
              name="values"
              tabIndex={3}
              component={ExpandingTextField}
              maxLength={4096}
              label={<FormattedMessage id="app.pipelines.variableForm.values" defaultMessage="Values:" />}
            />
          ) : (
            <Field
              name="value"
              tabIndex={3}
              component={TextField}
              maxLength={4096}
              label={
                isExternal ? (
                  <FormattedMessage id="app.pipelines.variableForm.externalValue" defaultMessage="External name:" />
                ) : (
                  <FormattedMessage id="app.pipelines.variableForm.value" defaultMessage="Value:" />
                )
              }
            />
          )}
        </Modal.Body>

        <Modal.Footer>
          <TheButtonGroup>
            {(dirty || editing) && (
              <SubmitButton
                id="variableForm"
                handleSubmit={() => {
                  handleSubmit();
                  return Promise.resolve(); // make sure the submit button always gets a promise
                }}
                submitting={submitting}
                invalid={invalid}
                dirty={dirty}
                hasSuceeded={submitSucceeded}
                reset={reset}
                defaultIcon={<SaveIcon gapRight />}
                messages={{
                  success: <FormattedMessage id="generic.saved" defaultMessage="Saved" />,
                  submit: <FormattedMessage id="generic.save" defaultMessage="Save" />,
                  submitting: <FormattedMessage id="generic.saving" defaultMessage="Saving..." />,
                }}
              />
            )}
            {dirty && (
              <Button variant="danger" onClick={reset}>
                <RefreshIcon gapRight />
                <FormattedMessage id="generic.reset" defaultMessage="Reset" />
              </Button>
            )}
            <Button variant="secondary" onClick={onHide}>
              <CloseIcon gapRight />
              <FormattedMessage id="generic.close" defaultMessage="Close" />
            </Button>
          </TheButtonGroup>
        </Modal.Footer>
      </Modal>
    );
  }
}

VariableForm.propTypes = {
  variables: PropTypes.array.isRequired,
  show: PropTypes.bool,
  editing: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  onHide: PropTypes.func.isRequired,
  isExternal: PropTypes.bool,
  selectedType: PropTypes.string,
  handleSubmit: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  submitSucceeded: PropTypes.bool,
  dirty: PropTypes.bool,
  invalid: PropTypes.bool,
  submitting: PropTypes.bool,
};

const validate = ({ name, type, external, value }, { variables, editing, dirty }) => {
  const errors = {};
  if (!dirty && !editing) {
    return errors;
  }

  if (!name || name.trim() === '') {
    errors.name = (
      <FormattedMessage id="app.pipelines.variableForm.emptyName" defaultMessage="Variable name cannot be empty." />
    );
  }

  if (name && name.trim() !== editing && variables && variables.find(v => v.name === name.trim())) {
    errors.name = (
      <FormattedMessage
        id="app.pipelines.variableForm.duplicitName"
        defaultMessage="This name is already taken by another variable."
      />
    );
  }

  if (!type) {
    errors.type = (
      <FormattedMessage id="app.pipelines.variableForm.missingType" defaultMessage="The type must be selected." />
    );
  }

  if (external) {
    if (!value || value.trim() === '') {
      errors.value = (
        <FormattedMessage
          id="app.pipelines.variableForm.missingExternalIdentifier"
          defaultMessage="Name of the external variable must be set."
        />
      );
    }
  }

  return errors;
};

const warn = ({ name, external, value }) => {
  const warnings = {};

  if (name && !name.trim().match(/^[-a-zA-Z0-9_]+$/)) {
    warnings.name = (
      <FormattedMessage
        id="app.pipelines.variableForm.warningNameChars"
        defaultMessage="It is recommended to use safe chars only for identifiers (letters, numbers, dash, and underscore)."
      />
    );
  }

  if (external) {
    if (value && value.trim().startsWith('$')) {
      warnings.value = (
        <FormattedMessage
          id="app.pipelines.variableForm.externalIdentifierDuplicitDollar"
          defaultMessage="The dollar sign $ is added automatically to external references."
        />
      );
    }
  }

  return warnings;
};

const mapStateToProps = state => ({
  isExternal: formValueSelector('variableForm')(state, 'external'),
  selectedType: formValueSelector('variableForm')(state, 'type'),
});

export default connect(mapStateToProps)(
  reduxForm({
    form: 'variableForm',
    enableReinitialize: true,
    keepDirtyOnReinitialize: false,
    validate,
    warn,
  })(VariableForm)
);
