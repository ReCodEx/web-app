import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Container, Row, Col, Pagination } from 'react-bootstrap';
import classnames from 'classnames';

import { SortedIcon, LoadingIcon } from '../../components/icons';
import PaginationButtons from '../../components/widgets/PaginationButtons';
import {
  getPaginationOffset,
  getPaginationLimit,
  getPaginationOrderBy,
  getPaginationFilters,
  getPaginationTotalCount,
  getPaginationIsPending,
  getPaginationDataJS,
} from '../../redux/selectors/pagination';
import {
  registerPaginationComponent,
  setPaginationOffsetLimit,
  setPaginationOrderBy,
  encodeOrderBy,
  decodeOrderBy,
  setPaginationFilters,
  fetchPaginated,
} from '../../redux/modules/pagination';
import { identity, EMPTY_OBJ } from '../../helpers/common';

import styles from './PaginationContainer.less';

const DEFAULT_LIMITS = [25, 50, 100, 200];

// Helper that creates sorting icon in the heading
export const createSortingIcon = (colName, orderByColumn, orderByDescending, setOrderBy) =>
  setOrderBy ? (
    <SortedIcon
      active={orderByColumn === colName}
      descending={orderByDescending}
      gapLeft
      onClick={() => setOrderBy(colName, orderByColumn === colName ? !orderByDescending : false)}
    />
  ) : (
    <LoadingIcon gapLeft />
  );

// Show label with actually displayed range info ...
export const showRangeInfo = (offset, limit, totalCount) =>
  totalCount > limit && (
    <div className="text-muted text-right small">
      <FormattedMessage
        id="app.paginationContainer.showingRange"
        defaultMessage="showing {offset}{nbsp}-{nbsp}{offsetEnd} (of{nbsp}{totalCount})"
        values={{
          offset: offset + 1,
          offsetEnd: Math.min(offset + limit, totalCount),
          totalCount,
          nbsp: <>&nbsp;</>,
        }}
      />
    </div>
  );

// Pagination container for paginating generic contents loaded via endpoints following pagination protocol...
class PaginationContainer extends Component {
  static init(props) {
    const { defaultOrderBy, defaultOrderDescending = false, defaultFilters, limits = DEFAULT_LIMITS, register } = props;
    const initials = {
      limit: props.defaultLimit || limits[0],
    };

    if (defaultOrderBy) {
      initials.orderBy = encodeOrderBy(defaultOrderBy, defaultOrderDescending);
    }

    if (defaultFilters) {
      initials.filters = defaultFilters;
    }

    register(initials);
  }

  constructor(props) {
    super(props);
    PaginationContainer.init(props);
  }

  // Mounting handles also redux state initialization using default values and fetching the first batch.
  componentDidMount() {
    const { hideAllItems } = this.props;
    if (!hideAllItems) {
      this.reload();
    }
  }

  // When lang or hideAllItems changes, reload is required ...
  componentDidUpdate(prevProps) {
    if (prevProps.id !== this.props.id) {
      PaginationContainer.init(this.props);
    }

    if (
      (this.props.intl.locale !== prevProps.intl.locale ||
        prevProps.id !== this.props.id ||
        prevProps.endpoint !== this.props.endpoint) &&
      !this.props.hideAllItems &&
      !this.props.isPending
    ) {
      this.reload();
    }
  }

  /**
   * Return bool indicating whether it is desirable to show buttons for limit selection.
   */
  showLimitsButtons = () => {
    const { limit, limits = DEFAULT_LIMITS, totalCount } = this.props;
    return limits.length > 0 && ((limits.length > 1 && totalCount > limits[0]) || limits[0] !== limit);
  };

  /**
   * Rendering function that creates one limit button for given limit (amount of rows).
   */
  createLimitButton = amount => {
    const {
      offset,
      limit,
      intl: { locale },
      setPage,
    } = this.props;
    return (
      <Pagination.Item
        key={amount}
        active={limit === amount}
        onClick={() => setPage(locale, Math.floor(offset / amount) * amount, amount)}>
        {amount}
      </Pagination.Item>
    );
  };

  /**
   * Return the number of total pages in pagination based on total count and limit.
   */
  getTotalPages = () => {
    const { limit, totalCount } = this.props;
    return Math.ceil(totalCount / limit);
  };

  /**
   * Get the (1-based) index of active page (1..totalPages)
   */
  getActivePage = () => {
    const { offset, limit } = this.props;
    return Math.floor(offset / limit) + 1;
  };

  /**
   * Handling function for page selection event.
   */
  handlePagination = page => {
    const {
      limit,
      intl: { locale },
      setPage,
    } = this.props;
    return setPage(locale, (page - 1) * limit, limit);
  };

  /**
   * Handler passed to filters creator. It updates the pagination filters and reloads the page.
   */
  setFilters = filters => {
    const {
      intl: { locale },
      setPaginationFilters,
    } = this.props;
    return setPaginationFilters(filters, locale);
  };

  /**
   * Method passed to children data rendering function, so it can use this for sorting icons in table heading.
   */
  setOrderBy = (orderBy, descending) => {
    const {
      intl: { locale },
      setPaginationOrderBy,
    } = this.props;
    return setPaginationOrderBy(encodeOrderBy(orderBy, descending), locale);
  };

