import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import ReactMarkdown from 'react-markdown';
import UsersList from '../../Users/UsersList';
import Box from '../../AdminLTE/Box';
import TreeView from '../../AdminLTE/TreeView';
import GroupTree from '../GroupTree';

import { isReady, isLoading, hasFailed } from '../../../redux/helpers/resourceManager';

const InstanceDetail = ({
  description,
  topLevelGroups,
  groups,
  isMemberOf
}) => (
  <div>
    <Box title={<FormattedMessage id='app.instance.detailTitle' defaultMessage='Instance description' />}>
      <ReactMarkdown source={description} />
    </Box>
    <Box title={<FormattedMessage id='app.instance.groupsTitle' defaultMessage='Groups hierarchy' />}>
      {topLevelGroups.map(id =>
        <GroupTree
          key={id}
          id={id}
          isMemberOf={isMemberOf}
          groups={groups} />)}

      {topLevelGroups.length === 0 && (
        <FormattedMessage id='app.instance.groups.noGroups' defaultMessage='There are no groups in this ReCodEx instance.' />
      )}
    </Box>
  </div>
);

InstanceDetail.propTypes = {
  description: PropTypes.string.isRequired,
  topLevelGroups: PropTypes.array.isRequired,
  groups: ImmutablePropTypes.map.isRequired
};

export default InstanceDetail;
