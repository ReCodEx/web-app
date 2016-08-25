import React from 'react';
import { FormattedMessage } from 'react-intl';
import { FailedIcon } from '../../Icons';

const FailedInstanceDetail = ({
  group,
  assignments
}) => (
  <div>
    <p>
      <FailedIcon />
      <FormattedMessage
        id='app.instances.failedDetail'
        defaultMessage='Loading the details of the instance failed. Please make sure you are connected to the Internet and try again later.' />
    </p>
  </div>
);

export default FailedInstanceDetail;
