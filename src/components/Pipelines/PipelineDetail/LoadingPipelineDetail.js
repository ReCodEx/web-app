import React from 'react';
import { FormattedMessage } from 'react-intl';
import { LoadingIcon } from '../../icons';
import Box from '../../widgets/Box';

const LoadingPipelineDetail = () => (
  <Box title={<FormattedMessage id="app.pipeline.title" defaultMessage="Pipeline Detail" />}>
    <LoadingIcon gapRight />
    <FormattedMessage id="app.pipeline.loadingDetail" defaultMessage="Loading pipeline detail" />
  </Box>
);

export default LoadingPipelineDetail;
