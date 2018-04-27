import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import { LinkContainer } from 'react-router-bootstrap';

import Button from '../../widgets/FlatButton';
import { TreeView, TreeViewItem } from '../../widgets/TreeView';
import { isReady, getJsData } from '../../../redux/helpers/resourceManager';
import GroupsName from '../GroupsName';
import { computeVisibleGroupsMap } from '../../helpers/group.js';
import { getLocalizedResourceName } from '../../../helpers/getLocalizedData';
import { GroupIcon } from '../../icons';
import withLinks from '../../../helpers/withLinks';

const conditionalEmphasize = (content, condition) =>
  condition
    ? <strong>
        {content}
      </strong>
    : content;

class GroupTree extends Component {
  renderLoading = level =>
    <TreeView>
      <TreeViewItem
        level={level}
        loading
        title={
          <FormattedMessage id="generic.loading" defaultMessage="Loading ..." />
        }
      />
    </TreeView>;

  renderButtons = (groupId, showInfoLink) => {
    const {
      links: { GROUP_INFO_URI_FACTORY, GROUP_DETAIL_URI_FACTORY }
    } = this.props;
    return (
      <span>
        <LinkContainer
          to={
            showInfoLink
              ? GROUP_INFO_URI_FACTORY(groupId)
              : GROUP_DETAIL_URI_FACTORY(groupId)
          }
        >
          <Button bsStyle="primary" bsSize="xs" className="btn-flat">
            <GroupIcon gapRight />
            {showInfoLink
              ? <FormattedMessage
                  id="app.group.info"
                  defaultMessage="Group Info"
                />
              : <FormattedMessage
                  id="app.group.detail"
                  defaultMessage="Group Detail"
                />}
          </Button>
        </LinkContainer>
      </span>
    );
  };

  renderChildGroups = (
    { all: allChildGroups, public: publicChildGroups },
    visibleGroupsMap,
    level
  ) => {
    const { isOpen = false, groups, intl: { locale } } = this.props;
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
      isPublic = false,
      groups,
      currentGroupId = null,
      visibleGroupsMap = null,
      ancestralPath = null
    } = this.props;

    const onAncestralPath = ancestralPath && ancestralPath.length > 0;
    const group = onAncestralPath
      ? groups.get(ancestralPath[0])
      : groups.get(id);
    if (!group || !isReady(group)) {
      return this.renderLoading(level);
    }

    const {
      id: groupId,
      name,
      localizedTexts,
      canView,
      childGroups,
      primaryAdminsIds,
      organizational
    } = getJsData(group);

    const actualVisibleGroupsMap =
      visibleGroupsMap !== null
        ? visibleGroupsMap
        : computeVisibleGroupsMap(groups);

    return (
      <TreeView>
        {level !== 0 || onAncestralPath
          ? <TreeViewItem
              title={conditionalEmphasize(
                <GroupsName
                  id={groupId}
                  name={name}
                  localizedTexts={localizedTexts}
                  noLink
                />,
                currentGroupId === groupId
              )}
              id={groupId}
              level={level}
              admins={primaryAdminsIds}
              organizational={organizational}
              isPublic={isPublic}
              forceOpen={onAncestralPath}
              isOpen={currentGroupId === groupId || isOpen}
              actions={
                currentGroupId !== groupId && canView
                  ? // this is inacurate, but public groups are visible to students who cannot see detail until they join
                    this.renderButtons(groupId, organizational || isPublic)
                  : undefined
              }
            >
              {onAncestralPath
                ? [
                    <GroupTree
                      {...this.props}
                      key={groupId}
                      level={level + 1}
                      ancestralPath={ancestralPath.slice(1)}
                    />
                  ]
                : this.renderChildGroups(
                    childGroups,
                    actualVisibleGroupsMap,
                    level
                  )}
            </TreeViewItem>
          : this.renderChildGroups(childGroups, actualVisibleGroupsMap, 0)}
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
  ancestralPath: PropTypes.array,
  links: PropTypes.object,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired
};

export default withLinks(injectIntl(GroupTree));
