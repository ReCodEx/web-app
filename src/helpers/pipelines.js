/*
 * Functions related to pipeline editing and visualization.
 */
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { defaultMemoize } from 'reselect';
import { arrayToObject, identity, objectFilter, deepCompare } from './common';

export const KNOWN_DATA_TYPES = ['file', 'remote-file', 'string']
  .reduce((acc, type) => [...acc, type, type + '[]'], [])
  .sort();

/**
 * Check whether given data type is a list of values.
 * @param {string} type descriptor
 * @returns {boolean} true if the type represents a list
 */
export const isArrayType = type => type.endsWith('[]');

/**
 * Check whether given variable value is a reference to external variable (starts with $).
 * @param {string|Array} value
 * @returns {boolean}
 */
export const isExternalReference = value => typeof value === 'string' && value.startsWith('$');

/**
 * Get the identifier if an external reference
 * @param {*} value
 * @returns {string|null} null if the value is not a reference
 */
export const getReferenceIdentifier = value => (isExternalReference(value) ? value.substr(1) : null);

/**
 * Create a value that is an external reference to a variable of given name
 * @param {string} name of the variable
 * @returns {string}
 */
export const makeExternalReference = name => '$' + name;

/**
 * Verify that variable value is present and matches declared type.
 * @param {Object} variable
 * @returns {boolean}
 */
export const isVariableValueValid = variable =>
  'value' in variable &&
  'type' in variable &&
  (Array.isArray(variable.value) === isArrayType(variable.type) || isExternalReference(variable.value));

/**
 * Make sure the variable value is of the right type, cast it if necessary.
 * @param {*} variable
 */
export const coerceVariableValue = variable => {
  if (!('value' in variable)) {
    variable.value = isArrayType(variable.type) ? [] : '';
  }

  if (typeof variable.value === 'object' && !Array.isArray(variable.value)) {
    variable.value = Object.values(variable.value);
  }

  if (!isVariableValueValid(variable)) {
    if (isArrayType(variable.type)) {
      variable.value = variable.value ? [variable.value] : [];
    } else {
      variable.value = variable.value.join(' ');
    }
  }
};

/**
 * Get info about variables utilization from boxes specification (where the variables are used)
 * @param {Object[]} boxes part of the pipeline specification
 * @return {Object} keys are variable names, values are objects holding { portsIn, portsOut } values,
 *                  both are arrays of objects { box, port } where the variable is present
 */
export const getVariablesUtilization = defaultMemoize(boxes => {
  const utils = {};
  boxes.forEach(box =>
    ['portsIn', 'portsOut'].forEach(ports =>
      Object.keys(box[ports])
        .filter(port => box[ports][port] && box[ports][port].value)
        .forEach(port => {
          const { value } = box[ports][port];
          if (!utils[value]) {
            utils[value] = { portsIn: [], portsOut: [] };
          }
          utils[value][ports].push({ box, port });
        })
    )
  );
  return utils;
});

/**
 * Transform array of variables into oject (dictionary), that translates name to type.
 * @param {Object[]} variables
 * @return {Object} keys are names, values are types
 */
export const getVariablesTypes = defaultMemoize(variables =>
  arrayToObject(
    variables,
    ({ name }) => name,
    ({ type }) => type
  )
);

const nameTypeComparator = (a, b) =>
  (a.name || '').localeCompare(b.name || '') || (a.type || '').localeCompare(b.type || '');

export const comparePipelineEntities = (entities1, entities2) => {
  if (!Array.isArray(entities1) || !Array.isArray(entities2)) {
    return deepCompare(entities1, entities2, true);
  }
  if (entities1.length !== entities2.length) {
    return false;
  }

  const sorted1 = [...entities1].sort(nameTypeComparator);
  const sorted2 = [...entities2].sort(nameTypeComparator);
  return deepCompare(sorted1, sorted2, true);
};

/*
 * Structural checks
 */

const isPortStructureOk = port => {
  return port && typeof port === 'object' && typeof port.type === 'string' && typeof port.value === 'string';
};

