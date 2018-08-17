import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';

import { isReady, getJsData } from '../../../redux/helpers/resourceManager';
import MenuTitle from '../../widgets/Sidebar/MenuTitle';
import MenuItem from '../../widgets/Sidebar/MenuItem';

import withLinks from '../../../helpers/withLinks';

const LoggedIn = ({
  instances,
  currentUrl,
  links: { DASHBOARD_URI, INSTANCE_URI_FACTORY }
}) =>
  <ul className="sidebar-menu">
    <MenuTitle
      title={
        <FormattedMessage id="app.sidebar.menu.title" defaultMessage="Menu" />
      }
    />
    <MenuItem
      title={
        <FormattedMessage
          id="app.sidebar.menu.dashboard"
          defaultMessage="Dashboard"
        />
      }
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
        .map(({ id, name }) =>
          <MenuItem
            key={id}
            title={name}
            icon="university"
            currentPath={currentUrl}
            link={INSTANCE_URI_FACTORY(id)}
          />
        )}
  </ul>;

LoggedIn.propTypes = {
  instances: ImmutablePropTypes.list,
  currentUrl: PropTypes.string.isRequired,
  links: PropTypes.object
};

export default withLinks(LoggedIn);
