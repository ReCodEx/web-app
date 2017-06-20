import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import { Field } from 'redux-form';
import { TextField, SelectField } from '../Fields';

const EditExerciseConfigVariable = ({ prefix, data }) =>
  <td key={data.name}>
    <Row>
      <Col xs={12}>
        <b>{data.name + ':'}</b>
      </Col>
    </Row>
    <Row>
      <Col xs={4} style={{ paddingRight: '0px' }}>
        <Field
          style={{ marginTop: '-20px' }}
          name={`${prefix}.type`}
          component={SelectField}
          options={[
            { key: 'string', name: 'String' },
            { key: 'file', name: 'File' }
          ]}
          label={''}
        />
      </Col>
      <Col xs={8} style={{ paddingLeft: '0px' }}>
        <Field
          style={{ marginTop: '-20px' }}
          name={`${prefix}.value`}
          component={TextField}
          label={''}
        />
      </Col>
    </Row>
  </td>;

EditExerciseConfigVariable.propTypes = {
  prefix: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired
};

export default EditExerciseConfigVariable;
