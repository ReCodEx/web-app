import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import GroupTree from '../GroupTree';

const GroupsList = ({
  groups = []
}) => (
  <div>
    {groups
      .toList()
      .map(group => group.getIn(['data', 'id']))
      .map(id => (
        <GroupTree key={id} id={id} groups={groups} />
    ))}
  </div>
);

// @todo: Replace GroupTree with some flat structure

GroupsList.propTypes = {
  groups: ImmutablePropTypes.map.isRequired
};

export default GroupsList;
