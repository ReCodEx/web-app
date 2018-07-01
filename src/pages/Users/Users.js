import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { push } from 'react-router-redux';
import { LinkContainer } from 'react-router-bootstrap';

import { SettingsIcon, SortedIcon, TransferIcon } from '../../components/icons';
import Button from '../../components/widgets/FlatButton';
import DeleteUserButtonContainer from '../../containers/DeleteUserButtonContainer';
import Page from '../../components/layout/Page';
import Box from '../../components/widgets/Box';
import UsersList from '../../components/Users/UsersList';
import PaginationContainer from '../../containers/PaginationContainer';
// import SearchContainer from '../../containers/SearchContainer'; TODO -- delete whole container
import {
  loggedInUserSelector,
  isLoggedAsSuperAdmin
} from '../../redux/selectors/users';
import { takeOver } from '../../redux/modules/auth';
import { searchPeople } from '../../redux/modules/search';

import withLinks from '../../helpers/withLinks';
import { getSearchQuery } from '../../redux/selectors/search';
import { selectedInstanceId } from '../../redux/selectors/auth';

const createSortingIcon = (
  colName,
  orderByColumn,
  orderByDescendant,
  setOrderBy
) =>
  <SortedIcon
    active={orderByColumn === colName}
    descendant={orderByDescendant}
    gapLeft
    onClick={() =>
      setOrderBy(
        colName,
        orderByColumn === colName ? !orderByDescendant : false
      )}
  />;

class Users extends Component {
  render() {
    const {
      instanceId,
      takeOver,
      isSuperAdmin,
      search,
      query,
      user,
      links: { EDIT_USER_URI_FACTORY, DASHBOARD_URI }
    } = this.props;

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
            iconName: 'users'
          }
        ]}
      >
        {user =>
          <div>
            <Box
              title={
                <FormattedMessage
                  id="app.users.listTitle"
                  defaultMessage="Users"
                />
              }
              unlimitedHeight
            >
              <PaginationContainer entities="users" defaultOrderBy="name">
                {({
                  data,
                  offset,
                  limit,
                  totalCount,
                  orderByColumn,
                  orderByDescendant,
                  setOrderBy
                }) =>
                  <UsersList
                    users={data}
                    loggedUserId={user.id}
                    useGravatar={user.privateData.settings.useGravatar}
                    emailColumn
                    createdAtColumn
                    heading={
                      <tr>
                        <th />
                        <th>
                          <FormattedMessage
                            id="generic.nameOfPerson"
                            defaultMessage="Name"
                          />
                          {createSortingIcon(
                            'name',
                            orderByColumn,
                            orderByDescendant,
                            setOrderBy
                          )}
                        </th>
                        <th>
                          <FormattedMessage
                            id="generic.email"
                            defaultMessage="Email"
                          />
                          {createSortingIcon(
                            'email',
                            orderByColumn,
                            orderByDescendant,
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
                            orderByDescendant,
                            setOrderBy
                          )}
                        </th>
                        <td>
                          <div className="text-muted text-right small">
                            <FormattedMessage
                              id="app.paginationContainer.showingRange"
                              defaultMessage="showing {offset}. - {offsetEnd}. (of {totalCount})"
                              values={{
                                offset: offset + 1,
                                offsetEnd: Math.min(offset + limit, totalCount),
                                totalCount
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    }
                    createActions={userId =>
                      <div>
                        <LinkContainer to={EDIT_USER_URI_FACTORY(userId)}>
                          <Button bsSize="xs" bsStyle="warning">
                            <SettingsIcon gapRight />
                            <FormattedMessage
                              id="generic.settings"
                              defaultMessage="Settings"
                            />
                          </Button>
                        </LinkContainer>
                        {isSuperAdmin &&
                          <Button
                            bsSize="xs"
                            bsStyle="primary"
                            onClick={() => takeOver(userId, DASHBOARD_URI)}
                          >
                            <TransferIcon gapRight />
                            <FormattedMessage
                              id="app.users.takeOver"
                              defaultMessage="Login as"
                            />
                          </Button>}
                        <DeleteUserButtonContainer
                          id={userId}
                          bsSize="xs"
                          resourceless={true}
                          onDeleted={() => search(instanceId)(query)}
                        />
                      </div>}
                  />}
              </PaginationContainer>
            </Box>
          </div>}
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
  search: PropTypes.func,
  query: PropTypes.string,
  user: ImmutablePropTypes.map.isRequired
};

export default withLinks(
  connect(
    state => {
      return {
        instanceId: selectedInstanceId(state),
        isSuperAdmin: isLoggedAsSuperAdmin(state),
        user: loggedInUserSelector(state),
        query: getSearchQuery('users-page')(state)
      };
    },
    dispatch => ({
      push: url => dispatch(push(url)),
      takeOver: (userId, redirectUrl) =>
        dispatch(takeOver(userId)).then(() => dispatch(push(redirectUrl))),
      search: instanceId => query =>
        dispatch(searchPeople(instanceId)('users-page', query))
    })
  )(Users)
);
