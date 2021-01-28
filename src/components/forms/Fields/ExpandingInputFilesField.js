import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'redux-form';
import { ControlLabel, OverlayTrigger, Tooltip } from 'react-bootstrap';

import FlatButton from '../../widgets/FlatButton';
import SelectField from './SelectField';
import TextField from './TextField';
import { AddIcon, CloseIcon } from '../../icons';

const EMPTY_VALUE = { file: '', name: '' };

const validate = value =>
  !value || value.trim() === '' ? (
    <FormattedMessage id="app.expandingInputFilesField.validateEmpty" defaultMessage="This value must not be empty." />
  ) : undefined;

const handleSelectChange = (oldValue, fieldName, change) => e => {
  if (oldValue.file === oldValue.name || (!oldValue.file && !oldValue.name)) {
    change(fieldName, e.target.value);
  }
};

const ExpandingInputFilesField = ({ fields, leftLabel = null, rightLabel = null, noItems = null, options, change }) => (
  <div>
    {fields.length > 0 && (
      <table>
        <thead>
          <tr>
            <th width="50%">{Boolean(leftLabel) && <ControlLabel>{leftLabel}</ControlLabel>}</th>
            <th width="50%">{Boolean(rightLabel) && <ControlLabel>{rightLabel}</ControlLabel>}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {fields.map((field, index) => (
            <tr key={index}>
              <td className="valign-top">
                <Field
                  name={`${field}.file`}
                  component={SelectField}
                  label={''}
                  options={options}
                  addEmptyOption={true}
                  validate={validate}
                  onChange={handleSelectChange(fields.get(index), `${field}.name`, change)}
                />
              </td>
              <td className="valign-top">
                <Field name={`${field}.name`} component={TextField} label={''} validate={validate} maxLength={64} />
              </td>
              <td className="valign-top">
                <OverlayTrigger
                  placement="top"
                  overlay={
                    <Tooltip id={Date.now()}>
                      <FormattedMessage
                        id="app.expandingInputFilesField.tooltip.remove"
                        defaultMessage="Remove this file."
                      />
                    </Tooltip>
                  }>
                  <FlatButton onClick={() => fields.remove(index)}>
                    <CloseIcon />
                  </FlatButton>
                </OverlayTrigger>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
    <div className="text-center">
      {fields.length === 0 && (
        <span style={{ paddingRight: '2em' }}>
          {noItems || (
            <FormattedMessage id="app.expandingInputFilesField.noFiles" defaultMessage="There are no files yet..." />
          )}
        </span>
      )}
      <OverlayTrigger
        placement="right"
        overlay={
          <Tooltip id={Date.now()}>
            <FormattedMessage id="app.expandingInputFilesField.tooltip.add" defaultMessage="Add another file." />
          </Tooltip>
        }>
        <FlatButton onClick={() => fields.push(EMPTY_VALUE)}>
          <AddIcon />
        </FlatButton>
      </OverlayTrigger>
    </div>
  </div>
);

ExpandingInputFilesField.propTypes = {
  fields: PropTypes.object.isRequired,
  meta: PropTypes.shape({
    active: PropTypes.bool,
    dirty: PropTypes.bool,
    error: PropTypes.any,
    warning: PropTypes.any,
  }).isRequired,
  leftLabel: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) }),
  ]),
  rightLabel: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) }),
  ]),
  noItems: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) }),
  ]),
  options: PropTypes.array,
  change: PropTypes.func.isRequired,
};

export default ExpandingInputFilesField;
