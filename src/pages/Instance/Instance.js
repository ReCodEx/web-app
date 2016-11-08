import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { List } from 'immutable';
import { Row, Col } from 'react-bootstrap';

import PageContent from '../../components/PageContent';
import ResourceRenderer from '../../components/ResourceRenderer';
import InstanceDetail, { LoadingInstanceDetail, FailedInstanceDetail } from '../../components/Instances/InstanceDetail';
import CreateGroupForm from '../../components/Forms/CreateGroupForm';

import { isReady } from '../../redux/helpers/resourceManager';
import { fetchInstanceIfNeeded } from '../../redux/modules/instances';
import { instanceSelector } from '../../redux/selectors/instances';
import { createGroup, fetchInstanceGroupsIfNeeded } from '../../redux/modules/groups';
import { groupsSelectors } from '../../redux/selectors/groups';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { isStudentOf, isSupervisorOf, isAdminOf, isMemberOf } from '../../redux/selectors/users';
import { fetchAssignmentsForInstance } from '../../redux/modules/assignments';

class Instance extends Component {

  componentWillMount() {
    this.props.loadAsync();
  }

  componentWillReceiveProps(newProps) {
    if (this.props.params.instanceId !== newProps.params.instanceId) {
      newProps.loadAsync();
    }
  }

  getTitle = (instance) =>
    isReady(instance)
      ? instance.getIn(['data', 'name'])
      : <FormattedMessage id='app.instance.loading' defaultMessage="Loading instance's detail ..." />;

  render() {
    const {
      params: { instanceId },
      instance,
      groups,
      createGroup,
      isMemberOf
    } = this.props;

    return (
      <PageContent
        title={this.getTitle(instance)}
        description={<FormattedMessage id='app.instance.description' defaultMessage='Instance overview' />}
        breadcrumbs={[
          {
            text: <FormattedMessage id='app.instance.description' defaultMessage="Instance overview" />,
            iconName: 'info-circle'
          }
        ]}>
        <ResourceRenderer resource={instance}>
          {data => (
            <Row>
              <Col sm={6}>
                <InstanceDetail {...data} groups={groups} isMemberOf={isMemberOf} />
              </Col>

              <Col sm={6}>
                <CreateGroupForm
                  onSubmit={createGroup}
                  instanceId={instanceId} />
              </Col>
            </Row>
          )}
        </ResourceRenderer>
      </PageContent>
    );
  }

}

Instance.propTypes = {
  loadAsync: PropTypes.func.isRequired
};

export default connect(
  (state, { params: { instanceId } }) => {
    const userId = loggedInUserIdSelector(state);
    return {
      instance: instanceSelector(state, instanceId),
      groups: groupsSelectors(state),
      isStudentOf: (groupId) => isStudentOf(userId, groupId)(state),
      isAdminOf: (groupId) => isAdminOf(userId, groupId)(state),
      isSupervisorOf: (groupId) => isSupervisorOf(groupId)(state),
      isMemberOf: (groupId) => isMemberOf(userId, groupId)(state)
    };
  },
  (dispatch, { params: { instanceId } }) => ({
    createGroup: ({ name, description }) =>
      dispatch(createGroup({ instanceId, name, description })),
    loadAsync: () => Promise.all([
      dispatch(fetchInstanceIfNeeded(instanceId)),
      dispatch(fetchInstanceGroupsIfNeeded(instanceId))
    ])
  })
)(Instance);
