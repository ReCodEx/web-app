import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, FormCheck, OverlayTrigger, Tooltip } from 'react-bootstrap';
import classnames from 'classnames';
import Icon, { WarningIcon } from '../../icons';

const SimpleCheckboxField = ({ input, meta: { dirty, error, warning }, ignoreDirty = false, ...props }) => {
  return (
    <FormGroup controlId={input.name} className="no-margin">
      <FormCheck
        type="checkbox"
        {...props}
        {...input}
        checked={Boolean(input.value)}
        className="simple-checkbox-container">
        <label
          className={classnames({
            'form-check-label': true,
            'text-danger': error,
            'text-warninig': !error && warning,
          })}>
          <input
            type="checkbox"
            name={input.name}
            value={input.value}
            checked={input.value}
            onChange={input.onChange}
          />
          <span className="checkmark">
            {input.value ? <Icon icon={['far', 'check-square']} /> : <Icon icon={['far', 'square']} />}

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
          </span>
        </label>
      </FormCheck>
    </FormGroup>
  );
};

SimpleCheckboxField.propTypes = {
  input: PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    onChange: PropTypes.func,
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
