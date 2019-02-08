import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { Row, Col } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

import Page from '../../components/layout/Page';
import {
  fetchBrokerStats,
  freezeBroker,
  unfreezeBroker,
} from '../../redux/modules/broker';
import {
  brokerStatsSelector,
  brokerFreezeSelector,
  brokerUnfreezeSelector,
} from '../../redux/selectors/broker';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import BrokerButtons from '../../components/Broker/BrokerButtons/BrokerButtons';
import StatsList from '../../components/Broker/StatsList/StatsList';
import { isLoggedAsSuperAdmin } from '../../redux/selectors/users';

class Broker extends Component {
  static loadAsync = (params, dispatch) =>
    Promise.all([dispatch(fetchBrokerStats())]);

  componentWillMount = () => this.props.loadAsync();

  render() {
    const {
      stats,
      isSuperAdmin,
      refreshBrokerStats,
      freezeBroker,
      unfreezeBroker,
      freezeActionStatus,
      unfreezeActionStatus,
    } = this.props;
    return (
      <Page
        title={
          <FormattedMessage
            id="app.broker.title"
            defaultMessage="Broker Management"
          />
        }
        description={
          <FormattedMessage
            id="app.broker.description"
            defaultMessage="Management of broker backend service"
          />
        }>
        {isSuperAdmin && (
          <React.Fragment>
            <BrokerButtons
              refreshBrokerStats={refreshBrokerStats}
              freezeBroker={freezeBroker}
              unfreezeBroker={unfreezeBroker}
              freezeActionStatus={freezeActionStatus}
              unfreezeActionStatus={unfreezeActionStatus}
            />
            <Row>
              <Col lg={6}>
                <ResourceRenderer resource={stats}>
                  {stats => <StatsList stats={stats} />}
                </ResourceRenderer>
              </Col>
            </Row>
          </React.Fragment>
        )}
      </Page>
    );
  }
}

Broker.propTypes = {
  loadAsync: PropTypes.func.isRequired,
  stats: ImmutablePropTypes.map,
  isSuperAdmin: PropTypes.bool.isRequired,
  refreshBrokerStats: PropTypes.func.isRequired,
  freezeBroker: PropTypes.func.isRequired,
  unfreezeBroker: PropTypes.func.isRequired,
  freezeActionStatus: PropTypes.string,
  unfreezeActionStatus: PropTypes.string,
};

export default connect(
  state => ({
    stats: brokerStatsSelector(state),
    freezeActionStatus: brokerFreezeSelector(state),
    unfreezeActionStatus: brokerUnfreezeSelector(state),
    isSuperAdmin: isLoggedAsSuperAdmin(state),
  }),
  dispatch => ({
    loadAsync: () => Broker.loadAsync({}, dispatch),
    refreshBrokerStats: () => dispatch(fetchBrokerStats()),
    freezeBroker: () =>
      dispatch(freezeBroker()).then(() => dispatch(fetchBrokerStats())),
    unfreezeBroker: () =>
      dispatch(unfreezeBroker()).then(() => dispatch(fetchBrokerStats())),
  })
)(Broker);
