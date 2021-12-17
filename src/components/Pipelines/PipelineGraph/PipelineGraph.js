import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { canUseDOM } from 'exenv';
import Viz from 'viz.js';

import InsetPanel from '../../widgets/InsetPanel';
import { LoadingIcon } from '../../icons';
import { isExternalReference } from '../../../helpers/pipelines';
import styles from '../styles.less';

const { Module, render } = require('viz.js/lite.render.js');

// string sanitizations
const normalizeDotId = id => (id || '').replace(/[^-a-zA-Z0-9_]/, '');
const normalizeDotRecordString = str => (str || '').replace(/[|{}"']/, '');
const normalizeDotString = str => (str || '').replace('"', '&quot;');

/**
 * Special sanitization for variable value (also ensures max. lengh by ellipsis).
 * @param {string} str
 * @returns {string}
 */
const normalizeVariableValue = str => {
  str = normalizeDotString(str);
  if (str.length > 25) {
    str = str.substring(0, 24) + '&hellip;';
  }
  return str;
};

/**
 * Ellipsis for arrays, if it has more than 4 items, it is truncated and ... becomes the last item.
 * @param {Array} arr
 * @returns {Array}
 */
const arrayEllipsis = arr => (arr.length > 4 ? [arr[0], arr[1], arr[2], '&hellip;'] : arr);

/**
 * Ensure given identifier is unique.
 * @param {string} id original identifier (used as prefix)
 * @param {Object} index id must not collide with any of the keys
 * @param {Object|null} index2 id must not collide with any of the keys (if the second index is provided)
 * @returns {string}
 */
const makeUnique = (id, index, index2 = null) => {
  let suffix = '';
  let counter = 0;
  while (`${id}${suffix}` in index) {
    suffix = `_${++counter}`;
  }
  if (index2) {
    while (`${id}${suffix}` in index2) {
      suffix = `_${++counter}`;
    }
  }
  return `${id}${suffix}`;
};

/**
 * Render list of ports in dot-formatted label.
 * @param {Object} ports
 * @returns {string}
 */
const renderPorts = ports =>
  Object.keys(ports)
    .map(port => `<${port}> ${port}`)
    .join(' | ');

/**
 * Special labels for technical boxes (merges, casts, ...) that can save space.
 * We do not need to show full box with name and type.
 */
const technicalBoxLabels = {
  'merge-files': '{ { <in1> [files1] | <in2> [files2] } | <out> [files1, files2] }',
  'merge-strings': '{ { <in1> [strs1] | <in2> [strs2] } | <out> [strs1, strs2] }',
  'file-to-array': '{ <in> file | <out> [file] }',
  'string-to-array': '{ <in> str | <out> [str] }',
  'file-name': '{ <in> file | <out> str }',
  'files-names': '{ <in> [files] | <out> [strs] }',
};

/**
 * Formatting function that converts a box into dot string representation of record node.
 * @param {Object} box
 * @param {string|null} primarySelection name of the selected box (null if no box is selected)
 * @returns {string} in dot format
 */
const renderBox = (box, primarySelection) => {
  const portsIn = box.portsIn && Object.keys(box.portsIn).length > 0 ? `{ ${renderPorts(box.portsIn)} } |` : '';
  const portsOut = box.portsOut && Object.keys(box.portsOut).length > 0 ? `| { ${renderPorts(box.portsOut)} }` : '';
  const fillColor = primarySelection === box.name ? '#ccccff' : technicalBoxLabels[box.type] ? '#eeeeee' : '#eeffee';
  const label =
    technicalBoxLabels[box.type] ||
    `{ ${portsIn} \\n${normalizeDotRecordString(box.name)} (${box.type})\\n&nbsp; ${portsOut} }`;
  return `<${box.id}> [label="${label}", tooltip="${normalizeDotString(
    box.name
  )}", fillcolor="${fillColor}", class="clickable"];`;
};

/**
 * Formatting function that renders a variable into dot string representation of a node.
 * @param {Object} variable
 * @param {string|null} primarySelection name of the selected variable (null if no variable is selected)
 * @returns {string}
 */
const renderVariableValue = (variable, primarySelection) => {
  const name = normalizeDotString(variable.name);
  const fillColor = primarySelection === variable.name ? '#ccccff' : null;
  const attributes = ['shape=oval', 'fontsize=8', `tooltip="${name}"`, 'class="clickable"'];

  if (isExternalReference(variable.value)) {
    // special case for external references so they are not missed
    attributes.push(
      `label="${normalizeVariableValue(variable.value)}"`,
      `fillcolor="${fillColor || '#ffeee0'}"`,
      'shape=oval'
    );
  } else {
    const label = Array.isArray(variable.value)
      ? arrayEllipsis(variable.value).map(normalizeVariableValue).join('\\l') // \l newline, but text aligned to left
      : normalizeVariableValue(variable.value);
    attributes.push(`label="${label}\\l"`, `fillcolor="${fillColor || '#ffffff'}"`, 'shape=note');
  }
  return `<${variable.id}> [${attributes.join(',')}]`;
};

// Formatting functions for connectors
const renderEdge = ({ from, to, label }) => {
  const res = [from, '->', to];
  if (label) {
    res.push('[label="', normalizeDotString(label), '", fontsize="8"]');
  }
  return res.join(' ') + ';';
};

/**
 * Main rendering function. Gets the configuration of the pipeline and generates a serialized dot representation.
 * @param {Array} boxes
 * @param {Array} variables
 * @param {Object} utilization
 * @param {string|null} selectedBox
 * @param {string|null} selectedVariable
 * @returns {Object} containg dot (string),
 */
const prepareGraphForRendering = (boxes, variables, utilization, selectedBox, selectedVariable) => {
  // preprocess and index boxes (ids must be safe and unique)
  const boxIndex = {};
  const boxIds = {};
  const renderedBoxes = boxes.map(box => {
    const id = makeUnique(normalizeDotId(box.name || box.type || 'box'), boxIndex);
    boxIndex[box.name] = id;
    boxIds[id] = box.name;
    return { ...box, id };
  });

  // preprocess and index variables (like boxes, but only nonempty are shown)
  const variableIndex = {};
  const variableIds = {};
  const prepVariables = variables
    .filter(({ value }) => value && (!Array.isArray(value) || value.length > 0))
    .map(variable => {
      const id = makeUnique(normalizeDotId(variable.name || variable.type || 'var'), variableIndex, boxIndex);
      variableIndex[variable.name] = id;
      variableIds[id] = variable.name;
      return { ...variable, id };
    });

  // compute connections between nodes in the dot graph based on how variables connect the boxes
  const connections = [];
  Object.keys(utilization).forEach(variable => {
    const { portsIn, portsOut } = utilization[variable];
    if (variableIndex[variable]) {
      // variable has explicit value, we need to connect outs -> var and var -> ins
      portsOut.forEach(portOut => {
        connections.push({
          from: `<${boxIndex[portOut.box.name]}>:<${portOut.port}>:s`, // :s = attached to south
          to: `<${variableIndex[variable]}>:n`, // :n = attached to north
          label: variable,
        });
      });
      portsIn.forEach(portIn => {
        connections.push({
          from: `<${variableIndex[variable]}>:s`, // :s = attached to south
          to: `<${boxIndex[portIn.box.name]}>:<${portIn.port}>:n`, // :n = attached to north
        });
      });
    } else {
      // no variable box present (only a simple connection)
      portsOut.forEach(portOut => {
        portsIn.forEach(portIn => {
          // cartesian product (although, there should be at most one port out)
          connections.push({
            from: `<${boxIndex[portOut.box.name]}>:<${portOut.port}>:s`, // :s = attached to south
            to: `<${boxIndex[portIn.box.name]}>:<${portIn.port}>:n`, // :n = attached to north
            label: variable,
          });
        });
      });
    }
  });

  // lets the assembly begin...
  const dot = [
    'digraph structs {',
    'graph [truecolor=true, bgcolor="#ffffff00"];',
    'node [shape=record, style="rounded,filled,solid", fontsize="12"];',
    ...renderedBoxes.map(box => renderBox(box, selectedBox)),
    ...prepVariables.map(variable => renderVariableValue(variable, selectedVariable)),
    ...connections.map(renderEdge),
    '}',
  ].join('\n');
  return { dot, boxIds, variableIds };
};

/**
 * Renders serialized dot graph into svg.
 * @param {string} dot
 * @returns {Promise}
 */
const startRenderingToSvg = dot => {
  const viz = new Viz({ Module, render });
  return viz.renderString(dot);
};

/**
 * Event handling helper that identifies either a box or variable from a click event.
 * @param {Event} ev
 * @param {Object} boxIds dot id -> box name dictionary
 * @param {Object} variableIds dot id -> variable name dictionary
 * @returns {Object} with two keys `box` and `variable` holding either string with name or null
 */
const preprocessClickEvent = (ev, boxIds, variableIds) => {
  let id = ev.target;
  id = id && id.closest('g.node.clickable'); // neares group parent representing box or variable
  id = id && id.querySelector('title'); // group title holds the dot id
  id = id && id.textContent;

  const box = (id && boxIds && boxIds[id]) || null;
  const variable = (id && variableIds && variableIds[id]) || null;
  return { box, variable };
};

const PipelineGraph = ({
  boxes,
  variables,
  utilization,
  selectedBox = null,
  selectedVariable = null,
  selectBox = null,
  editBox = null,
  selectVariable = null,
  editVariable = null,
}) => {
  if (canUseDOM) {
    const [svg, setSvg] = useState(null);
    const [boxIds, setBoxIds] = useState(null);
    const [variableIds, setVariableIds] = useState(null);

    useEffect(() => {
      setSvg(null);
      const { dot, boxIds, variableIds } = prepareGraphForRendering(
        boxes,
        variables,
        utilization,
        selectedBox,
        selectedVariable
      );
      setBoxIds(boxIds);
      setVariableIds(variableIds);
      startRenderingToSvg(dot).then(result => setSvg(result));
    }, [boxes, variables, utilization, selectedBox, selectedVariable]);

    return (
      <InsetPanel className="m-0 p-0">
        {canUseDOM && svg ? (
          <div
            className={styles.pipelineGraph}
            dangerouslySetInnerHTML={{
              __html: svg,
            }}
            onContextMenu={ev => {
              ev.preventDefault();
              const { box, variable } = preprocessClickEvent(ev, boxIds, variableIds);
              box && selectBox && selectBox(box);
              variable && selectVariable && selectVariable(variable);
            }}
            onClick={ev => {
              const { box, variable } = preprocessClickEvent(ev, boxIds, variableIds);
              box && editBox && editBox(box);
              variable && editVariable && editVariable(variable);
            }}
          />
        ) : (
          <div className="p-4 text-center larger">
            <LoadingIcon />
          </div>
        )}
      </InsetPanel>
    );
  } else {
    <InsetPanel />;
  }
};

PipelineGraph.propTypes = {
  boxes: PropTypes.array.isRequired,
  variables: PropTypes.array.isRequired,
  utilization: PropTypes.object.isRequired,
  selectedBox: PropTypes.string,
  selectedVariable: PropTypes.string,
  selectBox: PropTypes.func,
  editBox: PropTypes.func,
  selectVariable: PropTypes.func,
  editVariable: PropTypes.func,
};

export default PipelineGraph;
