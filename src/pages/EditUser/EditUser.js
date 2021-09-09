import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { defaultMemoize } from 'reselect';

import {
  fetchUser,
  fetchUserIfNeeded,
  updateProfile,
  updateSettings,
  makeLocalLogin,
  setRole,
} from '../../redux/modules/users';
import { getUser, isLoggedAsSuperAdmin } from '../../redux/selectors/users';
import Page from '../../components/layout/Page';
import { UserNavigation } from '../../components/layout/Navigation';
import Button, { TheButtonGroup } from '../../components/widgets/TheButton';
import Callout from '../../components/widgets/Callout';
import { LocalIcon, TransferIcon, EditUserIcon, RefreshIcon } from '../../components/icons';
import { isStudentRole } from '../../components/helpers/usersRoles';
import AllowUserButtonContainer from '../../containers/AllowUserButtonContainer';
import ResendVerificationEmail from '../../containers/ResendVerificationEmailContainer';

import EditUserProfileForm from '../../components/forms/EditUserProfileForm';
import EditUserSettingsForm from '../../components/forms/EditUserSettingsForm';
import GenerateTokenForm from '../../components/forms/GenerateTokenForm';
import EditUserRoleForm from '../../components/forms/EditUserRoleForm';
import { generateToken, takeOver } from '../../redux/modules/auth';
import { lastGeneratedToken, loggedInUserIdSelector } from '../../redux/selectors/auth';

const prepareUserSettingsInitialValues = defaultMemoize(({ defaultPage, ...settings }) => ({
  defaultPage: defaultPage || '',
  ...settings,
}));

class EditUser extends Component {
  static loadAsync = ({ userId }, dispatch) => dispatch(fetchUserIfNeeded(userId));

  componentDidMount = () => this.props.loadAsync();

  componentDidUpdate(prevProps) {
    if (this.props.match.params.userId !== prevProps.match.params.userId) {
      this.props.loadAsync();
    }
  }

  updateProfile(data, changeNames) {
    const { updateProfile } = this.props;
    if (!changeNames) {
      delete data.firstName;
      delete data.lastName;
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
      takeOver,
      refreshUser,
      intl: { locale },
    } = this.props;
    return (
      <Page
        resource={user}
        icon={<EditUserIcon />}
        title={<FormattedMessage id="app.editUser.title" defaultMessage="Edit User's Profile" />}>
        {data => (
          <>
            {data && (
              <UserNavigation
                userId={data.id}
                canViewDetail={isStudentRole(data.privateData.role)}
                canEdit={isSuperAdmin || data.id === loggedUserId}
                isLoggedInUser={data.id === loggedUserId}
              />
            )}

            {data && (!data.privateData.isLocal || (isSuperAdmin && data.id !== loggedUserId)) && (
              <div className="mb-3">
                <TheButtonGroup>
                  {!data.privateData.isLocal && (
                    <Button variant="warning" onClick={makeLocalLogin}>
                      <LocalIcon gapRight />
                      <FormattedMessage id="app.editUser.makeLocal" defaultMessage="Create local account" />
                    </Button>
                  )}

                  {isSuperAdmin && data.id !== loggedUserId && data.privateData.isAllowed && (
                    <Button variant="primary" onClick={() => takeOver(data.id)}>
                      <TransferIcon gapRight />
                      <FormattedMessage id="app.users.takeOver" defaultMessage="Login as" />
                    </Button>
                  )}

                  {isSuperAdmin && data.id !== loggedUserId && <AllowUserButtonContainer id={data.id} />}
                </TheButtonGroup>
              </div>
            )}

            {data && data.id === loggedUserId && !data.isVerified && (
              <Callout variant="warning">
                <h3>
                  <FormattedMessage
                    id="app.editUser.emailStillNotVerifiedTitle"
                    defaultMessage="Email Address Is Not Verified"
                  />
                </h3>
                <p>
                  <FormattedMessage
                    id="app.editUser.emailStillNotVerified"
                    defaultMessage="Your email addres has not been verified yet. ReCodEx needs to rely on vaild addresses since many notifications are sent via email. You may send yourself a validation email using the button below and then use a link from that email to verify its acceptance. Please validate your address as soon as possible."
                  />
                </p>
                <p>
                  <FormattedMessage
                    id="app.editUser.isEmailAlreadyVefiried"
                    defaultMessage="If you have just verified your email and still see the message, please refresh the page."
                  />
                </p>
                <p className="em-margin-vertical">
                  <ResendVerificationEmail
                    userId={data.id}
                    locale={locale /* a hack that enforce component refresh on locale change */}
                  />
                  <Button variant="outline-secondary" onClick={refreshUser}>
                    <RefreshIcon gapRight />
                    <FormattedMessage id="generic.refresh" defaultMessage="Refresh" />
                  </Button>
                </p>
              </Callout>
            )}

            <Row>
              <Col lg={6}>
                <EditUserProfileForm
                  onSubmit={formData => this.updateProfile(formData, isSuperAdmin || !data.privateData.isExternal)}
                  initialValues={{
                    firstName: data.name.firstName,
                    lastName: data.name.lastName,
                    degreesBeforeName: data.name.degreesBeforeName,
                    degreesAfterName: data.name.degreesAfterName,
                    email: data.privateData.email,
                    passwordStrength: null,
                    gravatarUrlEnabled: data.avatarUrl !== null,
                  }}
                  allowChangePassword={data.privateData.isLocal}
                  emptyLocalPassword={data.privateData.emptyLocalPassword}
                  canForceChangePassword={isSuperAdmin && data.id !== loggedUserId}
                  disabledNameChange={data.privateData.isExternal && !isSuperAdmin}
                />
              </Col>

              {data.privateData.settings && (
                <Col lg={6}>
                  <EditUserSettingsForm
                    onSubmit={updateSettings}
                    user={data}
                    initialValues={prepareUserSettingsInitialValues(data.privateData.settings)}
                  />
                </Col>
              )}

              {isSuperAdmin && data.id !== loggedUserId && data.privateData && (
                <Col lg={6}>
                  <EditUserRoleForm
                    currentRole={data.privateData.role}
                    initialValues={{ role: data.privateData.role }}
                    onSubmit={this.setRole}
                  />
                </Col>
              )}
            </Row>

            {data && data.id && data.id === loggedUserId && (
              <Row>
                <Col lg={12}>
                  <GenerateTokenForm
                    onSubmit={generateToken}
                    initialValues={{
                      expiration: '604800', // one week (in string)
                      scopes: {
                        'read-all': true,
                        master: false,
                        refresh: false,
                      },
                    }}
                    lastToken={lastToken}
                  />
                </Col>
              </Row>
            )}
          </>
        )}
      </Page>
    );
  }
}

