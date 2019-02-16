import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { FormGroup, ProgressBar } from 'react-bootstrap';

const getStyle = level => {
  switch (Number(level)) {
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

const maxLevel = 4;
const percentPerLevel = 100 / (maxLevel + 1);

const getPercent = level => percentPerLevel * (Number(level) + 1);
const getTitle = level => {
  switch (Number(level)) {
    case 0:
      return <FormattedMessage id="app.passwordStrength.worst" defaultMessage="Unsatisfactory" />;

    case 1:
      return <FormattedMessage id="app.passwordStrength.bad" defaultMessage="Are you sure?" />;

    case 2:
      return <FormattedMessage id="app.passwordStrength.somewhatOk" defaultMessage="You can do better." />;

    case 3:
      return <FormattedMessage id="app.passwordStrength.ok" defaultMessage="OK" />;

    case 4:
      return <FormattedMessage id="app.passwordStrength.good" defaultMessage="Good" />;

    default:
      return <FormattedMessage id="app.passwordStrength.unknown" defaultMessage="..." />;
  }
};

const PasswordStrength = ({ input: { name, value: level }, meta: { dirty }, label }) => (
  <FormGroup controlId={name}>
    {dirty && (
      <ProgressBar
        bsStyle={getStyle(level)}
        now={getPercent(level)}
        label={getTitle(level)}
        striped={level === 0}
        active={level === 0}
      />
    )}
  </FormGroup>
);

PasswordStrength.propTypes = {
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) }),
  ]).isRequired,
  input: PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }).isRequired,
  meta: PropTypes.shape({
    dirty: PropTypes.bool,
  }).isRequired,
};

export default PasswordStrength;
