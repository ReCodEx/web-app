import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import classnames from 'classnames';

import { AddIcon, BindIcon, UnbindIcon, InputIcon, OutputIcon, RemoveIcon, WarningIcon } from '../../icons';
import { getVariablesTypes } from '../../../helpers/pipelines.js';
import { getBoxTypeDescription } from '../comments.js';
import * as styles from '../styles.less';

/**
 * Prepare ports obect with all data required for rendering.
 * @param {Object} box of which the ports are being prepared
 * @param {string} direction portsIn or portsOut
 * @param {Object} boxTypes all box type descriptors
 * @returns {Array}
 */
const transformPorts = (box, direction, boxTypes) => {
  const ports = box[direction];
  const portsDescriptors = boxTypes && boxTypes[box.type] && boxTypes[box.type][direction];

  return Object.keys(ports)
    .sort()
    .map(name => ({
      name,
      direction,
      ...ports[name],
      prescribedType: portsDescriptors && portsDescriptors[name] && portsDescriptors[name].type,
    }));
};

const getMissingPorts = (box, direction, boxTypes) => {
  const ports = box[direction];
  const portsDescriptors = (boxTypes && boxTypes[box.type] && boxTypes[box.type][direction]) || {};

  return Object.keys(portsDescriptors)
    .filter(name => !ports[name])
    .sort()
    .map(name => ({
      name,
      direction,
      ...portsDescriptors[name],
      isMissing: true,
    }));
};

// Fragment of table row contaning the port values
const BoxesTablePortsFragment = ({ box, port, variables, selectedVariable, assignVariable }) => {
  const tipId = `${box.name}-${port.direction}-${port.name}`;
  const portTypeWrong =
    port.value && variables && variables[port.value] && variables[port.value] !== port.prescribedType;
  return (
    <>
      <td className="text-center">
        {port.direction === 'portsIn' ? (
          <InputIcon className={port.isMissing ? 'text-danger' : 'text-primary'} />
        ) : (
          <OutputIcon className={port.isMissing ? 'text-danger' : 'text-success'} />
        )}
      </td>

      <td className="small">
        <code className={classnames({ 'text-danger': port.isMissing })}>{port.name}</code>
        {!port.isMissing && !port.prescribedType && (
          <WarningIcon
            gapLeft={2}
            className="text-danger"
            tooltipId={`badport-${tipId}`}
            tooltipPlacement="bottom"
            tooltip={
              <FormattedMessage
                id="app.pipelines.boxesTable.unknownPort"
                defaultMessage="This port is not present in the box descriptor."
              />
            }
          />
        )}
      </td>

      <td className="small">
        <code className={classnames({ 'text-danger': port.isMissing })}>{port.type}</code>
        {!port.isMissing && port.prescribedType && port.prescribedType !== port.type && (
          <WarningIcon
            gapLeft={2}
            className="text-danger"
            tooltipId={`badporttype-${tipId}`}
            tooltipPlacement="bottom"
            tooltip={
              <FormattedMessage
                id="app.pipelines.boxesTable.wrongPortType"
                defaultMessage="The type of this port is <code>{type}</code>, but <code>{descType}</code> is prescribed by the descriptor."
                values={{
                  type: port.type,
                  descType: port.prescribedType,
                  code: content => <code>{content}</code>,
                }}
              />
            }
          />
        )}
      </td>

      <td className={classnames({ 'text-danger': port.isMissing })}>
        {port.isMissing ? (
          <em>
            <small>
              <WarningIcon gapRight={2} />
              <FormattedMessage
                id="app.pipelines.boxesTable.portMissing"
                defaultMessage="missing!"
                values={{
                  type: port.type,
                  descType: port.prescribedType,
                  code: content => <code>{content}</code>,
                }}
              />
            </small>
          </em>
        ) : (
          <>
            <small
              className={classnames({
                'text-danger': portTypeWrong,
                'fw-bold': selectedVariable && selectedVariable.name === port.value,
              })}>
              {port.value}
              {portTypeWrong && (
                <WarningIcon
                  gapLeft={2}
                  tooltipId={`badvartype-${tipId}`}
                  tooltipPlacement="bottom"
                  tooltip={
                    <FormattedMessage
                      id="app.pipelines.boxesTable.wrongVariableType"
                      defaultMessage="Associated variable is of <code>{type}</code>, but <code>{descType}</code> type is required."
                      values={{
                        type: variables[port.value],
                        descType: port.prescribedType,
                        code: content => <code>{content}</code>,
                      }}
                    />
                  }
                />
              )}
            </small>

            {assignVariable && !selectedVariable && !port.value && !portTypeWrong && (
              <AddIcon
                className="text-success"
                timid
                onClick={ev => {
                  ev.stopPropagation();
                  assignVariable(box.name, port.direction, port.name); // create new variable
                }}
                tooltipId={`newvar-${tipId}`}
                tooltipPlacement="bottom"
                tooltip={
                  <FormattedMessage
                    id="app.pipelines.boxesTable.createNewVariable"
                    defaultMessage="Create new variable and associate it with this port."
                  />
                }
              />
            )}
          </>
        )}
      </td>

      <td>
        {selectedVariable &&
          assignVariable &&
          !portTypeWrong &&
          selectedVariable.type === port.prescribedType &&
          selectedVariable.name !== port.value && (
            <BindIcon
              className="text-primary"
              timid
              onClick={ev => {
                ev.stopPropagation();
                assignVariable(box.name, port.direction, port.name, selectedVariable.name);
              }}
            />
          )}
        {selectedVariable && assignVariable && selectedVariable.name === port.value && (
          <UnbindIcon
            className="text-danger"
            onClick={ev => {
              ev.stopPropagation();
              assignVariable(box.name, port.direction, port.name, null); // remove
            }}
          />
        )}
      </td>
    </>
  );
};

