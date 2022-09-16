import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import classnames from 'classnames';
import { FormattedMessage, injectIntl } from 'react-intl';
import { defaultMemoize } from 'reselect';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';

import Admin from './Admin';
import UserPanelContainer from '../../../containers/UserPanelContainer';
import MenuTitle from '../../widgets/Sidebar/MenuTitle';
import MenuItem from '../../widgets/Sidebar/MenuItem';
import { LoadingIcon } from '../../icons';
import { isReady, getJsData } from '../../../redux/helpers/resourceManager';
import { isSupervisorRole, isEmpoweredSupervisorRole, isSuperadminRole } from '../../helpers/usersRoles';
import withLinks from '../../../helpers/withLinks';
import { getExternalIdForCAS } from '../../../helpers/cas';
import { getConfigVar } from '../../../helpers/config';

import styles from './sidebar.less';

const SKIN = getConfigVar('SKIN') || 'green';
const URL_PREFIX = getConfigVar('URL_PATH_PREFIX');

const getUserData = defaultMemoize(user => getJsData(user));

const Sidebar = ({
  pendingFetchOperations,
  isCollapsed,
  loggedInUser,
  effectiveRole = null,
  studentOf,
  supervisorOf,
  currentUrl,
  instances,
  small = false,
  links: {
    HOME_URI,
    FAQ_URL,
    LOGIN_URI,
    REGISTRATION_URI,
    DASHBOARD_URI,
    INSTANCE_URI_FACTORY,
    EXERCISES_URI,
    PIPELINES_URI,
    ARCHIVE_URI,
    SIS_INTEGRATION_URI,
  },
  location: { pathname, search },
  intl: { locale },
}) => {
  const user = getUserData(loggedInUser);
  // The following might get handy yet
  // const currentLink = pathname + search;

  return (
    <aside className={classnames(['main-sidebar', `sidebar-dark-${SKIN}`, 'elevation-4', styles.mainSidebar])}>
      <Link to={HOME_URI} className="brand-link elevation-2">
        <>
          <img
            src={`${URL_PREFIX}/public/logo-bare.png`}
            alt="ReCodEx Logo"
            className="pt-1 mr-3 brand-image almost-opaque"
          />
          <span className="brand-text">
            {pendingFetchOperations && (
              <span className={styles.mainLoadingIcon}>
                <LoadingIcon gapRight />
              </span>
            )}
            Re<b>CodEx</b>
          </span>
        </>
      </Link>

      <div className="sidebar">
        {!user && (
          <ul className="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu">
            <MenuTitle title="ReCodEx" />
            <MenuItem
              title={<FormattedMessage id="app.sidebar.menu.signIn" defaultMessage="Sign in" />}
              icon="sign-in-alt"
              currentPath={currentUrl}
              link={LOGIN_URI}
            />
            <MenuItem
              title={<FormattedMessage id="app.sidebar.menu.createAccount" defaultMessage="Create account" />}
              isActive={false}
              icon="user-plus"
              currentPath={currentUrl}
              link={REGISTRATION_URI}
            />
          </ul>
        )}

        {Boolean(user) && (
          <>
            <UserPanelContainer small={small} />
            <ul className="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu">
              <MenuTitle title={<FormattedMessage id="app.sidebar.menu.title" defaultMessage="Menu" />} />
              <MenuItem
                title={<FormattedMessage id="app.sidebar.menu.dashboard" defaultMessage="Dashboard" />}
                icon="tachometer-alt"
                currentPath={currentUrl}
                link={DASHBOARD_URI}
              />

              {instances &&
                instances.size > 0 &&
                instances
                  .toArray()
                  .filter(isReady)
                  .map(getJsData)
                  .map(({ id, name }) => (
                    <MenuItem
                      key={id}
                      title={name}
                      icon="university"
                      currentPath={currentUrl}
                      link={INSTANCE_URI_FACTORY(id)}
                    />
                  ))}

              {isSupervisorRole(effectiveRole) && (
                <MenuItem
                  title={<FormattedMessage id="app.sidebar.menu.exercises" defaultMessage="Exercises" />}
                  icon="puzzle-piece"
                  currentPath={currentUrl}
                  link={EXERCISES_URI}
                />
              )}

              {isEmpoweredSupervisorRole(effectiveRole) && (
                <MenuItem
                  title={<FormattedMessage id="app.sidebar.menu.pipelines" defaultMessage="Pipelines" />}
                  icon="random"
                  currentPath={currentUrl}
                  link={PIPELINES_URI}
                />
              )}

              <MenuItem
                title={<FormattedMessage id="app.sidebar.menu.archive" defaultMessage="Archive" />}
                icon="archive"
                currentPath={currentUrl}
                link={ARCHIVE_URI}
              />

              {Boolean(getExternalIdForCAS(user)) && (
                <MenuItem
                  icon="id-badge"
                  title={<FormattedMessage id="app.sidebar.menu.admin.sis" defaultMessage="SIS Integration" />}
                  currentPath={currentUrl}
                  link={SIS_INTEGRATION_URI}
                />
              )}

              <MenuItem
                title={<FormattedMessage id="app.sidebar.menu.faq" defaultMessage="FAQ" />}
                icon={['far', 'question-circle']}
                link={FAQ_URL}
                currentPath={currentUrl}
              />
            </ul>
          </>
        )}

        {isSuperadminRole(effectiveRole) && <Admin currentUrl={currentUrl} />}
      </div>
    </aside>
  );
};

Sidebar.propTypes = {
  pendingFetchOperations: PropTypes.bool,
  isCollapsed: PropTypes.bool,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
    search: PropTypes.string.isRequired,
  }).isRequired,
  loggedInUser: ImmutablePropTypes.map,
  effectiveRole: PropTypes.string,
  studentOf: ImmutablePropTypes.map,
  supervisorOf: ImmutablePropTypes.map,
  currentUrl: PropTypes.string,
  instances: ImmutablePropTypes.list,
  small: PropTypes.bool,
  links: PropTypes.object,
  intl: PropTypes.object,
};

export default withLinks(withRouter(injectIntl(Sidebar)));