EditUser.propTypes = {
  match: PropTypes.shape({ params: PropTypes.shape({ userId: PropTypes.string.isRequired }).isRequired }).isRequired,
  user: ImmutablePropTypes.map,
  loggedUserId: PropTypes.string.isRequired,
  isSuperAdmin: PropTypes.bool.isRequired,
  lastToken: PropTypes.string,
  loadAsync: PropTypes.func.isRequired,
  refreshUser: PropTypes.func.isRequired,
  updateProfile: PropTypes.func.isRequired,
  updateSettings: PropTypes.func.isRequired,
  makeLocalLogin: PropTypes.func.isRequired,
  generateToken: PropTypes.func.isRequired,
  setRole: PropTypes.func.isRequired,
  takeOver: PropTypes.func.isRequired,
  intl: PropTypes.object,
};

export default connect(
  (
    state,
    {
      match: {
        params: { userId },
      },
    }
  ) => ({
    user: getUser(userId)(state),
    loggedUserId: loggedInUserIdSelector(state),
    isSuperAdmin: isLoggedAsSuperAdmin(state),
    lastToken: lastGeneratedToken(state),
  }),
  (
    dispatch,
    {
      match: {
        params: { userId },
      },
    }
  ) => ({
    loadAsync: () => EditUser.loadAsync({ userId }, dispatch),
    refreshUser: () => dispatch(fetchUser(userId)),
    updateSettings: data => dispatch(updateSettings(userId, data)),
    updateProfile: data => dispatch(updateProfile(userId, data)),
    makeLocalLogin: () => dispatch(makeLocalLogin(userId)),
    generateToken: formData =>
      dispatch(
        generateToken(
          formData.expiration,
          Object.keys(formData.scopes).filter(key => formData.scopes[key] === true)
        )
      ),
    setRole: role => dispatch(setRole(userId, role)),
    takeOver: userId => dispatch(takeOver(userId)),
  })
)(injectIntl(EditUser));
