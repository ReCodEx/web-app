import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import { Modal, Table, Container, Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import { reduxForm, Field, formValueSelector } from 'redux-form';
import { lruMemoize } from 'reselect';

import { TextField, SelectField } from '../../forms/Fields';
import Button, { TheButtonGroup } from '../../widgets/TheButton';
import InsetPanel from '../../widgets/InsetPanel';
import SubmitButton from '../../forms/SubmitButton';
import { CloseIcon, SaveIcon, RefreshIcon, InputIcon, OutputIcon } from '../../../components/icons';
import { encodeId, safeSet } from '../../../helpers/common';
import { getBoxTypeDescription } from '../comments';

export const newBoxInitialData = { name: '', type: '', portsIn: {}, portsOut: {} };

const suggestedBoxName = lruMemoize((boxType, boxes) => {
  const names = new Set(boxes.map(({ name }) => name));
  const prefix = boxType || 'box';
  let suffix = 1;
  while (names.has(`${prefix}${suffix}`)) {
    suffix = suffix + 1;
  }
  return `${prefix}${suffix}`;
});

const prepareBoxTypeOptions = lruMemoize(boxTypes =>
  Object.values(boxTypes)
    .map(({ name, type }) => ({ key: type, name: `${name} (${type})` }))
    .sort((a, b) => a.name.localeCompare(b.name, 'en'))
);

const getSortedPorts = ports =>
  ports &&
  Object.keys(ports)
    .sort()
    .map(name => ({ name, ...ports[name] }));

const preparePortsOfSelectedBoxType = lruMemoize(boxType => {
  const portsIn = (boxType && getSortedPorts(boxType.portsIn)) || [];
  const portsOut = (boxType && getSortedPorts(boxType.portsOut)) || [];
  return { portsIn, portsOut };
});

const messages = defineMessages({
  varPlaceholder: {
    id: 'app.pipelines.boxForm.portVariablePlaceholder',
    defaultMessage: 'associated variable',
  },
});

class BoxForm extends Component {
  render() {
    const {
      show,
      editing = null,
      boxes,
      boxTypes,
      variables,
      selectedType,
      handleSubmit,
      submitSucceeded = false,
      invalid = false,
      dirty = false,
      submitting = false,
      reset,
      onHide,
      intl: { formatMessage },
    } = this.props;

    const { portsIn, portsOut } = preparePortsOfSelectedBoxType(selectedType && boxTypes[selectedType]);

    return (
      <Modal show={show} onHide={onHide} keyboard size="xl">
        <Modal.Header closeButton>
          <h5>
            {editing ? (
              <FormattedMessage
                id="app.pipelines.boxForm.titleEditting"
                defaultMessage="Editting Box <strong>{editing}</strong>"
                values={{ editing, strong: content => <strong className="ml-1">{content}</strong> }}
              />
            ) : (
              <FormattedMessage id="app.pipelines.boxForm.titleNew" defaultMessage="Add New Box" />
            )}
          </h5>
        </Modal.Header>

        <Modal.Body>
          <datalist id="boxFormVariableNamesDatalist">
            {variables.map(({ name }) => (
              <option key={name}>{name}</option>
            ))}
          </datalist>

          <datalist id="boxNameDatalist">
            {selectedType && <option>{suggestedBoxName(selectedType, boxes)}</option>}
            {editing && <option>{editing}</option>}
          </datalist>

          <Container fluid>
            <Row>
              <Col lg={6}>
                <Field
                  name="name"
                  tabIndex={1}
                  component={TextField}
                  maxLength={255}
                  list="boxNameDatalist"
                  placeholder={suggestedBoxName(selectedType, boxes)}
                  label={
                    <span>
                      <FormattedMessage id="generic.name" defaultMessage="Name" />:
                    </span>
                  }
                />
              </Col>

              <Col lg={6}>
                <Field
                  name="type"
                  tabIndex={2}
                  component={SelectField}
                  options={prepareBoxTypeOptions(boxTypes)}
                  addEmptyOption
                  label={<FormattedMessage id="app.pipelines.boxForm.type" defaultMessage="Type:" />}
                />
              </Col>
            </Row>

            {selectedType && getBoxTypeDescription(selectedType) && (
              <Row>
                <Col xl={12}>
                  <InsetPanel>{getBoxTypeDescription(selectedType)}</InsetPanel>
                </Col>
              </Row>
            )}

            {((portsIn && portsIn.length > 0) || (portsOut && portsOut.length > 0)) && <hr />}

            <Row>
              {portsIn && portsIn.length > 0 && (
                <Col xl={portsOut && portsOut.length > 0 ? 6 : 12}>
                  <h5>
                    <InputIcon gapRight className="text-muted" />
                    <FormattedMessage id="app.pipelines.boxForm.inputPorts" defaultMessage="Input ports" />
                  </h5>
                  <Table borderless size="sm">
                    <tbody>
                      {portsIn.map(port => (
                        <tr key={port.name}>
                          <td className="text-nowrap pr-4 valign-middle">
                            <strong>{port.name}</strong>
                          </td>
                          <td className="text-nowrap pr-4 valign-middle">
                            <code>{port.type}</code>
                          </td>
                          <td className="full-width valign-middle">
                            <Field
                              name={`portsIn.${encodeId(port.name)}`}
                              placeholder={formatMessage(messages.varPlaceholder)}
                              component={TextField}
                              maxLength={255}
                              groupClassName="mb-0"
                              list="boxFormVariableNamesDatalist"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Col>
              )}

              {portsOut && portsOut.length > 0 && (
                <Col xl={portsIn && portsIn.length > 0 ? 6 : 12}>
                  <h5>
                    <OutputIcon gapRight className="text-muted" />
                    <FormattedMessage id="app.pipelines.boxForm.outputPorts" defaultMessage="Output ports" />
                  </h5>
                  <Table size="sm">
                    <tbody>
                      {portsOut.map(port => (
                        <tr key={port.name}>
                          <td className="text-nowrap pr-4 valign-middle">
                            <strong>{port.name}</strong>
                          </td>
                          <td className="text-nowrap pr-4 valign-middle">
                            <code>{port.type}</code>
                          </td>
                          <td className="full-width valign-middle">
                            <Field
                              name={`portsOut.${encodeId(port.name)}`}
                              placeholder={formatMessage(messages.varPlaceholder)}
                              component={TextField}
                              maxLength={255}
                              groupClassName="mb-0"
                              list="boxFormVariableNamesDatalist"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Col>
              )}
            </Row>
          </Container>
        </Modal.Body>

        <Modal.Footer>
          <div className="text-center">
            <TheButtonGroup>
              {(dirty || editing) && (
                <SubmitButton
                  id="boxForm"
                  handleSubmit={() => {
                    handleSubmit();
                    return Promise.resolve();
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
          </div>
        </Modal.Footer>
      </Modal>
    );
  }
}

BoxForm.propTypes = {
  show: PropTypes.bool,
  editing: PropTypes.string,
  boxTypes: PropTypes.object.isRequired,
  boxes: PropTypes.array.isRequired,
  variables: PropTypes.array.isRequired,
  variablesUtilization: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onHide: PropTypes.func.isRequired,
  selectedType: PropTypes.string,
  handleSubmit: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  invalid: PropTypes.bool,
  dirty: PropTypes.bool,
  submitting: PropTypes.bool,
  intl: PropTypes.object,
};

const validate = (
  { name, type, portsIn = {}, portsOut = {} },
  { boxes, boxTypes, variables, variablesUtilization, editing, dirty }
) => {
  const errors = {};
  if (!dirty && !editing) {
    return errors;
  }

  if (!name || name.trim() === '') {
    errors.name = <FormattedMessage id="app.pipelines.boxForm.emptyName" defaultMessage="Box name cannot be empty." />;
  }

  if (name && name.trim() !== editing && boxes && boxes.find(v => v.name === name.trim())) {
    errors.name = (
      <FormattedMessage
        id="app.pipelines.boxForm.duplicitName"
        defaultMessage="This name is already taken by another box."
      />
    );
  }

  const boxType = type && boxTypes[type];
  if (!boxType) {
    errors.type = (
      <FormattedMessage id="app.pipelines.boxForm.missingType" defaultMessage="You must select type of the box." />
    );
  } else {
    // Check that associated variables match the prescribed port types
    const formDataPorts = { portsIn, portsOut };
    Object.keys(formDataPorts).forEach(ports =>
      Object.keys(boxType[ports]).forEach(portName => {
        const variableName = (formDataPorts[ports][encodeId(portName)] || '').trim();
        const variable = variableName && variables.find(v => v.name === variableName);
        if (variable && boxType[ports][portName].type !== variable.type) {
          safeSet(
            errors,
            [ports, encodeId(portName)],
            <FormattedMessage
              id="app.pipelines.boxesTable.wrongVariableType"
              defaultMessage="Associated variable is of <code>{type}</code>, but <code>{descType}</code> type is required."
              values={{
                type: variable.type,
                descType: boxType[ports][portName].type,
                code: content => <code>{content}</code>,
              }}
            />
          );
        }
      })
    );

    // Check that variables are not associated with too many output ports
    const utilizations = {};
    Object.keys(boxType.portsOut)
      .map(portName => (portsOut[encodeId(portName)] || '').trim())
      .filter(varName => varName && variablesUtilization[varName])
      .forEach(varName => {
        if (!utilizations[varName]) {
          utilizations[varName] =
            variablesUtilization[varName].portsOut.length - // number of boxes, where the var is used in output
            variablesUtilization[varName].portsOut.filter(({ box }) => box.name === editing).length; // -1 if this box is on the list
        }
        ++utilizations[varName]; // increment utilization since this one variable will be present
      });

    Object.keys(boxType.portsOut).forEach(portName => {
      const varName = (portsOut[encodeId(portName)] || '').trim();
      if (utilizations[varName] > 1) {
        safeSet(
          errors,
          ['portsOut', encodeId(portName)],
          <FormattedMessage
            id="app.pipelines.boxForm.variableUsedInMultipleOutputs"
            defaultMessage="This variable is being used in multiple output ports."
          />
        );
      }
    });
  }

  return errors;
};

const warn = ({ name, type, portsIn = {}, portsOut = {} }, { boxTypes, variables, editing, dirty }) => {
  const warnings = {};
  if (!dirty && !editing) {
    return warnings;
  }

  if (name && !name.trim().match(/^[-a-zA-Z0-9_]+$/)) {
    warnings.name = (
      <FormattedMessage
        id="app.pipelines.variableForm.warningNameChars"
        defaultMessage="It is recommended to use safe chars only for identifiers (letters, numbers, dash, and underscore)."
      />
    );
  }

  const boxType = type && boxTypes[type];
  if (boxType) {
    // Check that associated variables match the prescribed port types
    const formDataPorts = { portsIn, portsOut };
    Object.keys(formDataPorts).forEach(ports =>
      Object.keys(boxType[ports]).forEach(portName => {
        const variableName = (formDataPorts[ports][encodeId(portName)] || '').trim();
        const variable = variableName && variables.find(v => v.name === variableName);
        if (variableName && !variable) {
          safeSet(
            warnings,
            [ports, encodeId(portName)],
            <FormattedMessage
              id="app.pipelines.boxForm.variableNotExistYet"
              defaultMessage="Selected variable does not exist yet and will be created."
            />
          );
        }
      })
    );
  }

  return warnings;
};

const mapStateToProps = state => ({
  selectedType: formValueSelector('boxForm')(state, 'type'),
});

export default connect(mapStateToProps)(
  reduxForm({
    form: 'boxForm',
    enableReinitialize: true,
    keepDirtyOnReinitialize: false,
    validate,
    warn,
  })(injectIntl(BoxForm))
);
