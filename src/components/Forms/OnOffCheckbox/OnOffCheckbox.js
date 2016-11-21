import React, { PropTypes } from 'react';
import Toggle from 'react-toggle';
import { ControlLabel } from 'react-bootstrap';
import classNames from 'classnames';

import styles from './Checkbox.less';
import 'react-toggle/style.css';

import './OnOffCheckbox.css'; // eslint-disable-line import/no-deprecated

const OnOffCheckbox = ({
  children,
  controlId,
  className,
  disabled,
  value,
  ...props
}) => (
  <ControlLabel
    htmlFor={controlId}
    className={classNames({
      [className]: className && className.length > 0,
      [styles.labelDisabled]: disabled,
      [styles.label]: !disabled
    })}>
    <span className={styles.inputWrapper}>
      <Toggle {...props} value={value ? 'yes' : 'no'} id={controlId} disabled={disabled} />
    </span>
    <span className={styles.labelText}>
      {children}
    </span>
  </ControlLabel>
);

OnOffCheckbox.propTypes = {
  value: PropTypes.bool,
  children: PropTypes.any,
  disabled: PropTypes.bool,
  controlId: PropTypes.any,
  className: PropTypes.string
};

export default OnOffCheckbox;
