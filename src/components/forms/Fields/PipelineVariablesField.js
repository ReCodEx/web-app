import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { injectIntl, FormattedMessage } from 'react-intl';
import {
  TextField,
  SelectField,
  ExpandingTextField,
  ExpandingSelectField
} from '../Fields';
import ResourceRenderer from '../../helpers/ResourceRenderer';

const isArray = (type = '') =>
  typeof type === 'string' && type.indexOf('[]') === type.length - 2;

const PipelineVariablesField = ({
  input,
  label,
  variables,
  supplementaryFiles,
  intl
}) =>
  <div>
    <h4>
      {label}
    </h4>
    {variables.length === 0 &&
      <FormattedMessage
        id="app.portsField.empty"
        defaultMessage="There are no ports."
      />}
    {variables
      .reduce(
        (acc, variable) =>
          acc.find(used => used.value === variable.value)
            ? acc
            : [...acc, variable],
        []
      )
      .map(({ value, type }, i) =>
        <div key={i}>
          {(type === 'remote-file' || type === 'remote-file[]') &&
            <ResourceRenderer resource={supplementaryFiles.toArray()}>
              {(...supplementaryFiles) =>
                <Field
                  name={`${input.name}.${value}`}
                  component={isArray(type) ? ExpandingSelectField : SelectField}
                  options={[{ key: '', name: '...' }].concat(
                    supplementaryFiles
                      .sort((a, b) => a.name.localeCompare(b.name, intl.locale))
                      .filter((item, pos, arr) => arr.indexOf(item) === pos)
                      .map(data => ({
                        key: data.hashName,
                        name: data.name
                      }))
                  )}
                  label={`${atob(value)}: `}
                />}
            </ResourceRenderer>}
          {type !== 'remote-file' &&
            type !== 'remote-file[]' &&
            <Field
              key={value}
              name={`${input.name}.${value}`}
              component={isArray(type) ? ExpandingTextField : TextField}
              label={`${atob(value)}: `}
            />}
        </div>
      )}
  </div>;

PipelineVariablesField.propTypes = {
  input: PropTypes.shape({
    name: PropTypes.string.isRequired
  }).isRequired,
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) }),
    PropTypes.element
  ]).isRequired,
  variables: PropTypes.array,
  supplementaryFiles: ImmutablePropTypes.map,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired
};

export default injectIntl(PipelineVariablesField);
