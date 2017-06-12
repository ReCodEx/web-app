import React from 'react';
import Box from '../../widgets/Box';
import { LoadingIcon } from '../../icons';

const LoadingSubmissionDetail = () =>
  <Box
    title={
      <span>
        <LoadingIcon /> Načítám vyhodnocení odevzdaného řešení ...
      </span>
    }
    noPadding={false}
    isOpen={true}
  >
    Načítám výsledky ...
  </Box>;

export default LoadingSubmissionDetail;
