import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import classnames from 'classnames';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { defaultMemoize } from 'reselect';

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
import { safeGet, EMPTY_OBJ } from '../../../helpers/common';

import styles from './sidebar.less';

const getUserData = defaultMemoize(user => getJsData(user));

const Sidebar = ({
  loggedInUser,
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
  intl: { locale },
}) => {
  const user = getUserData(loggedInUser);
  const role = safeGet(user, ['privateData', 'role']);

  return (
    <aside className={classnames(['main-sidebar', styles.mainSidebar])}>
      <section className="sidebar">
        {!user && (
          <ul className="sidebar-menu">
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
          <React.Fragment>
            <BadgeContainer small={small} />
            <ul className="sidebar-menu">
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

              {studentOf && studentOf.size > 0 && (
                <MenuGroup
                  title={<FormattedMessage id="app.sidebar.menu.memberOfGroups" defaultMessage="Member of Groups" />}
                  items={studentOf
                    .toList()
                    .sort((a, b) =>
                      getLocalizedResourceName(a, locale).localeCompare(getLocalizedResourceName(b, locale), locale)
                    )}
                  notifications={EMPTY_OBJ}
                  icon={'user-circle'}
                  currentPath={currentUrl}
                  createLink={item => GROUP_DETAIL_URI_FACTORY(getId(item))}
                  forceOpen={false}
                />
              )}

              {isSupervisorRole(role) && (
                <MenuGroup
                  title={
                    <FormattedMessage id="app.sidebar.menu.supervisorOfGroups" defaultMessage="Supervisor of Groups" />
                  }
                  notifications={EMPTY_OBJ}
                  items={supervisorOf
                    .toList()
                    .sort((a, b) =>
                      getLocalizedResourceName(a, locale).localeCompare(getLocalizedResourceName(b, locale), locale)
                    )}
                  icon="graduation-cap"
                  currentPath={currentUrl}
                  createLink={item => GROUP_DETAIL_URI_FACTORY(getId(item))}
                  forceOpen={false}
                />
              )}

              {isSupervisorRole(role) && (
                <MenuItem
                  title={<FormattedMessage id="app.sidebar.menu.exercises" defaultMessage="Exercises" />}
                  icon="puzzle-piece"
                  currentPath={currentUrl}
                  link={EXERCISES_URI}
                />
              )}

              {isEmpoweredSupervisorRole(role) && (
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

        {isSuperadminRole(role) && <Admin currentUrl={currentUrl} />}
      </section>
    </aside>
  );
};

Sidebar.propTypes = {
  loggedInUser: ImmutablePropTypes.map,
  studentOf: ImmutablePropTypes.map,
  supervisorOf: ImmutablePropTypes.map,
  currentUrl: PropTypes.string,
  instances: ImmutablePropTypes.list,
  small: PropTypes.bool,
  links: PropTypes.object,
  intl: intlShape,
};

export default withLinks(injectIntl(Sidebar));
