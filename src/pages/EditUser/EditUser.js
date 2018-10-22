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
  makeLocalLogin,
  setRole
} from '../../redux/modules/users';
import { getUser, isLoggedAsSuperAdmin } from '../../redux/selectors/users';
import Page from '../../components/layout/Page';
import Button from '../../components/widgets/FlatButton';
import { LocalIcon, TransferIcon, BanIcon } from '../../components/icons';
import { UserRoleIcon } from '../../components/helpers/usersRoles';
import AllowUserButtonContainer from '../../containers/AllowUserButtonContainer';

import EditUserProfileForm from '../../components/forms/EditUserProfileForm';
import EditUserSettingsForm from '../../components/forms/EditUserSettingsForm';
import GenerateTokenForm from '../../components/forms/GenerateTokenForm';
import EditUserRoleForm from '../../components/forms/EditUserRoleForm';
import { generateToken, takeOver } from '../../redux/modules/auth';
import {
  lastGeneratedToken,
  loggedInUserIdSelector
} from '../../redux/selectors/auth';
import { safeGet } from '../../helpers/common';

class EditUser extends Component {
  static loadAsync = ({ userId }, dispatch) =>
    dispatch(fetchUserIfNeeded(userId));

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

  setRole = ({ role }) => {
    const { setRole } = this.props;
    return setRole(role);
  };

  render() {
    const {
      user,
      loggedUserId,
      updateSettings,
      makeLocalLogin,
      isSuperAdmin,
      generateToken,
      lastToken,
      takeOver
    } = this.props;
    return (
      <Page
        resource={user}
        title={user =>
          <span>
            {!safeGet(user, ['privateData', 'isAllowed']) &&
              <BanIcon gapRight />}

            {safeGet(user, ['privateData', 'role']) &&
              <UserRoleIcon
                role={user.privateData.role}
                showTooltip
                tooltipId={'user-role'}
                gapRight
              />}

            {user.fullName}
          </span>}
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
            iconName: ['far', 'edit']
          }
        ]}
      >
        {data =>
          <div>
            {data &&
              <p>
                {!data.privateData.isLocal &&
                  <Button bsStyle="warning" onClick={makeLocalLogin}>
                    <LocalIcon gapRight />
                    <FormattedMessage
                      id="app.editUser.makeLocal"
                      defaultMessage="Create local account"
                    />
                  </Button>}

                {isSuperAdmin &&
                  data.id !== loggedUserId &&
                  data.privateData.isAllowed &&
                  <Button bsStyle="primary" onClick={() => takeOver(data.id)}>
                    <TransferIcon gapRight />
                    <FormattedMessage
                      id="app.users.takeOver"
                      defaultMessage="Login as"
                    />
                  </Button>}

                {isSuperAdmin &&
                  data.id !== loggedUserId &&
                  <AllowUserButtonContainer id={data.id} />}
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
                    passwordStrength: null,
                    gravatarUrlEnabled: data.avatarUrl !== null
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

            {data &&
              data.id &&
              data.id === loggedUserId &&
              <Row>
                <Col lg={12}>
                  <GenerateTokenForm
                    onSubmit={generateToken}
                    initialValues={{
                      expiration: '604800', // one week (in string)
                      scopes: {
                        'read-all': true,
                        master: false,
                        refresh: false
                      }
                    }}
                    lastToken={lastToken}
                  />
                </Col>
              </Row>}

            {isSuperAdmin &&
              data.id !== loggedUserId &&
              data.privateData &&
              <Row>
                <Col lg={12}>
                  <EditUserRoleForm
                    currentRole={data.privateData.role}
                    initialValues={{ role: data.privateData.role }}
                    onSubmit={this.setRole}
                  />
                </Col>
              </Row>}
          </div>}
      </Page>
    );
  }
}

EditUser.propTypes = {
  user: ImmutablePropTypes.map,
  loggedUserId: PropTypes.string.isRequired,
  params: PropTypes.shape({ userId: PropTypes.string.isRequired }).isRequired,
  loadAsync: PropTypes.func.isRequired,
  updateProfile: PropTypes.func.isRequired,
  updateSettings: PropTypes.func.isRequired,
  makeLocalLogin: PropTypes.func.isRequired,
  isSuperAdmin: PropTypes.bool.isRequired,
  generateToken: PropTypes.func.isRequired,
  setRole: PropTypes.func.isRequired,
  takeOver: PropTypes.func.isRequired,
  lastToken: PropTypes.string
};

export default connect(
  (state, { params: { userId } }) => ({
    user: getUser(userId)(state),
    loggedUserId: loggedInUserIdSelector(state),
    isSuperAdmin: isLoggedAsSuperAdmin(state),
    lastToken: lastGeneratedToken(state)
  }),
  (dispatch, { params: { userId } }) => ({
    loadAsync: () => EditUser.loadAsync({ userId }, dispatch),
    updateSettings: data => dispatch(updateSettings(userId, data)),
    updateProfile: data => dispatch(updateProfile(userId, data)),
    makeLocalLogin: () => dispatch(makeLocalLogin(userId)),
    generateToken: formData =>
      dispatch(
        generateToken(
          formData.expiration,
          Object.keys(formData.scopes).filter(
            key => formData.scopes[key] === true
          )
        )
      ),
    setRole: role => dispatch(setRole(userId, role)),
    takeOver: userId => dispatch(takeOver(userId))
  })
)(EditUser);
