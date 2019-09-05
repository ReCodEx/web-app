import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { reset } from 'redux-form';

import Page from '../../components/layout/Page';
import EditInstanceForm from '../../components/forms/EditInstanceForm';

import { fetchInstanceIfNeeded, editInstance } from '../../redux/modules/instances';
import { instanceSelector } from '../../redux/selectors/instances';

import withLinks from '../../helpers/withLinks';

class EditInstance extends Component {
  static loadAsync = ({ instanceId }, dispatch) => Promise.all([dispatch(fetchInstanceIfNeeded(instanceId))]);

  componentDidMount = () => this.props.loadAsync();

  componentDidUpdate(prevProps) {
    if (this.props.match.params.instanceId !== prevProps.match.params.instanceId) {
      this.props.reset();
      this.props.loadAsync();
    }
  }

  getInitialValues = ({ threshold, ...instance }) => ({
    ...instance,
    threshold: threshold * 100,
  });

  render() {
    const {
      match: {
        params: { instanceId },
      },
      links: { INSTANCE_URI_FACTORY },
      instance,
      editInstance,
    } = this.props;

    return (
      <Page
        resource={instance}
        title={instance => instance.name}
        description={<FormattedMessage id="app.editInstance.description" defaultMessage="Change instance settings" />}
        breadcrumbs={[
          {
            text: <FormattedMessage id="app.instance.title" defaultMessage="Instance" />,
            iconName: 'university',
            link: INSTANCE_URI_FACTORY(instanceId),
          },
          {
            text: <FormattedMessage id="app.editInstance.title" defaultMessage="Edit instance" />,
            iconName: ['far', 'edit'],
          },
        ]}>
        {instance => <EditInstanceForm initialValues={this.getInitialValues(instance)} onSubmit={editInstance} />}
      </Page>
    );
  }
}

EditInstance.propTypes = {
  links: PropTypes.object.isRequired,
  loadAsync: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      instanceId: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  instance: ImmutablePropTypes.map,
  editInstance: PropTypes.func.isRequired,
};

export default withLinks(
  connect(
    (
      state,
      {
        match: {
          params: { instanceId },
        },
      }
    ) => ({
      instance: instanceSelector(state, instanceId),
    }),
    (
      dispatch,
      {
        match: {
          params: { instanceId },
        },
      }
    ) => ({
      reset: () => dispatch(reset('editInstance')),
      loadAsync: () => EditInstance.loadAsync({ instanceId }, dispatch),
      editInstance: data => dispatch(editInstance(instanceId, data)),
    })
  )(EditInstance)
);
