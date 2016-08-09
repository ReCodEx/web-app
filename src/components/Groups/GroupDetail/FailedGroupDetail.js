import React from 'react';
import { FailedIcon } from '../../Icons';

const LoadingGroupDetail = ({
  group,
  assignments
}) => (
  <div>
    <p>
      <FailedIcon /> Chyba načítání dat. Popis této skupiny se nepodařilo načíst. Ujistěte se, že jste připojen(a) k Internetu a opakujte prosíme akci o chvíli později.
    </p>
  </div>
);

export default LoadingGroupDetail;
