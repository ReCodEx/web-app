import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { getFormValues } from 'redux-form';
import { FormattedMessage, injectIntl } from 'react-intl';
import { List } from 'immutable';
import { Row, Col } from 'react-bootstrap';

import Page from '../../components/layout/Page';
import GroupInfoTable, {
  LoadingGroupDetail,
  FailedGroupDetail
} from '../../components/Groups/GroupDetail';
import HierarchyLine from '../../components/Groups/HierarchyLine';
import { LocalizedGroupName } from '../../components/helpers/LocalizedNames';
import SupervisorsList from '../../components/Users/SupervisorsList';
import { getLocalizedName } from '../../helpers/getLocalizedData';
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
  supervisorsOfGroupSelector,
  isStudentOf
} from '../../redux/selectors/users';
import { groupSelector, groupsSelector } from '../../redux/selectors/groups';
import { EMPTY_OBJ } from '../../helpers/common';
import GroupTopButtons from '../../components/Groups/GroupTopButtons/GroupTopButtons';

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
        iconName: 'users',
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
      isStudent,
      addSubgroup,
      formValues,
      intl: { locale }
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

            <GroupTopButtons
              group={data}
              userId={userId}
              canEdit={isAdmin || isSuperAdmin}
              canSeeDetail={
                isAdmin ||
                isSuperAdmin ||
                data.privateData.students.includes(userId)
              }
              canLeaveJoin={
                !isAdmin &&
                !isSupervisor &&
                (data.privateData.isPublic || isStudent)
              }
            />

            <Row>
              <Col sm={6}>
                <GroupInfoTable
                  group={data}
                  supervisors={supervisors}
                  isAdmin={isAdmin || isSuperAdmin}
                  groups={groups}
                  locale={locale}
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
                          locale
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

                {isAdmin &&
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
                  </Box>}
              </Col>
              <Col sm={6}>
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
                      currentGroupId={data.id}
                      deletable={false}
                      isAdmin={isAdmin}
                      isPublic={data.privateData.isPublic}
                      isOpen
                      groups={groups}
                      level={1}
                      ancestralPath={data.parentGroupsIds.slice(1)}
                    />
                  </Box>}

                {isAdmin &&
                  <EditGroupForm
                    form="addSubgroup"
                    onSubmit={addSubgroup}
                    initialValues={EMPTY_OBJ}
                    createNew
                    collapsable
                    isOpen={data.childGroups.all.length === 0}
                    formValues={formValues}
                  />}
              </Col>
            </Row>
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
  isStudent: PropTypes.bool,
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
    isStudent: isStudentOf(userId, groupId)(state),
    formValues: getFormValues('addSubgroup')(state)
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

export default connect(mapStateToProps, mapDispatchToProps)(
  injectIntl(GroupInfo)
);
