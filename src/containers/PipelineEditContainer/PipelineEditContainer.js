import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { Container, Row, Col } from 'react-bootstrap';

import Box from '../../components/widgets/Box';
import BoxesTable from '../../components/Pipelines/BoxesTable';
import VariablesTable from '../../components/Pipelines/VariablesTable';
import VariableForm, { newVariableInitialData } from '../../components/Pipelines/VariableForm';
import BoxForm, { newBoxInitialData } from '../../components/Pipelines/BoxForm';
import Button, { TheButtonGroup } from '../../components/widgets/TheButton';
import Icon, { RefreshIcon, SaveIcon } from '../../components/icons';

import { fetchSupplementaryFilesForPipeline } from '../../redux/modules/pipelineFiles';

import {
  getVariablesUtilization,
  isArrayType,
  coerceVariableValue,
  isExternalReference,
  getReferenceIdentifier,
  makeExternalReference,
  getVariablesTypes,
} from '../../helpers/pipelines';
import { getBoxTypes } from '../../redux/selectors/boxes';
import { objectMap, encodeId, deepCompare, identity } from '../../helpers/common';

// TODO

/*
const asyncValidate = (values, dispatch, { initialValues: { id, version } }) =>
  new Promise((resolve, reject) =>
    dispatch(validatePipeline(id, version))
      .then(res => res.value)
      .then(({ versionIsUpToDate }) => {
        const errors = {};
        if (versionIsUpToDate === false) {
          errors.name = (
            <FormattedMessage
              id="app.editPipelineForm.validation.versionDiffers"
              defaultMessage="Somebody has changed the pipeline while you have been editing it. Please reload the page and apply your changes once more."
            />
          );
          dispatch(touch('editPipeline', 'name'));
        }

        if (Object.keys(errors).length > 0) {
          throw errors;
        }
      })
      .then(resolve())
      .catch(errors => reject(errors))
  );
*/
const _getSelectedBoxVariables = (selectedBox, boxes) => {
  const box = selectedBox && boxes.find(b => b.name === selectedBox);
  return (
    box && [...Object.values(box.portsIn), ...Object.values(box.portsOut)].map(({ value }) => value).filter(identity)
  );
};

const _getSelectedVariableBoxes = (selectedVariable, boxes) =>
  selectedVariable &&
  boxes
    .filter(
      ({ portsIn, portsOut }) =>
        Object.values(portsIn).find(p => p.value === selectedVariable) ||
        Object.values(portsOut).find(p => p.value === selectedVariable)
    )
    .map(({ name }) => name);

const STATE_DEFAULTS = {
  boxFormOpen: false, // whether dialog is visible
  boxEditName: null, // if dialog is used for editing, name of the editted box
  variableFormOpen: false, // analogical to boxForm...
  variableEditName: null,
  selectedBox: null,
  selectedBoxVariables: null, // vars associated with selected box
  selectedVariable: null,
  selectedVariableBoxes: null, // boxes associated with selected var
};

class PipelineEditContainer extends Component {
  state = {
    pipelineId: null,
    version: null,
    boxes: null,
    variables: null,
    ...STATE_DEFAULTS,
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.pipelineId !== nextProps.pipeline.id) {
      return {
        pipelineId: nextProps.pipeline.id,
        version: nextProps.pipeline.version,
        boxes: nextProps.pipeline.pipeline.boxes,
        variables: nextProps.pipeline.pipeline.variables,
        ...STATE_DEFAULTS,
      };
    }

    if (prevState.version < nextProps.pipeline.version) {
      // TODO -- deal with mergin issues
      return { version: nextProps.pipeline.version };
    }

