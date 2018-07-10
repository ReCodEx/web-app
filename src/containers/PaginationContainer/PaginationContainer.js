import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import {
  Grid,
  Row,
  Col,
  Pagination,
  ButtonGroup,
  Button
} from 'react-bootstrap';
import classnames from 'classnames';

import { LoadingIcon } from '../../components/icons';
import {
  getPaginationOffset,
  getPaginationLimit,
  getPaginationOrderBy,
  getPaginationFilters,
  getPaginationTotalCount,
  getPaginationIsPending,
  getPaginationDataJS
} from '../../redux/selectors/pagination';
import {
  registerPaginationComponent,
  setPaginationOffsetLimit,
  setPaginationOrderBy,
  encodeOrderBy,
  decodeOrderBy,
  setPaginationFilters,
  fetchPaginated
} from '../../redux/modules/pagination';
import { identity, EMPTY_OBJ } from '../../helpers/common';

import styles from './PaginationContainer.less';

const DEFAULT_LIMITS = [25, 50, 100, 200];

class PaginationContainer extends Component {
  constructor(props) {
    super(props);

    const limits = props.limits || DEFAULT_LIMITS;
    const initials = {
      limit: props.defaultLimit || limits[0]
    };

    if (props.defaultOrderBy !== null) {
      initials.orderBy = encodeOrderBy(
        props.defaultOrderBy,
        props.defaultOrderDescending || false
      );
    }

    props.register(initials);
  }

  // Mounting handles also redux state initialization using default values and fetching the first batch.
  componentWillMount() {
    const {
      offset,
      limit,
      intl: { locale },
      hideAllItems,
      fetchPaginated
    } = this.props;

    if (!hideAllItems) {
      fetchPaginated(offset, limit, locale);
    }
  }

  // When lang or hideAllItems changes, reload is required ...
  componentWillReceiveProps(newProps) {
    if (
      this.props.intl.locale !== newProps.intl.locale ||
      (!newProps.hideAllItems && this.props.hideAllItems && !newProps.isPending)
    ) {
      newProps.fetchPaginated(
        newProps.offset,
        newProps.limit,
        newProps.intl.locale
      );
    }
  }

  /**
   * Return bool indicating whether it is desirable to show buttons for limit selection.
   */
  showLimitsButtons = () => {
    const { limit, limits = DEFAULT_LIMITS, totalCount } = this.props;
    return (
      limits.length > 0 &&
      ((limits.length > 1 && totalCount > limits[0]) || limits[0] !== limit)
    );
  };

  /**
   * Rendering function that creates one limit button for given limit (amount of rows).
   */
  createLimitButton = amount => {
    const { offset, limit, intl: { locale }, setPage } = this.props;
    return (
      <Button
        key={amount}
        active={limit === amount}
        bsStyle={limit === amount ? 'primary' : 'default'}
        onClick={() =>
          setPage(Math.floor(offset / amount) * amount, amount, locale)}
      >
        {amount}
      </Button>
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
    const { limit, intl: { locale }, setPage } = this.props;
    return setPage((page - 1) * limit, limit, locale);
  };

  /**
   * Handler passed to filters creator. It updates the pagination filters and reloads the page.
   */
  setFilters = filters => {
    const { limit, intl: { locale }, setPaginationFilters } = this.props;
    return setPaginationFilters(filters, limit, locale);
  };

  /**
   * Method passed to children data rendering function, so it can use this for sorting icons in table heading.
   */
  setOrderBy = (orderBy, descending) => {
    const {
      offset,
      limit,
      intl: { locale },
      setPaginationOrderBy
    } = this.props;
    return setPaginationOrderBy(
      encodeOrderBy(orderBy, descending),
      offset,
      limit,
      locale
    );
  };

  /**
   * Invokes reload of current page (preserving the offset and limit).
   * Reload is required when item is deleted for instance.
   */
  reload = () => {
    const { offset, limit, intl: { locale }, reload } = this.props;
    return reload(offset, limit, locale);
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
      limits = DEFAULT_LIMITS
    } = this.props;

    // Decode order by parameter ...
    const {
      column: orderByColumn,
      descending: orderByDescending
    } = decodeOrderBy(orderBy);

    return (
      <div>
        {filtersCreator &&
          <div>
            {filtersCreator(filters, isPending ? null : this.setFilters)}
          </div>}

        {hideAllItems
          ? hideAllMessage
          : totalCount !== null
            ? <div>
                <div
                  className={classnames({
                    [styles.paginatedContent]: true,
                    [styles.changePending]: isPending
                  })}
                >
                  {children({
                    data,
                    offset,
                    limit,
                    totalCount,
                    orderByColumn,
                    orderByDescending,
                    filters,
                    setOrderBy: isPending ? null : this.setOrderBy,
                    reload: isPending ? null : this.reload
                  })}
                </div>

                {(this.showLimitsButtons() || this.getTotalPages() > 1) &&
                  <Grid fluid>
                    <Row>
                      <Col md={3}>
                        {this.showLimitsButtons() &&
                          <ButtonGroup bsSize="small">
                            {limits
                              .map(
                                (l, idx) =>
                                  idx < 1 || totalCount > limits[idx - 1]
                                    ? this.createLimitButton(l)
                                    : null
                              )
                              .filter(identity)}
                          </ButtonGroup>}
                      </Col>
                      {totalCount > limit &&
                        <Col md={9}>
                          <div className="text-right">
                            <Pagination
                              prev
                              next
                              maxButtons={10}
                              boundaryLinks
                              items={this.getTotalPages()}
                              activePage={this.getActivePage()}
                              bsSize="small"
                              className={styles.pagination}
                              onSelect={this.handlePagination}
                            />
                          </div>
                        </Col>}
                    </Row>
                  </Grid>}
              </div>
            : <div className="text-center larger">
                <LoadingIcon gapRight />
                <FormattedMessage
                  id="generic.loading"
                  defaultMessage="Loading ..."
                />
              </div>}
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
  intl: intlShape.isRequired
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
      data: getPaginationDataJS(id, endpoint)(state)
    };
  },
  (dispatch, { id, endpoint }) => ({
    register: initials =>
      dispatch(registerPaginationComponent({ id, ...initials })),
    reload: (offset, limit, locale) =>
      dispatch(fetchPaginated(id, endpoint)(offset, limit, locale, true)), // true = force invalidate
    setPage: (offset, limit, locale) =>
      dispatch(fetchPaginated(id, endpoint)(offset, limit, locale)).then(() =>
        // fetch the data first, then change the range properties (better visualization)
        dispatch(setPaginationOffsetLimit(id)(offset, limit))
      ),
    setPaginationOrderBy: (orderBy, offset, limit, locale) => {
      dispatch(setPaginationOrderBy(id)(orderBy));
      return dispatch(fetchPaginated(id, endpoint)(offset, limit, locale));
    },
    setPaginationFilters: (filters, limit, locale) => {
      dispatch(setPaginationFilters(id)(filters));
      return dispatch(fetchPaginated(id, endpoint)(0, limit, locale)); // offset is 0, change of filters resets the position
    },
    fetchPaginated: (offset, limit, locale) =>
      dispatch(fetchPaginated(id, endpoint)(offset, limit, locale))
  })
)(injectIntl(PaginationContainer));
