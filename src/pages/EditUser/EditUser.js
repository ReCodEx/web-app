import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-bootstrap';

import {
  fetchUserIfNeeded,
  updateProfile,
  updateSettings,
  makeLocalLogin
} from '../../redux/modules/users';
import { getUser, isLoggedAsSuperAdmin } from '../../redux/selectors/users';
import Page from '../../components/layout/Page';
import Button from '../../components/widgets/FlatButton';
import { LocalIcon } from '../../components/icons';

import EditUserProfileForm from '../../components/forms/EditUserProfileForm';
import EditUserSettingsForm from '../../components/forms/EditUserSettingsForm';

class EditUser extends Component {
  static loadAsync = ({ userId }, dispatch) =>
    Promise.all([dispatch(fetchUserIfNeeded(userId))]);

  componentWillMount() {
    this.props.loadAsync();
  }

  componentWillReceiveProps(newProps) {
    if (this.props.params.userId !== newProps.params.userId) {
      newProps.loadAsync();
    }
  }

  updateProfile(data, changeNames) {
    const { updateProfile } = this.props;
    if (!changeNames) {
      delete data['firstName'];
      delete data['lastName'];
    }
    return updateProfile(data);
  }

  render() {
    const { user, updateSettings, makeLocalLogin, isSuperAdmin } = this.props;
    return (
      <Page
        resource={user}
        title={user => user.fullName}
        description={
          <FormattedMessage
            id="app.editUser.description"
            defaultMessage="Edit user's profile"
          />
        }
        breadcrumbs={[
          {
            resource: user,
            iconName: 'user',
            breadcrumb: user => ({
              text: <FormattedMessage id="app.user.title" />,
              link: ({ USER_URI_FACTORY }) => USER_URI_FACTORY(user.id)
            })
          },
          {
            text: (
              <FormattedMessage
                id="app.editUser.title"
                defaultMessage="Edit user's profile"
              />
            ),
            iconName: 'pencil'
          }
        ]}
      >
        {data =>
          <div>
            {!data.privateData.isLocal &&
              <p>
                <Button bsStyle="warning" onClick={makeLocalLogin}>
                  <LocalIcon />{' '}
                  <FormattedMessage
                    id="app.editUser.makeLocal"
                    defaultMessage="Create local account"
                  />
                </Button>
              </p>}
            <Row>
              <Col lg={6}>
                <EditUserProfileForm
                  onSubmit={formData =>
                    this.updateProfile(
                      formData,
                      isSuperAdmin || !data.privateData.isExternal
                    )}
                  initialValues={{
                    firstName: data.name.firstName,
                    lastName: data.name.lastName,
                    degreesBeforeName: data.name.degreesBeforeName,
                    degreesAfterName: data.name.degreesAfterName,
                    email: data.privateData.email,
                    passwordStrength: null
                  }}
                  allowChangePassword={data.privateData.isLocal}
                  emptyLocalPassword={data.privateData.emptyLocalPassword}
                  disabledNameChange={
                    data.privateData.isExternal && !isSuperAdmin
                  }
                />
              </Col>
              <Col lg={6}>
                <EditUserSettingsForm
                  onSubmit={updateSettings}
                  initialValues={data.privateData.settings}
                />
              </Col>
            </Row>
          </div>}
      </Page>
    );
  }
}

EditUser.propTypes = {
  user: ImmutablePropTypes.map,
  params: PropTypes.shape({ userId: PropTypes.string.isRequired }).isRequired,
  loadAsync: PropTypes.func.isRequired,
  updateProfile: PropTypes.func.isRequired,
  updateSettings: PropTypes.func.isRequired,
  makeLocalLogin: PropTypes.func.isRequired,
  isSuperAdmin: PropTypes.bool.isRequired
};

export default connect(
  (state, { params: { userId } }) => ({
    user: getUser(userId)(state),
    isSuperAdmin: isLoggedAsSuperAdmin(state)
  }),
  (dispatch, { params: { userId } }) => ({
    loadAsync: () => EditUser.loadAsync({ userId }, dispatch),
    updateSettings: data => dispatch(updateSettings(userId, data)),
    updateProfile: data => dispatch(updateProfile(userId, data)),
    makeLocalLogin: () => dispatch(makeLocalLogin(userId))
  })
)(EditUser);
