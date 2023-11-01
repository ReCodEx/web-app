import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

import GroupsTreeNode from './GroupsTreeNode';
import Button, { TheButtonGroup } from '../../widgets/TheButton';

import { GroupIcon, AssignmentsIcon, EditIcon, StudentsIcon } from '../../icons';
import withLinks from '../../../helpers/withLinks';
import { hasPermissions } from '../../../helpers/common';

import './styles.css';

const defaultButtonsCreator = (
  group,
  selectedGroupId,
  { GROUP_EDIT_URI_FACTORY, GROUP_INFO_URI_FACTORY, GROUP_ASSIGNMENTS_URI_FACTORY, GROUP_STUDENTS_URI_FACTORY }
) =>
  group.id !== selectedGroupId ? (
    <TheButtonGroup>
      {hasPermissions(group, 'update') && (
        <OverlayTrigger
          placement="bottom"
          overlay={
            <Tooltip id={`info-${group.id}`}>
              <FormattedMessage id="app.editGroup.titleShort" defaultMessage="Edit Group" />
            </Tooltip>
          }>
          <Link to={GROUP_EDIT_URI_FACTORY(group.id)}>
            <Button variant="warning" size="xs">
              <EditIcon smallGapLeft smallGapRight />
            </Button>
          </Link>
        </OverlayTrigger>
      )}

      {hasPermissions(group, 'viewPublicDetail') && (
        <OverlayTrigger
          placement="bottom"
          overlay={
            <Tooltip id={`info-${group.id}`}>
              <FormattedMessage id="app.group.info" defaultMessage="Group Info" />
            </Tooltip>
          }>
          <Link to={GROUP_INFO_URI_FACTORY(group.id)}>
            <Button variant="primary" size="xs">
              <GroupIcon />
            </Button>
          </Link>
        </OverlayTrigger>
      )}

      {hasPermissions(group, 'viewDetail') && (
        <OverlayTrigger
          placement="bottom"
          overlay={
            <Tooltip id={`info-${group.id}`}>
              <FormattedMessage id="app.group.assignments" defaultMessage="Assignments" />
            </Tooltip>
          }>
          <Link to={GROUP_ASSIGNMENTS_URI_FACTORY(group.id)}>
            <Button variant="primary" size="xs">
              <AssignmentsIcon smallGapLeft smallGapRight />
            </Button>
          </Link>
        </OverlayTrigger>
      )}

      {!group.organizational && hasPermissions(group, 'viewAssignments') && (
        <OverlayTrigger
          placement="bottom"
          overlay={
            <Tooltip id={`info-${group.id}`}>
              <FormattedMessage id="app.group.students" defaultMessage="Students" />
            </Tooltip>
          }>
          <Link to={GROUP_STUDENTS_URI_FACTORY(group.id)}>
            <Button variant="primary" size="xs">
              <StudentsIcon smallGapLeft smallGapRight />
            </Button>
          </Link>
        </OverlayTrigger>
      )}
    </TheButtonGroup>
  ) : null;

const GroupsTree = React.memo(
  ({
    groups,
    selectedGroupId = null,
    autoloadAuthors = false,
    isExpanded = false,
    buttonsCreator = defaultButtonsCreator,
  }) => (
    <ul className="groupTree nav flex-column">
      {groups.map(group => (
        <GroupsTreeNode
          key={group.id}
          group={group}
          selectedGroupId={selectedGroupId}
          autoloadAuthors={autoloadAuthors}
          isExpanded={isExpanded}
          buttonsCreator={buttonsCreator}
        />
      ))}
    </ul>
  )
);

GroupsTree.propTypes = {
  groups: PropTypes.array.isRequired,
  selectedGroupId: PropTypes.string,
  autoloadAuthors: PropTypes.bool,
  isExpanded: PropTypes.bool,
  buttonsCreator: PropTypes.func,
  links: PropTypes.object,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired,
};

export default withLinks(injectIntl(GroupsTree));
