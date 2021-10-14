import React from 'react';
import PropTypes from 'prop-types';
import { FormLabel, FormCheck, OverlayTrigger, Tooltip } from 'react-bootstrap';
import classnames from 'classnames';

import Icon, { WarningIcon } from '../../icons';
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
      <OverlayTrigger
        placement="bottom"
        overlay={
          <Tooltip id={name} className="wider-tooltip">
            {error || warning}
          </Tooltip>
        }>
        <WarningIcon gapLeft className={error ? 'text-danger' : 'text-warning'} />
      </OverlayTrigger>
    ) : null;

  const iconClass = error
    ? 'text-error'
    : warning
    ? 'text-warning'
    : dirty
    ? 'text-primary'
    : !checked
    ? 'text-muted'
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
          {checked ? (
            <Icon icon={['far', 'check-square']} className={iconClass} />
          ) : (
            <Icon icon={['far', 'square']} className={iconClass} />
          )}

          {!children && warningIcon}
        </span>
        {Boolean(children) && (
          <FormLabel className="nice-checkbox-label">
            {children}
            {warningIcon}
          </FormLabel>
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
