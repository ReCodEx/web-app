import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Table } from 'react-bootstrap';
import { defaultMemoize } from 'reselect';
import classnames from 'classnames';

import BoxesTableRow from './BoxesTableRow';
import { arrayToObject } from '../../../helpers/common';

const prepareSelectionIndex = defaultMemoize(
  selections =>
    selections &&
    arrayToObject(
      selections,
      x => x,
      () => true
    )
);

const BoxesTable = ({
  boxes,
  variables = null,
  secondarySelections = null,
  selectedVariable = null,
  removeBox = null,
  pending = false,
  intl: { locale },
  ...rowProps
}) => {
  const selectionIndex = secondarySelections && prepareSelectionIndex(secondarySelections);
  const variable = selectedVariable && variables && variables.find(v => v.name === selectedVariable);
  return (
    <Table
      className={classnames({
        'half-opaque': pending,
        'tbody-hover': boxes.length > 0 && !pending,
      })}
      size="sm">
      <thead>
        <tr>
          <th>
            <FormattedMessage id="app.pipelines.boxesTable.name" defaultMessage="Name" />
          </th>
          <th>
            <FormattedMessage id="app.pipelines.boxesTable.boxType" defaultMessage="Box Type" />
          </th>
          <th colSpan={2}>
            <FormattedMessage id="app.pipelines.boxesTable.port" defaultMessage="Port" />
          </th>
          <th>
            <FormattedMessage id="app.pipelines.boxesTable.portType" defaultMessage="Data Type" />
          </th>
          <th>
            <FormattedMessage id="app.pipelines.boxesTable.variable" defaultMessage="Variable" />
          </th>
          <th />
          {removeBox && <th />}
        </tr>
      </thead>

      {boxes
        .sort((a, b) => a.name.localeCompare(b.name, locale))
        .map(box => (
          <BoxesTableRow
            key={box.name}
            box={box}
            variables={variables}
            selectedVariable={variable}
            secondarySelections={selectionIndex}
            removeBox={removeBox}
            pending={pending}
            {...rowProps}
          />
        ))}

      {boxes.length === 0 && (
        <tbody>
          <tr>
            <td colSpan={7} className="text-center text-muted small">
              <em>
                <FormattedMessage
                  id="app.pipelines.boxesTable.noBoxes"
                  defaultMessage="There are no boxes in the pipeline."
                />
              </em>
            </td>
          </tr>
        </tbody>
      )}
    </Table>
  );
};

BoxesTable.propTypes = {
  boxes: PropTypes.array.isRequired,
  variables: PropTypes.array,
  removeBox: PropTypes.func,
  secondarySelections: PropTypes.array,
  selectedVariable: PropTypes.string,
  pending: PropTypes.bool,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired,
};

export default injectIntl(BoxesTable);
