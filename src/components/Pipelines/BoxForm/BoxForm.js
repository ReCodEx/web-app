import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';

import { connect } from 'react-redux';
import { reduxForm, Field, formValueSelector } from 'redux-form';

import { TextField, SelectField, PortsField } from '../../forms/Fields';
import { Modal, Alert } from 'react-bootstrap';
import Button from '../../widgets/FlatButton';
import ConfirmDeleteButton from '../../buttons/DeleteButton/ConfirmDeleteButton';

import SubmitButton from '../../forms/SubmitButton';
import { CloseIcon } from '../../../components/icons';

import { fetchBoxTypes } from '../../../redux/modules/boxes';
import { getBoxTypes } from '../../../redux/selectors/boxes';
import { getVariablesTypes } from '../../../helpers/boxes';

class BoxForm extends Component {
  componentWillMount = () => this.loadBoxTypes();
  loadBoxTypes() {
    const { fetchBoxTypes } = this.props;
    fetchBoxTypes();
  }

  render() {
    const {
      show,
      boxTypes,
      selectedType,
      title,
      handleSubmit,
      submitSucceeded = false,
      submitFailed = false,
      anyTouched = false,
      asyncValidating = false,
      invalid = false,
      submitting = false,
      reset,
      onHide,
      onDelete
    } = this.props;

    const currentBoxType = boxTypes.find(box => box.type === selectedType);
    const getPortsArray = ports =>
      Object.keys(ports).map(port => ({ name: port, ...ports[port] }));

    return (
      <Modal show={show} onHide={onHide} keyboard>
        <Modal.Header closeButton>
          {title}
        </Modal.Header>
        <Modal.Body>
          {submitFailed &&
            <Alert bsStyle="danger">
              <FormattedMessage
                id="app.pipelineEditor.BoxForm.failed"
                defaultMessage="We are sorry but we weren't able to save the box."
              />
            </Alert>}

          <Field
            name="name"
            tabIndex={1}
            component={TextField}
            required
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
            options={[
              { key: '', name: '...' },
              ...boxTypes.map(({ name, type }) => ({ key: type, name }))
            ]}
            required
            label={
              <FormattedMessage
                id="app.pipelineEditor.BoxForm.type"
                defaultMessage="Type:"
              />
            }
          />

          {currentBoxType &&
            <Field
              name="portsIn"
              prefix="portsIn"
              component={PortsField}
              ports={getPortsArray(currentBoxType.portsIn)}
              label={
                <FormattedMessage
                  id="app.pipelineEditor.BoxForm.portsIn"
                  defaultMessage="Inputs:"
                />
              }
            />}

          {currentBoxType &&
            <Field
              name="portsOut"
              prefix="portsOut"
              component={PortsField}
              ports={getPortsArray(currentBoxType.portsOut)}
              label={
                <FormattedMessage
                  id="app.pipelineEditor.BoxForm.portsOut"
                  defaultMessage="Outputs:"
                />
              }
            />}
        </Modal.Body>
        <Modal.Footer>
          <p className="text-center">
            <SubmitButton
              id="updateBox"
              handleSubmit={data => {
                handleSubmit();
                return Promise.resolve();
              }}
              submitting={submitting}
              invalid={invalid}
              dirty={anyTouched}
              hasFailed={submitFailed}
              hasSuceeded={submitSucceeded}
              asyncValidating={asyncValidating}
              reset={reset}
              messages={{
                success: (
                  <FormattedMessage id="generic.saved" defaultMessage="Saved" />
                ),
                submit: (
                  <FormattedMessage id="generic.save" defaultMessage="Save" />
                ),
                submitting: (
                  <FormattedMessage
                    id="generic.saving"
                    defaultMessage="Saving ..."
                  />
                )
              }}
            />
            <Button onClick={onHide}>
              <CloseIcon gapRight />
              <FormattedMessage id="generic.close" defaultMessage="Close" />
            </Button>
            <span style={{ display: 'inline-block', width: '5px' }} />
            <ConfirmDeleteButton
              id="delete-box"
              onClick={onDelete}
              small={false}
            />
          </p>
        </Modal.Footer>
      </Modal>
    );
  }
}

