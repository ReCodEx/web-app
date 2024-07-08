import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'redux-form';
import { FormLabel, OverlayTrigger, Tooltip } from 'react-bootstrap';

import Button from '../../widgets/TheButton';
import SelectField from './SelectField.js';
import TextField from './TextField.js';
import { AddIcon, CloseIcon } from '../../icons';

const EMPTY_VALUE = { file: '', name: '' };

const handleSelectChange = (oldValue, fieldName, change) => e => {
  if (oldValue.file === oldValue.name || (!oldValue.file && !oldValue.name)) {
    change(fieldName, e.target.value);
  }
};

const ExpandingInputFilesField = ({
  fields,
  leftLabel = null,
  rightLabel = null,
  noItemsLabel = null,
  noItems = null,
  options,
  change,
  readOnly = false,
}) => {
  if (fields.length === 0 && noItemsLabel) {
    leftLabel = noItemsLabel;
  }

  return (
    <table className="full-width">
      <thead>
        <tr>
          <th className="half-width">{Boolean(leftLabel) && <FormLabel>{leftLabel}</FormLabel>}</th>
          {fields.length > 0 && (
            <th className="half-width">{Boolean(rightLabel) && <FormLabel>{rightLabel}</FormLabel>}</th>
          )}
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
                onChange={handleSelectChange(fields.get(index), `${field}.name`, change)}
                disabled={readOnly}
                groupClassName="mb-1"
              />
            </td>

            <td className="valign-top">
              <Field
                name={`${field}.name`}
                component={TextField}
                label={''}
                maxLength={64}
                disabled={readOnly}
                groupClassName="mb-1"
                append={
                  readOnly ? null : (
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
                      <Button onClick={() => fields.remove(index)} size="xs" noShadow>
                        <CloseIcon fixedWidth />
                      </Button>
                    </OverlayTrigger>
                  )
                }
              />
            </td>
          </tr>
        ))}

        {(fields.length === 0 || !readOnly) && (
          <tr>
            <td
              className={fields.length === 0 ? 'text-muted small' : 'text-center small'}
              colSpan={fields.length === 0 ? 1 : 2}>
              {fields.length === 0 && (
                <span className="pr-3">
                  {noItems || (
                    <FormattedMessage
                      id="app.expandingInputFilesField.noFiles"
                      defaultMessage="There are no files yet..."
                    />
                  )}
                </span>
              )}

              {!readOnly && (
                <OverlayTrigger
                  placement="right"
                  overlay={
                    <Tooltip id={Date.now()}>
                      <FormattedMessage
                        id="app.expandingInputFilesField.tooltip.add"
                        defaultMessage="Add another file."
                      />
                    </Tooltip>
                  }>
                  <Button onClick={() => fields.push(EMPTY_VALUE)} size="xs">
                    <AddIcon />
                  </Button>
                </OverlayTrigger>
              )}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

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
  noItemsLabel: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  noItems: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  options: PropTypes.array,
  change: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
};

export default ExpandingInputFilesField;
