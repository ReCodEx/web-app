import React from 'react';
import { LoadingIcon } from '../../../icons';

const LoadingMenuItem = () =>
  <li>
    <a>
      <LoadingIcon />
      <span
        style={{
          whiteSpace: 'normal'
        }}
      >
        Načítám ...
      </span>
    </a>
  </li>;

export default LoadingMenuItem;