BoxForm.propTypes = {
  show: PropTypes.bool,
  title: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) }),
    PropTypes.element
  ]).isRequired,
  selectedType: PropTypes.string,
  boxTypes: PropTypes.array.isRequired,
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  anyTouched: PropTypes.bool,
  asyncValidating: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  invalid: PropTypes.bool,
  existingBoxes: PropTypes.array.isRequired,
  submitting: PropTypes.bool,
  fetchBoxTypes: PropTypes.func.isRequired,
  onHide: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

const validate = (
  { name, type, portsIn = {}, portsOut = {} },
  { boxTypes, existingBoxes }
) => {
  const errors = {};

  if (!name || name.length === 0) {
    errors['name'] = (
      <FormattedMessage
        id="app.pipelineEditor.BoxForm.emptyName"
        defaultMessage="Name cannot be empty."
      />
    );
  }

  if (!type) {
    errors['type'] = (
      <FormattedMessage
        id="app.pipelineEditor.BoxForm.missingType"
        defaultMessage="You must select some type."
      />
    );
  } else {
    const boxType = boxTypes.find(box => box.type === type);
    if (boxType) {
      const portsInNames = Object.keys(boxType.portsIn);
      const portsOutNames = Object.keys(boxType.portsOut);
      const portsInErrors = {};

      const existingVariablesTypes = getVariablesTypes(
        boxTypes,
        existingBoxes.filter(box => box.name !== name && box.type !== type)
      );

      for (let portName of portsInNames) {
        if (portsIn[portName] && portsIn[portName].length > 0) {
          const intendedVariableName = portsIn[portName].value;
          const portType = boxType.portsIn[portName].type;
          const existingVariableType =
            existingVariablesTypes[intendedVariableName];
          if (existingVariableType && existingVariableType.type !== portType) {
            portsInErrors[portName] = {
              value: (
                <FormattedHTMLMessage
                  id="app.pipelineEditor.BoxForm.conflictingPortType"
                  defaultMessage="You cannot set this variable to the port - the type of this port is <code>{portType}</code>, but the variable <code>{variable}</code> is already associated with port of type <code>{variableType}</code> (e.g., in box <code>{exampleBox}</code>)."
                  values={{
                    variable: intendedVariableName,
                    portType,
                    variableType: existingVariableType.type,
                    exampleBox: existingVariableType.examplePort
                  }}
                />
              )
            };
          }
        }
      }

      // check that the variable in a certain port has the correct port
      if (Object.keys(portsInErrors).length > 0) {
        errors['portsIn'] = portsInErrors;
      }

      const portsOutErrors = {};

      // check that one box does not have the same var as input and output
      for (let portIn of portsInNames) {
        for (let portOut of portsOutNames) {
          if (
            portsIn[portIn] &&
            portsOut[portOut] &&
            portsIn[portIn].value === portsOut[portOut].value
          ) {
            portsOutErrors[portOut] = {
              value: (
                <FormattedMessage
                  id="app.pipelineEditor.BoxForm.loop"
                  defaultMessage="Box can't use its own output as its input."
                />
              )
            };
          }
        }
      }

      if (Object.keys(portsOutErrors).length > 0) {
        errors['portsOut'] = portsOutErrors;
      }
    }
  }

  return errors;
};

const mapStateToProps = state => ({
  boxTypes: getBoxTypes(state),
  existingBoxes: formValueSelector('editPipeline')(state, 'pipeline.boxes'),
  selectedType: formValueSelector('boxForm')(state, 'type')
});

const mapDispatchToProps = dispatch => ({
  fetchBoxTypes: () => dispatch(fetchBoxTypes())
});

export default connect(mapStateToProps, mapDispatchToProps)(
  reduxForm({
    form: 'boxForm',
    validate
  })(BoxForm)
);
