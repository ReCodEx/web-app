import React from 'react';
import { FailedIcon } from '../Icons';

const FailedSubmissionDetail = () => (
  <span>
    <FailedIcon /> Vyhodnocení tohoto řešení se nepodařilo načíst. Ujistěte se, že jste připojen(a) k Internetu a opakujte prosíme akci o chvíli později.
  </span>
);

export default FailedSubmissionDetail;
