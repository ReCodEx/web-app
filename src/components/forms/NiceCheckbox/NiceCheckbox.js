import React from 'react';
import PropTypes from 'prop-types';
import { FormCheck } from 'react-bootstrap';
import classnames from 'classnames';

import { SquareIcon, WarningIcon } from '../../icons';
import './NiceCheckbox.css';

const NiceCheckbox = ({
  children,
  name,
  value,
  onChange,
  className,
  disabled,
  checked,
  error,
  warning,
  dirty,
  ...props
}) => {
  const warningIcon =
    error || warning ? (
      <WarningIcon
        gapLeft={2}
        className={error ? 'text-danger' : 'text-warning'}
        tooltipId={name}
        tooltipPlacement="bottom"
        tooltip={error || warning}
      />
    ) : null;

  const iconClass = error
    ? 'text-error'
    : warning
      ? 'text-warning'
      : dirty
        ? 'text-primary'
        : !checked
          ? 'text-body-secondary'
          : undefined;

  return (
    <FormCheck {...props} checked={checked} className="nice-checkbox-container">
      <label
        className={classnames({
          'form-check-label': true,
          'text-danger': error,
          'text-warninig': !error && warning,
        })}>
        <input type="checkbox" name={name} value={value} checked={checked} onChange={onChange} />
        <span className="nice-checkbox-checkmark">
          <SquareIcon checked={checked} className={iconClass} />
          {!children && warningIcon}
        </span>
        {Boolean(children) && (
          <span className="nice-checkbox-label">
            {children}
            {warningIcon}
          </span>
        )}
      </label>
    </FormCheck>
  );
};

NiceCheckbox.propTypes = {
  checked: PropTypes.bool,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  onChange: PropTypes.func,
  children: PropTypes.any,
  disabled: PropTypes.bool,
  dirty: PropTypes.bool,
  className: PropTypes.string,
  error: PropTypes.any,
  warning: PropTypes.any,
};

export default NiceCheckbox;
