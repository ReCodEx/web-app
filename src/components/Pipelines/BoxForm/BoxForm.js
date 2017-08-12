import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { connect } from 'react-redux';
import { reduxForm, Field, formValueSelector } from 'redux-form';

import { TextField, SelectField, PortsField } from '../../forms/Fields';
import { Alert } from 'react-bootstrap';

import Box from '../../widgets/Box';
import SubmitButton from '../../forms/SubmitButton';

import { fetchBoxTypes } from '../../../redux/modules/boxes';
import { getBoxTypes } from '../../../redux/selectors/boxes';

class BoxForm extends Component {
  componentWillMount = () => this.loadBoxTypes();
  loadBoxTypes() {
    const { fetchBoxTypes } = this.props;
    fetchBoxTypes();
  }

  render() {
    const {
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
      reset
    } = this.props;

    const currentBoxType = boxTypes.find(box => box.name === selectedType);
    const getPortsArray = ports =>
      Object.keys(ports).map(port => ({ name: port, ...ports[port] }));

    return (
      <Box
        title={title}
        footer={
          <p className="text-center">
            <SubmitButton
              id="updateBox"
              handleSubmit={data => {
                handleSubmit(data);
                return Promise.resolve(data);
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
                  <FormattedMessage
                    id="app.pipelineEditor.BoxForm.success"
                    defaultMessage="Saved"
                  />
                ),
                submit: (
                  <FormattedMessage
                    id="app.pipelineEditor.BoxForm.createGroup"
                    defaultMessage="Save"
                  />
                ),
                submitting: (
                  <FormattedMessage
                    id="app.pipelineEditor.BoxForm.processing"
                    defaultMessage="Saving ..."
                  />
                )
              }}
            />
          </p>
        }
        solid
      >
        <div>
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
              <FormattedMessage
                id="app.pipelineEditor.BoxForm.name"
                defaultMessage="Name:"
              />
            }
          />

          <Field
            name="type"
            tabIndex={2}
            component={SelectField}
            options={[
              { key: '', name: '...' },
              ...boxTypes.map(({ name }) => ({ key: name, name }))
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

          {selectedType &&
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
        </div>
      </Box>
    );
  }
}

BoxForm.propTypes = {
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
  submitting: PropTypes.bool,
  fetchBoxTypes: PropTypes.func.isRequired
};

const validate = (
  { name, type, portsIn = {}, portsOut = {} },
  { boxTypes }
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

  // @todo: validate that we don't have two boxes with the same name

  if (!type) {
    errors['type'] = (
      <FormattedMessage
        id="app.pipelineEditor.BoxForm.missingType"
        defaultMessage="You must select some type."
      />
    );
  } else {
    const boxType = boxTypes.find(box => box.name === type);

    const portsInErrors = {};
    for (let portName of Object.keys(boxType.portsIn)) {
      if (!portsIn[portName] || portsIn[portName].length === 0) {
        portsInErrors[portName] = {
          value: (
            <FormattedMessage
              id="app.pipelineEditor.BoxForm.missingPortName"
              defaultMessage="You must choose some name for the port."
            />
          )
        };
      }
    }

    if (Object.keys(portsInErrors).length > 0) {
      errors['portsIn'] = portsInErrors;
    }

    const portsOutErrors = {};
    for (let portName of Object.keys(boxType.portsOut)) {
      if (!portsOut[portName] || portsOut[portName].length === 0) {
        portsOutErrors[portName] = {
          value: (
            <FormattedMessage id="app.pipelineEditor.BoxForm.missingPortName" />
          )
        };
      }
    }

    if (Object.keys(portsOutErrors).length > 0) {
      errors['portsOut'] = portsOutErrors;
    }
  }

  return errors;
};

const mapStateToProps = state => ({
  boxTypes: getBoxTypes(state),
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
