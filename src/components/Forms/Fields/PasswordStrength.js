import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

import {
  FormGroup,
  ControlLabel,
  ProgressBar
} from 'react-bootstrap';

const getStyle = (level) => {
  switch (level) {
    case 0:
      return 'danger';
    case 1:
    case 2:
      return 'warning';
    case 3:
      return 'info';
    case 4:
      return 'success';
  }
};

const getPercent = (level) => 20 + 20 * level;

const PasswordStrength = ({
  input: {
    name,
    value: level
  },
  label
}) => (
  <FormGroup controlId={name}>
    <ProgressBar
      bsStyle={getStyle(level)}
      now={getPercent(level)}
      striped={level === 0}
      active={level === 0} />
  </FormGroup>
);

PasswordStrength.propTypes = {
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) })
  ]).isRequired
};

export default PasswordStrength;
