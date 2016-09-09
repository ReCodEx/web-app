import React from 'react';
import { LoginIcon } from '../../../Icons';

const LoadingMenuItem = () => (
  <li>
    <a>
      <LoadingIcon />
      <span style={{
        whiteSpace: 'normal'
      }}>
        Načítám ...
      </span>
    </a>
  </li>
);

export default LoadingMenuItem;
