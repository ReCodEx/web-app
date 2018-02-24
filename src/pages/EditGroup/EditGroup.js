import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { HelpBlock } from 'react-bootstrap';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { reset, formValueSelector } from 'redux-form';

import Page from '../../components/layout/Page';
import EditGroupForm from '../../components/forms/EditGroupForm';
import DeleteGroupButtonContainer from '../../containers/DeleteGroupButtonContainer';
import Box from '../../components/widgets/Box';
import { LocalizedGroupName } from '../../components/helpers/LocalizedNames';

import { fetchGroupIfNeeded, editGroup } from '../../redux/modules/groups';
import { groupSelector } from '../../redux/selectors/groups';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { isSupervisorOf } from '../../redux/selectors/users';
import { getLocalizedTextsLocales } from '../../helpers/getLocalizedData';

import withLinks from '../../helpers/withLinks';

class EditGroup extends Component {
  componentWillMount = () => this.props.loadAsync();
  componentWillReceiveProps = props => {
    if (this.props.params.groupId !== props.params.groupId) {
      props.reset();
      props.loadAsync();
    }
  };

  getInitialValues = ({
    localizedTexts,
    externalId,
    privateData: { isPublic, publicStats, threshold }
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
  });

  render() {
    const {
      params: { groupId },
      group,
      links: { GROUP_URI_FACTORY },
      editGroup,
      hasThreshold,
      localizedTexts,
      push
    } = this.props;

    return (
      <Page
        resource={group}
        title={group => <LocalizedGroupName entity={group} />}
        description={
          <FormattedMessage
            id="app.editGroup.description"
            defaultMessage="Change group settings"
          />
        }
        breadcrumbs={[
          {
            text: <FormattedMessage id="app.group.title" />,
            iconName: 'group',
            link: GROUP_URI_FACTORY(groupId)
          },
          {
            text: (
              <FormattedMessage
                id="app.editGroup.title"
                defaultMessage="Edit group"
              />
            ),
            iconName: 'pencil'
          }
        ]}
      >
        {group =>
          <div>
            <EditGroupForm
              initialValues={this.getInitialValues(group)}
              onSubmit={editGroup}
              hasThreshold={hasThreshold}
              localizedTextsLocales={getLocalizedTextsLocales(localizedTexts)}
            />

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
                    defaultMessage="Deleting a group will remove all the subgroups, the students submissions and all the assignments and the submissions of the students."
                  />
                </p>
                <p className="text-center">
                  <DeleteGroupButtonContainer
                    id={group.id}
                    disabled={
                      group.parentGroupId === null ||
                      (group.childGroups && group.childGroups.length > 0)
                    }
                    onDeleted={() =>
                      push(GROUP_URI_FACTORY(group.parentGroupId))}
                  />

                  {group.parentGroupId === null &&
                    <HelpBlock>
                      <FormattedMessage
                        id="app.editGroup.cannotDeleteRootGroup"
                        defaultMessage="This is a so-called root group and it cannot be deleted."
                      />
                    </HelpBlock>}
                </p>
              </div>
            </Box>
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
  localizedTexts: PropTypes.array
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
        localizedTexts: editGroupFormSelector(state, 'localizedTexts')
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
  )(EditGroup)
);
