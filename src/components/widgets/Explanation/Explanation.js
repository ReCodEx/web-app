import React from 'react';
import PropTypes from 'prop-types';
import { Popover, OverlayTrigger } from 'react-bootstrap';
import Icon from '../../icons';

const Explanation = ({ id = null, title = null, children, placement = 'right', gapLeft = 2, gapRight = 2 }) => (
  <OverlayTrigger
    placement={placement}
    overlay={
      <Popover id={id || Date.now()}>
        {title && <Popover.Header>{title}</Popover.Header>}
        <Popover.Body className="small">{children}</Popover.Body>
      </Popover>
    }>
    <span>
      <Icon
        icon={['far', 'question-circle']}
        className="text-body-secondary small"
        gapLeft={gapLeft}
        gapRight={gapRight}
      />
    </span>
  </OverlayTrigger>
);
Explanation.propTypes = {
  id: PropTypes.string,
  title: PropTypes.any,
  children: PropTypes.any.isRequired,
  placement: PropTypes.string,
  gapLeft: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
  gapRight: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
};

export default Explanation;
