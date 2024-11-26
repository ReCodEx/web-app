import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Nav } from 'react-bootstrap';
import { lruMemoize } from 'reselect';

import { groupsSelector, notArchivedGroupsSelector } from '../../redux/selectors/groups.js';
import { usersSelector } from '../../redux/selectors/users.js';
import { selectedInstance } from '../../redux/selectors/instances.js';
import { isReady, getJsData } from '../../redux/helpers/resourceManager';
import GroupsTree from '../../components/Groups/GroupsTree';
import { LoadingIcon } from '../../components/icons';

import { identity, hasPermissions, isRegularObject } from '../../helpers/common.js';
import { getLocalizedName } from '../../helpers/localizedData.js';

/**
 * Helper function that prepares augmented group object. Child groups are transformed as well recursively
 * (ids in childGroups are replaced with objects) and primaryAdmins property with sorted admin names is added.
 */
const prepareGroupObject = (
  groupId,
  groups,
  users,
  locale,
  processChildren,
  showArchived,
  filterGroups = () => true
) => {
  const group = getJsData(groups.get(groupId));
  if (!group || (!showArchived && group.archived)) {
    return null;
  }

  // add admin names
  if (users) {
    group.primaryAdmins = group.primaryAdminsIds
      .map(userId => {
        const user = getJsData(users.get(userId));
        return user ? { id: user.id, ...user.name } : userId;
      })
      .sort((u1, u2) => {
        return isRegularObject(u1) && isRegularObject(u2)
          ? u1.lastName.localeCompare(u2.lastName, locale) || u1.firstName.localeCompare(u2.firstName, locale)
          : 0;
      });
  }

  // add subgroups recursively
  if (processChildren) {
    group.childGroups = group.childGroups
      .map(id => prepareGroupObject(id, groups, users, locale, processChildren, showArchived, filterGroups))
      .filter(identity)
      .sort((g1, g2) => {
        const name1 = getLocalizedName(g1, locale);
        const name2 = getLocalizedName(g2, locale);
        return name1 !== undefined && name2 !== undefined ? name1.localeCompare(name2, locale) : 0;
      });

    if (group.childGroups.length === 0 && !filterGroups(group)) {
      return null; // the group did not pass the filter
    }
  }

  return group;
};

/**
 * Prepares plain-js datastructure that could be fed to GroupsTree component.
 * With memoization, this is basically a higher-level selector that creates hiarchial augmented group objects.
 */
const prepareGroupsTree = lruMemoize(
  (groups, users, locale, selectedGroupId, showArchived, onlyEditable, customFilter) => {
    let group = prepareGroupObject(selectedGroupId, groups, users, locale, true, showArchived, group => {
      return (
        hasPermissions(group, onlyEditable ? 'update' : 'viewDetail') &&
        (!customFilter || customFilter(group, selectedGroupId))
      );
    });

    if (!group) {
      return [];
    }

    // if a nested group is selected, add all its ancestors properly
    while (group.parentGroupId) {
      const parent = prepareGroupObject(group.parentGroupId, groups, users, locale, false, true);
      if (!parent) {
        break;
      }

      parent.alwaysVisible = true;
      parent.childGroups = [group];
      group = parent;
    }

    return group.parentGroupId ? [group] : group.childGroups; // root group is not displayed, only its children
  }
);

class GroupsTreeContainer extends Component {
  render() {
    const {
      selectedGroupId = null,
      showArchived = false,
      onlyEditable = false,
      groupsFilter = null,
      instance,
      groups,
      users,
      intl: { locale },
      ...props
    } = this.props;

    const rootGroupId = instance && instance.getIn(['data', 'rootGroupId'], null);

    if (!isReady(groups.get(selectedGroupId || rootGroupId))) {
      return (
        <Nav className="flex-column">
          <li>
            <LoadingIcon gapRight={2} />
            <FormattedMessage id="generic.loading" defaultMessage="Loading..." />
          </li>
        </Nav>
      );
    }

    const groupsTree =
      rootGroupId &&
      prepareGroupsTree(
        groups,
        users,
        locale,
        selectedGroupId || rootGroupId,
        showArchived,
        onlyEditable,
        groupsFilter
      );

    return groupsTree ? (
      <GroupsTree groups={groupsTree} selectedGroupId={selectedGroupId} {...props} />
    ) : (
      <FormattedMessage id="app.groupsTree.noGroups" defaultMessage="There are no groups currently visible to you." />
    );
  }
}

GroupsTreeContainer.propTypes = {
  selectedGroupId: PropTypes.string,
  showArchived: PropTypes.bool,
  onlyEditable: PropTypes.bool,
  groupsFilter: PropTypes.func,
  autoloadAuthors: PropTypes.bool,
  isExpanded: PropTypes.bool,
  buttonsCreator: PropTypes.func,
  instance: ImmutablePropTypes.map,
  groups: ImmutablePropTypes.map,
  users: ImmutablePropTypes.map,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired,
};

export default connect((state, { showArchived }) => ({
  instance: selectedInstance(state),
  groups: showArchived ? groupsSelector(state) : notArchivedGroupsSelector(state),
  users: usersSelector(state),
}))(injectIntl(GroupsTreeContainer));
