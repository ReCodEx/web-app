import React, { PropTypes } from 'react';
import Icon from 'react-fontawesome';
import { FormattedMessage } from 'react-intl';
import { Row, Col, Button } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';

import Box from '../../AdminLTE/Box';

const GroupDetail = ({
  id,
  description
}) => (
  <Row>
    <Col sm={12}>
      <Box
        title={<FormattedMessage id='app.groupDetail.description' defaultMessage='Group description' />}
        type='primary'
        collapsable
        noPadding={false}>
        <ReactMarkdown source={description} />
      </Box>
    </Col>
  </Row>
);

GroupDetail.propTypes = {
  id: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired
};

export default GroupDetail;
