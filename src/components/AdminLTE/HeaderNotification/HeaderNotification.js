import React, { Component, PropTypes } from 'react';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import { FormattedDate, FormattedTime } from 'react-intl';
import { SuccessIcon, WarningIcon, DeleteIcon } from '../../Icons';

class HeaderNotification extends Component {

  state = { hovering: false };

  render() {
    const {
      id,
      successful = true,
      msg,
      hide = null,
      time
    } = this.props;

    const deleteOnClick = hide && this.state.hovering;

    return (
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
          <a
            href={hide ? '#' : undefined}
            onClick={(e) => { e.preventDefault(); hide && hide(id); }}
            onMouseOver={() => this.setState({ hovering: true })}
            onMouseOut={() => this.setState({ hovering: false })}>
            {deleteOnClick
              ? <DeleteIcon />
              : successful
                ? <SuccessIcon />
                : <WarningIcon />}
            <span>{msg}</span>
          </a>
        </OverlayTrigger>
      </li>
    );
  }

}

HeaderNotification.propTypes = {
  id: PropTypes.any.isRequired,
  successful: PropTypes.bool,
  msg: PropTypes.string.isRequired,
  time: PropTypes.number.isRequired,
  hide: PropTypes.func
};

export default HeaderNotification;
