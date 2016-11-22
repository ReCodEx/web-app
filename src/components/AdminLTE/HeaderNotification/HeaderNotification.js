import React, { PropTypes } from 'react';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import { FormattedDate, FormattedTime } from 'react-intl';
import Icon from 'react-fontawesome';

const HeaderNotification = ({
  id,
  successful = true,
  msg,
  time
}) => (
  <li>
    <a>
      <OverlayTrigger
        placement='bottom'
        overlay={
          <Tooltip id={`notification-${id}-tooltip`}>
            <span>
              <FormattedDate value={time * 1000} />{' '}
              <FormattedTime value={time * 1000} />
            </span>
          </Tooltip>
        }>
        {successful
          ? <Icon name='check' className='text-success' />
          : <Icon name='times' className='text-warning' />}
      </OverlayTrigger>
      <span title={msg}>{msg}</span>
    </a>
  </li>
);

HeaderNotification.propTypes = {
  id: PropTypes.string.isRequired,
  successful: PropTypes.bool,
  msg: PropTypes.string.isRequired,
  time: PropTypes.number.isRequired
};

export default HeaderNotification;
