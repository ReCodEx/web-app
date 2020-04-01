import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import classnames from 'classnames';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { defaultMemoize } from 'reselect';
import { withRouter } from 'react-router';

import Admin from './Admin';
import BadgeContainer from '../../../containers/BadgeContainer';
import MenuGroup from '../../widgets/Sidebar/MenuGroup';
import MenuTitle from '../../widgets/Sidebar/MenuTitle';
import MenuItem from '../../widgets/Sidebar/MenuItem';
import { isReady, getJsData, getId } from '../../../redux/helpers/resourceManager';
import { getLocalizedResourceName } from '../../../helpers/localizedData';
import { isSupervisorRole, isEmpoweredSupervisorRole, isSuperadminRole } from '../../helpers/usersRoles';
import withLinks from '../../../helpers/withLinks';
import { getExternalIdForCAS } from '../../../helpers/cas';
import { EMPTY_OBJ } from '../../../helpers/common';

import styles from './sidebar.less';

const getUserData = defaultMemoize(user => getJsData(user));

const Sidebar = ({
  loggedInUser,
  effectiveRole = null,
  studentOf,
  supervisorOf,
  currentUrl,
  instances,
  small = false,
  links: {
    FAQ_URL,
    LOGIN_URI,
    REGISTRATION_URI,
    DASHBOARD_URI,
    INSTANCE_URI_FACTORY,
    GROUP_DETAIL_URI_FACTORY,
    EXERCISES_URI,
    PIPELINES_URI,
    ARCHIVE_URI,
    SIS_INTEGRATION_URI,
  },
  location: { pathname, search },
  intl: { locale },
}) => {
  const user = getUserData(loggedInUser);
  const createLink = item => GROUP_DETAIL_URI_FACTORY(getId(item));
  const studentOfItems =
    studentOf &&
    studentOf.size > 0 &&
    studentOf
      .toList()
      .sort((a, b) => getLocalizedResourceName(a, locale).localeCompare(getLocalizedResourceName(b, locale), locale));
  const supervisorOfItems =
    supervisorOf &&
    supervisorOf.size > 0 &&
    supervisorOf
      .toList()
      .sort((a, b) => getLocalizedResourceName(a, locale).localeCompare(getLocalizedResourceName(b, locale), locale));
  const currentLink = pathname + search;

  return (
    <aside className={classnames(['main-sidebar', styles.mainSidebar])}>
      <section className="sidebar">
        {!user && (
          <ul className="sidebar-menu">
            <MenuTitle title="ReCoVid" />
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
          <React.Fragment>
            <BadgeContainer small={small} />
            <ul className="sidebar-menu">
              <MenuTitle title={<FormattedMessage id="app.sidebar.menu.title" defaultMessage="Menu" />} />
              <MenuItem
                title={<FormattedMessage id="app.sidebar.menu.dashboard" defaultMessage="Dashboard" />}
                icon="heartbeat"
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
                      icon="dna"
                      currentPath={currentUrl}
                      link={INSTANCE_URI_FACTORY(id)}
                    />
                  ))}

              {studentOfItems && (
                <MenuGroup
                  title={<FormattedMessage id="app.sidebar.menu.memberOfGroups" defaultMessage="Member of Groups" />}
                  items={studentOfItems}
                  notifications={EMPTY_OBJ}
                  icon="diagnoses"
                  currentPath={currentUrl}
                  createLink={createLink}
                  forceOpen={false}
                  isActive={studentOfItems.find(item => createLink(item) === currentLink) !== undefined}
                />
              )}

              {isSupervisorRole(effectiveRole) && supervisorOfItems && (
                <MenuGroup
                  title={
                    <FormattedMessage id="app.sidebar.menu.supervisorOfGroups" defaultMessage="Supervisor of Groups" />
                  }
                  notifications={EMPTY_OBJ}
                  items={supervisorOfItems}
                  icon="graduation-cap"
                  currentPath={currentUrl}
                  createLink={createLink}
                  forceOpen={false}
                  isActive={supervisorOfItems.find(item => createLink(item) === currentLink) !== undefined}
                />
              )}

              {isSupervisorRole(effectiveRole) && (
                <MenuItem
                  title={<FormattedMessage id="app.sidebar.menu.exercises" defaultMessage="Exercises" />}
                  icon="stethoscope"
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
                icon="blind"
                link={FAQ_URL}
                currentPath={currentUrl}
              />
            </ul>
          </React.Fragment>
        )}

        {isSuperadminRole(effectiveRole) && <Admin currentUrl={currentUrl} />}
      </section>
    </aside>
  );
};

Sidebar.propTypes = {
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
  intl: intlShape,
};

export default withLinks(withRouter(injectIntl(Sidebar)));
