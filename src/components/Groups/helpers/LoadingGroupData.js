import React from 'react';
import { FormattedMessage } from 'react-intl';
import { LoadingIcon } from '../../icons';
import Box from '../../widgets/Box';

const LoadingGroupData = () => (
  <Box
    noPadding={false}
    title={
      <>
        <LoadingIcon gapRight />
        <FormattedMessage id="app.groupDetail.loading" defaultMessage="Loading group data..." />
      </>
    }>
    <FormattedMessage id="app.groupDetail.loading" defaultMessage="Loading group data..." />
  </Box>
);

export default LoadingGroupData;
