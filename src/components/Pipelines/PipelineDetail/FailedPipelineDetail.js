import React from 'react';
import { FormattedMessage } from 'react-intl';
import { WarningIcon } from '../../icons';

const FailedPipelineDetail = () =>
  <div>
    <p>
      <WarningIcon gapRight />
      <FormattedMessage
        id="app.pipeline.failedDetail"
        defaultMessage="Loading the details of the pipeline failed. Please make sure you are connected to the Internet and try again later."
      />
    </p>
  </div>;

export default FailedPipelineDetail;
