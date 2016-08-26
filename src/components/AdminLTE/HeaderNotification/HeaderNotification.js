import React, { PropTypes } from 'react';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import { FormattedMessage, FormattedDate, FormattedTime } from 'react-intl';
import Icon from 'react-fontawesome';

const HeaderNotification = ({
  id,
  successful = true,
  msg,
  time
}) => (
  <li>
    <a>
      {successful && <Icon name='check' className='text-success' />}
      {!successful && <Icon name='times' className='text-warning' />}
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
        <span>{msg}</span>
      </OverlayTrigger>
    </a>
  </li>
);

HeaderNotification.propTypes = {
};

export default HeaderNotification;
