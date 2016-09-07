import React, { PropTypes } from 'react';
import Icon from 'react-fontawesome';
import { FormattedMessage } from 'react-intl';
import { Row, Col, Button } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';

import Box from '../../AdminLTE/Box';
import LeaveJoinGroupButtonContainer from '../../../containers/LeaveJoinGroupButtonContainer';

const GroupDetail = ({
  group: { id, description }
}) => (
  <div>
    <Box
      title={<FormattedMessage id='app.groupDetail.description' defaultMessage='Group description' />}
      type='primary'
      collapsable
      noPadding={false}>
      <ReactMarkdown source={description} />
    </Box>
    <p className='text-center'>
      <LeaveJoinGroupButtonContainer groupId={id} />
    </p>
  </div>
);

export default GroupDetail;
