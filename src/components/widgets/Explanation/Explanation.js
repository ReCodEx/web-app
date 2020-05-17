import React from 'react';
import PropTypes from 'prop-types';
import { Popover, OverlayTrigger } from 'react-bootstrap';
import Icon from '../../icons';

const Explanation = ({ id = null, title = null, children, placement = 'right' }) => (
  <OverlayTrigger
    id={id || Date.now()}
    placement={placement}
    overlay={
      <Popover title={title}>
        <small>{children}</small>
      </Popover>
    }>
    <Icon icon={['far', 'question-circle']} className="text-muted small" gapLeft gapRight />
  </OverlayTrigger>
);
Explanation.propTypes = {
  id: PropTypes.string,
  title: PropTypes.any,
  children: PropTypes.any.isRequired,
  placement: PropTypes.string,
};

export default Explanation;