  /**
   * Invokes reload of current page (preserving the offset and limit).
   * Reload is required when item is deleted for instance.
   */
  reload = () => {
    const {
      id,
      endpoint,
      intl: { locale },
      reload,
    } = this.props;
    return reload(id, endpoint, locale);
  };

  /**
   * Main rendering function.
   */
  render() {
    const {
      filtersCreator,
      hideAllItems,
      hideAllMessage = '',
      children,
      offset,
      limit,
      totalCount,
      isPending,
      orderBy,
      filters,
      data,
      limits = DEFAULT_LIMITS,
    } = this.props;

    // Decode order by parameter ...
    const { column: orderByColumn, descending: orderByDescending } = decodeOrderBy(orderBy);

    return (
      <div>
        {filtersCreator && <div>{filtersCreator(filters, isPending ? null : this.setFilters)}</div>}

        {hideAllItems ? (
          hideAllMessage
        ) : totalCount !== null ? (
          <div>
            <div
              className={classnames({
                [styles.paginatedContent]: true,
                [styles.changePending]: isPending,
              })}>
              {children({
                data,
                offset,
                limit,
                totalCount,
                orderByColumn,
                orderByDescending,
                filters,
                setOrderBy: isPending ? null : this.setOrderBy,
                reload: isPending ? null : this.reload,
              })}
            </div>

            {(this.showLimitsButtons() || this.getTotalPages() > 1) && (
              <Container fluid>
                <Row>
                  <Col md={3}>
                    {this.showLimitsButtons() && (
                      <Pagination size="small">
                        {limits
                          .map((l, idx) =>
                            idx < 1 || totalCount > limits[idx - 1] || l === limit ? this.createLimitButton(l) : null
                          )
                          .filter(identity)}
                      </Pagination>
                    )}
                  </Col>
                  {totalCount > limit && (
                    <Col md={9}>
                      <div className="float-right">
                        <PaginationButtons
                          prev
                          next
                          maxButtons={10}
                          boundaryLinks
                          items={this.getTotalPages()}
                          activePage={this.getActivePage()}
                          size="small"
                          className={styles.pagination}
                          onSelect={this.handlePagination}
                        />
                      </div>
                    </Col>
                  )}
                </Row>
              </Container>
            )}
          </div>
        ) : (
          <div className="text-center larger em-maring">
            <LoadingIcon gapRight />
            <FormattedMessage id="generic.loading" defaultMessage="Loading..." />
          </div>
        )}
      </div>
    );
  }
}

PaginationContainer.propTypes = {
  id: PropTypes.string.isRequired,
  endpoint: PropTypes.string.isRequired,
  limits: PropTypes.array,
  filtersCreator: PropTypes.func,
  defaultLimit: PropTypes.number,
  defaultOrderBy: PropTypes.string,
  defaultOrderDescending: PropTypes.bool,
  defaultFilters: PropTypes.object,
  children: PropTypes.func.isRequired,
  hideAllItems: PropTypes.bool,
  hideAllMessage: PropTypes.any,
  offset: PropTypes.number.isRequired,
  limit: PropTypes.number.isRequired,
  orderBy: PropTypes.string,
  filters: PropTypes.object.isRequired,
  totalCount: PropTypes.number,
  isPending: PropTypes.bool.isRequired,
  data: PropTypes.array.isRequired,
  register: PropTypes.func.isRequired,
  reload: PropTypes.func.isRequired,
  setPage: PropTypes.func.isRequired,
  setPaginationOrderBy: PropTypes.func.isRequired,
  setPaginationFilters: PropTypes.func.isRequired,
  fetchPaginated: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired,
};

export default connect(
  (state, { id, endpoint }) => {
    return {
      offset: getPaginationOffset(id)(state) || 0,
      limit: getPaginationLimit(id)(state) || 0,
      orderBy: getPaginationOrderBy(id)(state),
      filters: getPaginationFilters(id)(state) || EMPTY_OBJ,
      totalCount: getPaginationTotalCount(id)(state),
      isPending: getPaginationIsPending(id)(state),
      data: getPaginationDataJS(id, endpoint)(state),
    };
  },
  (dispatch, { id, endpoint }) => ({
    register: initials => dispatch(registerPaginationComponent({ id, ...initials })),
    reload: (_id, _endpoint, locale) => dispatch(fetchPaginated(_id, _endpoint)(locale, null, null, true)), // true = force invalidate
    setPage: (locale, offset, limit) =>
      dispatch(fetchPaginated(id, endpoint)(locale, offset, limit)).then(() =>
        // fetch the data first, then change the range properties (better visualization)
        dispatch(setPaginationOffsetLimit(id)(offset, limit))
      ),
    setPaginationOrderBy: (orderBy, locale) => {
      dispatch(setPaginationOrderBy(id)(orderBy));
      return dispatch(fetchPaginated(id, endpoint)(locale));
    },
    setPaginationFilters: (filters, locale) => {
      dispatch(setPaginationFilters(id)(filters));
      return dispatch(fetchPaginated(id, endpoint)(locale, 0)); // offset is 0, change of filters resets the position
    },
    fetchPaginated: (locale, offset, limit) => dispatch(fetchPaginated(id, endpoint)(locale, offset, limit)),
  })
)(injectIntl(PaginationContainer));
