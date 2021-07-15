import React from 'react';
import PropTypes from 'prop-types';

import { TextField } from '../Fields';

import styles from './EditLimitsField.less';

const LimitsValueField = ({ input, prettyPrint, ...props }) => (
  <span className={styles.limitsFieldWrapper}>
    <TextField {...props} input={input} />
    <b className={`${styles.limitsValue} text-muted`}>{prettyPrint(input.value)}</b>
  </span>
);

LimitsValueField.propTypes = {
  input: PropTypes.shape({
    value: PropTypes.any.isRequired,
  }).isRequired,
  prettyPrint: PropTypes.func.isRequired,
};

export default LimitsValueField;
