import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Row, Col, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { defaultMemoize } from 'reselect';

import App from '../../containers/App';
import { SettingsIcon, TransferIcon, BanIcon, UserIcon } from '../../components/icons';
import Button from '../../components/widgets/TheButton';
import DeleteUserButtonContainer from '../../containers/DeleteUserButtonContainer';
import AllowUserButtonContainer from '../../containers/AllowUserButtonContainer';
import Page from '../../components/layout/Page';
import Box from '../../components/widgets/Box';
import Callout from '../../components/widgets/Callout';
import UsersList from '../../components/Users/UsersList';
import PaginationContainer, { createSortingIcon, showRangeInfo } from '../../containers/PaginationContainer';
import FilterUsersListForm from '../../components/forms/FilterUsersListForm';
import CreateUserForm from '../../components/forms/CreateUserForm';
import { loggedInUserSelector, isLoggedAsSuperAdmin, getLoggedInUserEffectiveRole } from '../../redux/selectors/users';
import { takeOver } from '../../redux/modules/auth';
import { selectedInstanceId } from '../../redux/selectors/auth';
import { createAccount } from '../../redux/modules/registration';
import { fetchPaginated } from '../../redux/modules/pagination';

import withLinks from '../../helpers/withLinks';
import { knownRoles, isSupervisorRole, isStudentRole, isSuperadminRole } from '../../components/helpers/usersRoles.js';

const filterInitialValues = defaultMemoize(({ search = '', roles = [] }) => {
  const initials = { search, roles: {} };
  knownRoles.forEach(role => (initials.roles[role] = false));
  roles.forEach(role => (initials.roles[role] = true));
  return initials;
});

const transformAndSetFilterData = defaultMemoize(setFilters => ({ search, roles }) => {
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
};

const PAGINATION_CONTAINER_ID = 'users-all';
const PAGINATION_CONTAINER_ENDPOINT = 'users';

class Users extends Component {
  state = { dialogOpen: false };

  openDialog = () => this.setState({ dialogOpen: true });

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

  createActions = defaultMemoize(reload => ({ id, privateData }) => {
    const {
      takeOver,
      isSuperAdmin,
      history: { push },
      links: { EDIT_USER_URI_FACTORY, DASHBOARD_URI },
    } = this.props;
    return (
      isSuperAdmin && (
        <div>
          {privateData && privateData.isAllowed && (
            <Button
              size="xs"
              variant="primary"
              onClick={() =>
                takeOver(id).then(() => {
                  App.ignoreNextLocationChange();
                  push(DASHBOARD_URI);
                })
              }>
              <TransferIcon gapRight />
              <FormattedMessage id="app.users.takeOver" defaultMessage="Login as" />
            </Button>
          )}

          <Link to={EDIT_USER_URI_FACTORY(id)}>
            <Button size="xs" variant="warning">
              <SettingsIcon gapRight />
              <FormattedMessage id="generic.settings" defaultMessage="Settings" />
            </Button>
          </Link>

          <AllowUserButtonContainer id={id} size="xs" />

          <DeleteUserButtonContainer id={id} size="xs" resourceless={true} onDeleted={reload} />
        </div>
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

    return createUser(data, instanceId).then(() => {
      this.closeDialog();
      return reloadPagination(locale);
    });
  };

  render() {
    const { user, effectiveRole } = this.props;

    return (
      <Page
        title={<FormattedMessage id="app.users.title" defaultMessage="User list" />}
        resource={user}
        description={<FormattedMessage id="app.users.description" defaultMessage="Browse all ReCodEx users." />}
        breadcrumbs={[
          {
            text: <FormattedMessage id="app.users.users" defaultMessage="Users" />,
            iconName: 'users',
          },
        ]}>
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
                        <UserIcon gapRight />
                        <FormattedMessage id="app.users.createUser" defaultMessage="Create User" />
                      </Button>

                      <Modal show={this.state.dialogOpen} backdrop="static" onHide={this.closeDialog} size="xl">
                        <Modal.Header closeButton>
                          <Modal.Title>
                            <FormattedMessage id="app.users.createUser" defaultMessage="Create User" />
                          </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                          <CreateUserForm
                            onSubmit={this.createNewUserAccount}
                            initialValues={createUserInitialValues}
                          />
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
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
  }),
  instanceId: PropTypes.string,
  isSuperAdmin: PropTypes.bool,
  user: ImmutablePropTypes.map,
  effectiveRole: PropTypes.string,
  takeOver: PropTypes.func.isRequired,
  createUser: PropTypes.func.isRequired,
  reloadPagination: PropTypes.func.isRequired,
  links: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired,
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
      createUser: ({ firstName, lastName, email, password, passwordConfirm }, instanceId) =>
        dispatch(createAccount(firstName, lastName, email, password, passwordConfirm, instanceId, true)), // true = skip auth changes
      reloadPagination: locale =>
        dispatch(fetchPaginated(PAGINATION_CONTAINER_ID, PAGINATION_CONTAINER_ENDPOINT)(locale, null, null, true)), // true = force invalidate
    })
  )(injectIntl(Users))
);
