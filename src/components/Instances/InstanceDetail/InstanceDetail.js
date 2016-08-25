import React, { PropTypes } from 'react';
import { Row, Col } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import UsersList from '../../Users/UsersList';
import Box from '../../AdminLTE/Box';

import { isReady, isLoading, hasFailed } from '../../../redux/helpers/resourceManager';

const InstanceDetail = ({
  instance,
  groups
}) => (
  <div>
    <ReactMarkdown source={instance.data.description} />
  </div>
);

export default InstanceDetail;
