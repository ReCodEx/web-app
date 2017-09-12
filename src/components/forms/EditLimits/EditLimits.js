import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Label } from 'react-bootstrap';

import EditEnvironmentLimitsForm from './EditEnvironmentLimitsForm';
import ResourceRenderer from '../../helpers/ResourceRenderer';

import styles from './styles.less';

const EditLimits = ({
  environments = [],
  editLimits,
  limits,
  config,
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
            {limits =>
              <EditEnvironmentLimitsForm
                {...props}
                config={config.find(forEnv => forEnv.name === id)}
                initialValues={{ limits }}
                form={`editEnvironmentLimits-${id}`}
                onSubmit={editLimits(id)}
              />}
          </ResourceRenderer>
        </div>
      </Col>
    )}
  </Row>;

EditLimits.propTypes = {
  config: PropTypes.array.isRequired,
  environments: PropTypes.array,
  editLimits: PropTypes.func.isRequired,
  limits: PropTypes.func.isRequired
};

export default EditLimits;