const checkBoxStructure = box => {
  if (!box || typeof box !== 'object' || typeof box.name !== 'string' || typeof box.type !== 'string') {
    return null;
  }
  const portsIn = box.portsIn && typeof box.portsIn === 'object' && objectFilter(box.portsIn, isPortStructureOk);
  const portsOut = box.portsOut && typeof box.portsOut === 'object' && objectFilter(box.portsOut, isPortStructureOk);

  if (
    !portsIn ||
    !portsOut ||
    Object.keys(portsIn).length !== Object.keys(box.portsIn).length ||
    Object.keys(portsOut).length !== Object.keys(box.portsOut).length
  ) {
    return { ...box, portsIn: portsIn || {}, portsOut: portsOut || {} };
  } else {
    return box; // input object returned => everything was fine
  }
};

const checkVariableStructure = variable => {
  return variable &&
    typeof variable === 'object' &&
    typeof variable.name === 'string' &&
    typeof variable.type === 'string'
    ? variable // input object returned => everything was fine
    : null;
};

const _cmpArrays = (a1, a2) =>
  Array.isArray(a1) && Array.isArray(a2) && a1.length === a2.length && a1.every((val, idx) => val === a2[idx]);

/**
 * Make sure a pipeline structure is ok. If not, a fix is attempted.
 * @param {Object} pipeline the pipeline structure to be verified
 * @returns {Object} the input pipeline object if it passes the checks, a newly constructed obejct with corrections otherwise
 */
export const checkPipelineStructure = pipeline => {
  const boxes = (Array.isArray(pipeline.boxes) ? pipeline.boxes : []).map(checkBoxStructure).filter(identity);
  const variables = (Array.isArray(pipeline.variables) ? pipeline.variables : [])
    .map(checkVariableStructure)
    .filter(identity);

  return !_cmpArrays(boxes, pipeline.boxes) || !_cmpArrays(variables, pipeline.variables)
    ? { ...pipeline, boxes, variables }
    : pipeline;
};

/*
 * Validation
 */

/**
 * Make sure that names of boxes and variables are properly set (not empty).
 * @param {Array} boxes
 * @param {Array} variables
 * @param {Array} errors output collector
 */
const validateNamesAreSet = (boxes, variables, errors) => {
  const boxNames = boxes.map(({ name }) => name).filter(name => name && name.trim() !== '');
  if (boxes.length !== boxNames.length) {
    errors.push(
      <FormattedMessage
        id="app.pipelines.validation.someBoxesWithoutName"
        defaultMessage="At least one box does not have properly filled name."
      />
    );
  }
  if (new Set(boxNames).size !== boxNames.length) {
    errors.push(
      <FormattedMessage
        id="app.pipelines.validation.someBoxesHaveDuplicitNames"
        defaultMessage="Some boxes have duplicit names."
      />
    );
  }

  const varNames = variables.map(({ name }) => name).filter(name => name && name.trim() !== '');
  if (variables.length !== varNames.length) {
    errors.push(
      <FormattedMessage
        id="app.pipelines.validation.someVariablesWithoutName"
        defaultMessage="At least one variables does not have properly filled name."
      />
    );
  }
  if (new Set(varNames).size !== varNames.length) {
    errors.push(
      <FormattedMessage
        id="app.pipelines.validation.someVariablesHaveDuplicitNames"
        defaultMessage="Some variables have duplicit names."
      />
    );
  }
};

/**
 * Verify that associated variable exist and match the port type.
 * @param {string} boxName
 * @param {string} ports
 * @param {string} portName
 * @param {Object} port
 * @param {Object} variablesIndex
 * @param {Array} errors output collector
 * @returns
 */
