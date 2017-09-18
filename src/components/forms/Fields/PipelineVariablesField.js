import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import {
  TextField,
  SelectField,
  ExpandingTextField,
  ExpandingSelectField
} from '../Fields';
import ResourceRenderer from '../../helpers/ResourceRenderer';

const isArray = (type = '') => type.indexOf('[]') === type.length - 2;

const PipelineVariablesField = ({
  input,
  label,
  variables,
  supplementaryFiles
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
    {variables.map(({ value, type }, i) =>
      <div key={i}>
        {(type === 'remote-file' || type === 'remote-file[]') &&
          <ResourceRenderer resource={supplementaryFiles.toArray()}>
            {(...supplementaryFiles) =>
              <Field
                name={`${input.name}.${value}`}
                component={isArray(type) ? ExpandingSelectField : SelectField}
                options={[{ key: '', name: '...' }].concat(
                  supplementaryFiles
                    .sort((a, b) => a.name.localeCompare(b.name))
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
  remoteFiles: ImmutablePropTypes.map
};

export default PipelineVariablesField;
