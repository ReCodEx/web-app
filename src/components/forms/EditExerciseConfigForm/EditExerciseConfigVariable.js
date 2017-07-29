import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Row, Col } from 'react-bootstrap';
import { Field } from 'redux-form';
import { TextField, SelectField } from '../Fields';
import ResourceRenderer from '../../helpers/ResourceRenderer';

const EditExerciseConfigVariable = ({ prefix, data, supplementaryFiles }) =>
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
        {data.type === 'string' &&
          <Field
            name={`${prefix}.value`}
            style={{ marginTop: '-20px' }}
            component={TextField}
            label={''}
          />}
        {data.type === 'file' &&
          <ResourceRenderer resource={supplementaryFiles.toArray()}>
            {(...supplementaryFiles) =>
              <Field
                name={`${prefix}.value`}
                style={{ marginTop: '-20px' }}
                component={SelectField}
                label={''}
                options={[{ key: '', name: '...' }].concat(
                  supplementaryFiles
                    .sort((a, b) => (a.name < b.name ? -1 : +(a.name > b.name))) // sort lexicographicaly
                    .map(data => {
                      const obj = {};
                      obj['key'] = data.hashName;
                      obj['name'] = data.name;
                      return obj;
                    })
                )}
              />}
          </ResourceRenderer>}
      </Col>
    </Row>
  </td>;

EditExerciseConfigVariable.propTypes = {
  prefix: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
  supplementaryFiles: ImmutablePropTypes.map
};

export default EditExerciseConfigVariable;
