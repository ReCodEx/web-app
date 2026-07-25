import React from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Tooltip, Badge } from 'react-bootstrap';

const EnvironmentsListItem = ({ runtimeEnvironment, longNames = false, idPrefix = '' }) =>
  runtimeEnvironment ? (
    <OverlayTrigger
      placement="bottom"
      overlay={
        <Tooltip id={`env-list-item-${idPrefix}-${runtimeEnvironment.id}`}>{runtimeEnvironment.description}</Tooltip>
      }>
      <Badge className="tag-margin" bg="secondary">
        {longNames ? runtimeEnvironment.longName : runtimeEnvironment.name}
      </Badge>
    </OverlayTrigger>
  ) : (
    '?'
  );

EnvironmentsListItem.propTypes = {
  runtimeEnvironment: PropTypes.object,
  longNames: PropTypes.bool,
  idPrefix: PropTypes.string,
};

export default EnvironmentsListItem;
