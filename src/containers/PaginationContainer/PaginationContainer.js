import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
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
  getPaginationTotalCount,
  getPaginationIsPending,
  getPaginationDataJS
} from '../../redux/selectors/pagination';
import {
  setPaginationOffsetLimit,
  setPaginationFilters,
  setPaginationOrderBy,
  fetchPaginated
} from '../../redux/modules/pagination';

import styles from './PaginationContainer.less';

class PaginationContainer extends Component {
  componentWillMount() {
    const { fetchPaginated, offset, limit } = this.props;
    fetchPaginated(offset, limit);
  }

  createLimitButton = amount => {
    const { offset, limit, setPage } = this.props;
    return (
      <Button
        active={limit === amount}
        bsStyle={limit === amount ? 'primary' : 'default'}
        onClick={() => setPage(Math.floor(offset / amount) * amount, amount)}
      >
        {amount}
      </Button>
    );
  };

  handlePagination = page => {
    const { limit, setPage } = this.props;
    setPage((page - 1) * limit, limit);
  };

  render() {
    const { children, offset, limit, totalCount, isPending, data } = this.props;
    return (
      <div>
        <div>TODO filters</div>
        {totalCount !== null
          ? <div>
              <div
                className={classnames({
                  'text-muted': true,
                  'text-right': true,
                  small: true,
                  [styles.rangeCaption]: true
                })}
              >
                <FormattedMessage
                  id="app.paginationContainer.showingRange"
                  defaultMessage="showing {offset}. - {offsetEnd}. (of {totalCount})"
                  values={{
                    offset: offset + 1,
                    offsetEnd: Math.min(offset + limit, totalCount),
                    totalCount
                  }}
                />
              </div>

              <div
                className={classnames({
                  [styles.paginatedContent]: true,
                  [styles.changePending]: isPending
                })}
              >
                {children(data)}
              </div>

              <Grid fluid>
                <Row>
                  <Col md={3}>
                    {totalCount > 25 &&
                      <ButtonGroup bsSize="small">
                        {this.createLimitButton(25)}
                        {this.createLimitButton(50)}
                        {totalCount > 50 && this.createLimitButton(100)}
                        {totalCount > 100 && this.createLimitButton(200)}
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
  children: PropTypes.func.isRequired,
  offset: PropTypes.number.isRequired,
  limit: PropTypes.number.isRequired,
  totalCount: PropTypes.number,
  isPending: PropTypes.bool.isRequired,
  data: PropTypes.array.isRequired,
  setPage: PropTypes.func.isRequired,
  fetchPaginated: PropTypes.func.isRequired
};

export default connect(
  (state, { entities }) => {
    return {
      offset: getPaginationOffset(entities)(state),
      limit: getPaginationLimit(entities)(state),
      totalCount: getPaginationTotalCount(entities)(state),
      isPending: getPaginationIsPending(entities)(state),
      data: getPaginationDataJS(entities)(state)
    };
  },
  (dispatch, { entities }) => ({
    setPage: (offset, limit) =>
      dispatch(fetchPaginated(entities)(offset, limit)).then(() =>
        dispatch(setPaginationOffsetLimit(entities)(offset, limit))
      ),
    //    setPaginationFilters: dispatch(setPaginationFilters(entities) .... ),
    //    setPaginationOrderBy: dispatch(setPaginationOrderBy(entities) .... ),
    fetchPaginated: (offset, limit) =>
      dispatch(fetchPaginated(entities)(offset, limit))
  })
)(PaginationContainer);
