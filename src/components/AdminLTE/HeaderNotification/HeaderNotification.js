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
    <OverlayTrigger
      placement='bottom'
      overlay={
        <Tooltip id={`notification-${id}-tooltip`}>
          <span>
            <FormattedDate value={time} />{' '}
            <FormattedTime value={time} /><br />
            {msg}
          </span>
        </Tooltip>
      }>
      <a>
        {successful
          ? <Icon name='check' className='text-success' />
          : <Icon name='times' className='text-warning' />}
        <span>{msg}</span>
      </a>
    </OverlayTrigger>
  </li>
);

HeaderNotification.propTypes = {
  id: PropTypes.any.isRequired,
  successful: PropTypes.bool,
  msg: PropTypes.string.isRequired,
  time: PropTypes.number.isRequired
};

export default HeaderNotification;
