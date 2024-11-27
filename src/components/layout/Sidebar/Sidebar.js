import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { lruMemoize } from 'reselect';
import { Link } from 'react-router-dom';

import UserPanelContainer from '../../../containers/UserPanelContainer';
import UserSwitchingContainer from '../../../containers/UserSwitchingContainer';

import MenuTitle from '../../widgets/Sidebar/MenuTitle';
import MenuItem from '../../widgets/Sidebar/MenuItem';
import { LoadingIcon } from '../../icons';
import { isReady, getJsData } from '../../../redux/helpers/resourceManager';
import { isSupervisorRole, isEmpoweredSupervisorRole, isSuperadminRole } from '../../helpers/usersRoles.js';
import withLinks from '../../../helpers/withLinks.js';
import { getExternalIdForCAS } from '../../../helpers/cas.js';
import { getConfigVar } from '../../../helpers/config.js';
import Admin from './Admin.js';

import * as styles from './sidebar.less';

const URL_PREFIX = getConfigVar('URL_PATH_PREFIX');

const getUserData = lruMemoize(user => getJsData(user));

const Sidebar = ({
  pendingFetchOperations,
  loggedInUser,
  effectiveRole = null,
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
}) => {
  const user = getUserData(loggedInUser);

  return (
    <aside className={`app-sidebar bg-body-secondary shadow ${styles.mainSidebar}`} data-bs-theme="dark">
      <div className="sidebar-brand">
        <Link to={HOME_URI} className="brand-link me-5">
          <>
            <img
              src={`${URL_PREFIX}/public/logo-bare.png`}
              alt="ReCodEx Logo"
              className="pt-1 me-2 brand-image opacity-75"
            />
            <span className="brand-text">
              {pendingFetchOperations && (
                <span className={styles.mainLoadingIcon}>
                  <LoadingIcon gapRight={2} />
                </span>
              )}
              Re<b>CodEx</b>
            </span>
          </>
        </Link>
      </div>

      <div className="sticky-top shadow border-bottom bg-body-secondary py-2">
        <UserPanelContainer small={small} />
      </div>

      <div className="sidebar-wrapper">
        <div data-overlayscrollbars-viewport="scrollbarHidden">
          <nav className="mt-2">
            {!user && (
              <ul
                className="nav nav-pills sidebar-menu flex-column"
                data-lte-toggle="treeview"
                role="menu"
                data-accordion="false">
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
                <UserSwitchingContainer open={true} />

                <ul
                  className="nav nav-pills sidebar-menu flex-column"
                  data-lte-toggle="treeview"
                  role="menu"
                  data-accordion="false">
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
          </nav>
        </div>
      </div>
    </aside>
  );
};

Sidebar.propTypes = {
  pendingFetchOperations: PropTypes.bool,
  loggedInUser: ImmutablePropTypes.map,
  effectiveRole: PropTypes.string,
  currentUrl: PropTypes.string,
  instances: ImmutablePropTypes.list,
  small: PropTypes.bool,
  links: PropTypes.object,
};

export default withLinks(Sidebar);
