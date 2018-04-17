import React from 'react';
import { FormattedMessage } from 'react-intl';
import { LoadingIcon } from '../../../icons';

const LoadingMenuItem = () =>
  <li>
    <a>
      <LoadingIcon gapRight />
      <span
        style={{
          whiteSpace: 'normal'
        }}
      >
        <FormattedMessage id="generic.loading" defaultMessage="Loading ..." />
      </span>
    </a>
  </li>;

export default LoadingMenuItem;
