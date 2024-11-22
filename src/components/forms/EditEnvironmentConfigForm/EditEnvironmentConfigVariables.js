import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'redux-form';
import { FormLabel, OverlayTrigger, Tooltip } from 'react-bootstrap';

import Button from '../../widgets/TheButton';
import TextField from '../Fields/TextField.js';
import SelectField from '../Fields/SelectField.js';
import { AddIcon, CloseIcon } from '../../icons';

const EMPTY_VALUE = { file: '', name: '', type: 'file[]' };

const _validateBrackets = value => {
  const [prefix, ...tokens] = value.split('{');
  return (
    prefix.match(/^[-a-zA-Z0-9_.,*?]*$/) &&
    tokens.reduce((res, token) => res && token.match(/^[-a-zA-Z0-9_.,]+}[-a-zA-Z0-9_.,*?]*$/), true)
  );
};

const validateWildcard = value => {
  return !value || !value.match(/^[-a-zA-Z0-9_.,{}*?]+$/) || !_validateBrackets(value) ? (
    <FormattedMessage
      id="app.editEnvironmentConfig.validateWildcard"
      defaultMessage="This value is not a valid file name or wildcard."
    />
  ) : undefined;
};

const VARIABLE_TYPES_OPTIONS = [
  { name: 'file', key: 'file' },
  { name: 'file[]', key: 'file[]' },
];

const EditEnvironmentConfigVariables = ({ fields, noItems = null }) => (
  <div>
    {fields.length > 0 && (
      <table className="w-100">
        <thead>
          <tr>
            <th width="40%">
              <FormLabel>
                <FormattedMessage id="app.editEnvironmentConfig.variableName" defaultMessage="Source Files Variable" />:
              </FormLabel>
            </th>
            <th width="40%">
              <FormLabel>
                <FormattedMessage id="app.editEnvironmentConfig.variableValue" defaultMessage="Wildcard Pattern" />:
              </FormLabel>
            </th>
            <th width="20%">
              <FormLabel>
                <FormattedMessage id="app.editEnvironmentConfig.variableType" defaultMessage="Type" />:
              </FormLabel>
            </th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field, index) => (
            <tr key={index}>
              <td className="align-top">
                <Field
                  name={`${field}.name`}
                  component={TextField}
                  label={''}
                  maxLength={64}
                  list="editEnvironmentConfigVariablesNames"
                  groupClassName="mb-1"
                />
              </td>
              <td className="align-top">
                <Field
                  name={`${field}.value`}
                  component={TextField}
                  label={''}
                  validate={validateWildcard}
                  maxLength={64}
                  groupClassName="mb-1"
                />
              </td>
              <td className="align-top">
                <Field
                  name={`${field}.type`}
                  component={SelectField}
                  label={''}
                  options={VARIABLE_TYPES_OPTIONS}
                  groupClassName="mb-1"
                  append={
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip id={Date.now()}>
                          <FormattedMessage
                            id="app.editEnvironmentConfig.tooltip.remove"
                            defaultMessage="Remove this variable."
                          />
                        </Tooltip>
                      }>
                      <Button onClick={() => fields.remove(index)} size="xs" noShadow>
                        <CloseIcon fixedWidth />
                      </Button>
                    </OverlayTrigger>
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}

    <div className="text-center">
      {fields.length === 0 && (
        <span className="pe-3">
          {noItems || (
            <FormattedMessage
              id="app.editEnvironmentConfig.noVariables"
              defaultMessage="There are no variables yet..."
            />
          )}
        </span>
      )}
      <OverlayTrigger
        placement="right"
        overlay={
          <Tooltip id={Date.now()}>
            <FormattedMessage id="app.editEnvironmentConfig.tooltip.add" defaultMessage="Add another variable." />
          </Tooltip>
        }>
        <Button onClick={() => fields.push(EMPTY_VALUE)} size="sm">
          <AddIcon />
        </Button>
      </OverlayTrigger>
    </div>
  </div>
);

EditEnvironmentConfigVariables.propTypes = {
  fields: PropTypes.object.isRequired,
  meta: PropTypes.shape({
    active: PropTypes.bool,
    dirty: PropTypes.bool,
    error: PropTypes.any,
    warning: PropTypes.any,
  }).isRequired,
  noItems: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
};

export default EditEnvironmentConfigVariables;
