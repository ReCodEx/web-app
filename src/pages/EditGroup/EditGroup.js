import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import { reset, formValueSelector } from 'redux-form';
import { lruMemoize } from 'reselect';

import Page from '../../components/layout/Page';
import { GroupNavigation } from '../../components/layout/Navigation';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import EditGroupForm, { EDIT_GROUP_FORM_LOCALIZED_TEXTS_DEFAULT } from '../../components/forms/EditGroupForm';
import RelocateGroupForm, { getPossibleParentsOfGroup } from '../../components/forms/RelocateGroupForm';
import OrganizationalGroupButtonContainer from '../../containers/OrganizationalGroupButtonContainer';
import ExamGroupButtonContainer from '../../containers/ExamGroupButtonContainer';
import ArchiveGroupButtonContainer from '../../containers/ArchiveGroupButtonContainer';
import DeleteGroupButtonContainer from '../../containers/DeleteGroupButtonContainer';
import Box from '../../components/widgets/Box';
import Callout from '../../components/widgets/Callout';
import GroupArchivedWarning from '../../components/Groups/GroupArchivedWarning/GroupArchivedWarning.js';
import { BanIcon, EditGroupIcon, WarningIcon } from '../../components/icons';

import { fetchGroup, fetchGroupIfNeeded, editGroup, relocateGroup } from '../../redux/modules/groups.js';
import {
  groupSelector,
  canViewParentDetailSelector,
  notArchivedGroupsSelector,
  groupDataAccessorSelector,
} from '../../redux/selectors/groups.js';
import { loggedInUserIdSelector, selectedInstanceId } from '../../redux/selectors/auth.js';
import { isLoggedAsSuperAdmin } from '../../redux/selectors/users.js';
import { getLocalizedTextsInitialValues, transformLocalizedTextsFormData } from '../../helpers/localizedData.js';

import { hasPermissions, hasOneOfPermissions } from '../../helpers/common.js';
import withLinks from '../../helpers/withLinks.js';
import { withRouterProps } from '../../helpers/withRouter.js';

const canRelocate = group => hasPermissions(group, 'relocate') && !group.archived;

const getRelocateFormInitialValues = lruMemoize(group => ({ groupId: group.parentGroupId }));

class EditGroup extends Component {
  componentDidMount() {
    this.props.loadAsync();
  }

  componentDidUpdate(prevProps) {
    if (this.props.params.groupId !== prevProps.params.groupId) {
      this.props.reset();
      this.props.loadAsync();
    }
  }

  getInitialValues = lruMemoize(
    ({ localizedTexts, public: isPublic, privateData: { publicStats, threshold, pointsLimit, detaining } }) => ({
      localizedTexts: getLocalizedTextsInitialValues(localizedTexts, EDIT_GROUP_FORM_LOCALIZED_TEXTS_DEFAULT),
      isPublic,
      publicStats,
      detaining,
      hasThreshold:
        (threshold !== null && threshold !== undefined) || (pointsLimit !== null && pointsLimit !== undefined),
      threshold: Number(threshold || 0) * 100 || null,
      pointsLimit: pointsLimit || null,
    })
  );

