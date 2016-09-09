import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { LoadingIcon } from '../../Icons';
import Box from '../../AdminLTE/Box';

const LoadingInstanceDetail = () => (
  <Box title={<FormattedMessage id='app.instance.detailTitle' defaultMessage='Instance description' />}>
    <LoadingIcon /> <FormattedMessage id='app.instances.loadingDetail' defaultMessage="Loading instance's detail" />
  </Box>
);

export default LoadingInstanceDetail;
