import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { reset } from 'redux-form';

import Page from '../../components/Page';
import EditInstanceForm from '../../components/Forms/EditInstanceForm';

import {
  fetchInstanceIfNeeded,
  editInstance
} from '../../redux/modules/instances';
import { instanceSelector } from '../../redux/selectors/instances';

import withLinks from '../../hoc/withLinks';

class EditInstance extends Component {
  static loadAsync = ({ instanceId }, dispatch) =>
    Promise.all([dispatch(fetchInstanceIfNeeded(instanceId))]);

  componentWillMount = () => this.props.loadAsync();
  componentWillReceiveProps = props => {
    if (this.props.params.instanceId !== props.params.instanceId) {
      props.reset();
      props.loadAsync();
    }
  };

  getInitialValues = ({ threshold, ...instance }) => ({
    ...instance,
    threshold: threshold * 100
  });

  render() {
    const {
      params: { instanceId },
      links: { INSTANCE_URI_FACTORY },
      instance,
      editInstance
    } = this.props;

    return (
      <Page
        resource={instance}
        title={instance => instance.name}
        description={
          <FormattedMessage
            id="app.editInstance.description"
            defaultMessage="Change instance settings"
          />
        }
        breadcrumbs={[
          {
            text: (
              <FormattedMessage
                id="app.instance.title"
                defaultMessage="Instance"
              />
            ),
            iconName: 'university',
            link: INSTANCE_URI_FACTORY(instanceId)
          },
          {
            text: (
              <FormattedMessage
                id="app.editInstance.title"
                defaultMessage="Edit instance"
              />
            ),
            iconName: 'pencil'
          }
        ]}
      >
        {instance => (
          <EditInstanceForm
            initialValues={this.getInitialValues(instance)}
            onSubmit={editInstance}
          />
        )}
      </Page>
    );
  }
}

EditInstance.propTypes = {
  links: PropTypes.object.isRequired,
  loadAsync: PropTypes.func.isRequired,
  params: PropTypes.shape({
    instanceId: PropTypes.string.isRequired
  }).isRequired,
  instance: ImmutablePropTypes.map,
  editInstance: PropTypes.func.isRequired
};

export default withLinks(
  connect(
    (state, { params: { instanceId } }) => ({
      instance: instanceSelector(state, instanceId)
    }),
    (dispatch, { params: { instanceId } }) => ({
      push: url => dispatch(push(url)),
      reset: () => dispatch(reset('editInstance')),
      loadAsync: () => EditInstance.loadAsync({ instanceId }, dispatch),
      editInstance: data => dispatch(editInstance(instanceId, data))
    })
  )(EditInstance)
);
