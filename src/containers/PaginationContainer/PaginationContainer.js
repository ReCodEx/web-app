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
  setPaginationOffsetLimit,
  setPaginationOrderBy,
  encodeOrderBy,
  decodeOrderBy,
  setPaginationFilters,
  fetchPaginated
} from '../../redux/modules/pagination';
import { identity } from '../../helpers/common';

import styles from './PaginationContainer.less';

class PaginationContainer extends Component {
  componentWillMount() {
    const {
      offset,
      limit,
      intl: { locale },
      defaultOrderBy = null,
      defaultOrderDescendant = false,
      setInitialOrderBy,
      fetchPaginated
    } = this.props;
    if (defaultOrderBy !== null) {
      setInitialOrderBy(encodeOrderBy(defaultOrderBy, defaultOrderDescendant));
    }
    fetchPaginated(offset, limit, locale);
  }

  componentWillReceiveProps(newProps) {
    if (this.props.intl.locale !== newProps.intl.locale) {
      newProps.fetchPaginated(
        newProps.offset,
        newProps.limit,
        newProps.intl.locale
      );
    }
  }

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

  handlePagination = page => {
    const { limit, intl: { locale }, setPage } = this.props;
    setPage((page - 1) * limit, limit, locale);
  };

  // Method passed to filters creator ...
  setFilters = filters => {
    const { limit, intl: { locale }, setPaginationFilters } = this.props;
    setPaginationFilters(filters, limit, locale);
  };

  // Method passed to children data rendering function, so it can use this for sorting icons in table heading
  setOrderBy = (orderBy, descending) => {
    const {
      offset,
      limit,
      intl: { locale },
      setPaginationOrderBy
    } = this.props;
    setPaginationOrderBy(
      encodeOrderBy(orderBy, descending),
      offset,
      limit,
      locale
    );
  };

  render() {
    const {
      children,
      offset,
      limit,
      totalCount,
      isPending,
      orderBy,
      filters,
      data,
      limits = [25, 50, 100, 200],
      filtersCreator = null
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
            {filtersCreator(filters, this.setFilters)}
          </div>}

        {totalCount !== null
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
                  setOrderBy: this.setOrderBy
                })}
              </div>

              <Grid fluid>
                <Row>
                  <Col md={3}>
                    {limits &&
                      limits.length > 0 &&
                      totalCount > limits[0] &&
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
                          items={Math.ceil(totalCount / limit)}
                          activePage={Math.floor(offset / limit) + 1}
                          bsSize="small"
                          className={styles.pagination}
                          onSelect={this.handlePagination}
                        />
                      </div>
                    </Col>}
                </Row>
              </Grid>
            </div>
          : <div className="text-center">
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
  entities: PropTypes.string.isRequired,
  limits: PropTypes.array,
  filtersCreator: PropTypes.func,
  defaultOrderBy: PropTypes.string,
  defaultOrderDescendant: PropTypes.bool,
  children: PropTypes.func.isRequired,
  offset: PropTypes.number.isRequired,
  limit: PropTypes.number.isRequired,
  orderBy: PropTypes.string,
  filters: PropTypes.object.isRequired,
  totalCount: PropTypes.number,
  isPending: PropTypes.bool.isRequired,
  data: PropTypes.array.isRequired,
  setPage: PropTypes.func.isRequired,
  setInitialOrderBy: PropTypes.func.isRequired,
  setInitialFilters: PropTypes.func.isRequired,
  setPaginationOrderBy: PropTypes.func.isRequired,
  setPaginationFilters: PropTypes.func.isRequired,
  fetchPaginated: PropTypes.func.isRequired,
  intl: intlShape.isRequired
};

export default connect(
  (state, { entities }) => {
    return {
      offset: getPaginationOffset(entities)(state),
      limit: getPaginationLimit(entities)(state),
      orderBy: getPaginationOrderBy(entities)(state),
      filters: getPaginationFilters(entities)(state),
      totalCount: getPaginationTotalCount(entities)(state),
      isPending: getPaginationIsPending(entities)(state),
      data: getPaginationDataJS(entities)(state)
    };
  },
  (dispatch, { entities }) => ({
    setPage: (offset, limit, locale) =>
      dispatch(fetchPaginated(entities)(offset, limit, locale)).then(() =>
        // fetch the data first, then change the range properties (better visualization)
        dispatch(setPaginationOffsetLimit(entities)(offset, limit))
      ),
    setInitialOrderBy: orderBy => {
      dispatch(setPaginationOrderBy(entities)(orderBy));
    },
    setInitialFilters: filters => {
      dispatch(setPaginationFilters(entities)(filters));
    },
    setPaginationOrderBy: (orderBy, offset, limit, locale) => {
      dispatch(setPaginationOrderBy(entities)(orderBy));
      return dispatch(fetchPaginated(entities)(offset, limit, locale));
    },
    setPaginationFilters: (filters, limit, locale) => {
      dispatch(setPaginationFilters(entities)(filters));
      return dispatch(fetchPaginated(entities)(0, limit, locale)); // offset is 0, change of filters resets the position
    },
    fetchPaginated: (offset, limit, locale) =>
      dispatch(fetchPaginated(entities)(offset, limit, locale))
  })
)(injectIntl(PaginationContainer));
