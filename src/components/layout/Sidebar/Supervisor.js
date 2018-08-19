import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { injectIntl, FormattedMessage, intlShape } from 'react-intl';

import MenuGroup from '../../widgets/Sidebar/MenuGroup';
import MenuItem from '../../widgets/Sidebar/MenuItem';
import { getId } from '../../../redux/helpers/resourceManager';
import { getLocalizedResourceName } from '../../../helpers/getLocalizedData';

import withLinks from '../../../helpers/withLinks';

const Supervisor = ({
  currentUrl,
  supervisorOf,
  isCollapsed,
  notifications,
  links: {
    GROUP_DETAIL_URI_FACTORY,
    EXERCISES_URI,
    PIPELINES_URI,
    ARCHIVE_URI
  },
  intl: { locale }
}) =>
  <ul className="sidebar-menu">
    <MenuGroup
      title={
        <FormattedMessage
          id="app.sidebar.menu.supervisorOfGroups"
          defaultMessage="Supervisor of Groups"
        />
      }
      items={supervisorOf
        .toList()
        .sort((a, b) =>
          getLocalizedResourceName(a, locale).localeCompare(
            getLocalizedResourceName(b, locale),
            locale
          )
        )}
      notifications={{}}
      icon="graduation-cap"
      currentPath={currentUrl}
      createLink={item => GROUP_DETAIL_URI_FACTORY(getId(item))}
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
    <MenuItem
      title={
        <FormattedMessage
          id="app.sidebar.menu.archive"
          defaultMessage="Archive"
        />
      }
      icon="archive"
      currentPath={currentUrl}
      link={ARCHIVE_URI}
    />
  </ul>;

Supervisor.propTypes = {
  currentUrl: PropTypes.string.isRequired,
  supervisorOf: ImmutablePropTypes.map,
  isCollapsed: PropTypes.bool,
  notifications: PropTypes.object,
  links: PropTypes.object,
  intl: intlShape.isRequired
};

export default injectIntl(withLinks(Supervisor));
