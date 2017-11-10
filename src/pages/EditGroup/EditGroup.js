import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { HelpBlock } from 'react-bootstrap';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { reset } from 'redux-form';

import Page from '../../components/layout/Page';
import EditGroupForm from '../../components/forms/EditGroupForm';
import DeleteGroupButtonContainer from '../../containers/DeleteGroupButtonContainer';
import Box from '../../components/widgets/Box';
import { LocalizedGroupName } from '../../components/helpers/LocalizedNames';

import { fetchGroupIfNeeded, editGroup } from '../../redux/modules/groups';
import { groupSelector } from '../../redux/selectors/groups';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { isSupervisorOf } from '../../redux/selectors/users';

import withLinks from '../../hoc/withLinks';

class EditGroup extends Component {
  componentWillMount = () => this.props.loadAsync();
  componentWillReceiveProps = props => {
    if (this.props.params.groupId !== props.params.groupId) {
      props.reset();
      props.loadAsync();
    }
  };

  getInitialValues = ({ threshold, ...group }) => ({
    ...group,
    threshold: threshold * 100
  });

  render() {
    const {
      params: { groupId },
      group,
      links: { GROUP_URI_FACTORY },
      editGroup,
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
  push: PropTypes.func.isRequired
};

export default withLinks(
  connect(
    (state, { params: { groupId } }) => {
      const selectGroup = groupSelector(groupId);
      const userId = loggedInUserIdSelector(state);
      return {
        group: selectGroup(state),
        userId,
        isStudentOf: groupId => isSupervisorOf(userId, groupId)(state)
      };
    },
    (dispatch, { params: { groupId } }) => ({
      push: url => dispatch(push(url)),
      reset: () => dispatch(reset('editGroup')),
      loadAsync: () => dispatch(fetchGroupIfNeeded(groupId)),
      editGroup: data => {
        if (data.threshold === null) {
          delete data.threshold;
        }
        return dispatch(editGroup(groupId, data));
      }
    })
  )(EditGroup)
);
