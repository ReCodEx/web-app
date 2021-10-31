import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import Collapse from 'react-collapse';
import { defaultMemoize } from 'reselect';

import GroupsTree from './GroupsTree';
import GroupsName from '../GroupsName';
import UsersNameContainer from '../../../containers/UsersNameContainer';
import Icon, { GroupIcon, LoadingIcon } from '../../icons';
import withLinks from '../../../helpers/withLinks';
import { isRegularObject } from '../../../helpers/common';

/**
 * Assemble the right CSS classes for the list item.
 * @param {bool} clickable whether the item can be clicked on
 * @param {bool} archived whether the group i
 */
const prepareClassList = defaultMemoize((clickable, archived) => {
  const classes = [];
  if (clickable) {
    classes.push('clickable');
  }
  if (archived) {
    classes.push('text-muted');
  }
  return classes.join(' ');
});

const DEFAULT_ICON = ['far', 'square'];

const clickEventDisipator = ev => ev.stopPropagation();

const GroupsTreeNode = React.memo(
  ({ group, selectedGroupId = null, autoloadAuthors = false, isExpanded = false, buttonsCreator, links }) => {
    const {
      id,
      localizedTexts,
      primaryAdmins = [],
      organizational,
      archived,
      isPublic,
      childGroups = [],
      alwaysVisible = false,
    } = group;

    const leafNode = childGroups.length === 0;
    const clickable = !leafNode && !alwaysVisible;
    const [isOpen, setOpen] = useState(isExpanded);

    return (
      <li>
        <span
          className={prepareClassList(clickable, archived)}
          onClick={clickable ? () => setOpen(!isOpen) : undefined}>
          <Icon
            icon={leafNode ? DEFAULT_ICON : alwaysVisible ? 'square' : isOpen ? 'minus-square' : 'plus-square'}
            className="text-muted"
            gapRight
            fixedWidth
          />

          <span className={id === selectedGroupId ? 'text-bold text-primary' : ''}>
            <GroupsName id={id} localizedTexts={localizedTexts} translations />
          </span>

          {primaryAdmins && primaryAdmins.length > 0 && (
            <span className="pl-2">
              (
              <em className="small">
                {primaryAdmins.map(admin => (
                  <React.Fragment key={isRegularObject(admin) ? admin.id : admin}>
                    {isRegularObject(admin) ? (
                      <span className="simpleName text-nowrap">
                        {admin.firstName} {admin.lastName}
                      </span>
                    ) : autoloadAuthors ? (
                      <UsersNameContainer userId={admin} isSimple />
                    ) : (
                      <LoadingIcon />
                    )}
                  </React.Fragment>
                ))}
              </em>
              )
            </span>
          )}
          {organizational && (
            <OverlayTrigger
              placement="bottom"
              overlay={
                <Tooltip id={`${id}-organizational-tooltip`}>
                  <FormattedMessage
                    id="app.groupTree.treeViewLeaf.organizationalTooltip"
                    defaultMessage="The group is organizational (it does not have any students or assignments)"
                  />
                </Tooltip>
              }>
              <GroupIcon organizational={true} className="text-muted" gapLeft />
            </OverlayTrigger>
          )}
          {archived && (
            <OverlayTrigger
              placement="bottom"
              overlay={
                <Tooltip id={`${id}-archived-tooltip`}>
                  <FormattedMessage
                    id="app.groupTree.treeViewLeaf.archivedTooltip"
                    defaultMessage="The group is archived"
                  />
                </Tooltip>
              }>
              <GroupIcon archived={true} className="text-muted" gapLeft />
            </OverlayTrigger>
          )}
          {isPublic && (
            <OverlayTrigger
              placement="bottom"
              overlay={
                <Tooltip id={`${id}-public-tooltip`}>
                  <FormattedMessage
                    id="app.groupTree.treeViewLeaf.publicTooltip"
                    defaultMessage="The group is public"
                  />
                </Tooltip>
              }>
              <Icon icon="eye" className="text-muted" gapLeft />
            </OverlayTrigger>
          )}

          {buttonsCreator && (
            <span className="float-right" onClick={clickEventDisipator}>
              {buttonsCreator(group, selectedGroupId, links)}
            </span>
          )}
        </span>

        {!leafNode && (
          <Collapse isOpened={isOpen || alwaysVisible}>
            <GroupsTree
              groups={childGroups}
              selectedGroupId={selectedGroupId}
              autoloadAuthors={autoloadAuthors}
              isExpanded={isExpanded}
              buttonsCreator={buttonsCreator}
            />
          </Collapse>
        )}
      </li>
    );
  }
);

GroupsTreeNode.propTypes = {
  group: PropTypes.shape({
    id: PropTypes.string,
    localizedTexts: PropTypes.array.isRequired,
    primaryAdmins: PropTypes.array,
    organizational: PropTypes.bool,
    archived: PropTypes.bool,
    isPublic: PropTypes.bool,
    childGroups: PropTypes.array,
    alwaysVisible: PropTypes.bool,
  }),
  selectedGroupId: PropTypes.string,
  autoloadAuthors: PropTypes.bool,
  isExpanded: PropTypes.bool,
  buttonsCreator: PropTypes.func,
  links: PropTypes.object,
};

export default withLinks(GroupsTreeNode);
