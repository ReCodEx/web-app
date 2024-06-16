import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { arrayToObject } from '../../../helpers/common';
import * as styles from './InsetPanel.less';

// Inset panel replaces old <Well> component from bootstrap 3
const InsetPanel = ({ children, className = '', size = '', ...props }) => {
  const givenClasses = className
    .split(' ')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  return (
    <div
      className={classnames({
        [styles.insetPanel]: true,
        [styles.large]: size === 'large' || size === 'lg',
        [styles.small]: size === 'small' || size === 'sm',
        ...arrayToObject(
          givenClasses,
          cls => cls, // values become keys
          () => true // new values are 'trues'
        ),
      })}
      {...props}>
      {children}
    </div>
  );
};

InsetPanel.propTypes = {
  className: PropTypes.string,
  size: PropTypes.string,
  children: PropTypes.any,
};

export default InsetPanel;
