import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { Panel, Row, Col } from 'react-bootstrap';
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
    <ReactMarkdown source={description} />
    <Row>
      <Col lg={6}>
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
      </Col>
    </Row>
  </div>
);

InstanceDetail.propTypes = {
  description: PropTypes.string.isRequired,
  topLevelGroups: PropTypes.array.isRequired,
  groups: ImmutablePropTypes.map.isRequired
};

export default InstanceDetail;
