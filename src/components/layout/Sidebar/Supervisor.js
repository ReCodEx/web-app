import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { injectIntl, FormattedMessage } from 'react-intl';

import MenuTitle from '../../widgets/Sidebar/MenuTitle';
import MenuGroup from '../../widgets/Sidebar/MenuGroup';
import MenuItem from '../../widgets/Sidebar/MenuItem';
import { getId } from '../../../redux/helpers/resourceManager';

import withLinks from '../../../helpers/withLinks';

const Supervisor = ({
  currentUrl,
  supervisorOf,
  isCollapsed,
  notifications,
  links: { GROUP_URI_FACTORY, EXERCISES_URI, PIPELINES_URI },
  intl
}) =>
  <ul className="sidebar-menu">
    <MenuTitle
      title={
        <FormattedMessage
          id="app.sudebar.menu.supervisor.title"
          defaultMessage="Supervisor"
        />
      }
    />
    <MenuGroup
      title={
        <FormattedMessage
          id="app.sidebar.menu.supervisorOf"
          defaultMessage="Groups - supervisor"
        />
      }
      items={supervisorOf
        .toList()
        .sort((a, b) =>
          a
            .getIn(['data', 'name'])
            .localeCompare(b.getIn(['data', 'name']), intl.locale)
        )}
      notifications={{}}
      icon="wrench"
      currentPath={currentUrl}
      createLink={item => GROUP_URI_FACTORY(getId(item))}
      forceOpen={isCollapsed}
    />
    <MenuItem
      title={
        <FormattedMessage
          id="app.sidebar.menu.exercises"
          defaultMessage="Exercises"
        />
      }
      icon="puzzle-piece"
      currentPath={currentUrl}
      link={EXERCISES_URI}
    />
    <MenuItem
      title={
        <FormattedMessage
          id="app.sidebar.menu.pipelines"
          defaultMessage="Pipelines"
        />
      }
      icon="random"
      currentPath={currentUrl}
      link={PIPELINES_URI}
    />
  </ul>;

Supervisor.propTypes = {
  currentUrl: PropTypes.string.isRequired,
  supervisorOf: ImmutablePropTypes.map,
  isCollapsed: PropTypes.bool,
  notifications: PropTypes.object,
  links: PropTypes.object,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired
};

export default injectIntl(withLinks(Supervisor));
