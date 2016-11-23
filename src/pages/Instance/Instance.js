import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-bootstrap';

import Page from '../../components/Page';
import InstanceDetail from '../../components/Instances/InstanceDetail';
import CreateGroupForm from '../../components/Forms/CreateGroupForm';

import { fetchInstanceIfNeeded } from '../../redux/modules/instances';
import { instanceSelector, isAdminOfInstance } from '../../redux/selectors/instances';
import { createGroup, fetchInstanceGroupsIfNeeded } from '../../redux/modules/groups';
import { groupsSelectors } from '../../redux/selectors/groups';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';

class Instance extends Component {

  static loadAsync = ({ instanceId }, dispatch) => Promise.all([
    dispatch(fetchInstanceIfNeeded(instanceId)),
    dispatch(fetchInstanceGroupsIfNeeded(instanceId))
  ]);

  componentWillMount() {
    this.props.loadAsync();
  }

  componentWillReceiveProps(newProps) {
    if (this.props.params.instanceId !== newProps.params.instanceId) {
      newProps.loadAsync();
    }
  }

  render() {
    const {
      params: { instanceId },
      instance,
      groups,
      createGroup,
      isAdmin
    } = this.props;

    return (
      <Page
        resource={instance}
        title={instance => instance.name}
        description={<FormattedMessage id='app.instance.description' defaultMessage='Instance overview' />}
        breadcrumbs={[
          {
            text: <FormattedMessage id='app.instance.description' defaultMessage="Instance overview" />,
            iconName: 'info-circle'
          }
        ]}>
        {data => (
          <div>
            <Row>
              <Col sm={12}>
                <InstanceDetail {...data} groups={groups} isAdmin={isAdmin} />
              </Col>
            </Row>

            {isAdmin && (
              <Row>
                <Col sm={6}>
                  <CreateGroupForm
                    onSubmit={createGroup}
                    instanceId={instanceId} />
                </Col>
              </Row>
            )}
          </div>
        )}
      </Page>
    );
  }

}

Instance.propTypes = {
  loadAsync: PropTypes.func.isRequired,
  params: PropTypes.shape({
    instanceId: PropTypes.string.isRequired
  }).isRequired,
  instance: ImmutablePropTypes.map,
  groups: ImmutablePropTypes.map,
  createGroup: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool.isRequired
};

export default connect(
  (state, { params: { instanceId } }) => {
    const userId = loggedInUserIdSelector(state);
    return {
      instance: instanceSelector(state, instanceId),
      groups: groupsSelectors(state),
      isAdmin: isAdminOfInstance(userId, instanceId)(state)
    };
  },
  (dispatch, { params: { instanceId } }) => ({
    createGroup: (data) =>
      dispatch(createGroup({ instanceId, ...data })),
    loadAsync: () => Instance.loadAsync({ instanceId }, dispatch)
  })
)(Instance);
