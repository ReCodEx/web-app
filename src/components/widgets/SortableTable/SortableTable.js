import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Table } from 'react-bootstrap';
import { lruMemoize } from 'reselect';

import { UserUIDataContext } from '../../../helpers/contexts.js';
import { CloseIcon, SortedIcon } from '../../icons';
import withRouter, { withRouterProps } from '../../../helpers/withRouter.js';
import { storageGetItem, storageSetItem } from '../../../helpers/localStorage.js';

const localStorageKeyPrefix = 'SortableTable';

class SortableTable extends Component {
  constructor(props) {
    super(props);
    this.state = { sortColumn: props.defaultOrder || null, ascendant: true };
  }

  setSortColumnFromLocalStorage = () => {
    const key = `${localStorageKeyPrefix}[${this.props.id}].order`;
    const order = storageGetItem(key, null);
    if (order) {
      const ascendant = order[0] === '+';
      const sortColumn = order.substring(1);
      this.setState({ sortColumn, ascendant });
    }
  };

  componentDidMount() {
    this.setSortColumnFromLocalStorage();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.id !== this.props.id) {
      this.setSortColumnFromLocalStorage();
    }
  }

  // Default row rendering function (if the user does not provide custom function)
  defaultRowRenderer = (row, idx, columns, openLinkGenerator = null) => {
    const { navigate } = this.props;
    const doubleClickLink = openLinkGenerator && openLinkGenerator(row, idx);

    return (
      <tr
        key={row.id || idx}
        className={row.selected ? 'selected' : ''}
        onDoubleClick={doubleClickLink && (() => navigate(doubleClickLink))}>
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
  };

  // Change internal state that holds sorting parameters.
  orderBy = colId => {
    const { id, columns } = this.props;
    let { sortColumn, ascendant } = this.state;
    const column = columns && columns.find(({ id }) => id === colId);
    const key = `${localStorageKeyPrefix}[${id}].order`;

    if (!colId || !column) {
      sortColumn = null;
      ascendant = true;
    } else if (colId === sortColumn) {
      ascendant = !ascendant;
    } else {
      sortColumn = colId;
      ascendant = true;
    }

    const order = sortColumn ? `${ascendant ? '+' : '-'}${sortColumn}` : null;
    storageSetItem(key, order);
    this.setState({ sortColumn, ascendant });
  };

  // Helper function that actually sorts the data according to internal state
  sortData = lruMemoize((data, colId, ascendant) => {
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
      openLinkGenerator = null,
      staticContext /* avoid capturing static context in the rest of ...props */,
      navigate /* avoid capturing injected function by ...props */,
      ...props
    } = this.props;
    const { sortColumn, ascendant } = this.state;

    return (
      <UserUIDataContext.Consumer>
        {({ openOnDoubleclick = false }) => (
          <Table {...props}>
            {columns.length > 0 && (
              <thead>
                <tr>
                  {columns.map(column => (
                    <th
                      key={`header-${column.id}`}
                      style={column.getHeaderStyle()}
                      className={column.getHeaderClassName()}>
                      {column.header}
                      {column.comparator && data.length > 1 && (
                        <span>
                          <SortedIcon
                            active={sortColumn === column.id}
                            descending={!ascendant}
                            gapLeft={2}
                            onClick={() => this.orderBy(column.id)}
                          />

                          {sortColumn === column.id && !defaultOrder && (
                            <CloseIcon gapLeft={1} timid className="text-danger" onClick={() => this.orderBy(null)} />
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
                this.sortData(data, sortColumn, ascendant).map((row, idx) =>
                  rowRenderer(row, idx, columns, openOnDoubleclick ? openLinkGenerator : null)
                )
              ) : (
                <tr>
                  <td colSpan={columns.length}>
                    {empty || (
                      <FormattedMessage
                        id="generic.noRecordsInTable"
                        defaultMessage="There are no records in the table."
                      />
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        )}
      </UserUIDataContext.Consumer>
    );
  }
}

SortableTable.propTypes = {
  id: PropTypes.string.isRequired,
  columns: PropTypes.array.isRequired,
  defaultOrder: PropTypes.string,
  data: PropTypes.array,
  empty: PropTypes.any,
  rowRenderer: PropTypes.func,
  openLinkGenerator: PropTypes.func,
  staticContext: PropTypes.any,
  navigate: withRouterProps.navigate,
};

export default withRouter(SortableTable);
