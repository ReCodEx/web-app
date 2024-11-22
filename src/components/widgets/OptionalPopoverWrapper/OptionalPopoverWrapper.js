import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Overlay, Popover } from 'react-bootstrap';

const HOVER = 'hover';
const CLICK = 'click';

const OptionalPopoverWrapper = ({
  title,
  contents,
  popoverId = Date.now(),
  placement = 'bottom',
  hide = false,
  children,
  trigger = HOVER,
}) => {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  const hoverTrigger = trigger === HOVER;
  const clickTrigger = trigger === CLICK;

  return (
    <>
      <span
        ref={ref}
        onClick={clickTrigger ? () => setShown(!shown) : undefined}
        onMouseEnter={hoverTrigger ? () => setShown(true) : undefined}
        onMouseLeave={hoverTrigger ? () => setShown(false) : undefined}>
        {children}
        <Overlay show={Boolean(contents) && !hide && shown} target={ref.current} placement={placement}>
          <Popover id={popoverId}>
            <Popover.Header>{title}</Popover.Header>
            <Popover.Body>{contents}</Popover.Body>
          </Popover>
        </Overlay>
      </span>
    </>
  );
};

OptionalPopoverWrapper.propTypes = {
  title: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  contents: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  popoverId: PropTypes.string,
  placement: PropTypes.string,
  hide: PropTypes.bool,
  children: PropTypes.element.isRequired,
  trigger: PropTypes.string,
};

export default OptionalPopoverWrapper;
