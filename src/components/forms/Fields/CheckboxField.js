import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { FormGroup, Checkbox, OverlayTrigger, Tooltip } from 'react-bootstrap';

import OnOffCheckbox from '../OnOffCheckbox';
import { WarningIcon } from '../../icons';

const CheckboxField = ({
  input,
  onOff = false,
  meta: { dirty, error, warning },
  ignoreDirty = false,
  label,
  ...props
}) => {
  const Component = onOff ? OnOffCheckbox : Checkbox;
  /* eslint-disable no-unneeded-ternary */
  return (
    <FormGroup
      validationState={error ? 'error' : warning ? 'warning' : dirty && !ignoreDirty ? 'success' : undefined}
      controlId={input.name}>
      <Component {...props} {...input} checked={input.value ? true : false}>
        {label}
        {Boolean(error || warning) && (
          <OverlayTrigger
            placement="bottom"
            overlay={
              <Tooltip id={input.name} className="wider-tooltip">
                {error || warning}
              </Tooltip>
            }>
            <WarningIcon gapLeft className={error ? 'text-danger' : 'text-warning'} />
          </OverlayTrigger>
        )}
      </Component>
    </FormGroup>
  );
};

CheckboxField.propTypes = {
  input: PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  }).isRequired,
  meta: PropTypes.shape({
    dirty: PropTypes.bool,
    error: PropTypes.any,
    warning: PropTypes.any,
  }).isRequired,
  type: PropTypes.string,
  onOff: PropTypes.bool,
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) }),
  ]).isRequired,
  ignoreDirty: PropTypes.bool,
};

export default CheckboxField;
