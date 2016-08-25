import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { LoadingIcon } from '../../Icons';
import Box from '../../AdminLTE/Box';

const LoadingInstanceDetail = () => (
  <div>
    <p>
      <LoadingIcon /> <FormattedMessage id='app.instances.loadingDetail' defaultMessage="Loading instance's detail" />
    </p>
  </div>
);

export default LoadingInstanceDetail;
