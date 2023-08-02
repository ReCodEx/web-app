import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { reset } from 'redux-form';

import Page from '../../components/layout/Page';
import EditInstanceForm from '../../components/forms/EditInstanceForm';

import { fetchInstanceIfNeeded, editInstance } from '../../redux/modules/instances';
import { instanceSelector } from '../../redux/selectors/instances';
import { EditIcon } from '../../components/icons';

class EditInstance extends Component {
  static loadAsync = ({ instanceId }, dispatch) => Promise.all([dispatch(fetchInstanceIfNeeded(instanceId))]);

  componentDidMount() {
    this.props.loadAsync();
  }

  componentDidUpdate(prevProps) {
    if (this.props.params.instanceId !== prevProps.params.instanceId) {
      this.props.reset();
      this.props.loadAsync();
    }
  }

  getInitialValues = ({ threshold, ...instance }) => ({
    ...instance,
    threshold: threshold * 100,
  });

  render() {
    const { instance, editInstance } = this.props;

    return (
      <Page resource={instance} icon={<EditIcon />} title={instance => instance.name}>
        {instance => <EditInstanceForm initialValues={this.getInitialValues(instance)} onSubmit={editInstance} />}
      </Page>
    );
  }
}

EditInstance.propTypes = {
  loadAsync: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  params: PropTypes.shape({
    instanceId: PropTypes.string.isRequired,
  }).isRequired,
  instance: ImmutablePropTypes.map,
  editInstance: PropTypes.func.isRequired,
};

export default connect(
  (state, { params: { instanceId } }) => ({
    instance: instanceSelector(state, instanceId),
  }),
  (dispatch, { params: { instanceId } }) => ({
    reset: () => dispatch(reset('editInstance')),
    loadAsync: () => EditInstance.loadAsync({ instanceId }, dispatch),
    editInstance: data => dispatch(editInstance(instanceId, data)),
  })
)(EditInstance);
