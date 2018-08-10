import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { HelpBlock, Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { reset, formValueSelector } from 'redux-form';
import { defaultMemoize } from 'reselect';

import Page from '../../components/layout/Page';
import EditGroupForm from '../../components/forms/EditGroupForm';
import OrganizationalGroupButtonContainer from '../../containers/OrganizationalGroupButtonContainer';
import DeleteGroupButtonContainer from '../../containers/DeleteGroupButtonContainer';
import Box from '../../components/widgets/Box';
import Icon, { BanIcon } from '../../components/icons';

import { fetchGroupIfNeeded, editGroup } from '../../redux/modules/groups';
import { groupSelector } from '../../redux/selectors/groups';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import {
  isSupervisorOf,
  isLoggedAsSuperAdmin
} from '../../redux/selectors/users';
import {
  getLocalizedTextsLocales,
  getLocalizedName
} from '../../helpers/getLocalizedData';

import withLinks from '../../helpers/withLinks';
import { hasPermissions } from '../../helpers/common';

class EditGroup extends Component {
  componentWillMount() {
    this.props.loadAsync();
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.params.groupId !== nextProps.params.groupId) {
      nextProps.reset();
      nextProps.loadAsync();
    }
  }

  getInitialValues = defaultMemoize(
    ({
      localizedTexts,
      externalId,
      public: isPublic,
      privateData: { publicStats, threshold }
    }) => ({
      localizedTexts,
      externalId,
      isPublic,
      publicStats,
      hasThreshold: threshold !== null && threshold !== undefined,
      threshold:
        threshold !== null && threshold !== undefined
          ? String(Number(threshold) * 100)
          : '0'
    })
  );

  render() {
    const {
      params: { groupId },
      group,
      isSuperAdmin,
      links: { GROUP_INFO_URI_FACTORY, GROUP_DETAIL_URI_FACTORY },
      editGroup,
      hasThreshold,
      localizedTexts,
      push,
      intl: { locale }
    } = this.props;

    return (
      <Page
        resource={group}
        title={group => getLocalizedName(group, locale)}
        description={
          <FormattedMessage
            id="app.editGroup.description"
            defaultMessage="Change group settings"
          />
        }
        breadcrumbs={[
          {
            text: (
              <FormattedMessage
                id="app.group.info"
                defaultMessage="Group Info"
              />
            ),
            iconName: 'users',
            link: GROUP_INFO_URI_FACTORY(groupId)
          },
          {
            text: <FormattedMessage id="app.group.title" />,
            iconName: 'users',
            link: GROUP_DETAIL_URI_FACTORY(groupId)
          },
          {
            text: (
              <FormattedMessage
                id="app.editGroup.title"
                defaultMessage="Edit Group"
              />
            ),
            iconName: ['far', 'edit']
          }
        ]}
      >
        {group =>
          <div>
            {!hasPermissions(group, 'update') &&
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

            {hasPermissions(group, 'update') &&
              <Row>
                <Col lg={3}>
                  <p>
                    <OrganizationalGroupButtonContainer id={group.id} />
                  </p>
                </Col>
                <Col lg={9}>
                  <p className="small text-muted" style={{ padding: '0.75em' }}>
                    <Icon icon="info-circle" gapRight />
                    <FormattedMessage
                      id="app.editGroup.organizationalExplain"
                      defaultMessage="Regular groups are containers for students and assignments. Organizational groups are intended to create hierarchy, so they are forbidden to hold any students or assignments."
                    />
                  </p>
                </Col>
              </Row>}

            {hasPermissions(group, 'update') &&
              <EditGroupForm
                form="editGroup"
                initialValues={this.getInitialValues(group)}
                onSubmit={editGroup}
                hasThreshold={hasThreshold}
                isPublic={group.public}
                localizedTextsLocales={getLocalizedTextsLocales(localizedTexts)}
                isSuperAdmin={isSuperAdmin}
              />}

            {hasPermissions(group, 'remove') &&
              <Box
                type="danger"
                title={
                  <FormattedMessage
                    id="app.editGroup.deleteGroup"
                    defaultMessage="Delete the group"
                  />
                }
              >
                <div>
                  <p>
                    <FormattedMessage
                      id="app.editGroup.deleteGroupWarning"
                      defaultMessage="Deleting a group will make all attached entities (assignments, solutions, ...) inaccessible."
                    />
                  </p>
                  <p className="text-center">
                    <DeleteGroupButtonContainer
                      id={group.id}
                      disabled={
                        group.parentGroupId === null ||
                        (group.childGroups && group.childGroups.length > 0) // TODO whatabout archived sub-groups?
                      }
                      onDeleted={() =>
                        push(GROUP_INFO_URI_FACTORY(group.parentGroupId))}
                    />

                    {group.parentGroupId === null &&
                      <HelpBlock>
                        <FormattedMessage
                          id="app.editGroup.cannotDeleteRootGroup"
                          defaultMessage="This is a so-called root group and it cannot be deleted."
                        />
                      </HelpBlock>}

                    {group.parentGroupId !== null &&
                      group.childGroups &&
                      group.childGroups.length > 0 &&
                      <HelpBlock>
                        <FormattedMessage
                          id="app.editGroup.cannotDeleteGroupWithSubgroups"
                          defaultMessage="Group with nested sub-groups cannot be deleted."
                        />
                      </HelpBlock>}
                  </p>
                </div>
              </Box>}
          </div>}
      </Page>
    );
  }
}

EditGroup.propTypes = {
  links: PropTypes.object.isRequired,
  loadAsync: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  params: PropTypes.shape({
    groupId: PropTypes.string.isRequired
  }).isRequired,
  group: ImmutablePropTypes.map,
  editGroup: PropTypes.func.isRequired,
  push: PropTypes.func.isRequired,
  hasThreshold: PropTypes.bool,
  localizedTexts: PropTypes.array,
  isSuperAdmin: PropTypes.bool,
  intl: intlShape
};

const editGroupFormSelector = formValueSelector('editGroup');

export default withLinks(
  connect(
    (state, { params: { groupId } }) => {
      const selectGroup = groupSelector(groupId);
      const userId = loggedInUserIdSelector(state);
      return {
        group: selectGroup(state),
        userId,
        isStudentOf: groupId => isSupervisorOf(userId, groupId)(state),
        hasThreshold: editGroupFormSelector(state, 'hasThreshold'),
        localizedTexts: editGroupFormSelector(state, 'localizedTexts'),
        isSuperAdmin: isLoggedAsSuperAdmin(state)
      };
    },
    (dispatch, { params: { groupId } }) => ({
      push: url => dispatch(push(url)),
      reset: () => dispatch(reset('editGroup')),
      loadAsync: () => dispatch(fetchGroupIfNeeded(groupId)),
      editGroup: ({
        localizedTexts,
        externalId,
        isPublic,
        publicStats,
        threshold,
        hasThreshold
      }) => {
        let transformedData = {
          localizedTexts,
          externalId,
          isPublic,
          publicStats,
          hasThreshold
        };
        if (hasThreshold) {
          transformedData.threshold = Number(threshold);
        }
        return dispatch(editGroup(groupId, transformedData));
      }
    })
  )(injectIntl(EditGroup))
);
