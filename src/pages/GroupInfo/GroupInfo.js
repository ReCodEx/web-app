import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { formValueSelector } from 'redux-form';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Row, Col } from 'react-bootstrap';

import {
  createGroup,
  fetchGroupIfNeeded,
  fetchAllGroups,
  addAdmin,
  addSupervisor,
  addObserver,
  removeMember,
} from '../../redux/modules/groups';
import { fetchByIds, fetchUser } from '../../redux/modules/users';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { isLoggedAsSuperAdmin } from '../../redux/selectors/users';
import { groupSelector, groupsSelector } from '../../redux/selectors/groups';
import {
  primaryAdminsOfGroupSelector,
  supervisorsOfGroupSelector,
  observersOfGroupSelector,
  studentsIdsOfGroup,
  loggedUserIsStudentOfSelector,
  loggedUserIsSupervisorOfSelector,
  loggedUserIsAdminOfSelector,
  pendingMembershipsSelector,
} from '../../redux/selectors/usersGroups';

import Page from '../../components/layout/Page';
import { GroupNavigation } from '../../components/layout/Navigation';
import GroupInfoTable, { LoadingGroupDetail, FailedGroupDetail } from '../../components/Groups/GroupDetail';
import SupervisorsList from '../../components/Users/SupervisorsList';
import LeaveJoinGroupButtonContainer from '../../containers/LeaveJoinGroupButtonContainer';
import { getLocalizedName, transformLocalizedTextsFormData } from '../../helpers/localizedData';
import { isReady } from '../../redux/helpers/resourceManager/index';
import Box from '../../components/widgets/Box';
import Callout from '../../components/widgets/Callout';
import GroupTree from '../../components/Groups/GroupTree/GroupTree';
import EditGroupForm, { EDIT_GROUP_FORM_EMPTY_INITIAL_VALUES } from '../../components/forms/EditGroupForm';
import AddSupervisor from '../../components/Groups/AddSupervisor';
import { BanIcon } from '../../components/icons';
import { hasPermissions, safeGet } from '../../helpers/common';
import GroupArchivedWarning from '../../components/Groups/GroupArchivedWarning/GroupArchivedWarning';

class GroupInfo extends Component {
  static loadAsync = ({ groupId }, dispatch) =>
    dispatch(fetchGroupIfNeeded(groupId))
      .then(res => res.value)
      .then(group =>
        Promise.all([
          dispatch(fetchByIds(safeGet(group, ['primaryAdminsIds'], []))),
          dispatch(fetchByIds(safeGet(group, ['privateData', 'supervisors'], []))),
          dispatch(fetchByIds(safeGet(group, ['privateData', 'observers'], []))),
          group.archived ? dispatch(fetchAllGroups({ archived: true })) : null,
        ])
      );

  componentDidMount = () => this.props.loadAsync();

  componentDidUpdate(prevProps) {
    if (this.props.match.params.groupId !== prevProps.match.params.groupId) {
      this.props.loadAsync();
      return;
    }

    if (isReady(this.props.group) && isReady(prevProps.group)) {
      const newData = this.props.group.toJS().data.privateData;
      const prevData = prevProps.group.toJS().data.privateData;
      const groupJs = this.props.group.toJS();
      if (safeGet(prevData, ['primaryAdmins', 'length'], -1) !== safeGet(newData, ['primaryAdmins', 'length'], -1)) {
        this.props.refetchUsers(safeGet(groupJs, ['data', 'primaryAdminsIds'], []));
      }
      if (safeGet(prevData, ['supervisors', 'length'], -1) !== safeGet(newData, ['supervisors', 'length'], -1)) {
        this.props.refetchUsers(safeGet(groupJs, ['data', 'privateData', 'supervisors'], []));
      }
      if (safeGet(prevData, ['observers', 'length'], -1) !== safeGet(newData, ['observers', 'length'], -1)) {
        this.props.refetchUsers(safeGet(groupJs, ['data', 'privateData', 'observers'], []));
      }
    }
  }

