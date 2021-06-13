import React from 'react';
import PropTypes from 'prop-types';

import GroupsNameContainer from '../../../containers/GroupsNameContainer';
import { GroupIcon } from '../../icons';
import InsetPanel from '../../widgets/InsetPanel';

import './HierarchyLine.css';

const HierarchyLine = ({ groupId, parentGroupsIds }) => (
  <InsetPanel bsSize="sm" className="groupParents">
    <GroupIcon className="slashStyle" />
    {parentGroupsIds.map(
      (groupId, i) =>
        i !== 0 && (
          <span key={i}>
            <GroupsNameContainer groupId={groupId} /> <span className="slashStyle">/</span>
          </span>
        )
    )}
    <GroupsNameContainer groupId={groupId} />
  </InsetPanel>
);

HierarchyLine.propTypes = {
  groupId: PropTypes.string.isRequired,
  parentGroupsIds: PropTypes.array,
};

export default HierarchyLine;
