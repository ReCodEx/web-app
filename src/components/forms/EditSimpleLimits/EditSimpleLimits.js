import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Label } from 'react-bootstrap';

import EditEnvironmentSimpleLimitsForm from './EditEnvironmentSimpleLimitsForm';
import ResourceRenderer from '../../helpers/ResourceRenderer';

import styles from './styles.less';

const formName = id => `editEnvironmentSimpleLimits-${id}`;

const fillInDefaultValuesWhereMissing = (testNames, limits) =>
  testNames.reduce(
    (acc, test) => ({
      ...acc,
      [test]: limits[test] || { memory: 0, 'wall-time': 0 }
    }),
    {}
  );

const EditSimpleLimits = ({
  environments = [],
  editLimits,
  limits,
  config,
  setHorizontally,
  setVertically,
  setAll,
  ...props
}) =>
  <Row>
    {environments.map(({ id, name, platform, description }, i) =>
      <Col key={id} sm={Math.floor(12 / environments.length)}>
        <div
          className={i % 2 === 0 ? styles.evenLimitsCol : styles.oddLimitsCol}
        >
          <h3>
            {name}
          </h3>
          <p>
            {description} <Label>{platform}</Label>
          </p>
          <ResourceRenderer resource={limits(id)}>
            {limits => {
              const envConfig = config.find(forEnv => forEnv.name === id);
              return (
                <EditEnvironmentSimpleLimitsForm
                  {...props}
                  envName={name}
                  config={envConfig}
                  initialValues={{
                    limits: fillInDefaultValuesWhereMissing(
                      envConfig.tests.map(test => test.name),
                      limits
                    )
                  }}
                  form={formName(id)}
                  onSubmit={editLimits(id)}
                  setHorizontally={setHorizontally(formName(id), id)}
                  setVertically={setVertically(formName(id), id)}
                  setAll={setAll(formName(id), id)}
                />
              );
            }}
          </ResourceRenderer>
        </div>
      </Col>
    )}
  </Row>;

EditSimpleLimits.propTypes = {
  config: PropTypes.array.isRequired,
  environments: PropTypes.array,
  editLimits: PropTypes.func.isRequired,
  limits: PropTypes.func.isRequired,
  setHorizontally: PropTypes.func.isRequired,
  setVertically: PropTypes.func.isRequired,
  setAll: PropTypes.func.isRequired
};

export default EditSimpleLimits;
