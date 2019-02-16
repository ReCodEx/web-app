import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { FormGroup, FormControl, ControlLabel, HelpBlock } from 'react-bootstrap';
import classnames from 'classnames';

import styles from './commonStyles.less';

const SelectField = ({
  input,
  meta: { active, dirty, warning, error },
  label = null,
  options,
  addEmptyOption = false,
  emptyOptionCaption = '...',
  ignoreDirty = false,
  associatedButton = null,
  ...props
}) => (
  <FormGroup controlId={input.name} validationState={error ? 'error' : warning ? 'warning' : undefined}>
    {Boolean(label) && <ControlLabel>{label}</ControlLabel>}

    <table className="full-width">
      <tbody>
        <tr>
          <td className="full-width valign-top">
            <FormControl
              {...input}
              {...props}
              componentClass="select"
              bsClass={classnames({
                'form-control': true,
                [styles.dirty]: dirty && !ignoreDirty && !error && !warning,
                [styles.active]: active,
                'full-width': true,
              })}>
              {addEmptyOption && (
                <option value={''} key={'-1'}>
                  {emptyOptionCaption}
                </option>
              )}
              {options.map(({ key, name }, i) => (
                <option value={key} key={i}>
                  {name}
                </option>
              ))}
            </FormControl>
          </td>
          {associatedButton && <td className="valign-top">{associatedButton}</td>}
        </tr>
      </tbody>
    </table>

    {error && <HelpBlock> {error} </HelpBlock>}
    {!error && warning && <HelpBlock> {warning} </HelpBlock>}
  </FormGroup>
);

SelectField.propTypes = {
  input: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
  meta: PropTypes.shape({
    active: PropTypes.bool,
    dirty: PropTypes.bool,
    error: PropTypes.any,
    warning: PropTypes.any,
  }).isRequired,
  type: PropTypes.string,
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) }),
  ]),
  options: PropTypes.array.isRequired,
  addEmptyOption: PropTypes.bool,
  emptyOptionCaption: PropTypes.string,
  associatedButton: PropTypes.any,
  ignoreDirty: PropTypes.bool,
};

export default SelectField;
