import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { reset } from 'redux-form';

import Page from '../../components/Page';
import EditGroupForm from '../../components/Forms/EditGroupForm';

import { fetchGroupIfNeeded, editGroup } from '../../redux/modules/groups';
import { groupSelector } from '../../redux/selectors/groups';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { isSupervisorOf } from '../../redux/selectors/users';

class EditGroup extends Component {

  componentWillMount = () => this.props.loadAsync();
  componentWillReceiveProps = (props) => {
    if (this.props.params.groupId !== props.params.groupId) {
      props.reset();
      props.loadAsync();
    }
  };

  render() {
    const { links: { GROUP_URI_FACTORY } } = this.context;
    const {
      params: { groupId },
      group,
      editGroup
    } = this.props;

    return (
      <Page
        resource={group}
        title={(group) => group.name}
        description={<FormattedMessage id='app.editGroup.description' defaultMessage='Change group settings' />}
        breadcrumbs={[
          {
            text: <FormattedMessage id='app.group.title' />,
            iconName: 'group',
            link: GROUP_URI_FACTORY(groupId)
          },
          {
            text: <FormattedMessage id='app.editGroup.title' defaultMessage='Edit group' />,
            iconName: 'pencil'
          }
        ]}>
        {group => (
          <EditGroupForm
            initialValues={group}
            onSubmit={editGroup} />
        )}
      </Page>
    );
  }

}

EditGroup.contextTypes = {
  links: PropTypes.object
};

EditGroup.propTypes = {
  loadAsync: PropTypes.func.isRequired,
  params: PropTypes.shape({
    groupId: PropTypes.string.isRequired
  }).isRequired,
  group: ImmutablePropTypes.map,
  editGroup: PropTypes.func.isRequired
};

export default connect(
  (state, { params: { groupId } }) => {
    const selectGroup = groupSelector(groupId);
    const userId = loggedInUserIdSelector(state);
    return {
      group: selectGroup(state),
      userId,
      isStudentOf: (groupId) => isSupervisorOf(userId, groupId)(state)
    };
  },
  (dispatch, { params: { groupId } }) => ({
    push: (url) => dispatch(push(url)),
    reset: () => dispatch(reset('editGroup')),
    loadAsync: () => dispatch(fetchGroupIfNeeded(groupId)),
    editGroup: (data) => {
      if (data.threshold === null) {
        delete data.threshold;
      }
      return dispatch(editGroup(groupId, data));
    }
  })
)(EditGroup);
