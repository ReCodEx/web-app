import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'redux-form';
import { Row, Col, HelpBlock } from 'react-bootstrap';
import { BytesTextField, SecondsTextField } from '../Fields';
import ReferenceSolutionsEvaluationsResults
  from '../../Submissions/ReferenceSolutionsEvaluationsResults';

const sortTests = tests => {
  return tests.sort((a, b) => a.localeCompare(b));
};

const HardwareGroupFields = ({
  prefix,
  i,
  limits,
  referenceSolutionsEvaluations
}) => {
  const { hardwareGroup, tests } = limits[i];
  const referenceSolutionsEvaluationsResults =
    referenceSolutionsEvaluations[hardwareGroup];
  return (
    <Row>
      {sortTests(Object.keys(tests)).map((testName, j) => (
        <Col lg={6} key={j}>
          <h4>
            <FormattedMessage
              id="app.hardwareGroupFields.test"
              defaultMessage="Test:"
            />
            {' '}
            <b>{testName}</b>
          </h4>
          {Object.keys(tests[testName]).map((taskId, k) => (
            <div key={k}>
              <Field
                name={`${prefix}.tests.${testName}.${taskId}.time`}
                component={SecondsTextField}
                label={
                  <FormattedMessage
                    id="app.hardwareGroupFields.timeLimit"
                    defaultMessage="Time limit for &quot;{taskId}&quot;:"
                    values={{ taskId }}
                  />
                }
              />
              <Field
                name={`${prefix}.tests.${testName}.${taskId}.memory`}
                component={BytesTextField}
                label={
                  <FormattedMessage
                    id="app.hardwareGroupFields.memoryLimit"
                    defaultMessage="Memory limit for &quot;{taskId}&quot;:"
                    values={{ taskId }}
                  />
                }
              />

              {referenceSolutionsEvaluationsResults &&
                <ReferenceSolutionsEvaluationsResults
                  testId={testName}
                  taskId={taskId}
                  results={referenceSolutionsEvaluationsResults}
                />}

              {!referenceSolutionsEvaluationsResults &&
                <HelpBlock>
                  <FormattedMessage
                    id="app.hardwareGroupFields.noReferenceSolutions"
                    defaultMessage="There are no reference solutions' evaluations' for test '{testName}' and its task '{taskId}'."
                    values={{ testName, taskId }}
                  />
                </HelpBlock>}
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
  limits: PropTypes.array.isRequired,
  referenceSolutionsEvaluations: PropTypes.object
};

export default HardwareGroupFields;
