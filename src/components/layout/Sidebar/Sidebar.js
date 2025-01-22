import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage, injectIntl } from 'react-intl';
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
import { EMPTY_ARRAY } from '../../../helpers/common.js';
import Admin from './Admin.js';

import './sidebar.css';

const URL_PREFIX = getConfigVar('URL_PATH_PREFIX');

const getUserData = lruMemoize(user => getJsData(user));

const processInstances = lruMemoize(instances =>
  instances && instances.size > 0 ? instances.toArray().filter(isReady).map(getJsData) : EMPTY_ARRAY
);

const _getCaption = (caption, locale) =>
  typeof caption === 'string'
    ? caption
    : caption && typeof caption === 'object'
      ? caption[locale] || caption.en || caption[Object.keys(caption)[0]]
      : '??';

const getExtensions = lruMemoize((instances, locale) => {
  const exts = [];
  processInstances(instances).forEach(({ id, extensions = {} }) =>
    Object.keys(extensions).forEach(extension =>
      exts.push({ extension, caption: _getCaption(extensions[extension], locale), instance: id })
    )
  );
  exts.sort((a, b) => a.caption.localeCompare(b.caption));
  return exts;
});

const extensionClickHandler = lruMemoize(fetchExtensionUrl => ev => {
  ev.preventDefault();
  if (window) {
    const extension = ev.currentTarget.dataset.extension;
    const instance = ev.currentTarget.dataset.instance;
    const locale = ev.currentTarget.dataset.locale;
    const returnUrl = window.location.href;
    fetchExtensionUrl(extension, instance, locale, returnUrl).then(
      ({ value: url }) => url && window.location.assign(url)
    );
  }
});

const Sidebar = ({
  pendingFetchOperations,
  loggedInUser,
  effectiveRole = null,
  currentUrl,
  instances,
  fetchExtensionUrl,
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
  intl: { locale },
}) => {
  const user = getUserData(loggedInUser);

  return (
    <aside className="app-sidebar bg-body-secondary shadow" data-bs-theme="dark">
      <div className="sidebar-brand">
        <Link to={HOME_URI} className="brand-link me-5">
          <>
            {window && window.recodexmas ? (
              <span className="me-1 brand-image fs-2">🎄</span>
            ) : (
              <img
                src={`${URL_PREFIX}/public/logo-bare.png`}
                alt="ReCodEx Logo"
                className="pt-1 me-2 brand-image opacity-75"
              />
            )}
            <span className="brand-text">
              {pendingFetchOperations && (
                <span className="brand-loading">
                  <LoadingIcon gapRight={2} />
                </span>
              )}
              Re<b>CodEx</b>
            </span>
          </>
        </Link>
      </div>

      {Boolean(loggedInUser) && (
        <div className="sticky-top shadow border-bottom bg-body-secondary py-2">
          <UserPanelContainer />
        </div>
      )}

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

                  {processInstances(instances).map(({ id, name }) => (
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
                      title={
                        <FormattedMessage id="app.sidebar.menu.admin.sis" defaultMessage="SIS Integration [old]" />
                      }
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

            {getExtensions(instances, locale).length > 0 && (
              <ul
                className="nav nav-pills sidebar-menu flex-column"
                data-lte-toggle="treeview"
                role="menu"
                data-accordion="false">
                <MenuTitle title={<FormattedMessage id="app.sidebar.menu.extensions" defaultMessage="Extensions" />} />

                {getExtensions(instances, locale).map(({ extension, caption, instance }) => (
                  <MenuItem
                    key={extension}
                    title={caption}
                    icon="share-from-square"
                    linkData={{ extension, instance, locale }}
                    onClick={extensionClickHandler(fetchExtensionUrl)}
                  />
                ))}
              </ul>
            )}
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
  fetchExtensionUrl: PropTypes.func.isRequired,
  links: PropTypes.object,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired,
};

export default withLinks(injectIntl(Sidebar));
