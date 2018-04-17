import React from 'react';
import PropTypes from 'prop-types';
import { Well } from 'react-bootstrap';
import GroupsNameContainer from '../../../containers/GroupsNameContainer';
import { GroupIcon } from '../../icons';

import './HierarchyLine.css';

const HierarchyLine = ({ groupId, parentGroupsIds }) =>
  <Well bsSize="sm" className="groupParents">
    <GroupIcon className="slashStyle" />
    {parentGroupsIds.map(
      (groupId, i) =>
        i !== 0 &&
        <span key={i}>
          <GroupsNameContainer groupId={groupId} />{' '}
          <span className="slashStyle">/</span>
        </span>
    )}
    <GroupsNameContainer groupId={groupId} />
  </Well>;

HierarchyLine.propTypes = {
  groupId: PropTypes.string.isRequired,
  parentGroupsIds: PropTypes.array
};

export default HierarchyLine;
