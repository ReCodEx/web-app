import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

const OptionalTooltipWrapper = ({ tooltip, tooltipId = Date.now(), placement = 'bottom', hide = false, children }) =>
  Boolean(tooltip) && !hide ? (
    <OverlayTrigger placement={placement} overlay={<Tooltip id={tooltipId}>{tooltip}</Tooltip>}>
      {children}
    </OverlayTrigger>
  ) : (
    children
  );

OptionalTooltipWrapper.propTypes = {
  tooltip: PropTypes.oneOfType([PropTypes.oneOf([FormattedMessage]), PropTypes.element, PropTypes.string]),
  tooltipId: PropTypes.string,
  placement: PropTypes.string,
  hide: PropTypes.bool,
  children: PropTypes.element.isRequired,
};

export default OptionalTooltipWrapper;
