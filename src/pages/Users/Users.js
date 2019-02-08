import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { push } from 'react-router-redux';
import { Row, Col } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { defaultMemoize } from 'reselect';

import { SettingsIcon, TransferIcon, BanIcon } from '../../components/icons';
import Button from '../../components/widgets/FlatButton';
import DeleteUserButtonContainer from '../../containers/DeleteUserButtonContainer';
import AllowUserButtonContainer from '../../containers/AllowUserButtonContainer';
import Page from '../../components/layout/Page';
import Box from '../../components/widgets/Box';
import UsersList from '../../components/Users/UsersList';
import PaginationContainer, {
  createSortingIcon,
  showRangeInfo,
} from '../../containers/PaginationContainer';
import FilterUsersListForm from '../../components/forms/FilterUsersListForm';
import {
  loggedInUserSelector,
  isLoggedAsSuperAdmin,
} from '../../redux/selectors/users';
import { takeOver } from '../../redux/modules/auth';
import { selectedInstanceId } from '../../redux/selectors/auth';

import withLinks from '../../helpers/withLinks';
import {
  knownRoles,
  isSupervisorRole,
  isStudentRole,
} from '../../components/helpers/usersRoles.js';

const filterInitialValues = defaultMemoize(({ search = '', roles = [] }) => {
  const initials = { search, roles: {} };
  knownRoles.forEach(role => (initials.roles[role] = false));
  roles.forEach(role => (initials.roles[role] = true));
  return initials;
});

const transformAndSetFilterData = defaultMemoize(
  setFilters => ({ search, roles }) => {
    const data = {
      search: search.trim(),
      roles: Object.keys(roles).filter(role => roles[role]),
    };
    if (!data.search) {
      delete data.search;
    }
    return setFilters(data);
  }
);

class Users extends Component {
  filtersCreator = (filters, setFilters) => (
    <FilterUsersListForm
      onSubmit={setFilters ? transformAndSetFilterData(setFilters) : null}
      initialValues={filterInitialValues(filters)}
    />
  );

  headingCreator = ({
    offset,
    limit,
    totalCount,
    orderByColumn,
    orderByDescending,
    setOrderBy,
  }) => (
    <tr>
      <th />
      <th>
        <FormattedMessage id="generic.nameOfPerson" defaultMessage="Name" />
        {createSortingIcon(
          'name',
          orderByColumn,
          orderByDescending,
          setOrderBy
        )}
      </th>
      <th>
        <FormattedMessage id="generic.email" defaultMessage="Email" />
        {createSortingIcon(
          'email',
          orderByColumn,
          orderByDescending,
          setOrderBy
        )}
      </th>
      <th>
        <FormattedMessage
          id="app.users.userCreatedAt"
          defaultMessage="User created"
        />
        {createSortingIcon(
          'createdAt',
          orderByColumn,
          orderByDescending,
          setOrderBy
        )}
      </th>
      <td>{showRangeInfo(offset, limit, totalCount)}</td>
    </tr>
  );

  createActions = defaultMemoize(reload => ({ id, privateData }) => {
    const {
      takeOver,
      isSuperAdmin,
      links: { EDIT_USER_URI_FACTORY, DASHBOARD_URI },
    } = this.props;
    return (
      isSuperAdmin && (
        <div>
          {privateData && privateData.isAllowed && (
            <Button
              bsSize="xs"
              bsStyle="primary"
              onClick={() => takeOver(id, DASHBOARD_URI)}>
              <TransferIcon gapRight />
              <FormattedMessage
                id="app.users.takeOver"
                defaultMessage="Login as"
              />
            </Button>
          )}

          <LinkContainer to={EDIT_USER_URI_FACTORY(id)}>
            <Button bsSize="xs" bsStyle="warning">
              <SettingsIcon gapRight />
              <FormattedMessage
                id="generic.settings"
                defaultMessage="Settings"
              />
            </Button>
          </LinkContainer>

          <AllowUserButtonContainer id={id} bsSize="xs" />

          <DeleteUserButtonContainer
            id={id}
            bsSize="xs"
            resourceless={true}
            onDeleted={reload}
          />
        </div>
      )
    );
  });

  render() {
    const { user } = this.props;

    return (
      <Page
        title={
          <FormattedMessage id="app.users.title" defaultMessage="User list" />
        }
        resource={user}
        description={
          <FormattedMessage
            id="app.users.description"
            defaultMessage="Browse all ReCodEx users."
          />
        }
        breadcrumbs={[
          {
            text: (
              <FormattedMessage id="app.users.users" defaultMessage="Users" />
            ),
            iconName: 'users',
          },
        ]}>
        {user => (
          <div>
            {(!isSupervisorRole(user.privateData.role) ||
              isStudentRole(user.privateData.role)) && (
              <Row>
                <Col sm={12}>
                  <p className="callout callout-warning larger">
                    <BanIcon gapRight />
                    <FormattedMessage
                      id="generic.accessDenied"
                      defaultMessage="You do not have permissions to see this page. If you got to this page via a seemingly legitimate link or button, please report a bug."
                    />
                  </p>
                </Col>
              </Row>
            )}

            {isSupervisorRole(user.privateData.role) &&
              !isStudentRole(user.privateData.role) && (
                <Box
                  title={
                    <FormattedMessage
                      id="app.users.listTitle"
                      defaultMessage="Users"
                    />
                  }
                  unlimitedHeight>
                  <div>
                    <PaginationContainer
                      id="users-all"
                      endpoint="users"
                      defaultOrderBy="name"
                      filtersCreator={this.filtersCreator}>
                      {({
                        data,
                        offset,
                        limit,
                        totalCount,
                        orderByColumn,
                        orderByDescending,
                        setOrderBy,
                        reload,
                      }) => (
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
  push: PropTypes.func.isRequired,
  links: PropTypes.object.isRequired,
  takeOver: PropTypes.func.isRequired,
  isSuperAdmin: PropTypes.bool,
  user: ImmutablePropTypes.map.isRequired,
};

export default withLinks(
  connect(
    state => {
      return {
        instanceId: selectedInstanceId(state),
        isSuperAdmin: isLoggedAsSuperAdmin(state),
        user: loggedInUserSelector(state),
      };
    },
    dispatch => ({
      push: url => dispatch(push(url)),
      takeOver: (userId, redirectUrl) =>
        dispatch(takeOver(userId)).then(() => dispatch(push(redirectUrl))),
    })
  )(Users)
);
