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
import { instanceSelector, isAdminOfInstance } from '../../redux/selectors/instances';
import { createGroup, fetchInstanceGroupsIfNeeded } from '../../redux/modules/groups';
import { groupsSelectors } from '../../redux/selectors/groups';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { isMemberOf } from '../../redux/selectors/users';

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
      isMemberOf,
      isAdmin
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
            <div>
              <Row>
                <Col sm={12}>
                  <InstanceDetail {...data} groups={groups} isMemberOf={isMemberOf} />
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
  groups: ImmutablePropTypes.map,
  createGroup: PropTypes.func.isRequired,
  isMemberOf: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool.isRequired
};

export default connect(
  (state, { params: { instanceId } }) => {
    const userId = loggedInUserIdSelector(state);
    return {
      instance: instanceSelector(state, instanceId),
      groups: groupsSelectors(state),
      isMemberOf: (groupId) => isMemberOf(userId, groupId)(state),
      isAdmin: isAdminOfInstance(userId, instanceId)(state)
    };
  },
  (dispatch, { params: { instanceId } }) => ({
    createGroup: ({ name, description }) =>
      dispatch(createGroup({ instanceId, name, description })),
    loadAsync: () => Instance.loadAsync({ instanceId }, dispatch)
  })
)(Instance);
