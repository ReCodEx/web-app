import React from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Tooltip, Badge } from 'react-bootstrap';

const EnvironmentsListItem = ({ runtimeEnvironment, longNames = false }) => (
  <OverlayTrigger placement="bottom" overlay={<Tooltip id={Date.now()}>{runtimeEnvironment.description}</Tooltip>}>
    <Badge className="tag-margin" variant="secondary">
      {longNames ? runtimeEnvironment.longName : runtimeEnvironment.name}
    </Badge>
  </OverlayTrigger>
);

EnvironmentsListItem.propTypes = {
  runtimeEnvironment: PropTypes.object,
  longNames: PropTypes.bool,
};

export default EnvironmentsListItem;
