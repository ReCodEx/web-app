import React from 'react';
import { FormattedMessage } from 'react-intl';
import { LoadingIcon } from '../../icons';
import Box from '../../widgets/Box';

const LoadingInstanceDetail = () =>
  <Box
    title={
      <FormattedMessage
        id="app.instance.detailTitle"
        defaultMessage="Instance description"
      />
    }
  >
    <LoadingIcon gapRight />
    <FormattedMessage
      id="app.instances.loadingDetail"
      defaultMessage="Loading detail of the instance"
    />
  </Box>;

export default LoadingInstanceDetail;
