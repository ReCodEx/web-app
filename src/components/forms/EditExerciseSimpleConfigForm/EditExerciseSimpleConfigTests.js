import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FieldArray, Field } from 'redux-form';
import { Row, Col } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

import { SelectField } from '../Fields';

const EditExerciseSimpleConfigTests = ({ prefix, i, runtimeEnvironments }) =>
  <div>
    <Field
      name={`${prefix}.runtimeEnvironmentId`}
      component={SelectField}
      options={[{ key: '', name: '...' }].concat(
        Object.keys(runtimeEnvironments.toJS()).map(key => ({
          key,
          name: runtimeEnvironments.toJS()[key].data.name
        }))
      )}
      label={
        <FormattedMessage
          id="app.editExerciseSimpleConfigTests.runtimeEnvironment"
          defaultMessage="Runtime environment:"
        />
      }
    />
    <FieldArray
      name={`${prefix}.tests`}
      component={() => {
        return (
          <Row>
            <Col lg={3}>
              <div />
            </Col>
          </Row>
        );
      }}
      prefix={`${prefix}.tests`}
    />
  </div>;

EditExerciseSimpleConfigTests.propTypes = {
  prefix: PropTypes.string.isRequired,
  i: PropTypes.number.isRequired,
  runtimeEnvironments: ImmutablePropTypes.map
};

export default EditExerciseSimpleConfigTests;
