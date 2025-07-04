import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { lruMemoize } from 'reselect';

import Page from '../../components/layout/Page';
import { UserNavigation } from '../../components/layout/Navigation';
import NotVerifiedEmailCallout from '../../components/Users/NotVerifiedEmailCallout';
import Button, { TheButtonGroup } from '../../components/widgets/TheButton';
import { LocalIcon, TransferIcon, EditUserIcon } from '../../components/icons';
import { isStudentRole } from '../../components/helpers/usersRoles.js';
import AllowUserButtonContainer from '../../containers/AllowUserButtonContainer';
import EditUserProfileForm, {
  prepareInitialValues as prepareUserProfileValues,
} from '../../components/forms/EditUserProfileForm';
import EditUserSettingsForm from '../../components/forms/EditUserSettingsForm';
import EditUserUIDataForm, {
  EDITOR_FONT_SIZE_MIN,
  EDITOR_FONT_SIZE_MAX,
  EDITOR_FONT_SIZE_DEFAULT,
} from '../../components/forms/EditUserUIDataForm';
import GenerateTokenForm, { initialValues } from '../../components/forms/GenerateTokenForm';
import EditUserRoleForm, {
  prepareInitialValues as prepareUserRoleValues,
} from '../../components/forms/EditUserRoleForm';
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
} from '../../redux/modules/users.js';
import { getUser, isLoggedAsSuperAdmin } from '../../redux/selectors/users.js';
import { generateToken, takeOver } from '../../redux/modules/auth.js';
import { lastGeneratedToken, loggedInUserIdSelector } from '../../redux/selectors/auth.js';
import {
  fetchUserCalendarsIfNeeded,
  createUserCalendar,
  setUserCalendarExpired,
} from '../../redux/modules/userCalendars.js';
import { getUserCalendars } from '../../redux/selectors/userCalendars.js';
import { EMPTY_OBJ } from '../../helpers/common.js';

const prepareNumber = (number, min, max, defaultValue) => {
  number = Number(number);
  if (isNaN(number)) {
    return defaultValue;
  }
  return Math.max(Math.min(number, max), min);
};

const prepareUserUIDataInitialValues = lruMemoize(
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

class EditUser extends Component {
  constructor(props) {
    super(props);
    this.user = null;
  }

  static loadAsync = ({ userId }, dispatch) =>
    Promise.all([dispatch(fetchUserIfNeeded(userId)), dispatch(fetchUserCalendarsIfNeeded(userId))]);

  componentDidMount() {
    this.setState({ mounted: true });
    this.props.loadAsync();
  }

  componentDidUpdate(prevProps) {
    if (this.props.params.userId !== prevProps.params.userId) {
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
                      <LocalIcon gapRight={2} />
                      <FormattedMessage id="app.editUser.makeLocal" defaultMessage="Create local account" />
                    </Button>
                  )}

                  {isSuperAdmin && data.id !== loggedUserId && data.privateData.isAllowed && (
                    <Button variant="primary" onClick={() => takeOver(data.id)}>
                      <TransferIcon gapRight={2} />
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
                  initialValues={prepareUserProfileValues(data)}
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
                    initialValues={prepareUserUIDataInitialValues(data.privateData.uiData || EMPTY_OBJ)}
                  />
                </Col>
              )}

              {isSuperAdmin && data.id !== loggedUserId && data.privateData && (
                <Col lg={6}>
                  <EditUserRoleForm
                    currentRole={data.privateData.role}
                    initialValues={prepareUserRoleValues(data)}
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
                      title={<FormattedMessage id="app.editUser.iCalTitle" defaultMessage="Deadlines Export to iCal" />}
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
                    <GenerateTokenForm onSubmit={generateToken} initialValues={initialValues} lastToken={lastToken} />
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
  params: PropTypes.shape({ userId: PropTypes.string.isRequired }).isRequired,
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
  (state, { params: { userId } }) => ({
    user: getUser(userId)(state),
    loggedUserId: loggedInUserIdSelector(state),
    isSuperAdmin: isLoggedAsSuperAdmin(state),
    lastToken: lastGeneratedToken(state),
    calendars: getUserCalendars(userId)(state),
  }),
  (dispatch, { params: { userId } }) => ({
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
      dispatch(generateToken(formData.expiration, formData.refresh ? [formData.scope, 'refresh'] : [formData.scope])),
    setRole: role => dispatch(setRole(userId, role)),
    takeOver: userId => dispatch(takeOver(userId)),
    createCalendar: () => dispatch(createUserCalendar(userId)),
    setCalendarExpired: calendarId => dispatch(setUserCalendarExpired(userId, calendarId)),
  })
)(EditUser);
