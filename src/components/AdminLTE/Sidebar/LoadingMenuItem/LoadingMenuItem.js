import React from 'react';
import Icon from 'react-fontawesome';

const LoadingMenuItem = () => (
  <li>
    <a>
      <Icon name='circle-o-notch' />
      <span style={{
        whiteSpace: 'normal'
      }}>
        Načítám ...
      </span>
    </a>
  </li>
);

export default LoadingMenuItem;
