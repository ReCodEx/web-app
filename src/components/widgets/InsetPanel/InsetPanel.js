import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { arrayToObject } from '../../../helpers/common';
import styles from './InsetPanel.less';

// Inset panel replaces old <Well> component from bootstrap 3
const InsetPanel = ({ children, className = '', bsSize = '' }) => {
  const givenClasses = className
    .split(' ')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  return (
    <div
      className={classnames({
        [styles.insetPanel]: true,
        [styles.large]: bsSize === 'large' || bsSize === 'lg',
        [styles.small]: bsSize === 'small' || bsSize === 'sm',
        ...arrayToObject(
          givenClasses,
          cls => cls, // values become keys
          () => true // new values are 'trues'
        ),
      })}>
      {children}
    </div>
  );
};

InsetPanel.propTypes = {
  className: PropTypes.string,
  bsSize: PropTypes.string,
  children: PropTypes.any,
};

export default InsetPanel;
