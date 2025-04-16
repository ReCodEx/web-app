import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Row, Col, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { lruMemoize } from 'reselect';

import { SettingsIcon, TransferIcon, BanIcon, SuccessIcon, UserIcon } from '../../components/icons';
import Button, { TheButtonGroup } from '../../components/widgets/TheButton';
import DeleteUserButtonContainer from '../../containers/DeleteUserButtonContainer';
import AllowUserButtonContainer from '../../containers/AllowUserButtonContainer';
import Page from '../../components/layout/Page';
import Box from '../../components/widgets/Box';
import Callout from '../../components/widgets/Callout';
import UsersList from '../../components/Users/UsersList';
import PaginationContainer, { createSortingIcon, showRangeInfo } from '../../containers/PaginationContainer';
import FilterUsersListForm from '../../components/forms/FilterUsersListForm';
import CreateUserForm from '../../components/forms/CreateUserForm';
import {
  loggedInUserSelector,
  isLoggedAsSuperAdmin,
  getLoggedInUserEffectiveRole,
} from '../../redux/selectors/users.js';
import { takeOver } from '../../redux/modules/auth.js';
import { selectedInstanceId } from '../../redux/selectors/auth.js';
import { createAccount } from '../../redux/modules/registration.js';
import { fetchPaginated } from '../../redux/modules/pagination.js';

import { knownRoles, isSupervisorRole, isStudentRole, isSuperadminRole } from '../../components/helpers/usersRoles.js';
import withLinks from '../../helpers/withLinks.js';
import { withRouterProps } from '../../helpers/withRouter.js';
import { suspendAbortPendingRequestsOptimization } from '../../pages/routes.js';
import { EMPTY_ARRAY } from '../../helpers/common.js';

const filterInitialValues = lruMemoize(({ search = '', roles = [] }) => {
  const initials = { search, roles: {} };
  knownRoles.forEach(role => (initials.roles[role] = false));
  roles.forEach(role => (initials.roles[role] = true));
  return initials;
});

const transformAndSetFilterData = lruMemoize(setFilters => ({ search, roles }) => {
  const data = {
    search: search.trim(),
    roles: Object.keys(roles).filter(role => roles[role]),
  };
  if (!data.search) {
    delete data.search;
  }
  return setFilters(data);
});

const createUserInitialValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  passwordConfirm: '',
  ignoreNameCollision: undefined,
};

const PAGINATION_CONTAINER_ID = 'users-all';
const PAGINATION_CONTAINER_ENDPOINT = 'users';

class Users extends Component {
  state = { dialogOpen: false, userCreated: false, matchingUsers: EMPTY_ARRAY };

  openDialog = () => this.setState({ dialogOpen: true, userCreated: false, matchingUsers: EMPTY_ARRAY });

  closeDialog = () => this.setState({ dialogOpen: false });

  filtersCreator = (filters, setFilters) => (
    <FilterUsersListForm
      onSubmit={setFilters ? transformAndSetFilterData(setFilters) : null}
      initialValues={filterInitialValues(filters)}
    />
  );

  headingCreator = ({ offset, limit, totalCount, orderByColumn, orderByDescending, setOrderBy }) => (
    <tr>
      <th />
      <th>
        <FormattedMessage id="generic.nameOfPerson" defaultMessage="Name" />
        {createSortingIcon('name', orderByColumn, orderByDescending, setOrderBy)}
      </th>
      <th>
        <FormattedMessage id="generic.email" defaultMessage="Email" />
        {createSortingIcon('email', orderByColumn, orderByDescending, setOrderBy)}
      </th>
      <th>
        <FormattedMessage id="app.users.userCreatedAt" defaultMessage="User created" />
        {createSortingIcon('createdAt', orderByColumn, orderByDescending, setOrderBy)}
      </th>
      <td>{showRangeInfo(offset, limit, totalCount)}</td>
    </tr>
  );

  // eslint-disable-next-line react/prop-types
  createActions = lruMemoize(reload => ({ id, privateData }) => {
    const {
      takeOver,
      isSuperAdmin,
      navigate,
      links: { EDIT_USER_URI_FACTORY, DASHBOARD_URI },
    } = this.props;
    return (
      isSuperAdmin && (
        <TheButtonGroup>
          {
            // eslint-disable-next-line react/prop-types
            privateData && privateData.isAllowed && (
              <Button
                size="xs"
                variant="primary"
                onClick={() =>
                  takeOver(id).then(() => {
                    suspendAbortPendingRequestsOptimization();
                    navigate(DASHBOARD_URI);
                  })
                }>
                <TransferIcon gapRight={2} />
                <FormattedMessage id="app.users.takeOver" defaultMessage="Login as" />
              </Button>
            )
          }

          <Link to={EDIT_USER_URI_FACTORY(id)}>
            <Button size="xs" variant="warning">
              <SettingsIcon gapRight={2} />
              <FormattedMessage id="generic.settings" defaultMessage="Settings" />
            </Button>
          </Link>

          <AllowUserButtonContainer id={id} size="xs" />

          <DeleteUserButtonContainer id={id} size="xs" resourceless={true} onDeleted={reload} />
        </TheButtonGroup>
      )
    );
  });

