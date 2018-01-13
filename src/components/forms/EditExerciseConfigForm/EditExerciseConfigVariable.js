import React from 'react';
import { injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Row, Col } from 'react-bootstrap';
import { Field, FieldArray } from 'redux-form';
import {
  TextField,
  SelectField,
  ExpandingTextField,
  ExpandingSelectField
} from '../Fields';
import ResourceRenderer from '../../helpers/ResourceRenderer';

const EditExerciseConfigVariable = ({
  prefix,
  data,
  supplementaryFiles,
  intl
}) =>
  <td key={data.name}>
    <Row>
      <Col xs={12}>
        <b>
          {data.name + ':'}
        </b>
      </Col>
    </Row>
    <Row>
      <Col xs={12}>
        {(data.type === 'string' || data.type === 'file') &&
          <Field
            name={`${prefix}.value`}
            style={{ marginTop: '-20px' }}
            component={TextField}
            label={''}
          />}
        {data.type === 'remote-file' &&
          <ResourceRenderer resource={supplementaryFiles.toArray()}>
            {(...supplementaryFiles) =>
              <Field
                name={`${prefix}.value`}
                style={{ marginTop: '-20px' }}
                component={SelectField}
                label={''}
                options={[{ key: '', name: '...' }].concat(
                  supplementaryFiles
                    .sort((a, b) => a.name.localeCompare(b.name, intl.locale))
                    .filter((item, pos, arr) => arr.indexOf(item) === pos)
                    .map(data => ({
                      key: data.hashName,
                      name: data.name
                    }))
                )}
              />}
          </ResourceRenderer>}
        {(data.type === 'string[]' || data.type === 'file[]') &&
          <FieldArray
            name={`${prefix}.value`}
            style={{ marginTop: '-20px' }}
            component={ExpandingTextField}
            label={''}
          />}
        {data.type === 'remote-file[]' &&
          <ResourceRenderer resource={supplementaryFiles.toArray()}>
            {(...supplementaryFiles) =>
              <FieldArray
                name={`${prefix}.value`}
                style={{ marginTop: '-20px' }}
                component={ExpandingSelectField}
                label={''}
                options={[{ key: '', name: '...' }].concat(
                  supplementaryFiles
                    .sort((a, b) => a.name.localeCompare(b.name, intl.locale))
                    .filter((item, pos, arr) => arr.indexOf(item) === pos)
                    .map(data => ({
                      key: data.hashName,
                      name: data.name
                    }))
                )}
              />}
          </ResourceRenderer>}
      </Col>
    </Row>
  </td>;

EditExerciseConfigVariable.propTypes = {
  prefix: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
  supplementaryFiles: ImmutablePropTypes.map,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired
};

export default injectIntl(EditExerciseConfigVariable);
