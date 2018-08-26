import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'redux-form';
import { ControlLabel, OverlayTrigger, Tooltip } from 'react-bootstrap';

import FlatButton from '../../widgets/FlatButton';
import TextField from '../Fields/TextField';
import { AddIcon, CloseIcon } from '../../icons';

const EMPTY_VALUE = { file: '', name: '' };

const validateName = value => value.match(/^[-a-zA-Z0-9_]+$/);

const _validateBrackets = value => {
  const [prefix, ...tokens] = value.split('{');
  return (
    prefix.match(/^[-a-zA-Z0-9_.,*?]*$/) &&
    tokens.reduce(
      (res, token) =>
        res && token.match(/^[-a-zA-Z0-9_.,]+}[-a-zA-Z0-9_.,*?]*$/),
      true
    )
  );
};

const validateWildcard = value => {
  return !value ||
  !value.match(/^[-a-zA-Z0-9_.,{}*?]+$/) ||
  !_validateBrackets(value)
    ? <FormattedMessage
        id="app.editEnvironmentConfig.validateNotWildcard"
        defaultMessage="This value is not a valid file name or wildcard."
      />
    : undefined;
};

const EditEnvironmentConfigVariables = ({
  nameSuggestions = [],
  fields,
  meta: { active, dirty, error, warning },
  leftLabel = '',
  rightLabel = '',
  noItems = null,
  options,
  ...props
}) =>
  <div>
    <datalist id="editEnvironmentConfigVariablesNames">
      {nameSuggestions.map(name =>
        <option key={name}>
          {name}
        </option>
      )}
    </datalist>

    {fields.length > 0 &&
      <table>
        <thead>
          <tr>
            <th width="50%">
              <ControlLabel>
                {leftLabel}
              </ControlLabel>
            </th>
            <th width="50%">
              <ControlLabel>
                {rightLabel}
              </ControlLabel>
            </th>
            <th />
          </tr>
        </thead>
        <tbody>
          {fields.map((field, index) =>
            <tr key={index}>
              <td className="valign-top">
                <Field
                  name={`${field}.name`}
                  component={TextField}
                  label={''}
                  validate={validateName}
                  maxLength={64}
                  list="editEnvironmentConfigVariablesNames"
                  {...props}
                />
              </td>
              <td className="valign-top">
                <Field
                  name={`${field}.value`}
                  component={TextField}
                  label={''}
                  validate={validateWildcard}
                  maxLength={64}
                  {...props}
                />
              </td>
              <td className="valign-top">
                <OverlayTrigger
                  placement="top"
                  overlay={
                    <Tooltip id={Date.now()}>
                      <FormattedMessage
                        id="app.editEnvironmentConfig.tooltip.remove"
                        defaultMessage="Remove this variable."
                      />
                    </Tooltip>
                  }
                >
                  <FlatButton onClick={() => fields.remove(index)}>
                    <CloseIcon />
                  </FlatButton>
                </OverlayTrigger>
              </td>
            </tr>
          )}
        </tbody>
      </table>}
    <div className="text-center">
      {fields.length === 0 &&
        <span style={{ paddingRight: '2em' }}>
          {noItems ||
            <FormattedMessage
              id="app.editEnvironmentConfig.noVariables"
              defaultMessage="There are no variables yet ..."
            />}
        </span>}
      <OverlayTrigger
        placement="right"
        overlay={
          <Tooltip id={Date.now()}>
            <FormattedMessage
              id="app.editEnvironmentConfig.tooltip.add"
              defaultMessage="Add another variable."
            />
          </Tooltip>
        }
      >
        <FlatButton onClick={() => fields.push(EMPTY_VALUE)}>
          <AddIcon />
        </FlatButton>
      </OverlayTrigger>
    </div>
  </div>;

EditEnvironmentConfigVariables.propTypes = {
  nameSuggestions: PropTypes.array,
  fields: PropTypes.object.isRequired,
  meta: PropTypes.shape({
    active: PropTypes.bool,
    dirty: PropTypes.bool,
    error: PropTypes.any,
    warning: PropTypes.any
  }).isRequired,
  leftLabel: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) })
  ]).isRequired,
  rightLabel: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) })
  ]).isRequired,
  noItems: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) })
  ]),
  options: PropTypes.array
};

export default EditEnvironmentConfigVariables;
