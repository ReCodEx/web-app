import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'redux-form';
import { FormLabel, OverlayTrigger, Tooltip } from 'react-bootstrap';

import TheButton from '../../widgets/TheButton';
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

const ExpandingInputFilesField = ({
  fields,
  leftLabel = null,
  rightLabel = null,
  noItems = null,
  options,
  change,
  readOnly = false,
}) => (
  <div>
    {fields.length > 0 && (
      <table className="full-width">
        <thead>
          <tr>
            <th className="half-width">{Boolean(leftLabel) && <FormLabel>{leftLabel}</FormLabel>}</th>
            <th className="half-width">{Boolean(rightLabel) && <FormLabel>{rightLabel}</FormLabel>}</th>
            {!readOnly && <th />}
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
                  disabled={readOnly}
                />
              </td>
              <td className="valign-top">
                <Field
                  name={`${field}.name`}
                  component={TextField}
                  label={''}
                  validate={validate}
                  maxLength={64}
                  disabled={readOnly}
                />
              </td>
              {!readOnly && (
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
                    <TheButton onClick={() => fields.remove(index)}>
                      <CloseIcon />
                    </TheButton>
                  </OverlayTrigger>
                </td>
              )}
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
      {!readOnly && (
        <OverlayTrigger
          placement="right"
          overlay={
            <Tooltip id={Date.now()}>
              <FormattedMessage id="app.expandingInputFilesField.tooltip.add" defaultMessage="Add another file." />
            </Tooltip>
          }>
          <TheButton onClick={() => fields.push(EMPTY_VALUE)}>
            <AddIcon />
          </TheButton>
        </OverlayTrigger>
      )}
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
  leftLabel: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  rightLabel: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  noItems: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  options: PropTypes.array,
  change: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
};

export default ExpandingInputFilesField;
