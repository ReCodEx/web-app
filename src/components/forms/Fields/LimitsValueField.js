import React from 'react';
import PropTypes from 'prop-types';

import { TextField } from '../Fields';

import styles from './EditLimitsField.less';

const LimitsValueField = ({ input, prettyPrint, ...props }) => (
  <tr>
    <td width="100%" rowSpan="2">
      <TextField {...props} input={input} />
    </td>
    <td className={styles.buttonsCol}>
      <b>{prettyPrint(input.value)}</b>
    </td>
  </tr>
);

LimitsValueField.propTypes = {
  input: PropTypes.shape({
    value: PropTypes.any.isRequired,
  }).isRequired,
  prettyPrint: PropTypes.func.isRequired,
};

export default LimitsValueField;