  getBreadcrumbs = () => {
    const {
      group,
      intl: { locale },
    } = this.props;
    const breadcrumbs = [
      {
        resource: group,
        iconName: 'university',
        breadcrumb: data => ({
          link:
            data && data.privateData
              ? ({ INSTANCE_URI_FACTORY }) => INSTANCE_URI_FACTORY(data.privateData.instanceId)
              : undefined,
          text: 'Instance',
        }),
      },
      {
        resource: group,
        iconName: 'users',
        breadcrumb: data => ({
          text: getLocalizedName(data, locale),
        }),
      },
    ];
    return breadcrumbs;
  };

  render() {
    const {
      group,
      userId,
      groups,
      primaryAdmins = [],
      supervisors = [],
      observers = [],
      studentsIds = [],
      isAdmin,
      isSuperAdmin,
      isSupervisor,
      isStudent,
      addSubgroup,
      hasThreshold,
      pendingMemberships,
      addAdmin,
      addSupervisor,
      addObserver,
      removeMember,
      intl: { locale },
    } = this.props;

    const isAdminOrSuperadmin = isAdmin || isSuperAdmin;

    return (
      <Page
        resource={group}
        title={group => getLocalizedName(group, locale)}
        description={
          <FormattedMessage id="app.groupInfo.pageDescription" defaultMessage="Group details and metadata" />
        }
        breadcrumbs={this.getBreadcrumbs()}
        loading={<LoadingGroupDetail />}
        failed={<FailedGroupDetail />}>
        {data => (
          <div>
            <GroupNavigation
              groupId={data.id}
              canEdit={hasPermissions(data, 'update')}
              canViewDetail={hasPermissions(data, 'viewDetail')}
            />

            {!isAdmin &&
              !isSupervisor &&
              (data.public || (isStudent && !data.privateData.detaining)) &&
              !data.organizational && (
                <LeaveJoinGroupButtonContainer userId={userId} groupId={group.id} size={null} redirectAfterLeave />
              )}

            <GroupArchivedWarning archived={data.archived} directlyArchived={data.directlyArchived} />

            {!hasPermissions(data, 'viewDetail') && (
              <Row>
                <Col sm={12}>
                  <Callout variant="warning" className="larger" icon={<BanIcon />}>
                    <FormattedMessage
                      id="generic.accessDenied"
                      defaultMessage="You do not have permissions to see this page. If you got to this page via a seemingly legitimate link or button, please report a bug."
                    />
                  </Callout>
                </Col>
              </Row>
            )}

            <Row>
              <Col sm={6}>
                {hasPermissions(data, 'viewDetail') && (
                  <GroupInfoTable
                    group={data}
                    supervisors={supervisors}
                    isAdmin={isAdminOrSuperadmin}
                    groups={groups}
                    locale={locale}
                  />
                )}

                {hasPermissions(data, 'viewMembers') && (
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
                              localizedTexts: data.localizedTexts,
                            },
                            locale
                          ),
                        }}
                      />
                    }>
                    <SupervisorsList
                      groupId={data.id}
                      primaryAdmins={primaryAdmins}
                      supervisors={supervisors}
                      observers={observers}
                      showButtons={isAdminOrSuperadmin && !data.archived}
                      isLoaded={
                        supervisors.length === data.privateData.supervisors.length &&
                        primaryAdmins.length === data.primaryAdminsIds.length
                      }
                      addAdmin={addAdmin}
                      addSupervisor={addSupervisor}
                      removeMember={removeMember}
                      addObserver={addObserver}
                      pendingMemberships={pendingMemberships}
                    />
                  </Box>
                )}

                {isAdminOrSuperadmin && !data.archived && (
                  <Box
                    title={
                      <FormattedMessage id="app.group.adminsView.addSupervisor" defaultMessage="Add Supervisor" />
                    }>
                    <AddSupervisor
                      instanceId={data.privateData.instanceId}
                      groupId={data.id}
                      primaryAdmins={primaryAdmins}
                      supervisors={supervisors}
                      observers={observers}
                      studentsIds={studentsIds}
                      addAdmin={addAdmin}
                      addSupervisor={addSupervisor}
                      addObserver={addObserver}
                      pendingMemberships={pendingMemberships}
                    />
                  </Box>
                )}
              </Col>
              <Col sm={6}>
                {hasPermissions(data, 'viewSubgroups') && (
                  <Box
                    title={<FormattedMessage id="app.groupDetail.subgroups" defaultMessage="Subgroups Hierarchy" />}
                    unlimitedHeight
                    extraPadding>
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
                  </Box>
                )}

                {hasPermissions(data, 'addSubgroup') && !data.archived && (
                  <EditGroupForm
                    form="addSubgroup"
                    onSubmit={addSubgroup(data.privateData.instanceId, userId)}
                    initialValues={EDIT_GROUP_FORM_EMPTY_INITIAL_VALUES}
                    createNew
                    collapsable
                    isOpen={false}
                    hasThreshold={hasThreshold}
                    isSuperAdmin={isSuperAdmin}
                  />
                )}
              </Col>
            </Row>
          </div>
        )}
      </Page>
    );
  }
}