const validatePortVariable = (boxName, ports, portName, port, variablesIndex, errors) => {
  const variable = port.value;
  if (!variable) {
    return; // no variable associated, nothing to check
  }

  if (!variablesIndex[variable]) {
    // the variable does not exit
    errors.push(
      <FormattedMessage
        id="app.pipelines.validation.portVariableDoesNotExist"
        defaultMessage="Port <code>{boxName}.{ports}.{portName}</code> has attached variable <code>{variable}</code> which does not exist."
        values={{
          boxName,
          ports,
          portName,
          variable,
          code: content => <code>{content}</code>,
        }}
      />
    );
  } else if (variablesIndex[variable].type !== port.type) {
    // the type of the variable does not match
    errors.push(
      <FormattedMessage
        id="app.pipelines.validation.portVariableTypeMismatch"
        defaultMessage="Port <code>{boxName}.{ports}.{portName}</code> has attached variable <code>{variable}</code>, but their types do not match (<code>{portType}</code> != <code>varType</code>)."
        values={{
          boxName,
          ports,
          portName,
          variable,
          portType: port.type,
          varType: variablesIndex[variable].type,
          code: content => <code>{content}</code>,
        }}
      />
    );
  }
};

/**
 * Validate ports of a given box whether its type match box type definition,
 * and and associated variables exist and match their port types.
 * @param {Object} box
 * @param {Object} boxType
 * @param {string} ports portsIn or portsOut
 * @param {Object} variablesIndex build from variables array using name as key
 * @param {Array} errors output collector
 */
const validateBoxPorts = (box, boxType, ports, variablesIndex, errors) => {
  Object.keys(boxType[ports]).forEach(portName => {
    const portDef = boxType[ports][portName];
    const port = box[ports] && box[ports][portName];
    if (!port) {
      // port missing
      errors.push(
        <FormattedMessage
          id="app.pipelines.validation.portMissing"
          defaultMessage="Port <code>{boxName}.{ports}.{portName}</code> is prescribed by the box type but missing."
          values={{
            boxName: box.name,
            ports,
            portName,
            code: content => <code>{content}</code>,
          }}
        />
      );
    } else {
      // port type mismatch
      if (port.type !== portDef.type) {
        errors.push(
          <FormattedMessage
            id="app.pipelines.validation.invalidPortType"
            defaultMessage="Port <code>{boxName}.{ports}.{portName}</code> is of type <code>{type}</code>, but <code>{typeDef}</code> type is prescribed by the box type."
            values={{
              boxName: box.name,
              ports,
              portName,
              type: port.type,
              typeDef: portDef.type,
              code: content => <code>{content}</code>,
            }}
          />
        );
      }

      validatePortVariable(box.name, ports, portName, port, variablesIndex, errors);
    }
  });
};

/**
 * Complete validation of boxes.
 * - Boxes have known type,
 * - structure of ports is matching that type,
 * - and associated variables exist and match their port types.
 * @param {Array} boxes
 * @param {Array} variables
 * @param {Object} boxTypes
 * @param {Array} errors output collector
 */
const validateBoxes = (boxes, variables, boxTypes, errors) => {
  const variablesIndex = arrayToObject(variables, ({ name }) => name);
  boxes.forEach(box => {
    if (!boxTypes[box.type]) {
      errors.push(
        <FormattedMessage
          id="app.pipelines.validation.invalidBoxType"
          defaultMessage="Unknown box type <code>{type}</code> of box <code>{name}</code>."
          values={{
            name: box.name || '??',
            type: box.type,
            code: content => <code>{content}</code>,
          }}
        />
      );
    } else {
      const boxType = boxTypes[box.type];
      ['portsIn', 'portsOut'].forEach(ports => validateBoxPorts(box, boxType, ports, variablesIndex, errors));
    }
  });
};

/**
 * Validate that variables have known types, value is matching that type,
 * and no variable is attached to more than one output port.
 * @param {Array} variables
 * @param {Array} boxes
 * @param {Array} errors output collector
 */
