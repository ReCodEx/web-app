import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Table, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { defaultMemoize } from 'reselect';
import classnames from 'classnames';

import { InputIcon, OutputIcon, TransferIcon, RemoveIcon, WarningIcon } from '../../icons';
import { isVariableValueValid } from '../../../helpers/pipelines';
import { safeGet, arrayToObject } from '../../../helpers/common';
import styles from '../styles.less';

const prepareSelectionIndex = defaultMemoize(
  selections =>
    selections &&
    arrayToObject(
      selections,
      x => x,
      () => true
    )
);

const VariablesTable = ({
  variables,
  utilization = null,
  primarySelection = null,
  secondarySelections = null,
  selectVariable = null,
  editVariable = null,
  removeVariable = null,
  pending = false,
  intl: { locale },
}) => {
  const secondarySelectionsIndexed = secondarySelections && prepareSelectionIndex(secondarySelections);

  return (
    <Table hover={variables.length > 0 && !pending} className={pending ? 'half-opaque' : ''} size="sm">
      <thead>
        <tr>
          {utilization && <th />}
          <th>
            <FormattedMessage id="app.pipelines.variablesTable.name" defaultMessage="Variable" />
          </th>
          <th>
            <FormattedMessage id="app.pipelines.variablesTable.type" defaultMessage="Data Type" />
          </th>
          <th>
            <FormattedMessage id="app.pipelines.variablesTable.value" defaultMessage="Value" />
          </th>
          {removeVariable && <th />}
        </tr>
      </thead>
      <tbody>
        {variables
          .sort((a, b) => a.name.localeCompare(b.name, locale))
          .map(variable => {
            const portsIn = safeGet(utilization, [variable.name, 'portsIn', 'length'], 0);
            const portsOut = safeGet(utilization, [variable.name, 'portsOut', 'length'], 0);
            return (
              <tr
                key={`${variable.name}-${portsIn}-${portsOut}`}
                onClick={selectVariable && !pending ? () => selectVariable(variable.name) : null}
                onDoubleClick={editVariable && !pending ? () => editVariable(variable.name) : null}
                className={classnames({
                  clickable: (selectVariable || editVariable) && !pending,
                  [styles.primarySelection]: primarySelection === variable.name,
                  [styles.secondarySelection]: secondarySelectionsIndexed && secondarySelectionsIndexed[variable.name],
                })}>
                {utilization && (
                  <td className="shrink-col">
                    <OverlayTrigger
                      placement="bottom"
                      overlay={
                        <Tooltip id={`util-${variable.name}`}>
                          {portsOut > 1 ? (
                            <FormattedMessage
                              id="app.pipelines.variablesTable.tooManyOutputsAttached"
                              defaultMessage="Variable is attached to more than one output port!"
                            />
                          ) : portsIn && portsOut ? (
                            <FormattedMessage
                              id="app.pipelines.variablesTable.interconnectingVariable"
                              defaultMessage="An interconnecting variable"
                            />
                          ) : portsIn ? (
                            <FormattedMessage
                              id="app.pipelines.variablesTable.inputVariable"
                              defaultMessage="An input variable"
                            />
                          ) : portsOut ? (
                            <FormattedMessage
                              id="app.pipelines.variablesTable.outputVariable"
                              defaultMessage="An output variable"
                            />
                          ) : (
                            <FormattedMessage
                              id="app.pipelines.variablesTable.unused"
                              defaultMessage="This variable is not used in any box"
                            />
                          )}
                        </Tooltip>
                      }>
                      {portsOut > 1 ? (
                        <WarningIcon className="text-danger" />
                      ) : portsIn && portsOut ? (
                        <TransferIcon className="text-muted" />
                      ) : portsIn ? (
                        <InputIcon className="text-primary" />
                      ) : portsOut ? (
                        <OutputIcon className="text-success" />
                      ) : (
                        <WarningIcon className="text-warning" />
                      )}
                    </OverlayTrigger>
                  </td>
                )}

                <td
                  className={classnames({
                    'text-danger': portsOut > 1,
                    'text-bold': primarySelection === variable.name,
                    'text-italic': secondarySelectionsIndexed && secondarySelectionsIndexed[variable.name],
                  })}>
                  {variable.name}
                </td>
                <td>
                  <code className="small">{variable.type}</code>
                </td>
                <td>
                  {!isVariableValueValid(variable) && (
                    <OverlayTrigger
                      placement="bottom"
                      overlay={
                        <Tooltip id={`util-${variable.name}`}>
                          <FormattedMessage
                            id="app.pipelines.variablesTable.wrongValueType"
                            defaultMessage="Variable value has a different type than declared."
                          />
                        </Tooltip>
                      }>
                      <WarningIcon gapLeft className="text-danger float-right m-1" />
                    </OverlayTrigger>
                  )}

                  {Array.isArray(variable.value) ? (
                    variable.value.map((row, idx) => (
                      <code key={idx} className={styles.variableValueRow}>
                        {row}
                      </code>
                    ))
                  ) : (
                    <code className={styles.variableValue}>{variable.value}</code>
                  )}
                </td>
                {removeVariable && (
                  <td>
                    <RemoveIcon
                      className="text-danger"
                      timid
                      onClick={ev => {
                        ev.stopPropagation();
                        if (!pending) {
                          removeVariable(variable.name);
                        }
                      }}
                    />
                  </td>
                )}
              </tr>
            );
          })}

        {variables.length === 0 && (
          <tr>
            <td colSpan={7} className="text-center text-muted small">
              <em>
                <FormattedMessage
                  id="app.pipelines.variablesTable.noVariables"
                  defaultMessage="There are no variables in the pipeline."
                />
              </em>
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
};

VariablesTable.propTypes = {
  variables: PropTypes.array.isRequired,
  utilization: PropTypes.object,
  primarySelection: PropTypes.string,
  secondarySelections: PropTypes.array,
  selectVariable: PropTypes.func,
  editVariable: PropTypes.func,
  removeVariable: PropTypes.func,
  pending: PropTypes.bool,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired,
};

export default injectIntl(VariablesTable);
