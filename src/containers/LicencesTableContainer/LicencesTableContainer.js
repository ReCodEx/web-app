import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import LicencesTable from '../../components/Instances/LicencesTable';

import { fetchInstanceLincences } from '../../redux/modules/licences';
import { getLicencesOfInstance } from '../../redux/selectors/licences';

class LicencesTableContainer extends Component {
  componentDidMount = () => this.props.loadAsync(this.props.instance.id);

  componentDidUpdate(prevProps) {
    if (this.props.instance.id !== prevProps.instance.id) {
      this.props.loadAsync(this.props.instance.id);
    }
  }

  render() {
    const { licences, instance } = this.props;
    return (
      <ResourceRenderer resource={licences}>
        {list => <LicencesTable licences={list} instance={instance} />}
      </ResourceRenderer>
    );
  }
}

LicencesTableContainer.propTypes = {
  instance: PropTypes.object.isRequired,
  licences: ImmutablePropTypes.map,
  loadAsync: PropTypes.func.isRequired,
};

export default connect(
  (state, { instance }) => ({
    licences: getLicencesOfInstance(instance.id)(state),
  }),
  dispatch => ({
    loadAsync: instanceId => dispatch(fetchInstanceLincences(instanceId)),
  })
)(LicencesTableContainer);
