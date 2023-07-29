import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { defaultMemoize } from 'reselect';

import Page from '../../components/layout/Page';
import { UserNavigation } from '../../components/layout/Navigation';
import NotVerifiedEmailCallout from '../../components/Users/NotVerifiedEmailCallout';
import Button, { TheButtonGroup } from '../../components/widgets/TheButton';
import { LocalIcon, TransferIcon, EditUserIcon } from '../../components/icons';
import { isStudentRole } from '../../components/helpers/usersRoles';
import AllowUserButtonContainer from '../../containers/AllowUserButtonContainer';
import EditUserProfileForm from '../../components/forms/EditUserProfileForm';
import EditUserSettingsForm from '../../components/forms/EditUserSettingsForm';
import EditUserUIDataForm, {
  EDITOR_FONT_SIZE_MIN,
  EDITOR_FONT_SIZE_MAX,
  EDITOR_FONT_SIZE_DEFAULT,
} from '../../components/forms/EditUserUIDataForm';
import GenerateTokenForm from '../../components/forms/GenerateTokenForm';
import EditUserRoleForm from '../../components/forms/EditUserRoleForm';
import CalendarTokens from '../../components/Users/CalendarTokens';
import Box from '../../components/widgets/Box';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';

import {
  fetchUser,
  fetchUserIfNeeded,
  updateProfile,
  updateSettings,
  updateUIData,
  makeLocalLogin,
  setRole,
} from '../../redux/modules/users';
import { getUser, isLoggedAsSuperAdmin } from '../../redux/selectors/users';
import { generateToken, takeOver } from '../../redux/modules/auth';
import { lastGeneratedToken, loggedInUserIdSelector } from '../../redux/selectors/auth';
import {
  fetchUserCalendarsIfNeeded,
  createUserCalendar,
  setUserCalendarExpired,
} from '../../redux/modules/userCalendars';
import { getUserCalendars } from '../../redux/selectors/userCalendars';

const prepareNumber = (number, min, max, defaultValue) => {
  number = Number(number);
  if (isNaN(number)) {
    return defaultValue;
  }
  return Math.max(Math.min(number, max), min);
};

const prepareUserUIDataInitialValues = defaultMemoize(
  ({
    darkTheme = true,
    vimMode = false,
    lastNameFirst = true,
    openOnDoubleclick = false,
    openedSidebar = true,
    useGravatar = true,
    defaultPage = null,
    dateFormatOverride = null,
    editorFontSize = EDITOR_FONT_SIZE_DEFAULT,
  }) => ({
    darkTheme,
    vimMode,
    lastNameFirst,
    openOnDoubleclick,
    openedSidebar,
    useGravatar,
    defaultPage: defaultPage || '',
    dateFormatOverride: dateFormatOverride || '',
    editorFontSize: prepareNumber(editorFontSize, EDITOR_FONT_SIZE_MIN, EDITOR_FONT_SIZE_MAX, EDITOR_FONT_SIZE_DEFAULT),
  })
);

const GENERATE_TOKEN_SCOPES = {
  'read-all': true,
  master: false,
  refresh: false,
};

class EditUser extends Component {
  static loadAsync = ({ userId }, dispatch) =>
    Promise.all([dispatch(fetchUserIfNeeded(userId)), dispatch(fetchUserCalendarsIfNeeded(userId))]);

  componentDidMount = () => this.props.loadAsync();

  componentDidUpdate(prevProps) {
    if (this.props.match.params.userId !== prevProps.match.params.userId) {
      this.props.loadAsync();
    }
  }

  updateProfile(data, changeNames) {
    const { updateProfile } = this.props;
    const { titlesBeforeName, firstName, lastName, titlesAfterName, ...restData } = data;
    const transformedData = changeNames ? data : restData;
    return updateProfile(transformedData);
  }

  setRole = ({ role }) => {
    const { setRole } = this.props;
    return setRole(role);
  };

  render() {
    const {
      user,
      calendars,
      loggedUserId,
      updateSettings,
      updateUIData,
      makeLocalLogin,
      isSuperAdmin,
      generateToken,
      lastToken,
      takeOver,
      refreshUser,
      createCalendar,
      setCalendarExpired,
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
              <NotVerifiedEmailCallout userId={data.id} refreshUser={refreshUser} />
            )}

            <Row>
              <Col lg={6}>
                <EditUserProfileForm
                  onSubmit={formData => this.updateProfile(formData, isSuperAdmin || !data.privateData.isExternal)}
                  initialValues={{
                    firstName: data.name.firstName,
                    lastName: data.name.lastName,
                    titlesBeforeName: data.name.titlesBeforeName,
                    titlesAfterName: data.name.titlesAfterName,
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

              {data.id === loggedUserId && (
                <Col lg={6}>
                  {data.privateData.settings && (
                    <EditUserSettingsForm
                      onSubmit={updateSettings}
                      user={data}
                      initialValues={data.privateData.settings}
                    />
                  )}

                  <EditUserUIDataForm
                    onSubmit={updateUIData}
                    initialValues={prepareUserUIDataInitialValues(data.privateData.uiData || {})}
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
              <>
                <Row>
                  <Col lg={12}>
                    <Box
                      title={<FormattedMessage id="app.editUser.icalTitle" defaultMessage="Deadlines Export to iCal" />}
                      noPadding
                      unlimitedHeight>
                      <ResourceRenderer resource={calendars}>
                        {calendars => (
                          <CalendarTokens
                            calendars={calendars}
                            create={createCalendar}
                            setExpired={setCalendarExpired}
                          />
                        )}
                      </ResourceRenderer>
                    </Box>
                  </Col>
                </Row>

                <Row>
                  <Col lg={12}>
                    <GenerateTokenForm
                      onSubmit={generateToken}
                      initialValues={{
                        expiration: '604800', // one week (in string)
                        scopes: GENERATE_TOKEN_SCOPES,
                      }}
                      lastToken={lastToken}
                    />
                  </Col>
                </Row>
              </>
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
  calendars: ImmutablePropTypes.map,
  loggedUserId: PropTypes.string.isRequired,
  isSuperAdmin: PropTypes.bool.isRequired,
  lastToken: PropTypes.string,
  loadAsync: PropTypes.func.isRequired,
  refreshUser: PropTypes.func.isRequired,
  updateProfile: PropTypes.func.isRequired,
  updateSettings: PropTypes.func.isRequired,
  updateUIData: PropTypes.func.isRequired,
  makeLocalLogin: PropTypes.func.isRequired,
  generateToken: PropTypes.func.isRequired,
  setRole: PropTypes.func.isRequired,
  takeOver: PropTypes.func.isRequired,
  createCalendar: PropTypes.func.isRequired,
  setCalendarExpired: PropTypes.func.isRequired,
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
    calendars: getUserCalendars(userId)(state),
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
    updateUIData: ({ editorFontSize, ...data }) =>
      dispatch(
        updateUIData(
          userId,
          {
            editorFontSize: prepareNumber(
              editorFontSize,
              EDITOR_FONT_SIZE_MIN,
              EDITOR_FONT_SIZE_MAX,
              EDITOR_FONT_SIZE_DEFAULT
            ),
            ...data,
          },
          false
        )
      ),
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
    createCalendar: () => dispatch(createUserCalendar(userId)),
    setCalendarExpired: calendarId => dispatch(setUserCalendarExpired(userId, calendarId)),
  })
)(EditUser);
