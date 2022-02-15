import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Table } from 'react-bootstrap';
import { defaultMemoize } from 'reselect';
import { CloseIcon, SortedIcon } from '../../icons';

class SortableTable extends Component {
  constructor(props) {
    super(props);
    this.state = { sortColumn: props.defaultOrder || null, ascendant: true };
  }

  // Default row rendering fucntion (if the user does not provide custom function)
  defaultRowRenderer = (row, idx, columns) => (
    <tr key={row.id || idx} className={row.selected ? 'selected' : ''}>
      {columns.map(({ id: colId, cellRenderer, style, className, onClick, isClickable }) => {
        if (typeof isClickable === 'function') {
          isClickable = isClickable(row.id, colId);
        }
        return (
          <td
            key={colId}
            style={style}
            className={`${className} ${isClickable ? 'clickable' : ''}`}
            onClick={onClick && isClickable ? () => onClick(row.id, colId) : null}>
            {cellRenderer(row[colId], idx, colId, row)}
          </td>
        );
      })}
    </tr>
  );

  // Change internal state that holds sorting parameters.
  orderBy = colId => {
    const { columns } = this.props;
    const { sortColumn, ascendant } = this.state;
    const column = columns && columns.find(({ id }) => id === colId);

    if (!colId || !column) {
      this.setState({ sortColumn: null, ascendant: true });
    } else if (colId === sortColumn) {
      this.setState({ ascendant: !ascendant });
    } else {
      this.setState({ sortColumn: colId, ascendant: true });
    }
  };

  // Helper function that actually sorts the data according to internal state
  sortData = defaultMemoize((data, colId, ascendant) => {
    const { columns } = this.props;
    const column = columns && columns.find(({ id }) => id === colId);
    return column === null || column.comparator === null
      ? data
      : ascendant
      ? data.sort(column.comparator)
      : data.sort(column.comparator).reverse();
  });

  getHeaderSuffixRow = () => {
    const { columns } = this.props;
    if (columns.reduce((res, { headerSuffix }) => res || headerSuffix !== null, false)) {
      return (
        <tr>
          {columns.map(column => (
            <th key={column.id} style={column.getHeaderSuffixStyle()} className={column.getHeaderSuffixClassName()}>
              {column.headerSuffix}
            </th>
          ))}
        </tr>
      );
    } else {
      return null;
    }
  };

  render() {
    const {
      columns,
      defaultOrder,
      data = [],
      empty = null,
      rowRenderer = this.defaultRowRenderer,
      ...props
    } = this.props;
    const { sortColumn, ascendant } = this.state;

    return (
      <Table {...props}>
        {columns.length > 0 && (
          <thead>
            <tr>
              {columns.map(column => (
                <th key={`header-${column.id}`} style={column.getHeaderStyle()} className={column.getHeaderClassName()}>
                  {column.header}
                  {column.comparator && data.length > 1 && (
                    <span>
                      <SortedIcon
                        active={sortColumn === column.id}
                        descending={!ascendant}
                        gapLeft
                        onClick={() => this.orderBy(column.id)}
                      />

                      {sortColumn === column.id && !defaultOrder && (
                        <CloseIcon smallGapLeft timid className="text-danger" onClick={() => this.orderBy(null)} />
                      )}
                    </span>
                  )}
                </th>
              ))}
            </tr>
            {this.getHeaderSuffixRow()}
          </thead>
        )}
        <tbody>
          {data.length > 0 ? (
            this.sortData(data, sortColumn, ascendant).map((row, idx) => rowRenderer(row, idx, columns))
          ) : (
            <tr>
              <td colSpan={columns.length}>
                {empty || (
                  <FormattedMessage id="generic.noRecordsInTable" defaultMessage="There are no records in the table." />
                )}
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    );
  }
}

SortableTable.propTypes = {
  columns: PropTypes.array.isRequired,
  defaultOrder: PropTypes.string,
  data: PropTypes.array,
  empty: PropTypes.any,
  rowRenderer: PropTypes.func,
};

export default SortableTable;
