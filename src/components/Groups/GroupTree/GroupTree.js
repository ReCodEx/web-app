import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import { LinkContainer } from 'react-router-bootstrap';
import Icon from 'react-fontawesome';

import Button from '../../widgets/FlatButton';
import { TreeView, TreeViewItem } from '../../widgets/TreeView';
import { isReady, getJsData } from '../../../redux/helpers/resourceManager';
import GroupsName from '../GroupsName';
import { computeVisibleGroupsMap } from '../../helpers/group.js';
import { getLocalizedResourceName } from '../../../helpers/getLocalizedData';

import withLinks from '../../../hoc/withLinks';

class GroupTree extends Component {
  renderLoading = level =>
    <TreeView>
      <TreeViewItem
        level={level}
        loading
        title={
          <FormattedMessage
            id="app.groupTree.loading"
            defaultMessage="Loading ..."
          />
        }
      />
    </TreeView>;

  renderButtons = groupId => {
    const { links: { GROUP_URI_FACTORY } } = this.props;
    return (
      <span>
        <LinkContainer to={GROUP_URI_FACTORY(groupId)}>
          <Button bsStyle="primary" bsSize="xs" className="btn-flat">
            <Icon name="group" />{' '}
            <FormattedMessage
              id="app.groupTree.detailButton"
              defaultMessage="See group's page"
            />
          </Button>
        </LinkContainer>
      </span>
    );
  };

  renderChildGroups = (
    { all: allChildGroups, public: publicChildGroups },
    visibleGroupsMap
  ) => {
    const { level = 0, isOpen = false, groups, intl: { locale } } = this.props;
    return allChildGroups
      .filter(id => visibleGroupsMap[id])
      .sort((id1, id2) => {
        const name1 = getLocalizedResourceName(groups.get(id1), locale);
        const name2 = getLocalizedResourceName(groups.get(id2), locale);
        return name1 !== undefined && name2 !== undefined
          ? name1.localeCompare(name2, locale)
          : 0;
      })
      .map(id =>
        <GroupTree
          {...this.props}
          key={id}
          id={id}
          isOpen={level !== 0 || isOpen}
          level={level + 1}
          isPublic={publicChildGroups.indexOf(id) >= 0}
          visibleGroupsMap={visibleGroupsMap}
        />
      );
  };

  render() {
    const {
      id,
      level = 0,
      isOpen = false,
      isPublic = true,
      groups,
      currentGroupId = null,
      visibleGroupsMap = null,
      links: { GROUP_URI_FACTORY }
    } = this.props;

    const group = groups.get(id);
    if (!group || !isReady(group)) {
      return isPublic ? this.renderLoading(level) : null;
    }

    const {
      name,
      localizedTexts,
      canView,
      childGroups,
      primaryAdminsIds
    } = getJsData(group);

    const actualVisibleGroupsMap =
      visibleGroupsMap !== null
        ? visibleGroupsMap
        : computeVisibleGroupsMap(groups);

    return (
      <TreeView>
        {level !== 0 &&
          <TreeViewItem
            title={
              <GroupsName
                id={id}
                name={name}
                localizedTexts={localizedTexts}
                noLink
              />
            }
            id={id}
            level={level}
            admins={primaryAdminsIds}
            isPublic={isPublic}
            isOpen={currentGroupId === id || isOpen}
            actions={
              currentGroupId !== id && canView
                ? this.renderButtons(id, GROUP_URI_FACTORY(id))
                : undefined
            }
          >
            {this.renderChildGroups(childGroups, actualVisibleGroupsMap)}
          </TreeViewItem>}
        {level === 0 &&
          this.renderChildGroups(childGroups, actualVisibleGroupsMap)}
      </TreeView>
    );
  }
}

GroupTree.propTypes = {
  id: PropTypes.string.isRequired,
  groups: PropTypes.object.isRequired,
  level: PropTypes.number,
  isOpen: PropTypes.bool,
  isPublic: PropTypes.bool,
  currentGroupId: PropTypes.string,
  visibleGroupsMap: PropTypes.object,
  links: PropTypes.object,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired
};

export default withLinks(injectIntl(GroupTree));
