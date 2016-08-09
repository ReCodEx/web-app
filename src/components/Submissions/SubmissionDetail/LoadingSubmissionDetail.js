import React from 'react';
import Box from '../../AdminLTE/Box';
import { LoadingIcon } from '../../Icons';

const LoadingSubmissionDetail = () => (
  <Box
    title={
      <span>
        <LoadingIcon /> Načítám vyhodnocení odevzdaného řešení ...
      </span>
    }
    noPadding={false}
    isOpen={true}>
    Načítám výsledky ...
  </Box>
);

export default LoadingSubmissionDetail;
