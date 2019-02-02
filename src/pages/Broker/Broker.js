import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { Row, Col } from 'react-bootstrap';
import Page from '../../components/layout/Page';
import { fetchBrokerStats } from '../../redux/modules/brokerStats';
import { brokerStatsSelector } from '../../redux/selectors/brokerStats';
import { FormattedMessage } from 'react-intl';
import BrokerButtons from '../../components/Broker/BrokerButtons/BrokerButtons';
import StatsList from '../../components/Broker/StatsList/StatsList';

class Broker extends Component {
  static loadAsync = (params, dispatch) =>
    Promise.all([dispatch(fetchBrokerStats())]);

  componentWillMount = () => this.props.loadAsync();

  render() {
    const { stats, refreshBrokerStats } = this.props;
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
        }
        resource={stats}
      >
        {stats =>
          <div>
            <BrokerButtons refreshBrokerStats={refreshBrokerStats} />
            <Row>
              <Col lg={6}>
                <StatsList stats={stats} />
              </Col>
            </Row>
          </div>}
      </Page>
    );
  }
}

Broker.propTypes = {
  loadAsync: PropTypes.func.isRequired,
  stats: ImmutablePropTypes.map,
  refreshBrokerStats: PropTypes.func
};

export default connect(
  state => ({
    stats: brokerStatsSelector(state)
  }),
  dispatch => ({
    loadAsync: () => Broker.loadAsync({}, dispatch),
    refreshBrokerStats: () => Promise.all([dispatch(fetchBrokerStats())])
  })
)(Broker);
