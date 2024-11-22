import React from 'react';
import PropTypes from 'prop-types';
import { Popover, OverlayTrigger } from 'react-bootstrap';
import Icon from '../../icons';

const Explanation = ({ id = null, title = null, children, placement = 'right' }) => (
  <OverlayTrigger
    placement={placement}
    overlay={
      <Popover id={id || Date.now()}>
        {title && <Popover.Header>{title}</Popover.Header>}
        <Popover.Body className="small">{children}</Popover.Body>
      </Popover>
    }>
    <Icon icon={['far', 'question-circle']} className="text-body-secondary small" gapLeft gapRight />
  </OverlayTrigger>
);
Explanation.propTypes = {
  id: PropTypes.string,
  title: PropTypes.any,
  children: PropTypes.any.isRequired,
  placement: PropTypes.string,
};

export default Explanation;
