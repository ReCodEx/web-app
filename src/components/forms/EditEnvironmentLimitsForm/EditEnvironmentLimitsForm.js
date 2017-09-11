import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
// import { FormattedMessage } from 'react-intl';
// import { TabbedArrayField } from '../Fields';
// import EditEnvironmentLimitsFields from './EditEnvironmentLimitsFields';

import { Row, Col } from 'react-bootstrap';

const EditEnvironmentLimitsForm = ({
  environments = [],
  runtimeEnvironments,
  ...props
}) =>
  <Row>
    {environments.map(environment =>
      <Col key={environment}>
        <h3>
          {environment.name}
        </h3>
        {JSON.stringify(environment)}
        {/* <EditEnvironmentLimitsFields /> */}
      </Col>
    )}
  </Row>;

EditEnvironmentLimitsForm.propTypes = {
  environments: PropTypes.array,
  runtimeEnvironments: ImmutablePropTypes.map
};

export default EditEnvironmentLimitsForm;
