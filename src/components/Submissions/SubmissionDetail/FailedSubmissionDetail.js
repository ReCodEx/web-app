import React from 'react';
import Box from '../../AdminLTE/Box';
import { WarningIcon } from '../../Icons';

const FailedSubmissionDetail = () => (
  <Box
    title={
      <span>
        <WarningIcon /> Vyhodnocení tohoto řešení se nepodařilo načíst.
      </span>
    }
    noPadding={false}
    type={'warning'}
    isOpen={true}>
    Ujistěte se, že jste připojen(a) k Internetu a opakujte prosíme akci o chvíli později.
  </Box>
);

export default FailedSubmissionDetail;