  render() {
    const {
      navigate,
      group,
      groups,
      groupsAccessor,
      isSuperAdmin,
      editGroup,
      relocateGroup,
      hasThreshold,
      threshold,
      pointsLimit,
      canViewParentDetail,
      instanceId,
      reload,
      links: { GROUP_INFO_URI_FACTORY, INSTANCE_URI_FACTORY, GROUP_EDIT_URI_FACTORY },
      intl: { locale },
    } = this.props;

    return (
      <Page
        resource={group}
        icon={<EditGroupIcon />}
        title={<FormattedMessage id="app.editGroup.title" defaultMessage="Change Group Settings" />}>
        {group => (
          <div>
            {group.privateData && <GroupNavigation group={group} />}

            {!hasOneOfPermissions(group, 'update', 'archive', 'remove', 'relocate') && (
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

            <GroupArchivedWarning {...group} groupsDataAccessor={groupsAccessor} linkFactory={GROUP_EDIT_URI_FACTORY} />

            <Row>
              {hasPermissions(group, 'update') && !group.archived && (
                <Col xs={12} xl={6}>
                  <EditGroupForm
                    form="editGroup"
                    initialValues={this.getInitialValues(group)}
                    onSubmit={editGroup}
                    hasThreshold={hasThreshold}
                    threshold={threshold}
                    pointsLimit={pointsLimit}
                    isOrganizational={group.organizational}
                    isSuperAdmin={isSuperAdmin}
                  />
                </Col>
              )}

              <Col xs={12} xl={group.archived || !hasPermissions(group, 'update') ? 12 : 6}>
                {!group.archived && hasOneOfPermissions(group, 'setOrganizational', 'setExamFlag') && (
                  <Box
                    type="info"
                    title={<FormattedMessage id="app.editGroup.changeGroupType" defaultMessage="Change group type" />}>
                    <table>
                      <tbody>
                        <tr>
                          <td className="fw-bold text-end p-2">
                            <FormattedMessage id="app.editGroup.currentType" defaultMessage="Current type" />:
                          </td>
                          <td className="p-2">
                            {group.exam ? (
                              <FormattedMessage id="app.groupTypeButton.exam" defaultMessage="Exam" />
                            ) : group.organizational ? (
                              <FormattedMessage
                                id="app.groupTypeButton.organizational"
                                defaultMessage="Organizational"
                              />
                            ) : (
                              <FormattedMessage id="app.groupTypeButton.regular" defaultMessage="Regular" />
                            )}
                          </td>
                        </tr>
                        {!group.exam && (
                          <tr>
                            <td>
                              <OrganizationalGroupButtonContainer id={group.id} className="m-2" locale={locale} />
                            </td>
                            <td className="text-body-secondary small p-2">
                              <FormattedMessage
                                id="app.editGroup.organizationalExplain"
                                defaultMessage="Regular groups are containers for students and assignments. Organizational groups are intended to create hierarchy, so they are forbidden to hold any students or assignments."
                              />
                            </td>
                          </tr>
                        )}
                        {!group.organizational && (
                          <tr>
                            <td>
                              <ExamGroupButtonContainer id={group.id} className="m-2" locale={locale} />
                            </td>
                            <td className="text-body-secondary small p-2">
                              <FormattedMessage
                                id="app.editGroup.examExplain"
                                defaultMessage="Exam groups work the same as regular groups internally. The exam flag is mainly an indicator for the users and it may also affect the way how the group is listed or when it is archived. This indicator is completely independent of the Exam terms which can be set on a so named page."
                              />
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </Box>
                )}

                {hasPermissions(group, 'archive') && (!group.archived || group.directlyArchived) && (
                  <Box
                    type="info"
                    title={
                      <FormattedMessage id="app.editGroup.archiveGroup" defaultMessage="Change archived status" />
                    }>
                    <Row className="align-items-center">
                      <Col xs={false} sm="auto">
                        <ArchiveGroupButtonContainer id={group.id} shortLabels className="m-2" onChange={reload} />
                      </Col>
                      <Col xs={12} sm className="text-body-secondary small">
                        <FormattedMessage
                          id="app.editGroup.archivedExplain"
                          defaultMessage="Archived groups are containers for students, assignments and results after the course is finished. They are immutable and can be accessed through separate Archive page."
                        />
                      </Col>
                    </Row>
                  </Box>
                )}

                {canRelocate(group) && (
                  <ResourceRenderer resourceArray={groups}>
                    {groups =>
                      getPossibleParentsOfGroup(groups, group).length > 1 && (
                        <Box
                          type="warning"
                          title={<FormattedMessage id="app.editGroup.relocateGroup" defaultMessage="Relocate Group" />}>
                          <RelocateGroupForm
                            initialValues={getRelocateFormInitialValues(group)}
                            groups={getPossibleParentsOfGroup(groups, group)}
                            groupsAccessor={groupsAccessor}
                            onSubmit={relocateGroup}
                          />
                        </Box>
                      )
                    }
                  </ResourceRenderer>
                )}

                {hasPermissions(group, 'remove') && (
                  <Box
                    type="danger"
                    title={<FormattedMessage id="app.editGroup.deleteGroup" defaultMessage="Delete Group" />}>
                    <Row className="align-items-center">
                      <Col xs={false} sm="auto">
                        <DeleteGroupButtonContainer
                          id={group.id}
                          small={false}
                          className="m-2"
                          disabled={
                            group.parentGroupId === null || (group.childGroups && group.childGroups.length > 0) // TODO whatabout archived sub-groups?
                          }
                          onDeleted={() =>
                            navigate(
                              canViewParentDetail
                                ? GROUP_INFO_URI_FACTORY(group.parentGroupId)
                                : INSTANCE_URI_FACTORY(instanceId),
                              { replace: true }
                            )
                          }
                        />
                      </Col>
                      <Col xs={12} sm>
                        <div className="text-body-secondary small">
                          <FormattedMessage
                            id="app.editGroup.deleteGroupWarning"
                            defaultMessage="Deleting a group will make all attached entities (assignments, solutions, ...) inaccessible."
                          />
                        </div>

                        {group.parentGroupId === null && (
                          <div className="mt-1">
                            <WarningIcon className="text-danger" gapRight={2} />
                            <FormattedMessage
                              id="app.editGroup.cannotDeleteRootGroup"
                              defaultMessage="This is a so-called root group and it cannot be deleted."
                            />
                          </div>
                        )}

                        {group.parentGroupId !== null && group.childGroups && group.childGroups.length > 0 && (
                          <div className="mt-1">
                            <WarningIcon className="text-danger" gapRight={2} />
                            <FormattedMessage
                              id="app.editGroup.cannotDeleteGroupWithSubgroups"
                              defaultMessage="Group with nested sub-groups cannot be deleted."
                            />
                          </div>
                        )}
                      </Col>
                    </Row>
                  </Box>
                )}
              </Col>
            </Row>
          </div>
        )}
      </Page>
    );
  }
}

EditGroup.propTypes = {
  links: PropTypes.object.isRequired,
  loadAsync: PropTypes.func.isRequired,
  reload: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  params: PropTypes.shape({
    groupId: PropTypes.string.isRequired,
  }).isRequired,
  group: ImmutablePropTypes.map,
  groups: ImmutablePropTypes.map,
  groupsAccessor: PropTypes.func.isRequired,
  canViewParentDetail: PropTypes.bool.isRequired,
  instanceId: PropTypes.string,
  hasThreshold: PropTypes.bool,
  threshold: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  pointsLimit: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isSuperAdmin: PropTypes.bool,
  editGroup: PropTypes.func.isRequired,
  relocateGroup: PropTypes.func.isRequired,
  intl: PropTypes.object,
  navigate: withRouterProps.navigate,
};

const editGroupFormSelector = formValueSelector('editGroup');

export default withLinks(
  connect(
    (state, { params: { groupId } }) => ({
      group: groupSelector(state, groupId),
      groups: notArchivedGroupsSelector(state),
      groupsAccessor: groupDataAccessorSelector(state),
      userId: loggedInUserIdSelector(state),
      hasThreshold: editGroupFormSelector(state, 'hasThreshold'),
      threshold: editGroupFormSelector(state, 'threshold'),
      pointsLimit: editGroupFormSelector(state, 'pointsLimit'),
      isSuperAdmin: isLoggedAsSuperAdmin(state),
      canViewParentDetail: canViewParentDetailSelector(state, groupId),
      instanceId: selectedInstanceId(state),
    }),
    (dispatch, { params: { groupId } }) => ({
      reset: () => dispatch(reset('editGroup')),
      loadAsync: () => dispatch(fetchGroupIfNeeded(groupId)),
      reload: () => dispatch(fetchGroup(groupId)),
      editGroup: ({ localizedTexts, isPublic, publicStats, detaining, hasThreshold, threshold, pointsLimit }) =>
        dispatch(
          editGroup(groupId, {
            localizedTexts: transformLocalizedTextsFormData(localizedTexts),
            externalId: '',
            isPublic,
            publicStats,
            detaining,
            threshold: (hasThreshold && Number(threshold)) || null,
            pointsLimit: (hasThreshold && Number(pointsLimit)) || null,
          })
        ),
      relocateGroup: ({ groupId: newParentId }) => dispatch(relocateGroup(groupId, newParentId)),
    })
  )(injectIntl(EditGroup))
);
