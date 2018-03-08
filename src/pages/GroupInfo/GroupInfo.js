import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { getFormValues } from 'redux-form';
import { LinkContainer } from 'react-router-bootstrap';
import Button from '../../components/widgets/FlatButton';
import { FormattedMessage, injectIntl } from 'react-intl';
import { List } from 'immutable';
import { Row, Col } from 'react-bootstrap';

import Page from '../../components/layout/Page';
import GroupDetail, {
  LoadingGroupDetail,
  FailedGroupDetail
} from '../../components/Groups/GroupDetail';
import LeaveJoinGroupButtonContainer from '../../containers/LeaveJoinGroupButtonContainer';
import HierarchyLine from '../../components/Groups/HierarchyLine';
import { EditIcon } from '../../components/icons';
import { LocalizedGroupName } from '../../components/helpers/LocalizedNames';
import SupervisorsList from '../../components/Users/SupervisorsList';
import { getLocalizedName } from '../../helpers/getLocalizedData';
import withLinks from '../../helpers/withLinks';
import { isReady } from '../../redux/helpers/resourceManager/index';
import Box from '../../components/widgets/Box';
import GroupTree from '../../components/Groups/GroupTree/GroupTree';
import EditGroupForm from '../../components/forms/EditGroupForm';
import AddSupervisor from '../../components/Groups/AddSupervisor';

import {
  createGroup,
  fetchGroupIfNeeded,
  fetchInstanceGroups,
  fetchSubgroups
} from '../../redux/modules/groups';
import { fetchSupervisors } from '../../redux/modules/users';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import {
  isSupervisorOf,
  isAdminOf,
  isLoggedAsSuperAdmin,
  supervisorsOfGroupSelector
} from '../../redux/selectors/users';
import { groupSelector, groupsSelector } from '../../redux/selectors/groups';
import { EMPTY_OBJ } from '../../helpers/common';

class GroupInfo extends Component {
  static loadAsync = ({ groupId }, dispatch, userId, isSuperAdmin) =>
    Promise.all([
      dispatch(fetchGroupIfNeeded(groupId))
        .then(res => res.value)
        .then(group =>
          Promise.all([
            dispatch(fetchSupervisors(groupId)),
            dispatch(fetchInstanceGroups(group.privateData.instanceId))
          ])
        ),
      dispatch(fetchSubgroups(groupId))
    ]);

  componentWillMount() {
    const { loadAsync, userId, isSuperAdmin } = this.props;
    loadAsync(userId, isSuperAdmin);
  }

  componentWillReceiveProps(newProps) {
    const { params: { groupId }, userId, isSuperAdmin } = this.props;

    if (
      groupId !== newProps.params.groupId ||
      userId !== newProps.userId ||
      isSuperAdmin !== newProps.isSuperAdmin
    ) {
      newProps.loadAsync(newProps.userId, newProps.isSuperAdmin);
      return;
    }

    if (isReady(this.props.group) && isReady(newProps.group)) {
      const thisData = this.props.group.toJS().data.privateData;
      const newData = newProps.group.toJS().data.privateData;
      if (thisData.supervisors.length !== newData.supervisors.length) {
        newProps.refetchSupervisors();
      }
    }
  }

  getBreadcrumbs = () => {
    const { group, intl: { locale } } = this.props;
    const breadcrumbs = [
      {
        resource: group,
        iconName: 'university',
        breadcrumb: data => ({
          link: ({ INSTANCE_URI_FACTORY }) =>
            INSTANCE_URI_FACTORY(data.privateData.instanceId),
          text: 'Instance'
        })
      },
      {
        resource: group,
        iconName: 'group',
        breadcrumb: data => ({
          text: getLocalizedName(data, locale)
        })
      }
    ];
    return breadcrumbs;
  };

