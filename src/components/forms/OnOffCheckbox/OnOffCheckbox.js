import React from 'react';
import PropTypes from 'prop-types';
import Toggle from 'react-toggle';
import { FormLabel } from 'react-bootstrap';
import classnames from 'classnames';
import { WarningIcon } from '../../icons';

import 'react-toggle/style.css';
import './OnOffCheckbox.css';

const OnOffCheckbox = ({
  children,
  name,
  className,
  disabled,
  checked,
  error,
  warning,
  dirty,
  id = name,
  ...props
}) => (
  <FormLabel
    className={classnames({
      [className]: className && className.length > 0,
      onOffCheckboxLabelDisabled: disabled,
      onOffCheckboxLabel: !disabled,
    })}>
    <Toggle {...props} checked={checked} name={name} id={id} value={checked ? 'true' : 'false'} disabled={disabled} />
    <span className="onOffCheckboxLabelText">
      {children}
      {Boolean(error || warning) && (
        <WarningIcon
          gapLeft={2}
          className={error ? 'text-danger' : 'text-warning'}
          tooltipId={`${id}-tooltip`}
          tooltipPlacement="bottom"
          tooltip={error || warning}
        />
      )}
    </span>
  </FormLabel>
);

OnOffCheckbox.propTypes = {
  checked: PropTypes.bool,
  children: PropTypes.any,
  disabled: PropTypes.bool,
  error: PropTypes.any,
  warning: PropTypes.any,
  dirty: PropTypes.bool,
  id: PropTypes.string,
  name: PropTypes.string,
  className: PropTypes.string,
};

export default OnOffCheckbox;
