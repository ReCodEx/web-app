import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { push } from 'react-router-redux';
import { LinkContainer } from 'react-router-bootstrap';

import FetchManyResourceRenderer from '../../components/helpers/FetchManyResourceRenderer';
import { SettingsIcon, TransferIcon } from '../../components/icons';
import Button from '../../components/widgets/FlatButton';
import DeleteUserButtonContainer from '../../containers/DeleteUserButtonContainer';
import PageContent from '../../components/layout/PageContent';
import Box from '../../components/widgets/Box';
import UsersList from '../../components/Users/UsersList';
import SearchContainer from '../../containers/SearchContainer';
import {
  fetchManyStatus,
  loggedInUserSelector,
  isLoggedAsSuperAdmin
} from '../../redux/selectors/users';
import { fetchAllUsers } from '../../redux/modules/users';
import { takeOver } from '../../redux/modules/auth';
import { searchPeople } from '../../redux/modules/search';

import withLinks from '../../helpers/withLinks';

class Users extends Component {
  static loadAsync = (params, dispatch) => dispatch(fetchAllUsers);

  componentWillMount() {
    this.props.loadAsync();
  }

  render() {
    const {
      links: { EDIT_USER_URI_FACTORY, DASHBOARD_URI },
      takeOver,
      isSuperAdmin,
      fetchStatus,
      search,
      user
    } = this.props;

    return (
      <FetchManyResourceRenderer
        fetchManyStatus={fetchStatus}
        loading={
          <PageContent
            title={
              <FormattedMessage
                id="app.page.users.loading"
                defaultMessage="Loading list of users ..."
              />
            }
            description={
              <FormattedMessage
                id="app.page.users.loadingDescription"
                defaultMessage="Please wait while we are getting the list of users ready."
              />
            }
          />
        }
        failed={
          <PageContent
            title={
              <FormattedMessage
                id="app.page.users.failed"
                defaultMessage="Cannot load the list of users"
              />
            }
            description={
              <FormattedMessage
                id="app.page.users.failedDescription"
                defaultMessage="We are sorry for the inconvenience, please try again later."
              />
            }
          />
        }
      >
        {() =>
          <PageContent
            title={
              <FormattedMessage
                id="app.users.title"
                defaultMessage="User list"
              />
            }
            description={
              <FormattedMessage
                id="app.users.description"
                defaultMessage="Browse all ReCodEx users."
              />
            }
            breadcrumbs={[
              {
                text: (
                  <FormattedMessage
                    id="app.users.users"
                    defaultMessage="Users"
                  />
                ),
                iconName: 'users'
              }
            ]}
          >
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
                <SearchContainer
                  type="users"
                  id="users-page"
                  search={search(user.toJS().data.privateData.instanceId)}
                  showAllOnEmptyQuery={true}
                  renderList={users =>
                    <UsersList
                      users={users}
                      createActions={userId =>
                        <div>
                          <LinkContainer to={EDIT_USER_URI_FACTORY(userId)}>
                            <Button bsSize="xs">
                              <SettingsIcon />{' '}
                              <FormattedMessage
                                id="app.users.settings"
                                defaultMessage="Settings"
                              />
                            </Button>
                          </LinkContainer>
                          {isSuperAdmin &&
                            <Button
                              bsSize="xs"
                              onClick={() => takeOver(userId, DASHBOARD_URI)}
                            >
                              <TransferIcon />{' '}
                              <FormattedMessage
                                id="app.users.takeOver"
                                defaultMessage="Login as"
                              />
                            </Button>}
                          <DeleteUserButtonContainer id={userId} bsSize="xs" />
                        </div>}
                    />}
                />
              </Box>
            </div>
          </PageContent>}
      </FetchManyResourceRenderer>
    );
  }
}

Users.propTypes = {
  loadAsync: PropTypes.func.isRequired,
  push: PropTypes.func.isRequired,
  links: PropTypes.object.isRequired,
  takeOver: PropTypes.func.isRequired,
  isSuperAdmin: PropTypes.bool,
  fetchStatus: PropTypes.string,
  search: PropTypes.func,
  user: ImmutablePropTypes.map.isRequired
};

export default withLinks(
  connect(
    state => {
      return {
        isSuperAdmin: isLoggedAsSuperAdmin(state),
        fetchStatus: fetchManyStatus(state),
        user: loggedInUserSelector(state)
      };
    },
    dispatch => ({
      push: url => dispatch(push(url)),
      loadAsync: () => Users.loadAsync({}, dispatch),
      takeOver: (userId, redirectUrl) =>
        dispatch(takeOver(userId)).then(() => dispatch(push(redirectUrl))),
      search: instanceId => query =>
        dispatch(searchPeople(instanceId)('users-page', query))
    })
  )(Users)
);
