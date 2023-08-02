import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { Row, Col } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

import Page from '../../components/layout/Page';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import BrokerButtons from '../../components/Broker/BrokerButtons/BrokerButtons';
import StatsList from '../../components/Broker/StatsList/StatsList';
import AsyncJobsButtons from '../../components/AsyncJobs/AsyncJobsButtons';
import AsyncJobsList from '../../components/AsyncJobs/AsyncJobsList';
import { BanIcon, ServerIcon } from '../../components/icons';
import Callout from '../../components/widgets/Callout';

import { fetchBrokerStats, freezeBroker, unfreezeBroker } from '../../redux/modules/broker';
import { fetchAllJobs, ping, abort } from '../../redux/modules/asyncJobs';
import { brokerStatsSelector, brokerFreezeSelector, brokerUnfreezeSelector } from '../../redux/selectors/broker';
import { getAllAsyncJobs, getPingStatus } from '../../redux/selectors/asyncJobs';
import { isLoggedAsSuperAdmin, loggedInUserSelector } from '../../redux/selectors/users';

class Broker extends Component {
  static loadAsync = (params, dispatch) => Promise.all([dispatch(fetchBrokerStats()), dispatch(fetchAllJobs())]);

  componentDidMount() {
    this.props.loadAsync();
  }

  render() {
    const {
      asyncJobs,
      pingStatus,
      brokerStats,
      isSuperAdmin,
      refreshAsyncJobs,
      refreshBrokerStats,
      ping,
      abort,
      freezeBroker,
      unfreezeBroker,
      freezeActionStatus,
      unfreezeActionStatus,
      user,
    } = this.props;
    return (
      <Page
        resource={user}
        icon={<ServerIcon />}
        title={<FormattedMessage id="app.serverManagement.title" defaultMessage="Management of Backend Services" />}>
        {user => (
          <>
            <hr />
            {isSuperAdmin ? (
              <Row>
                <Col lg={6}>
                  <h4>
                    <FormattedMessage id="app.asyncJobs.title" defaultMessage="Core Background Jobs" />
                  </h4>
                  <AsyncJobsButtons refresh={refreshAsyncJobs} pingAction={ping} pingStatus={pingStatus} />
                  <ResourceRenderer resource={asyncJobs.toArray()} returnAsArray>
                    {asyncJobs => <AsyncJobsList asyncJobs={asyncJobs} abort={abort} />}
                  </ResourceRenderer>
                </Col>

                <Col lg={6}>
                  <h4>
                    <FormattedMessage id="app.broker.title" defaultMessage="ZeroMQ Broker" />
                  </h4>
                  <BrokerButtons
                    refreshBrokerStats={refreshBrokerStats}
                    freezeBroker={freezeBroker}
                    unfreezeBroker={unfreezeBroker}
                    freezeActionStatus={freezeActionStatus}
                    unfreezeActionStatus={unfreezeActionStatus}
                  />
                  <ResourceRenderer resource={brokerStats}>
                    {brokerStats => <StatsList stats={brokerStats} />}
                  </ResourceRenderer>
                </Col>
              </Row>
            ) : (
              <Row>
                <Col sm={12}>
                  <Callout variant="warning" className="larger" icon={<BanIcon />}>
                    <FormattedMessage
                      id="generic.accessDenied"
                      defaultMessage="You do not have permissions to see this page. If you got to this page via a seemingly legitimate link or button, please report a bug."
                    />
                  </Callout>
                </Col>
              </Row>
            )}
          </>
        )}
      </Page>
    );
  }
}

Broker.propTypes = {
  loadAsync: PropTypes.func.isRequired,
  brokerStats: ImmutablePropTypes.map,
  asyncJobs: ImmutablePropTypes.map,
  pingStatus: PropTypes.string,
  isSuperAdmin: PropTypes.bool.isRequired,
  user: ImmutablePropTypes.map,
  refreshAsyncJobs: PropTypes.func.isRequired,
  refreshBrokerStats: PropTypes.func.isRequired,
  ping: PropTypes.func.isRequired,
  abort: PropTypes.func.isRequired,
  freezeBroker: PropTypes.func.isRequired,
  unfreezeBroker: PropTypes.func.isRequired,
  freezeActionStatus: PropTypes.string,
  unfreezeActionStatus: PropTypes.string,
};

export default connect(
  state => ({
    brokerStats: brokerStatsSelector(state),
    asyncJobs: getAllAsyncJobs(state),
    pingStatus: getPingStatus(state),
    freezeActionStatus: brokerFreezeSelector(state),
    unfreezeActionStatus: brokerUnfreezeSelector(state),
    isSuperAdmin: isLoggedAsSuperAdmin(state),
    user: loggedInUserSelector(state),
  }),
  dispatch => ({
    loadAsync: () => Broker.loadAsync({}, dispatch),
    refreshBrokerStats: () => dispatch(fetchBrokerStats()),
    refreshAsyncJobs: () => dispatch(fetchAllJobs()),
    ping: () => dispatch(ping()),
    abort: id => dispatch(abort(id)),
    freezeBroker: () => dispatch(freezeBroker()).then(() => dispatch(fetchBrokerStats())),
    unfreezeBroker: () => dispatch(unfreezeBroker()).then(() => dispatch(fetchBrokerStats())),
  })
)(Broker);
