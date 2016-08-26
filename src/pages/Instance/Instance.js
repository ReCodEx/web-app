import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { List } from 'immutable';

import PageContent from '../../components/PageContent';
import InstanceDetail, { LoadingInstanceDetail, FailedInstanceDetail } from '../../components/Instances/InstanceDetail';

import { isReady, isLoading, hasFailed } from '../../redux/helpers/resourceManager';
import { fetchInstanceIfNeeded } from '../../redux/modules/instances';
import { instanceSelector } from '../../redux/selectors/instances';
import { fetchInstanceGroupsIfNeeded } from '../../redux/modules/groups';
import { groupsSelectors } from '../../redux/selectors/groups';
import { isStudentOf, isSupervisorOf } from '../../redux/selectors/users';
import { fetchAssignmentsForInstance } from '../../redux/modules/assignments';

class Instance extends Component {

  componentWillMount() {
    this.loadData(this.props);
  }

  componentWillReceiveProps(newProps) {
    if (this.props.params.instanceId !== newProps.params.instanceId) {
      this.loadData(newProps);
    }
  }

  loadData = ({
    params: { instanceId },
    loadInstanceIfNeeded,
    loadInstanceGroupsIfNeeded
  }) => {
    loadInstanceIfNeeded(instanceId);
    loadInstanceGroupsIfNeeded(instanceId);
  };

  getTitle = (instance) =>
    isReady(instance)
      ? instance.getIn(['data', 'name'])
      : <FormattedMessage id='app.instance.loading' defaultMessage="Loading instance's detail ..." />;

  render() {
    const {
      instance,
      groups,
      isMemberOf
    } = this.props;

    return (
      <PageContent
        title={this.getTitle(instance)}
        description={<FormattedMessage id='app.instance.description' defaultMessage='Instance overview' />}>
        <div>
          {isLoading(instance) && <LoadingInstanceDetail />}
          {hasFailed(instance) && <FailedInstanceDetail />}
          {isReady(instance) &&
            <InstanceDetail {...instance.get('data').toJS()} groups={groups} isMemberOf={isMemberOf} />}
        </div>
      </PageContent>
    );
  }

}

export default connect(
  (state, { params: { instanceId } }) => ({
    instance: instanceSelector(state, instanceId),
    groups: groupsSelectors(state),
    isStudentOf: (groupId) => isStudentOf(groupId)(state),
    isSupervisorOf: (groupId) => isSupervisorOf(groupId)(state),
    isMemberOf: (groupId) => isStudentOf(groupId)(state) || isSupervisorOf(groupId)(state)
  }),
  (dispatch) => ({
    loadInstanceIfNeeded: (instanceId) => dispatch(fetchInstanceIfNeeded(instanceId)),
    loadInstanceGroupsIfNeeded: (instanceId) => dispatch(fetchInstanceGroupsIfNeeded(instanceId))
  })
)(Instance);
