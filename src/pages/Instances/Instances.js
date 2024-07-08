import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { fetchInstances } from '../../redux/modules/instances.js';
import { instancesSelector } from '../../redux/selectors/instances.js';

import InstancesManagement from '../../components/Instances/InstancesManagement';

class Instances extends Component {
  static loadAsync = (params, dispatch) => Promise.all([dispatch(fetchInstances())]);

  componentDidMount() {
    this.props.loadAsync();
  }

  render() {
    const { instances } = this.props;
    return <InstancesManagement instances={instances} />;
  }
}

Instances.propTypes = {
  loadAsync: PropTypes.func.isRequired,
  instances: ImmutablePropTypes.map,
};

export default connect(
  state => ({
    instances: instancesSelector(state),
  }),
  dispatch => ({
    loadAsync: () => Instances.loadAsync({}, dispatch),
  })
)(Instances);
