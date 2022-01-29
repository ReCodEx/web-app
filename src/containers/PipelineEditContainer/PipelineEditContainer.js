import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import { Container, Row, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';

import Box from '../../components/widgets/Box';
import PipelineGraph from '../../components/Pipelines/PipelineGraph';
import BoxesTable from '../../components/Pipelines/BoxesTable';
import VariablesTable from '../../components/Pipelines/VariablesTable';
import VariableForm, { newVariableInitialData } from '../../components/Pipelines/VariableForm';
import BoxForm, { newBoxInitialData } from '../../components/Pipelines/BoxForm';
import Button, { TheButtonGroup } from '../../components/widgets/TheButton';
import SubmitButton from '../../components/forms/SubmitButton';
import Callout from '../../components/widgets/Callout';
import Icon, {
  RefreshIcon,
  SaveIcon,
  DownloadIcon,
  UploadIcon,
  SuccessIcon,
  UndoIcon,
  RedoIcon,
} from '../../components/icons';

import {
  getVariablesUtilization,
  isArrayType,
  coerceVariableValue,
  isExternalReference,
  getReferenceIdentifier,
  makeExternalReference,
  getVariablesTypes,
  comparePipelineEntities,
  checkPipelineStructure,
  validatePipeline,
} from '../../helpers/pipelines';
import { editPipeline, reloadPipeline } from '../../redux/modules/pipelines';
import { getBoxTypes } from '../../redux/selectors/boxes';
import { objectMap, arrayToObject, encodeId, identity } from '../../helpers/common';
import { downloadString } from '../../redux/helpers/api/download';

import styles from '../../components/Pipelines/styles.less';
import InsetPanel from '../../components/widgets/InsetPanel';

const getFormattedErrorAsKey = element => {
  const values = element.props.values ? { ...element.props.values } : {};
  delete values.code;
  return `${element.props.id}-${Object.values(values).join('_')}`;
};

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

const importErrorMessages = defineMessages({
  exception: {
    id: 'app.pipelineEditContainer.importError.exception',
    defaultMessage: 'Import of file {name} failed: {error}',
  },
  parser: {
    id: 'app.pipelineEditContainer.importError.parser',
    defaultMessage: 'Parsing of JSON file {name} failed: {error}',
  },
  structure: {
    id: 'app.pipelineEditContainer.importError.structure',
    defaultMessage: 'Pipeline in file {name} has invalid structure!',
  },
});

class PipelineEditContainer extends Component {
  state = {
    pipelineId: null,
    version: null,
    boxes: null,
    variables: null,
    boxTypes: null,
    errors: [],
    history: [],
    future: [],
    ...STATE_DEFAULTS,
    showTable: true,
    showGraph: false,
    submitting: false,
    submitError: null,
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.pipelineId !== nextProps.pipeline.id) {
      // pipeline was changed whilst component was kept mounted => complete reload
      const pipeline = checkPipelineStructure(nextProps.pipeline.pipeline);
      const pipelineStructureCoerced = pipeline !== nextProps.pipeline.pipeline;
      return {
        pipelineId: nextProps.pipeline.id,
        version: nextProps.pipeline.version,
        originalBoxes: nextProps.pipeline.pipeline.boxes,
        boxes: pipeline.boxes,
        originalVariables: nextProps.pipeline.pipeline.variables,
        variables: pipeline.variables,
        boxTypes: nextProps.boxTypes,
        pipelineStructureCoerced,
        errors: validatePipeline(pipeline.boxes, pipeline.variables, nextProps.boxTypes),
        history: [],
        future: [],
        ...STATE_DEFAULTS,
        submitting: false,
        submitError: null,
      };
    }

    const updates = {};

    if (prevState.boxTypes !== nextProps.boxTypes) {
      // boxTypes changed (probably get loaded) -> revalidate
      updates.boxTypes = nextProps.boxTypes;
      updates.errors = validatePipeline(prevState.boxes, prevState.variables, nextProps.boxTypes);
    }

    if (prevState.version < nextProps.pipeline.version) {
      const { boxes, variables } = nextProps.pipeline.pipeline;
      if (
        (comparePipelineEntities(prevState.originalBoxes, boxes) || comparePipelineEntities(prevState.boxes, boxes)) &&
        (comparePipelineEntities(prevState.originalVariables, variables) ||
          comparePipelineEntities(prevState.variables, variables))
      ) {
        // if version changed, but the structure remained the same => just silently update the version
        updates.version = nextProps.pipeline.version;
        updates.originalBoxes = nextProps.pipeline.pipeline.boxes;
        updates.originalVariables = nextProps.pipeline.pipeline.variables;
      }
    }

    return Object.keys(updates).length > 0 ? updates : null;
  }

  constructor(props) {
    super(props);
    this.inputFileRef = React.createRef();
  }

  undo = () => {
    if (this.state.history.length === 0) {
      return;
    }

    const [restore, ...history] = this.state.history;
    const snapshot = arrayToObject(Object.keys(restore), identity, key => this.state[key]);

    this.setState({
      ...restore,
      errors: validatePipeline(
        restore.boxes || this.state.boxes,
        restore.variables || this.state.variables,
        this.props.boxTypes
      ),
      history,
      future: [snapshot, ...this.state.future],
      selectedBoxVariables: _getSelectedBoxVariables(this.state.selectedBox, restore.boxes || this.state.boxes),
      selectedVariableBoxes: _getSelectedVariableBoxes(this.state.selectedVariable, restore.boxes || this.state.boxes),
    });
  };

  redo = () => {
    if (this.state.future.length === 0) {
      return;
    }

    const [restore, ...future] = this.state.future;
    const snapshot = arrayToObject(Object.keys(restore), identity, key => this.state[key]);

    this.setState({
      ...restore,
      errors: validatePipeline(
        restore.boxes || this.state.boxes,
        restore.variables || this.state.variables,
        this.props.boxTypes
      ),
      history: [snapshot, ...this.state.history],
      future,
      selectedBoxVariables: _getSelectedBoxVariables(this.state.selectedBox, restore.boxes || this.state.boxes),
      selectedVariableBoxes: _getSelectedVariableBoxes(this.state.selectedVariable, restore.boxes || this.state.boxes),
    });
  };

  reset = () => {
    const [, ...future] = [
      {
        boxes: this.state.boxes,
        variables: this.state.variables,
      },
      ...this.state.history,
    ].reverse();

    this.setState({
      version: this.props.pipeline.version,
      boxes: this.props.pipeline.pipeline.boxes,
      variables: this.props.pipeline.pipeline.variables,
      errors: validatePipeline(
        this.props.pipeline.pipeline.boxes,
        this.props.pipeline.pipeline.variables,
        this.props.boxTypes
      ),
      history: [],
      future,
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
    const snapshot = {};

    const boxes = transformBoxes && transformBoxes(this.state.boxes, this.state.variables);
    if (boxes && !comparePipelineEntities(boxes, this.state.boxes)) {
      snapshot.boxes = this.state.boxes;
      stateUpdate.boxes = boxes;
    }

    const variables = transformVariables && transformVariables(this.state.variables, this.state.boxes);
    if (variables && !comparePipelineEntities(variables, this.state.variables)) {
      snapshot.variables = this.state.variables;
      stateUpdate.variables = variables;
    }

    const pipelineChanged = Object.keys(stateUpdate).length > 0;
    if (pipelineChanged) {
      stateUpdate.history = [snapshot, ...this.state.history];
      stateUpdate.future = [];
      stateUpdate.errors = validatePipeline(
        stateUpdate.boxes || this.state.boxes,
        stateUpdate.variables || this.state.variables,
        this.props.boxTypes
      );
    }

    // update (recompute) selections if necessary
    if (pipelineChanged || selectedBox !== this.state.selectedBox || selectedVariable !== this.state.selectedVariable) {
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

  /**
   * Read a JSON file in hidden file-input, parse it, and load it as the pipeline (if it checks out).
   */
  import = () => {
    const {
      intl: { formatMessage },
    } = this.props;
    const files = this.inputFileRef.current.files;
    if (files.length === 1) {
      files[0].text().then(
        content => {
          try {
            const pipeline = JSON.parse(content);
            const fixedPipeline = checkPipelineStructure(pipeline);
            if (fixedPipeline === pipeline) {
              this.setState({
                boxes: fixedPipeline.boxes,
                variables: fixedPipeline.variables,
                history: [{ boxes: this.state.boxes, variables: this.state.variables }, ...this.state.history],
                future: [],
                errors: validatePipeline(fixedPipeline.boxes, fixedPipeline.variables, this.props.boxTypes),
                selectedBox: null,
                selectedBoxVariables: null,
                selectedVariable: null,
                selectedVariableBoxes: null,
              });
            } else {
              const msg = formatMessage(importErrorMessages.structure, { name: files[0].name });
              window.alert(msg); // eslint-disable-line no-alert
            }
          } catch (e) {
            const msg = formatMessage(importErrorMessages.parser, { name: files[0].name, error: e.message });
            window.alert(msg); // eslint-disable-line no-alert
          }
        },
        error => {
          const msg = formatMessage(importErrorMessages.exception, { name: files[0].name, error });
          window.alert(msg); // eslint-disable-line no-alert
        }
      );
    }
  };

  /**
   * Serialize the pipeline in JSON string and offer it to be downloaded as a file.
   */
  export = () => {
    downloadString(
      'pipeline.json',
      JSON.stringify(
        { ...this.props.pipeline.pipeline, boxes: this.state.boxes, variables: this.state.variables },
        undefined,
        4
      ),
      'text/json',
      false
    );
  };

  /**
   * Accept new version of the base pipeline silently, keeping current work-in-progress.
   */
  acknowledgeNewVersion = () => {
    this.setState({
      version: this.props.pipeline.version,
      originalBoxes: this.props.pipeline.pipeline.boxes,
      orignalVariables: this.props.pipeline.pipeline.variables,
    });
  };

  /**
   * Load new version of pipeline structure (push it as a new state).
   */
  reload = () => {
    const pipeline = checkPipelineStructure(this.props.pipeline.pipeline);
    const pipelineStructureCoerced = pipeline !== this.props.pipeline.pipeline;
    this.setState({
      version: this.props.pipeline.version,
      originalBoxes: this.props.pipeline.pipeline.boxes,
      boxes: pipeline.boxes,
      orignalVariables: this.props.pipeline.pipeline.variables,
      variables: pipeline.variables,
      pipelineStructureCoerced,
      history: [{ boxes: this.state.boxes, variables: this.state.variables }, ...this.state.history],
      future: [],
      errors: validatePipeline(pipeline.boxes, pipeline.variables, this.props.boxTypes),
      selectedBox: null,
      selectedBoxVariables: null,
      selectedVariable: null,
      selectedVariableBoxes: null,
    });
  };

  showAsTable = () => this.setState({ showTable: true, showGraph: false });
  showAsGraph = () => this.setState({ showTable: false, showGraph: true });
  showTableAndGraph = () => this.setState({ showTable: true, showGraph: true });

  /**
   * Save the pipeline.
   */
  save = () => {
    const { editPipeline } = this.props;
    this.setState({ submitting: true, submitError: null });
    return editPipeline({
      ...this.props.pipeline.pipeline,
      boxes: this.state.boxes,
      variables: this.state.variables,
    }).then(
      res => {
        this.setState({ submitting: false });
        return res;
      },
      err => {
        if (err.code === '400-010') {
          // special code dedicated to version mismatchs
          return this.props.reloadPipeline().then(() => {
            this.setState({ submitting: false });
            throw err;
          });
        } else {
          this.setState({ submitting: false, submitError: err });
        }
        throw err;
      }
    );
  };

  render() {
    const { boxTypes, pipeline } = this.props;
    const utilization = getVariablesUtilization(this.state.boxes);
    return (
      <Box
        title={<FormattedMessage id="app.pipelineEditContainer.title" defaultMessage="Edit Pipeline Structure" />}
        unlimitedHeight
        type={this.state.errors && this.state.errors.length > 0 ? 'danger' : 'light'}
        customIcons={
          !this.state.pipelineStructureCoerced ? (
            <>
              <OverlayTrigger
                placement="bottom"
                overlay={
                  <Tooltip id="pipelineTable">
                    <FormattedMessage id="app.pipelineEditContainer.showAsTableIcon" defaultMessage="Show as table" />
                  </Tooltip>
                }>
                <Icon
                  icon="th-list"
                  size="lg"
                  className="valign-middle text-primary"
                  timid={!this.state.showTable || this.state.showGraph}
                  largeGapRight
                  onClick={this.showAsTable}
                />
              </OverlayTrigger>
              <OverlayTrigger
                placement="bottom"
                overlay={
                  <Tooltip id="pipelineGraph">
                    <FormattedMessage
                      id="app.pipelineEditContainer.showAsGraphIcon"
                      defaultMessage="Show as visual diagram"
                    />
                  </Tooltip>
                }>
                <Icon
                  icon="project-diagram"
                  size="lg"
                  className="valign-middle text-primary"
                  timid={this.state.showTable || !this.state.showGraph}
                  largeGapRight
                  onClick={this.showAsGraph}
                />
              </OverlayTrigger>
              <OverlayTrigger
                placement="bottom"
                overlay={
                  <Tooltip id="pipelineBoth">
                    <FormattedMessage
                      id="app.pipelineEditContainer.showAsBothIcon"
                      defaultMessage="Show both data table and diagram"
                    />
                  </Tooltip>
                }>
                <Icon
                  icon="columns"
                  size="lg"
                  className="valign-middle text-primary"
                  timid={!this.state.showTable || !this.state.showGraph}
                  largeGapRight
                  onClick={this.showTableAndGraph}
                />
              </OverlayTrigger>
            </>
          ) : null
        }
        footer={
          this.state.pipelineStructureCoerced ? (
            <div className="text-center">
              <Button variant="warning" onClick={() => this.setState({ pipelineStructureCoerced: false })}>
                <SuccessIcon gapRight />
                <FormattedMessage id="generic.accept" defaultMessage="Accept" />
              </Button>
            </div>
          ) : (
            <div className="text-center" style={{ marginBottom: '-0.75rem' }}>
              <TheButtonGroup className={styles.mainButtonGroup}>
                <Button
                  variant="primary"
                  onClick={this.undo}
                  disabled={this.state.submitting || this.state.history.length === 0}>
                  <UndoIcon gapRight />
                  <FormattedMessage id="generic.undo" defaultMessage="Undo" />
                </Button>
                <Button
                  variant="primary"
                  onClick={this.redo}
                  disabled={this.state.submitting || this.state.future.length === 0}>
                  <RedoIcon gapRight />
                  <FormattedMessage id="generic.redo" defaultMessage="Redo" />
                </Button>
                <Button
                  variant="danger"
                  onClick={this.reset}
                  disabled={this.state.submitting || this.state.history.length === 0}>
                  <RefreshIcon gapRight />
                  <FormattedMessage id="generic.reset" defaultMessage="Reset" />
                </Button>
              </TheButtonGroup>

              <TheButtonGroup className={styles.mainButtonGroup}>
                <Button variant="primary" onClick={() => this.openBoxForm()} disabled={this.state.submitting}>
                  <Icon icon="box" gapRight />
                  <FormattedMessage id="app.pipelineEditContainer.addBoxButton" defaultMessage="Add Box" />
                </Button>
                <Button variant="primary" onClick={() => this.openVariableForm()} disabled={this.state.submitting}>
                  <Icon icon="dollar-sign" gapRight />
                  <FormattedMessage id="app.pipelineEditContainer.addVariableButton" defaultMessage="Add Variable" />
                </Button>
              </TheButtonGroup>

              <TheButtonGroup className={styles.mainButtonGroup}>
                <Button
                  variant="primary"
                  onClick={() => this.inputFileRef.current.click()}
                  disabled={this.state.submitting}>
                  <UploadIcon gapRight />
                  <FormattedMessage id="generic.import" defaultMessage="Import" />
                </Button>
                <input type="file" ref={this.inputFileRef} className="d-none" onChange={this.import} />

                <Button variant="primary" onClick={this.export} disabled={this.state.submitting}>
                  <DownloadIcon gapRight />
                  <FormattedMessage id="generic.export" defaultMessage="Export" />
                </Button>
                <SubmitButton
                  id="pipelineEditContainer"
                  handleSubmit={this.save}
                  submitting={this.state.submitting}
                  hasFailed={this.state.submitError !== null}
                  invalid={this.state.version < pipeline.version || (this.state.errors && this.state.errors.length > 0)}
                  defaultIcon={<SaveIcon gapRight />}
                  messages={{
                    success: <FormattedMessage id="generic.saved" defaultMessage="Saved" />,
                    submit: <FormattedMessage id="generic.save" defaultMessage="Save" />,
                    submitting: <FormattedMessage id="generic.saving" defaultMessage="Saving..." />,
                    invalid: <FormattedMessage id="generic.save" defaultMessage="Save" />,
                  }}
                />
              </TheButtonGroup>
            </div>
          )
        }>
        <>
          {this.state.version < pipeline.version && (
            <Callout variant="warning">
              <h4>
                <FormattedMessage
                  id="app.pipelineEditContainer.versionChangedTitle"
                  defaultMessage="The pipeline was updated"
                />
              </h4>
              <p>
                <FormattedMessage
                  id="app.pipelineEditContainer.versionChanged"
                  defaultMessage="The pipeline structure was updated whilst you were editing it. If you load the new pipeline, it will be pushed as a new state in editor (you can use undo button to revert it)."
                />
              </p>

              <TheButtonGroup>
                <Button variant="primary" onClick={this.acknowledgeNewVersion} disabled={this.state.submitting}>
                  <Icon icon={['far', 'smile']} gapRight />
                  <FormattedMessage id="generic.acknowledge" defaultMessage="Acknowledge" />
                </Button>
                <Button variant="success" onClick={this.reload} disabled={this.state.submitting}>
                  <UploadIcon gapRight />
                  <FormattedMessage id="generic.load" defaultMessage="Load" />
                </Button>
              </TheButtonGroup>
            </Callout>
          )}

          {this.state.pipelineStructureCoerced ? (
            <>
              <Callout variant="danger">
                <h4>
                  <FormattedMessage
                    id="app.pipelineEditContainer.structureCoercedWarningTitle"
                    defaultMessage="The pipeline structure was broken"
                  />
                </h4>
                <p>
                  <FormattedMessage
                    id="app.pipelineEditContainer.structureCoercedWarning"
                    defaultMessage="The pipeline structure was not upholding the prescribed schema and had to be fixed. Some information may have been lost. The original and the fixed pipeline structure is serialized below."
                  />
                </p>
              </Callout>
              <Container fluid>
                <Row>
                  <Col lg={6}>
                    <InsetPanel className="p-1">
                      <strong>
                        <FormattedMessage
                          id="app.pipelineEditContainer.structureCoercedOriginal"
                          defaultMessage="Original"
                        />
                        :
                      </strong>
                      <pre className="m-0 p-0 small">{JSON.stringify(pipeline.pipeline, undefined, 4)}</pre>
                    </InsetPanel>
                  </Col>
                  <Col lg={6}>
                    <InsetPanel className="p-1">
                      <strong>
                        <FormattedMessage
                          id="app.pipelineEditContainer.structureCoercedFixed"
                          defaultMessage="Fixed structure"
                        />
                        :
                      </strong>
                      <pre className="m-0 p-0 small">
                        {JSON.stringify(
                          { ...pipeline.pipeline, boxes: this.state.boxes, variables: this.state.variables },
                          undefined,
                          4
                        )}
                      </pre>
                    </InsetPanel>
                  </Col>
                </Row>
              </Container>
            </>
          ) : (
            <Container fluid>
              {this.state.showTable && (
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
                        pending={this.state.submitting || this.state.version < pipeline.version}
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
                        pending={this.state.submitting || this.state.version < pipeline.version}
                      />
                    )}
                  </Col>
                </Row>
              )}

              {this.state.showGraph && (
                <Row>
                  <Col xl={12}>
                    <PipelineGraph
                      boxes={this.state.boxes}
                      variables={this.state.variables}
                      utilization={utilization}
                      selectedBox={this.state.selectedBox}
                      selectedVariable={this.state.selectedVariable}
                      selectBox={this.selectBox}
                      editBox={this.openBoxForm}
                      selectVariable={this.selectVariable}
                      editVariable={this.openVariableForm}
                      pending={this.state.submitting || this.state.version < pipeline.version}
                    />
                  </Col>
                </Row>
              )}

              {this.state.errors && this.state.errors.length > 0 && (
                <Row>
                  <Col xl={12}>
                    <Callout variant="danger">
                      <h5>
                        <FormattedMessage
                          id="app.pipelineEditContainer.errorsCalloutTitle"
                          defaultMessage="The following errors were found in the pipeline"
                        />
                        :
                      </h5>
                      <ul>
                        {this.state.errors.map(error => (
                          <li key={getFormattedErrorAsKey(error)}>{error}</li>
                        ))}
                      </ul>
                    </Callout>
                  </Col>
                </Row>
              )}
            </Container>
          )}

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
  editPipeline: PropTypes.func.isRequired,
  reloadPipeline: PropTypes.func.isRequired,
  intl: PropTypes.object,
};

export default connect(
  state => {
    return {
      boxTypes: getBoxTypes(state),
    };
  },
  (dispatch, { pipeline }) => ({
    editPipeline: pipelineStructure =>
      dispatch(
        editPipeline(pipeline.id, {
          name: pipeline.name,
          description: pipeline.description,
          version: pipeline.version,
          global: pipeline.author === null,
          pipeline: pipelineStructure,
        })
      ),
    reloadPipeline: () => dispatch(reloadPipeline(pipeline.id)),
  })
)(injectIntl(PipelineEditContainer));
