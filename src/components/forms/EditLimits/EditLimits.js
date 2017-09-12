import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Label } from 'react-bootstrap';

import EditEnvironmentLimitsForm from './EditEnvironmentLimitsForm';

import styles from './styles.less';

const EditLimits = ({ environments = [], ...props }) =>
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
          <EditEnvironmentLimitsForm
            {...props}
            form={`editEnvironmentLimits-${id}`}
          />
        </div>
      </Col>
    )}
  </Row>;

EditLimits.propTypes = {
  environments: PropTypes.array
};

export default EditLimits;
