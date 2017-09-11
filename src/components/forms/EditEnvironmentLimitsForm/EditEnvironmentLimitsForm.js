import React from 'react';
import PropTypes from 'prop-types';
import { reduxForm } from 'redux-form';
import { LimitsField } from '../Fields';

import { Row, Col, Label } from 'react-bootstrap';

const EditEnvironmentLimitsForm = ({ environments = [], tests, ...props }) =>
  <Row>
    {environments.map(({ id, name, platform, description }) =>
      <Col key={id} sm={Math.floor(12 / environments.length)}>
        <h3>
          {name} <Label>{platform}</Label>
        </h3>
        <p>
          {description}
        </p>

        {tests.map(test =>
          <LimitsField
            key={test}
            prefix={`limits.${test}`}
            test={test}
            label={test}
          />
        )}
      </Col>
    )}
  </Row>;

EditEnvironmentLimitsForm.propTypes = {
  environments: PropTypes.array,
  tests: PropTypes.array
};

export default reduxForm({
  form: 'editEnvironmentLimits'
})(EditEnvironmentLimitsForm);
