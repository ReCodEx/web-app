import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, Checkbox, OverlayTrigger, Tooltip } from 'react-bootstrap';
import Icon, { WarningIcon } from '../../icons';

const SimpleCheckboxField = ({ input, meta: { dirty, error, warning }, ignoreDirty = false, ...props }) => {
  return (
    <FormGroup
      validationState={error ? 'error' : warning ? 'warning' : dirty && !ignoreDirty ? 'success' : undefined}
      controlId={input.name}
      className="no-margin">
      <Checkbox {...props} {...input} checked={Boolean(input.value)} className="simple-checkbox-container">
        <span className="checkmark">
          {input.value ? <Icon icon={['far', 'check-square']} /> : <Icon icon={['far', 'square']} />}
        </span>

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
      </Checkbox>
    </FormGroup>
  );
};

SimpleCheckboxField.propTypes = {
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
  ignoreDirty: PropTypes.bool,
};

export default SimpleCheckboxField;
