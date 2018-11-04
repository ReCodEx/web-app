import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { formValueSelector } from 'redux-form';
import { FormattedMessage, injectIntl } from 'react-intl';
import { List } from 'immutable';
import { Row, Col } from 'react-bootstrap';

import {
  createGroup,
  fetchGroupIfNeeded,
  fetchAllGroups
} from '../../redux/modules/groups';
import { fetchSupervisors, fetchUser } from '../../redux/modules/users';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import {
  isSupervisorOf,
  isAdminOf,
  isLoggedAsSuperAdmin,
  supervisorsOfGroupSelector,
  isStudentOf
} from '../../redux/selectors/users';
import { groupSelector, groupsSelector } from '../../redux/selectors/groups';

import Page from '../../components/layout/Page';
import GroupInfoTable, {
  LoadingGroupDetail,
  FailedGroupDetail
} from '../../components/Groups/GroupDetail';
import HierarchyLine from '../../components/Groups/HierarchyLine';
import SupervisorsList from '../../components/Users/SupervisorsList';
import {
  getLocalizedName,
  transformLocalizedTextsFormData
} from '../../helpers/localizedData';
import { isReady } from '../../redux/helpers/resourceManager/index';
import Box from '../../components/widgets/Box';
import GroupTree from '../../components/Groups/GroupTree/GroupTree';
import EditGroupForm, {
  EDIT_GROUP_FORM_EMPTY_INITIAL_VALUES
} from '../../components/forms/EditGroupForm';
import AddSupervisor from '../../components/Groups/AddSupervisor';
import GroupTopButtons from '../../components/Groups/GroupTopButtons/GroupTopButtons';
import { BanIcon } from '../../components/icons';
import { hasPermissions } from '../../helpers/common';
import GroupArchivedWarning from '../../components/Groups/GroupArchivedWarning/GroupArchivedWarning';

class GroupInfo extends Component {
  static loadAsync = ({ groupId }, dispatch) =>
    dispatch(fetchGroupIfNeeded(groupId))
      .then(res => res.value)
      .then(group =>
        Promise.all([
          dispatch(fetchSupervisors(groupId)),
          group.archived ? dispatch(fetchAllGroups({ archived: true })) : null
        ])
      );

  componentWillMount() {
    const { loadAsync } = this.props;
    loadAsync();
  }

  componentWillReceiveProps(newProps) {
    const { params: { groupId } } = this.props;

    if (groupId !== newProps.params.groupId) {
      newProps.loadAsync();
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
      hasThreshold,
      intl: { locale }
    } = this.props;

    return (
      <Page
        resource={group}
        title={group => getLocalizedName(group, locale)}
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
              canLeaveJoin={
                !isAdmin && !isSupervisor && (data.public || isStudent)
              }
            />

            <GroupArchivedWarning
              archived={data.archived}
              directlyArchived={data.directlyArchived}
            />

            {!hasPermissions(data, 'viewDetail') &&
              <Row>
                <Col sm={12}>
                  <p className="callout callout-warning larger">
                    <BanIcon gapRight />
                    <FormattedMessage
                      id="generic.accessDenied"
                      defaultMessage="You do not have permissions to see this page. If you got to this page via a seemingly legitimate link or button, please report a bug."
                    />
                  </p>
                </Col>
              </Row>}

            <Row>
              <Col sm={6}>
                {hasPermissions(data, 'viewDetail') &&
                  <GroupInfoTable
                    group={data}
                    supervisors={supervisors}
                    isAdmin={isAdmin || isSuperAdmin}
                    groups={groups}
                    locale={locale}
                  />}

                {hasPermissions(data, 'viewSupervisors') &&
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
                        supervisors.length ===
                        data.privateData.supervisors.length
                      }
                    />
                  </Box>}

                {hasPermissions(data, 'setAdmin') &&
                  !data.archived &&
                  <Box
                    title={
                      <FormattedMessage
                        id="app.group.adminsView.addSupervisor"
                        defaultMessage="Add Supervisor"
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
                {hasPermissions(data, 'viewSubgroups') &&
                  <Box
                    title={
                      <FormattedMessage
                        id="app.groupDetail.subgroups"
                        defaultMessage="Subgroups Hierarchy"
                      />
                    }
                    unlimitedHeight
                    extraPadding
                  >
                    <GroupTree
                      id={data.id}
                      currentGroupId={data.id}
                      deletable={false}
                      isAdmin={isAdmin}
                      isPublic={data.public}
                      isOpen
                      groups={groups}
                      level={1}
                      ancestralPath={data.parentGroupsIds.slice(1)}
                    />
                  </Box>}

                {hasPermissions(data, 'addSubgroup') &&
                  !data.archived &&
                  <EditGroupForm
                    form="addSubgroup"
                    onSubmit={addSubgroup(data.privateData.instanceId, userId)}
                    initialValues={EDIT_GROUP_FORM_EMPTY_INITIAL_VALUES}
                    createNew
                    collapsable
                    isOpen={false}
                    hasThreshold={hasThreshold}
                    isSuperAdmin={isSuperAdmin}
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
  hasThreshold: PropTypes.bool,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired
};

const addSubgroupFormSelector = formValueSelector('addSubgroup');

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
    hasThreshold: addSubgroupFormSelector(state, 'hasThreshold')
  };
};

const mapDispatchToProps = (dispatch, { params }) => ({
  addSubgroup: (instanceId, userId) => ({ localizedTexts, ...data }) =>
    dispatch(
      createGroup({
        ...data,
        localizedTexts: transformLocalizedTextsFormData(localizedTexts),
        instanceId,
        parentGroupId: params.groupId
      })
    ).then(() =>
      Promise.all([dispatch(fetchAllGroups()), dispatch(fetchUser(userId))])
    ),
  loadAsync: () => GroupInfo.loadAsync(params, dispatch),
  push: url => dispatch(push(url)),
  refetchSupervisors: () => dispatch(fetchSupervisors(params.groupId))
});

export default connect(mapStateToProps, mapDispatchToProps)(
  injectIntl(GroupInfo)
);