  render() {
    const {
      group,
      userId,
      groups,
      supervisors = List(),
      isAdmin,
      isSuperAdmin,
      isSupervisor,
      addSubgroup,
      formValues,
      links: { GROUP_EDIT_URI_FACTORY }
    } = this.props;

    return (
      <Page
        resource={group}
        title={group => <LocalizedGroupName entity={group} />}
        description={
          <FormattedMessage
            id="app.group.description"
            defaultMessage="Group overview and assignments"
          />
        }
        breadcrumbs={this.getBreadcrumbs()}
        loading={<LoadingGroupDetail />}
        failed={<FailedGroupDetail />}
      >
        {data =>
          <div>
            <HierarchyLine
              groupId={data.id}
              parentGroupsIds={data.parentGroupsIds}
            />
            <p />
            {(isAdmin || isSuperAdmin) &&
              <p>
                <LinkContainer to={GROUP_EDIT_URI_FACTORY(data.id)}>
                  <Button bsStyle="warning">
                    <EditIcon />{' '}
                    <FormattedMessage
                      id="app.group.edit"
                      defaultMessage="Edit group settings"
                    />
                  </Button>
                </LinkContainer>
              </p>}

            <Row>
              <Col xs={6}>
                {data.childGroups.all.length > 0 &&
                  <Box
                    title={
                      <FormattedMessage
                        id="app.groupDetail.subgroups"
                        defaultMessage="Subgroups hierarchy"
                      />
                    }
                    unlimitedHeight
                  >
                    <GroupTree
                      id={data.id}
                      deletable={false}
                      isAdmin={isAdmin}
                      isPublic={data.privateData.isPublic}
                      isOpen
                      groups={groups}
                      level={1}
                    />
                  </Box>}

                <EditGroupForm
                  onSubmit={addSubgroup}
                  initialValues={EMPTY_OBJ}
                  createNew
                  collapsable
                  isOpen={false}
                  formValues={formValues}
                />
              </Col>
              <Col xs={6}>
                <GroupDetail
                  group={data}
                  supervisors={supervisors}
                  isAdmin={isAdmin || isSuperAdmin}
                  groups={groups}
                />
                <Box
                  noPadding
                  collapsable
                  unlimitedHeight
                  title={
                    <FormattedMessage
                      id="app.groupDetail.supervisors"
                      defaultMessage="Supervisors of {groupName}"
                      values={{
                        groupName: getLocalizedName(
                          {
                            name: data.name,
                            localizedTexts: data.localizedTexts
                          },
                          'en' //locale
                        )
                      }}
                    />
                  }
                >
                  <SupervisorsList
                    groupId={data.id}
                    users={supervisors}
                    isAdmin={isAdmin}
                    primaryAdminsIds={data.primaryAdminsIds}
                    isLoaded={
                      supervisors.length === data.privateData.supervisors.length
                    }
                  />
                </Box>
                <Box
                  title={
                    <FormattedMessage
                      id="app.group.adminsView.addSupervisor"
                      defaultMessage="Add supervisor"
                    />
                  }
                >
                  <AddSupervisor
                    instanceId={data.privateData.instanceId}
                    groupId={data.id}
                  />
                </Box>
              </Col>
            </Row>

            {!isAdmin &&
              !isSupervisor &&
              data.isPublic &&
              <p className="text-center">
                <LeaveJoinGroupButtonContainer
                  userId={userId}
                  groupId={data.id}
                />
              </p>}
          </div>}
      </Page>
    );
  }
}

GroupInfo.propTypes = {
  params: PropTypes.shape({ groupId: PropTypes.string.isRequired }).isRequired,
  userId: PropTypes.string.isRequired,
  group: ImmutablePropTypes.map,
  instance: ImmutablePropTypes.map,
  supervisors: PropTypes.array,
  groups: ImmutablePropTypes.map,
  isAdmin: PropTypes.bool,
  isSupervisor: PropTypes.bool,
  isSuperAdmin: PropTypes.bool,
  addSubgroup: PropTypes.func,
  loadAsync: PropTypes.func,
  push: PropTypes.func.isRequired,
  refetchSupervisors: PropTypes.func.isRequired,
  links: PropTypes.object,
  formValues: PropTypes.object,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired
};

const mapStateToProps = (state, { params: { groupId } }) => {
  const userId = loggedInUserIdSelector(state);

  return {
    group: groupSelector(groupId)(state),
    userId,
    groups: groupsSelector(state),
    supervisors: supervisorsOfGroupSelector(state, groupId),
    isSupervisor: isSupervisorOf(userId, groupId)(state),
    isAdmin: isAdminOf(userId, groupId)(state),
    isSuperAdmin: isLoggedAsSuperAdmin(state),
    formValues: getFormValues('editGroup')(state)
  };
};

const mapDispatchToProps = (dispatch, { params }) => ({
  addSubgroup: instanceId => data =>
    dispatch(
      createGroup({
        ...data,
        instanceId,
        parentGroupId: params.groupId
      })
    ),
  loadAsync: (userId, isSuperAdmin) =>
    GroupInfo.loadAsync(params, dispatch, userId, isSuperAdmin),
  push: url => dispatch(push(url)),
  refetchSupervisors: () => dispatch(fetchSupervisors(params.groupId))
});

export default withLinks(
  connect(mapStateToProps, mapDispatchToProps)(injectIntl(GroupInfo))
);
