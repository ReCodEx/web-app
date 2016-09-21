import React, { PropTypes } from 'react';
import Icon from 'react-fontawesome';
import { FormattedMessage } from 'react-intl';
import { Row, Col, Button } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';

import Box from '../../AdminLTE/Box';
import GroupTree from '../GroupTree';

const GroupDetail = ({
  id,
  description,
  childGroups,
  groups
}) => (
  <Row>
    <Col md={childGroups.length === 0 ? 12 : 8}>
      <Box
        title={<FormattedMessage id='app.groupDetail.description' defaultMessage='Group description' />}
        type='primary'
        collapsable
        noPadding={false}>
        <ReactMarkdown source={description} />
      </Box>
    </Col>
    {childGroups.length > 0 && (
      <Col md={4}>
        <Box title={<FormattedMessage id='app.groupDetail.groupsTitle' defaultMessage='Groups hierarchy' />} noPadding>
          <GroupTree id={id} groups={groups} />
        </Box>
      </Col>
    )}
  </Row>
);

GroupDetail.propTypes = {
  id: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  childGroups: PropTypes.array,
  groups: PropTypes.object.isRequired
};

export default GroupDetail;