BoxesTablePortsFragment.propTypes = {
  box: PropTypes.object.isRequired,
  port: PropTypes.object.isRequired,
  variables: PropTypes.object,
  selectedVariable: PropTypes.object,
  assignVariable: PropTypes.func,
};

const BoxesTableRow = ({
  box,
  boxTypes,
  variables = null,
  selectedVariable = null,
  primarySelection = null,
  secondarySelections = null,
  selectBox = null,
  editBox = null,
  removeBox = null,
  assignVariable = null,
  pending = false,
}) => {
  const [firstPort, ...ports] = [
    ...transformPorts(box, 'portsIn', boxTypes),
    ...transformPorts(box, 'portsOut', boxTypes),
    ...getMissingPorts(box, 'portsIn', boxTypes),
    ...getMissingPorts(box, 'portsOut', boxTypes),
  ];

  return (
    <tbody
      onClick={selectBox && !pending ? () => selectBox(box.name) : null}
      onDoubleClick={editBox && !pending ? () => editBox(box.name) : null}
      className={classnames({
        clickable: (editBox || selectBox) && !pending,
        [styles.primarySelection]: primarySelection === box.name,
        [styles.secondarySelection]: secondarySelections && secondarySelections[box.name],
      })}>
      <tr>
        <td
          rowSpan={ports.length + 1}
          className={classnames({
            'fw-bold': primarySelection === box.name,
            'fst-italic': secondarySelections && secondarySelections[box.name],
          })}>
          {box.name}
        </td>
        <td rowSpan={ports.length + 1}>
          <OverlayTrigger
            placement="bottom"
            overlay={
              <Popover id={`util-${box.type}`}>
                <Popover.Header>
                  {boxTypes[box.type] ? (
                    boxTypes[box.type].name
                  ) : (
                    <FormattedMessage id="app.pipelines.boxesTable.unknownType" defaultMessage="Unknown box type!" />
                  )}
                </Popover.Header>
                <Popover.Body>{getBoxTypeDescription(box.type)}</Popover.Body>
              </Popover>
            }>
            <code className="small">
              {box.type}
              {!boxTypes[box.type] && <WarningIcon className="text-danger" gapLeft={2} />}
            </code>
          </OverlayTrigger>
        </td>

        <BoxesTablePortsFragment
          box={box}
          port={firstPort}
          variables={variables && getVariablesTypes(variables)}
          selectedVariable={selectedVariable}
          assignVariable={assignVariable}
        />

        {removeBox && (
          <td rowSpan={ports.length + 1}>
            <RemoveIcon
              className="text-danger"
              timid
              onClick={ev => {
                ev.stopPropagation();
                if (!pending) {
                  removeBox(box.name);
                }
              }}
            />
          </td>
        )}
      </tr>
      {ports.map(port => (
        <tr key={port.name}>
          <BoxesTablePortsFragment
            box={box}
            port={port}
            variables={variables && getVariablesTypes(variables)}
            selectedVariable={selectedVariable}
            assignVariable={assignVariable}
          />
        </tr>
      ))}
    </tbody>
  );
};

BoxesTableRow.propTypes = {
  box: PropTypes.object.isRequired,
  boxTypes: PropTypes.object.isRequired,
  variables: PropTypes.array,
  selectedVariable: PropTypes.object,
  primarySelection: PropTypes.string,
  secondarySelections: PropTypes.object,
  selectBox: PropTypes.func,
  editBox: PropTypes.func,
  removeBox: PropTypes.func,
  assignVariable: PropTypes.func,
  pending: PropTypes.bool,
};

export default BoxesTableRow;
