import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import LicensesTable from '../../components/Instances/LicensesTable';

import { fetchInstanceLincences } from '../../redux/modules/licences.js';
import { getLicencesOfInstance } from '../../redux/selectors/licences.js';

class LicensesTableContainer extends Component {
  componentDidMount() {
    this.props.loadAsync(this.props.instance.id);
  }

  componentDidUpdate(prevProps) {
    if (this.props.instance.id !== prevProps.instance.id) {
      this.props.loadAsync(this.props.instance.id);
    }
  }

  render() {
    const { licenses, instance } = this.props;
    return (
      <ResourceRenderer resource={licenses}>
        {list => <LicensesTable licenses={list} instance={instance} />}
      </ResourceRenderer>
    );
  }
}

LicensesTableContainer.propTypes = {
  instance: PropTypes.object.isRequired,
  licenses: ImmutablePropTypes.map,
  loadAsync: PropTypes.func.isRequired,
};

export default connect(
  (state, { instance }) => ({
    licenses: getLicencesOfInstance(instance.id)(state),
  }),
  dispatch => ({
    loadAsync: instanceId => dispatch(fetchInstanceLincences(instanceId)),
  })
)(LicensesTableContainer);