GroupInfo.propTypes = {
  match: PropTypes.shape({ params: PropTypes.shape({ groupId: PropTypes.string.isRequired }).isRequired }).isRequired,
  userId: PropTypes.string.isRequired,
  group: ImmutablePropTypes.map,
  instance: ImmutablePropTypes.map,
  primaryAdmins: PropTypes.array,
  supervisors: PropTypes.array,
  observers: PropTypes.array,
  studentsIds: PropTypes.array,
  groups: ImmutablePropTypes.map,
  isAdmin: PropTypes.bool,
  isSupervisor: PropTypes.bool,
  isSuperAdmin: PropTypes.bool,
  isStudent: PropTypes.bool,
  addSubgroup: PropTypes.func,
  loadAsync: PropTypes.func,
  refetchUsers: PropTypes.func.isRequired,
  addAdmin: PropTypes.func.isRequired,
  addSupervisor: PropTypes.func.isRequired,
  addObserver: PropTypes.func.isRequired,
  removeMember: PropTypes.func.isRequired,
  hasThreshold: PropTypes.bool,
  pendingMemberships: ImmutablePropTypes.list,
  links: PropTypes.object,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired,
};

const addSubgroupFormSelector = formValueSelector('addSubgroup');

const mapStateToProps = (
  state,
  {
    match: {
      params: { groupId },
    },
  }
) => {
  const userId = loggedInUserIdSelector(state);

  return {
    group: groupSelector(state, groupId),
    userId,
    groups: groupsSelector(state),
    primaryAdmins: primaryAdminsOfGroupSelector(state, groupId),
    supervisors: supervisorsOfGroupSelector(state, groupId),
    observers: observersOfGroupSelector(state, groupId),
    studentsIds: studentsIdsOfGroup(groupId)(state),
    isSupervisor: loggedUserIsSupervisorOfSelector(state)(groupId),
    isAdmin: loggedUserIsAdminOfSelector(state)(groupId),
    isSuperAdmin: isLoggedAsSuperAdmin(state),
    isStudent: loggedUserIsStudentOfSelector(state)(groupId),
    hasThreshold: addSubgroupFormSelector(state, 'hasThreshold'),
    pendingMemberships: pendingMembershipsSelector(state, groupId),
  };
};

const mapDispatchToProps = (dispatch, { match: { params } }) => ({
  addSubgroup:
    (instanceId, userId) =>
    ({ localizedTexts, hasThreshold, threshold, makeMeAdmin, ...data }) =>
      dispatch(
        createGroup({
          ...data,
          hasThreshold,
          threshold: hasThreshold ? threshold : undefined,
          localizedTexts: transformLocalizedTextsFormData(localizedTexts),
          noAdmin: !makeMeAdmin, // inverted logic in API, user is added as admin by default
          instanceId,
          parentGroupId: params.groupId,
        })
      ).then(() => Promise.all([dispatch(fetchAllGroups()), dispatch(fetchUser(userId))])),
  loadAsync: () => GroupInfo.loadAsync(params, dispatch),
  refetchUsers: ids => dispatch(fetchByIds(ids)),
  addAdmin: (userId, groupId) => dispatch(addAdmin(userId, groupId)),
  addSupervisor: (userId, groupId) => dispatch(addSupervisor(userId, groupId)),
  addObserver: (userId, groupId) => dispatch(addObserver(userId, groupId)),
  removeMember: (userId, groupId) => dispatch(removeMember(userId, groupId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(GroupInfo));
