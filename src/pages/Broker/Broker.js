import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { fetchBrokerStats } from '../../redux/modules/brokerStats';
import { brokerStatsSelector } from '../../redux/selectors/brokerStats';

class Broker extends Component {
  static loadAsync = (params, dispatch) =>
    Promise.all([dispatch(fetchBrokerStats())]);

  componentWillMount = () => this.props.loadAsync();

  render() {
    const { stats } = this.props;
    return <div>To be implemented</div>;
  }
}

Broker.propTypes = {
  loadAsync: PropTypes.func.isRequired,
  stats: ImmutablePropTypes.array
};

export default connect(
  state => ({
    stats: brokerStatsSelector(state)
  }),
  dispatch => ({
    loadAsync: () => Broker.loadAsync({}, dispatch)
  })
)(Broker);