  createNewUserAccount = data => {
    const {
      instanceId,
      createUser,
      reloadPagination,
      intl: { locale },
    } = this.props;

    return createUser(data, instanceId).then(({ value: { user, usersWithSameName = null } }) => {
      if (user) {
        this.setState({ userCreated: true, matchingUsers: EMPTY_ARRAY });
        reloadPagination(locale);
        return true;
      } else {
        this.setState({ matchingUsers: usersWithSameName });
        return false;
      }
    });
  };

  render() {
    const { user, effectiveRole } = this.props;

    return (
      <Page
        icon="user-friends"
        title={<FormattedMessage id="app.users.title" defaultMessage="List of All Users" />}
        resource={user}>
        {user => (
          <div>
            {(!isSupervisorRole(effectiveRole) || isStudentRole(effectiveRole)) && (
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

            {isSupervisorRole(effectiveRole) && !isStudentRole(effectiveRole) && (
              <Box
                title={<FormattedMessage id="app.users.listTitle" defaultMessage="Users" />}
                unlimitedHeight
                footer={
                  isSuperadminRole(effectiveRole) ? (
                    <div className="text-center">
                      <Button variant="success" onClick={this.openDialog}>
                        <UserIcon gapRight={2} />
                        <FormattedMessage id="app.users.createUser" defaultMessage="Create User" />
                      </Button>

                      <Modal show={this.state.dialogOpen} backdrop="static" onHide={this.closeDialog} size="xl">
                        <Modal.Header closeButton>
                          <Modal.Title>
                            <FormattedMessage id="app.users.createUser" defaultMessage="Create User" />
                          </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                          {this.state.userCreated ? (
                            <Callout variant="success" className="mb-4">
                              <p>
                                <FormattedMessage
                                  id="app.users.createUser.userCreated"
                                  defaultMessage="The user account was created."
                                />
                              </p>
                              <div className="text-end">
                                <Button onClick={this.closeDialog} variant="success">
                                  <SuccessIcon gapRight={2} />
                                  <FormattedMessage id="generic.close" defaultMessage="Close" />
                                </Button>
                              </div>
                            </Callout>
                          ) : (
                            <CreateUserForm
                              onSubmit={this.createNewUserAccount}
                              initialValues={createUserInitialValues}
                              matchingUsers={this.state.matchingUsers}
                            />
                          )}
                        </Modal.Body>
                      </Modal>
                    </div>
                  ) : undefined
                }>
                <div>
                  <PaginationContainer
                    id={PAGINATION_CONTAINER_ID}
                    endpoint={PAGINATION_CONTAINER_ENDPOINT}
                    defaultOrderBy="name"
                    filtersCreator={this.filtersCreator}>
                    {({ data, offset, limit, totalCount, orderByColumn, orderByDescending, setOrderBy, reload }) => (
                      <UsersList
                        users={data}
                        loggedUserId={user.id}
                        emailColumn
                        createdAtColumn
                        heading={this.headingCreator({
                          offset,
                          limit,
                          totalCount,
                          orderByColumn,
                          orderByDescending,
                          setOrderBy,
                        })}
                        createActions={this.createActions(reload)}
                      />
                    )}
                  </PaginationContainer>
                </div>
              </Box>
            )}
          </div>
        )}
      </Page>
    );
  }
}

Users.propTypes = {
  instanceId: PropTypes.string,
  isSuperAdmin: PropTypes.bool,
  user: ImmutablePropTypes.map,
  effectiveRole: PropTypes.string,
  takeOver: PropTypes.func.isRequired,
  createUser: PropTypes.func.isRequired,
  reloadPagination: PropTypes.func.isRequired,
  links: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired,
  navigate: withRouterProps.navigate,
};

export default withLinks(
  connect(
    state => {
      return {
        instanceId: selectedInstanceId(state),
        isSuperAdmin: isLoggedAsSuperAdmin(state),
        user: loggedInUserSelector(state),
        effectiveRole: getLoggedInUserEffectiveRole(state),
      };
    },
    dispatch => ({
      takeOver: userId => dispatch(takeOver(userId)),
      createUser: ({ firstName, lastName, email, password, passwordConfirm, ignoreNameCollision }, instanceId) =>
        dispatch(
          createAccount(
            { firstName, lastName, email, password, passwordConfirm, ignoreNameCollision, instanceId },
            true // create by superadmin
          )
        ), // true = skip auth changes
      reloadPagination: locale =>
        dispatch(fetchPaginated(PAGINATION_CONTAINER_ID, PAGINATION_CONTAINER_ENDPOINT)(locale, null, null, true)), // true = force invalidate
    })
  )(injectIntl(Users))
);
