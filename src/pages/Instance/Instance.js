import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-bootstrap';

import PageContent from '../../components/PageContent';
import ResourceRenderer from '../../components/ResourceRenderer';
import InstanceDetail from '../../components/Instances/InstanceDetail';
import CreateGroupForm from '../../components/Forms/CreateGroupForm';

import { fetchInstanceIfNeeded } from '../../redux/modules/instances';
import { instanceSelector } from '../../redux/selectors/instances';
import { createGroup, fetchInstanceGroupsIfNeeded } from '../../redux/modules/groups';
import { groupsSelectors } from '../../redux/selectors/groups';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { isStudentOf, isSupervisorOf, isAdminOf, isMemberOf } from '../../redux/selectors/users';

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
      isMemberOf
    } = this.props;

    return (
      <PageContent
        title={(
          <ResourceRenderer resource={instance}>
            {instance => <span>{instance.name}</span>}
          </ResourceRenderer>
        )}
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
  loadAsync: PropTypes.func.isRequired,
  params: PropTypes.shape({
    instanceId: PropTypes.string.isRequired
  }).isRequired,
  instance: ImmutablePropTypes.map,
  groups: ImmutablePropTypes.list,
  createGroup: PropTypes.func.isRequired,
  isMemberOf: PropTypes.func.isRequired
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
    loadAsync: () => Instance.loadAsync({ instanceId }, dispatch)
  })
)(Instance);
