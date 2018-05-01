import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Table } from 'react-bootstrap';
import { defaultMemoize } from 'reselect';
import { safeGet } from '../../../helpers/common';
import Icon, { CloseIcon } from '../../icons';

class SortableTable extends Component {
  constructor(props) {
    super(props);
    this.state = { sortColumn: props.defaultOrder || null, ascendant: true };
  }

  // Helper function that fetches style property field (style or className) for given column.
  getStyle = (columnKey, styleField) =>
    safeGet(this.props.styles, [columnKey, styleField]) ||
    safeGet(this.props.styles, ['', styleField]) ||
    null;

  // Default row rendering fucntion (if the user does not provide custom function)
  defaultRowRenderer = (row, idx, { headerKeys, cellRenderers }) =>
    <tr key={row.id || idx}>
      {headerKeys.map(key =>
        <td
          key={key}
          style={this.getStyle(key, 'style')}
          className={this.getStyle(key, 'className')}
        >
          {cellRenderers[key]
            ? cellRenderers[key](row[key])
            : cellRenderers[''] ? cellRenderers[''](row[key]) : row[key]}
        </td>
      )}
    </tr>;

  // Change internal state that holds sorting parameters.
  orderBy = col => {
    const { comparators } = this.props;
    const { sortColumn, ascendant } = this.state;

    if (!col || !comparators || !comparators[col]) {
      this.setState({ sortColumn: null, ascendant: true });
    } else if (col === sortColumn) {
      this.setState({ ascendant: !ascendant });
    } else {
      this.setState({ sortColumn: col, ascendant: true });
    }
  };

  // Helper function that actually sorts the data according to internal state
  sortData = defaultMemoize((data, col, ascendant) => {
    const { comparators } = this.props;
    return col === null || !comparators || !comparators[col]
      ? data
      : ascendant
        ? data.sort(comparators[col])
        : data.sort(comparators[col]).reverse();
  });

  render() {
    const {
      header,
      comparators = {},
      defaultOrder,
      data = [],
      empty = null,
      rowRenderer = this.defaultRowRenderer,
      cellRenderers = {},
      ...props
    } = this.props;
    const headerKeys = Object.keys(header);
    const { sortColumn, ascendant } = this.state;
    return (
      <Table {...props}>
        {headerKeys.length > 0 &&
          <thead>
            <tr>
              {headerKeys.map(key =>
                <th
                  key={`header-${key}`}
                  style={this.getStyle(key, 'style')}
                  className={this.getStyle(key, 'className')}
                >
                  {header[key]}
                  {comparators[key] &&
                    data.length > 1 &&
                    <span>
                      <Icon
                        icon={
                          sortColumn !== key || ascendant
                            ? 'sort-alpha-down'
                            : 'sort-alpha-up'
                        }
                        gapLeft
                        timid={sortColumn !== key}
                        className={
                          sortColumn === key ? 'text-success' : 'text-primary'
                        }
                        onClick={() => this.orderBy(key)}
                      />

                      {sortColumn === key &&
                        !defaultOrder &&
                        <CloseIcon
                          smallGapLeft
                          timid
                          className="text-danger"
                          onClick={() => this.orderBy(null)}
                        />}
                    </span>}
                </th>
              )}
            </tr>
          </thead>}
        <tbody>
          {data.length > 0
            ? this.sortData(data, sortColumn, ascendant).map((row, idx) =>
                rowRenderer(row, idx, { headerKeys, cellRenderers })
              )
            : <tr>
                <td colSpan={headerKeys.length}>
                  {empty ||
                    <FormattedMessage
                      id="generic.noRecordsInTable"
                      defaultMessage="There are no records in the table."
                    />}
                </td>
              </tr>}
        </tbody>
      </Table>
    );
  }
}

SortableTable.propTypes = {
  header: PropTypes.object.isRequired,
  styles: PropTypes.object,
  comparators: PropTypes.object,
  defaultOrder: PropTypes.string,
  data: PropTypes.array,
  empty: PropTypes.any,
  rowRenderer: PropTypes.func,
  cellRenderers: PropTypes.object
};

export default SortableTable;
