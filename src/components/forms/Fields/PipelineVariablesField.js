import React from 'react';
import PropTypes from 'prop-types';
import { Field, FieldArray } from 'redux-form';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Row, Col, Grid } from 'react-bootstrap';
import {
  TextField,
  SelectField,
  ExpandingTextField,
  ExpandingSelectField
} from '../Fields';
import ResourceRenderer from '../../helpers/ResourceRenderer';

const isArray = (firstVal, type = '') =>
  firstVal &&
  firstVal.length > 0 &&
  firstVal[0] !== '$' &&
  typeof type === 'string' &&
  type.indexOf('[]') === type.length - 2;

const firstValue = value => (Array.isArray(value) ? value[0] || '' : value);

const PipelineVariablesField = ({
  input,
  label,
  variables,
  supplementaryFiles,
  intl
}) =>
  <Grid fluid>
    <Row>
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
          <Col lg={6} key={i}>
            {(type === 'remote-file' || type === 'remote-file[]') &&
              <ResourceRenderer resource={supplementaryFiles.toArray()}>
                {(...supplementaryFiles) =>
                  isArray(firstValue(input.value[value]), type)
                    ? <FieldArray
                        name={`${input.name}.${value}`}
                        component={ExpandingSelectField}
                        options={[{ key: '', name: '...' }].concat(
                          supplementaryFiles
                            .sort((a, b) =>
                              a.name.localeCompare(b.name, intl.locale)
                            )
                            .filter(
                              (item, pos, arr) => arr.indexOf(item) === pos
                            )
                            .map(data => ({
                              key: data.hashName,
                              name: data.name
                            }))
                        )}
                        label={`${atob(value)}: `}
                      />
                    : <Field
                        name={`${input.name}.${value}`}
                        component={SelectField}
                        options={[{ key: '', name: '...' }].concat(
                          supplementaryFiles
                            .sort((a, b) =>
                              a.name.localeCompare(b.name, intl.locale)
                            )
                            .filter(
                              (item, pos, arr) => arr.indexOf(item) === pos
                            )
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
              (isArray(firstValue(input.value[value]), type)
                ? <FieldArray
                    key={value}
                    name={`${input.name}.${value}`}
                    component={ExpandingTextField}
                    label={`${atob(value)}: `}
                  />
                : <Field
                    key={value}
                    name={`${input.name}.${value}`}
                    component={TextField}
                    maxLength={255}
                    label={`${atob(value)}: `}
                  />)}
          </Col>
        )}
    </Row>
  </Grid>;

PipelineVariablesField.propTypes = {
  input: PropTypes.shape({
    name: PropTypes.string.isRequired
  }).isRequired,
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) })
  ]).isRequired,
  variables: PropTypes.array,
  supplementaryFiles: ImmutablePropTypes.map,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired
};

export default injectIntl(PipelineVariablesField);
