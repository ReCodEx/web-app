import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Collapse from 'react-collapse';
import { lruMemoize } from 'reselect';

import GroupsTree from './GroupsTree.js';
import GroupsName from '../GroupsName';
import UsersNameContainer from '../../../containers/UsersNameContainer';
import Icon, { GroupIcon, GroupExamsIcon, LoadingIcon } from '../../icons';
import withLinks from '../../../helpers/withLinks.js';
import { isRegularObject } from '../../../helpers/common.js';
import { isExam } from '../../../helpers/groups.js';

/**
 * Assemble the right CSS classes for the list item.
 * @param {bool} clickable whether the item can be clicked on
 * @param {bool} archived whether the group i
 */
const prepareClassList = lruMemoize((clickable, archived) => {
  const classes = [];
  if (clickable) {
    classes.push('clickable');
  }
  if (archived) {
    classes.push('text-body-secondary');
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
      exam,
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
            className="text-body-secondary"
            gapRight={2}
            fixedWidth
          />

          <span className={id === selectedGroupId ? 'fw-bold text-primary' : ''}>
            <GroupsName id={id} localizedTexts={localizedTexts} translations />
          </span>

          {primaryAdmins && primaryAdmins.length > 0 && (
            <span className="ps-2">
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
          {isExam(group) ? (
            <GroupExamsIcon
              className="text-danger"
              gapLeft={2}
              tooltipId={`${id}-pendingexam-tooltip`}
              tooltipPlacement="bottom"
              tooltip={
                <FormattedMessage
                  id="app.groupTree.treeViewLeaf.pendingExamTooltip"
                  defaultMessage="The group is locked for an exam"
                />
              }
            />
          ) : (
            exam && (
              <GroupIcon
                exam={true}
                className="text-warning"
                gapLeft={2}
                tooltipId={`${id}-exam-tooltip`}
                tooltipPlacement="bottom"
                tooltip={<FormattedMessage id="app.groupTree.treeViewLeaf.examTooltip" defaultMessage="Exam group" />}
              />
            )
          )}
          {organizational && (
            <GroupIcon
              organizational={true}
              className="text-body-secondary"
              gapLeft={2}
              tooltipId={`${id}-organizational-tooltip`}
              tooltipPlacement="bottom"
              tooltip={
                <FormattedMessage
                  id="app.groupTree.treeViewLeaf.organizationalTooltip"
                  defaultMessage="The group is organizational (it does not have any students or assignments)"
                />
              }
            />
          )}
          {archived && (
            <GroupIcon
              archived={true}
              className="text-body-secondary"
              gapLeft={2}
              tooltipId={`${id}-archived-tooltip`}
              tooltipPlacement="bottom"
              tooltip={
                <FormattedMessage
                  id="app.groupTree.treeViewLeaf.archivedTooltip"
                  defaultMessage="The group is archived"
                />
              }
            />
          )}
          {isPublic && (
            <Icon
              icon="eye"
              className="text-body-secondary"
              gapLeft={2}
              tooltipId={`${id}-public-tooltip`}
              tooltipPlacement="bottom"
              tooltip={
                <FormattedMessage id="app.groupTree.treeViewLeaf.publicTooltip" defaultMessage="The group is public" />
              }
            />
          )}

          {buttonsCreator && (
            <span className="float-end" onClick={clickEventDisipator}>
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
    exam: PropTypes.bool,
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