const validateVariables = (variables, boxes, errors) => {
  const dataTypes = new Set(KNOWN_DATA_TYPES);
  const utilization = getVariablesUtilization(boxes);
  variables.forEach(variable => {
    if (!dataTypes.has(variable.type)) {
      errors.push(
        <FormattedMessage
          id="app.pipelines.validation.invalidVariableType"
          defaultMessage="Unknown data type <code>{type}</code> of variable <code>{name}</code>."
          values={{
            name: variable.name || '??',
            type: variable.type,
            code: content => <code>{content}</code>,
          }}
        />
      );
    } else if (!isVariableValueValid(variable)) {
      errors.push(
        <FormattedMessage
          id="app.pipelines.validation.variableValueNotValid"
          defaultMessage="Value of variable <code>{name}</code> does not match its declared data type <code>{type}</code>."
          values={{
            name: variable.name || '??',
            type: variable.type,
            code: content => <code>{content}</code>,
          }}
        />
      );
    }

    if (utilization[variable.name] && utilization[variable.name].portsOut.length > 1) {
      errors.push(
        <FormattedMessage
          id="app.pipelines.validation.variableAttachedToMultiple"
          defaultMessage="Variable <code>{name}</code> is attached to more than one output port."
          values={{
            name: variable.name || '??',
            code: content => <code>{content}</code>,
          }}
        />
      );
    }
  });
};

/**
 * Build a oriented-graph representation of the pipeline (boxes are vertices, variables define edges).
 * @param {Array} boxes
 * @returns {Object} keys are box names, values are Set objects holding box names
 */
const buildGraph = boxes => {
  const variablesToBoxes = {};
  boxes.forEach(box =>
    Object.values(box.portsIn)
      .map(({ value }) => value)
      .filter(identity)
      .forEach(variable => {
        if (!variablesToBoxes[variable]) {
          variablesToBoxes[variable] = [];
        }
        variablesToBoxes[variable].push(box.name);
      })
  );

  return arrayToObject(
    boxes,
    ({ name }) => name,
    box =>
      new Set(
        Object.values(box.portsOut)
          .map(({ value }) => value && variablesToBoxes[value])
          .filter(dests => dests && dests.length > 0)
          .reduce((acc, dests) => [...acc, ...dests], [])
      )
  );
};

/**
 * Internal function that performs DFS on the graph to detect loops.
 * @param {Object} graph
 * @param {string} vertex
 * @param {Object} visited
 * @param {Object} open
 * @returns {boolean} true if a loop was detected
 */
const _visitGraphVertex = (graph, vertex, visited, open) => {
  if (!vertex || !graph[vertex] || visited[vertex]) {
    return false;
  }

  if (open[vertex]) {
    return true;
  }

  open[vertex] = true;
  const res = [...graph[vertex]].some(dest => _visitGraphVertex(graph, dest, visited, open));
  visited[vertex] = true;
  return res;
};

/**
 * Detect whether the graph has loop
 * @param {Array} boxes
 * @returns {boolean} true if the graph has an oriented loop
 */
const pipelineGraphHasLoops = boxes => {
  const graph = buildGraph(boxes);
  const open = {}; // vertices which have entered the processing
  const visited = {}; // vertices which are done being processed

  let box = null;
  let res = false;
  while (!res && (box = Object.keys(graph).find(name => !visited[name]))) {
    res = _visitGraphVertex(graph, box, visited, open);
  }
  return res;
};

/**
 * Perform standard valiadtion of a pipeline.
 * - All box names and variable names are properly filled.
 * - All boxes, ports, and variables have valid types.
 * - Variables assigned to ports match the port type.
 * - No variable is used in two output ports.
 * - There are no loops in the graph.
 * @param {Array} boxes
 * @param {Array} variables
 * @return {Array|null} list of errors or null, if everything is ok
 */
export const validatePipeline = (boxes, variables, boxTypes) => {
  const errors = [];

  validateNamesAreSet(boxes, variables, errors);
  if (errors.length > 0) {
    // if names are corrupted, no point in checking further...
    return errors;
  }

  validateBoxes(boxes, variables, boxTypes, errors);
  validateVariables(variables, boxes, errors);

  if (errors.length === 0) {
    // graph structure is only worth checking if everyting else is correct
    if (pipelineGraphHasLoops(boxes)) {
      errors.push(
        <FormattedMessage id="app.pipelines.validation.loopDetected" defaultMessage="Loop detected in the pipeline." />
      );
    }
  }

  return errors.length > 0 ? errors : null;
};
