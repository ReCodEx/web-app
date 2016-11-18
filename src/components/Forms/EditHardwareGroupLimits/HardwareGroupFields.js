import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { Field } from 'redux-form';
import { Row, Col } from 'react-bootstrap';
import { BytesTextField, SecondsTextField } from '../Fields';

const sortTests = (tests) => {
  return tests.sort(
    (a, b) => a.localeCompare(b)
  );
};

const HardwareGroupFields = ({ prefix, i, limits }) => {
  const { tests } = limits[i];
  return (
    <Row>
      {sortTests(Object.keys(tests)).map((testName, j) => (
        <Col lg={6} key={j}>
          <h4>
            <FormattedMessage id='app.hardwareGroupFields.test' defaultMessage='Test:' />{' '}<b>{testName}</b>
          </h4>
          {Object.keys(tests[testName]).map((taskId, k) => (
            <div key={k}>
              <Field
                name={`${prefix}.tests.${testName}.${taskId}.time`}
                component={SecondsTextField}
                label={
                  <FormattedMessage
                    id='app.hardwareGroupFields.timeLimit'
                    defaultMessage='Time limit for "{taskId}":'
                    values={{ taskId }} />
                } />
              <Field
                name={`${prefix}.tests.${testName}.${taskId}.memory`}
                component={BytesTextField}
                label={
                  <FormattedMessage
                    id='app.hardwareGroupFields.memoryLimit'
                    defaultMessage='Memory limit for "{taskId}":'
                    values={{ taskId }} />
                } />
            </div>
          ))}
        </Col>
      ))}
    </Row>
  );
};

HardwareGroupFields.propTypes = {
  prefix: PropTypes.string.isRequired,
  i: PropTypes.number,
  limits: PropTypes.array.isRequired
};

export default HardwareGroupFields;
