import React from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

const OptionalTooltipWrapper = ({ tooltip, tooltipId, placement = 'bottom', hide = false, children }) =>
  Boolean(tooltip) && !hide ? (
    <OverlayTrigger placement={placement} overlay={<Tooltip id={tooltipId}>{tooltip}</Tooltip>}>
      {children}
    </OverlayTrigger>
  ) : (
    children
  );

OptionalTooltipWrapper.propTypes = {
  tooltip: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  tooltipId: PropTypes.string.isRequired,
  placement: PropTypes.string,
  hide: PropTypes.bool,
  children: PropTypes.element.isRequired,
};

export default OptionalTooltipWrapper;
