import React from 'react';
import PropTypes from 'prop-types';
import Toggle from 'react-toggle';
import { FormLabel } from 'react-bootstrap';
import classnames from 'classnames';

import styles from './Checkbox.less';
import 'react-toggle/style.css';

import './OnOffCheckbox.css'; // eslint-disable-line import/no-deprecated

const OnOffCheckbox = ({ children, name, className, disabled, checked, ...props }) => (
  <FormLabel
    htmlFor={name}
    className={classnames({
      [className]: className && className.length > 0,
      [styles.labelDisabled]: disabled,
      [styles.label]: !disabled,
    })}>
    <span className={styles.inputWrapper}>
      <Toggle
        {...props}
        checked={checked}
        name={name}
        id={name}
        value={checked ? 'true' : 'false'}
        disabled={disabled}
      />
    </span>
    <span className={styles.labelText}>{children}</span>
  </FormLabel>
);

OnOffCheckbox.propTypes = {
  checked: PropTypes.bool,
  children: PropTypes.any,
  disabled: PropTypes.bool,
  name: PropTypes.string,
  className: PropTypes.string,
};

export default OnOffCheckbox;