    return null;
  }

  reset = () => {
    this.setState({
      version: this.props.pipeline.version,
      boxes: this.props.pipeline.pipeline.boxes,
      variables: this.props.pipeline.pipeline.variables,
      ...STATE_DEFAULTS,
    });
  };

  /*
   * Dialog handling
   */

  openBoxForm = (boxEditName = null) => {
    this.setState({ boxFormOpen: true, boxEditName });
  };

  openVariableForm = (variableEditName = null) => {
    this.setState({ variableFormOpen: true, variableEditName });
  };

  closeForms = () => {
    this.setState({ boxFormOpen: false, boxEditName: null, variableFormOpen: false, variableEditName: null });
  };

  getBoxFormInitialData = () => {
    const box = this.state.boxEditName && this.state.boxes.find(box => box.name === this.state.boxEditName);
    if (box) {
      const data = { name: box.name, type: box.type, portsIn: {}, portsOut: {} };
      ['portsIn', 'portsOut'].forEach(ports =>
        Object.keys(box[ports]).forEach(port => (data[ports][encodeId(port)] = box[ports][port].value))
      );
      return data;
    } else {
      return newBoxInitialData;
    }
  };

  getVariableFormInitialData = () => {
    const variable =
      this.state.variableEditName &&
      this.state.variables.find(variable => variable.name === this.state.variableEditName);

    if (variable) {
      const data = { ...variable, external: false, values: [] };
      coerceVariableValue(data);

      if (isExternalReference(data.value)) {
        data.external = true;
        data.value = getReferenceIdentifier(data.value);
      } else if (isArrayType(data.type)) {
        data.values = data.value;
        data.value = '';
      }

      return data;
    } else {
      return newVariableInitialData;
    }
  };

  /*
   * Selection handling
   */

  selectBox = (selectedBox = null) => {
    if (selectedBox === this.state.selectedBox) {
      selectedBox = null; // repeated select = unselect
    }

    if (selectedBox) {
      this.selectVariable(); // unselect variable, so the box holds primary selection
    }

    this.setState({
      selectedBox,
      selectedBoxVariables: _getSelectedBoxVariables(selectedBox, this.state.boxes),
    });
  };

  selectVariable = (selectedVariable = null) => {
    if (selectedVariable === this.state.selectedVariable) {
      selectedVariable = null; // repeated select = unselect
    }

    if (selectedVariable) {
      this.selectBox(); // unselect box, so the variable holds primary selection
    }

    this.setState({
      selectedVariable,
      selectedVariableBoxes: _getSelectedVariableBoxes(selectedVariable, this.state.boxes),
    });
  };

  /*
   * Methods that modify the pipeline
   */

  transformState = (
    transformBoxes,
    transformVariables = null,
    selectedBox = this.state.selectedBox,
    selectedVariable = this.state.selectedVariable
  ) => {
    const stateUpdate = {};

    const boxes = transformBoxes && transformBoxes(this.state.boxes, this.state.variables);
    if (boxes && !deepCompare(boxes, this.state.boxes)) {
      stateUpdate.boxes = boxes;
    }

    const variables = transformVariables && transformVariables(this.state.variables, this.state.boxes);
    if (variables && !deepCompare(variables, this.state.variables)) {
      stateUpdate.variables = variables;
    }

    // update (recompute) selections if necessary
    if (
      Object.keys(stateUpdate).length > 0 ||
      selectedBox !== this.state.selectedBox ||
      selectedVariable !== this.state.selectedVariable
    ) {
      stateUpdate.selectedBox = selectedBox;
      stateUpdate.selectedBoxVariables = _getSelectedBoxVariables(selectedBox, stateUpdate.boxes || this.state.boxes);
      stateUpdate.selectedVariable = selectedVariable;
      stateUpdate.selectedVariableBoxes = _getSelectedVariableBoxes(
        selectedVariable,
        stateUpdate.boxes || this.state.boxes
      );
    }

    if (Object.keys(stateUpdate).length > 0) {
      this.setState(stateUpdate);
    }
  };

  submitBoxForm = ({ name, type, portsIn, portsOut }) => {
    const oldBoxName = this.state.boxEditName;
    const boxType = this.props.boxTypes[type];
    this.closeForms();
    name = name.trim();
    if (!name || !boxType) {
      return;
    }

    // prepare new box object
    const newBox = {
      name,
      type,
      portsIn: objectMap(boxType.portsIn, (port, name) => ({ ...port, value: (portsIn[encodeId(name)] || '').trim() })),
      portsOut: objectMap(boxType.portsOut, (port, name) => ({
        ...port,
        value: (portsOut[encodeId(name)] || '').trim(),
      })),
    };

    // extract all assigned variables, find which of them do not exist yet, and prepare their new objects
    const newVariables = [...Object.values(newBox.portsIn), ...Object.values(newBox.portsOut)]
      .filter(port => port.value && !this.state.variables.find(v => v.name === port.value))
      .map(port => ({ name: port.value, type: port.type, value: isArrayType(port.type) ? [] : '' }));

    if (oldBoxName) {
      // replace old box with new one
      this.transformState(
        boxes => boxes.map(box => (box.name === oldBoxName ? newBox : box)),
        newVariables.length > 0 ? variables => [...variables, ...newVariables] : null,
        this.state.selectedBox === oldBoxName ? newBox.name : this.state.selectedBox // update box selection
      );
    } else {
      this.transformState(
        boxes => [...boxes, newBox], // append new box
        newVariables.length > 0 ? variables => [...variables, ...newVariables] : null
      );
    }
  };

  submitVariableForm = ({ name, type, value, values, external }) => {
    const oldVarName = this.state.variableEditName;
    this.closeForms();
    name = name.trim();
    if (!name || !type) {
      return;
    }

    const newVariable = { name, type, value: isArrayType(type) ? values : value };
    if (external) {
      newVariable.value = makeExternalReference(value);
    }

    if (oldVarName) {
      // update in ports: if the type still matches, update the variable name; remove it otherwise
      const updateVarInPorts = ports =>
        objectMap(ports, port =>
          port.value === oldVarName ? { ...port, value: port.type === type ? name : '' } : port
        );
      this.transformState(
        boxes =>
          boxes.map(({ portsIn, portsOut, ...rest }) => {
            return {
              portsIn: updateVarInPorts(portsIn),
              portsOut: updateVarInPorts(portsOut),
              ...rest,
            };
          }),
        variables => variables.map(variable => (variable.name === oldVarName ? newVariable : variable)),
        this.state.selectedBox,
        this.state.selectedVariable === oldVarName ? newVariable.name : this.state.selectedVariable // update selection
      );
    } else {
      this.transformState(null, variables => [...variables, newVariable]);
    }
  };

  removeBox = name => {
    this.transformState(
      boxes => boxes.filter(box => box.name !== name),
      null,
      this.state.selectedBox === name ? null : this.state.selectedBox // clear selection if box remmoved
    );
  };

  removeVariable = name => {
    const removeVarFromPorts = ports => objectMap(ports, port => (port.value === name ? { ...port, value: '' } : port));

    this.transformState(
      boxes =>
        boxes.map(({ portsIn, portsOut, ...rest }) => {
          return {
            portsIn: removeVarFromPorts(portsIn),
            portsOut: removeVarFromPorts(portsOut),
            ...rest,
          };
        }),
      variables => variables.filter(variable => variable.name !== name),
      this.state.selectedBox,
      this.state.selectedVariable === name ? null : this.state.selectedVariable // clear selection if var removed
    );
  };

  getUnusedVariableName = prefix => {
    const varIndex = getVariablesTypes(this.state.variables);
    let suffix = '';
    while (varIndex[prefix + suffix]) {
      ++suffix;
    }
    return prefix + suffix;
  };

  /**
   * Change association of one variable in one port.
   * @param {string} boxName
   * @param {string} portsKey portsIn or portsOut
   * @param {string} portName
   * @param {string|null} variableName to be assigned, null = remove current variable, if missing => create new variable
   */
  assignVariable = (boxName, portsKey, portName, variableName) => {
    if (variableName === undefined) {
      variableName = this.getUnusedVariableName(portName);
    }

    const box = this.state.boxes.find(b => b.name === boxName);
    const port = box && box[portsKey] && box[portsKey][portName];
    if (!port) {
      return;
    }

    const variable = variableName && this.state.variables.find(v => v.name === variableName);
    if (variable && variable.type !== port.type) {
      return; // type check to avoid creating invalid affiliations
    }

    this.transformState(
      boxes =>
        boxes.map(
          b =>
            b.name === boxName
              ? {
                  ...b, // clone the box and replace corresponding port
                  [portsKey]: { ...b[portsKey], [portName]: { ...b[portsKey][portName], value: variableName || '' } },
                }
              : b // other boxes are just passed through
        ),
      variableName && !variable // create the variable if it does not exist
        ? variables => [...variables, { name: variableName, type: port.type, value: isArrayType(port.type) ? [] : '' }]
        : null
    );
  };

  render() {
    const { boxTypes } = this.props;
    const utilization = getVariablesUtilization(this.state.boxes);
    return (
      <Box
        title={<FormattedMessage id="app.pipelineEditContainer.title" defaultMessage="Edit Pipeline Structure" />}
        unlimitedHeight
        footer={
          <div className="text-center">
            <TheButtonGroup>
              <Button variant="primary" onClick={() => this.openBoxForm()}>
                <Icon icon="box" gapRight />
                <FormattedMessage id="app.pipelineEditContainer.addBoxButton" defaultMessage="Add Box" />
              </Button>
              <Button variant="primary" onClick={() => this.openVariableForm()}>
                <Icon icon="dollar-sign" gapRight />
                <FormattedMessage id="app.pipelineEditContainer.addVariableButton" defaultMessage="Add Variable" />
              </Button>

              <Button variant="danger" onClick={this.reset}>
                <RefreshIcon gapRight />
                <FormattedMessage id="generic.reset" defaultMessage="Reset" />
              </Button>
              <Button variant="success">
                <SaveIcon gapRight />
                <FormattedMessage id="generic.save" defaultMessage="Save" />
              </Button>
            </TheButtonGroup>
          </div>
        }>
        <>
          <Container fluid>
            <Row>
              <Col xl={6} lg={12}>
                <h4>
                  <FormattedMessage id="app.pipelineEditContainer.boxesTitle" defaultMessage="Boxes" />
                </h4>
                {this.state.boxes && (
                  <BoxesTable
                    boxes={this.state.boxes}
                    boxTypes={boxTypes}
                    variables={this.state.variables}
                    primarySelection={this.state.selectedBox}
                    secondarySelections={this.state.selectedVariableBoxes}
                    selectedVariable={this.state.selectedVariable}
                    selectBox={this.selectBox}
                    editBox={this.openBoxForm}
                    removeBox={this.removeBox}
                    assignVariable={this.assignVariable}
                  />
                )}
              </Col>

              <Col xl={6} lg={12}>
                <h4>
                  <FormattedMessage id="app.pipelineEditContainer.variablesTitle" defaultMessage="Variables" />
                </h4>
                {this.state.variables && (
                  <VariablesTable
                    variables={this.state.variables}
                    utilization={utilization}
                    primarySelection={this.state.selectedVariable}
                    secondarySelections={this.state.selectedBoxVariables}
                    selectVariable={this.selectVariable}
                    editVariable={this.openVariableForm}
                    removeVariable={this.removeVariable}
                  />
                )}
              </Col>
            </Row>
          </Container>

          <BoxForm
            show={this.state.boxFormOpen}
            editing={this.state.boxEditName}
            boxTypes={boxTypes}
            variables={this.state.variables}
            variablesUtilization={utilization}
            boxes={this.state.boxes}
            onSubmit={this.submitBoxForm}
            onHide={this.closeForms}
            initialValues={this.getBoxFormInitialData()}
          />

          <VariableForm
            variables={this.state.variables}
            show={this.state.variableFormOpen}
            editing={this.state.variableEditName}
            onSubmit={this.submitVariableForm}
            onHide={this.closeForms}
            initialValues={this.getVariableFormInitialData()}
          />
        </>
      </Box>
    );
  }
}

PipelineEditContainer.propTypes = {
  pipeline: PropTypes.shape({
    id: PropTypes.string.isRequired,
    version: PropTypes.number.isRequired,
    pipeline: PropTypes.shape({
      boxes: PropTypes.array.isRequired,
      variables: PropTypes.array.isRequired,
    }),
  }).isRequired,
  supplementaryFiles: ImmutablePropTypes.map,
  boxTypes: PropTypes.object.isRequired,
};

export default connect(
  (state, { pipeline }) => {
    return {
      boxTypes: getBoxTypes(state),
    };
  },
  (dispatch, { pipeline }) => ({
    loadFiles: () => dispatch(fetchSupplementaryFilesForPipeline(pipeline.id)),
  })
)(PipelineEditContainer);
