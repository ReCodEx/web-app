import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tooltip, OverlayTrigger, Overlay, Badge, Dropdown } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import classnames from 'classnames';

import { SuccessIcon, WarningIcon, DeleteIcon, CopyIcon } from '../../icons';
import DateTime from '../../widgets/DateTime';

import * as styles from '../Header/Header.less';

class HeaderNotification extends Component {
  state = { hovering: false, clickedCopy: false };

  onCopy = () => {
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
    }

    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }

    this.showTimeout = setTimeout(() => {
      this.setState({ clickedCopy: true });
      this.hideTimeout = setTimeout(() => {
        this.setState({ clickedCopy: false });
        this.hideTimeout = null;
      }, 2000);
      this.showTimeout = null;
    }, 500);
  };

  render() {
    const { id, successful = true, msg, hide = null, time, count, isNew = false } = this.props;

    const { hovering, clickedCopy } = this.state;
    const deleteOnClick = hide && hovering;

    return (
      <Dropdown.Item
        className={classnames({
          [styles.notification]: true,
          [styles.newNotification]: isNew,
        })}>
        <OverlayTrigger
          placement="bottom"
          overlay={
            <Tooltip id={`notification-${id}-tooltip`}>
              <span>
                <DateTime unixts={Math.round(time / 1000)} />
                <br />
                {msg}
              </span>
            </Tooltip>
          }>
          <span>
            <span
              className="fa"
              onMouseOver={() => this.setState({ hovering: true })}
              onMouseOut={() => this.setState({ hovering: false })}>
              {deleteOnClick ? (
                <span
                  className={styles.delete}
                  href={hide ? '#' : undefined}
                  onClick={e => {
                    e.preventDefault();
                    hide && hide(id);
                  }}>
                  <DeleteIcon className="fa text-danger" gapRight={1} fixedWidth />
                </span>
              ) : successful ? (
                <SuccessIcon className="text-success" gapRight={1} fixedWidth />
              ) : (
                <WarningIcon className="text-warning" gapRight={1} fixedWidth />
              )}
            </span>
            <span className="fa">
              <span className={styles.copy} ref={copy => (this.copy = copy)}>
                <CopyToClipboard text={msg} onCopy={this.onCopy}>
                  <CopyIcon gapRight={2} fixedWidth />
                </CopyToClipboard>
              </span>
              <Overlay show={clickedCopy} container={this} target={() => this.copy} placement="bottom">
                <Tooltip id={`clicked-copy-${id}`}>
                  <FormattedMessage
                    id="app.headerNotification.copiedToClipboard"
                    defaultMessage="Copied to clipboard."
                  />
                </Tooltip>
              </Overlay>
            </span>
            <span>{msg}</span>
            {count > 1 && (
              <span className={styles.badgeContainer}>
                <Badge bg="secondary">{count}</Badge>
              </span>
            )}
          </span>
        </OverlayTrigger>
      </Dropdown.Item>
    );
  }
}

HeaderNotification.propTypes = {
  id: PropTypes.any.isRequired,
  successful: PropTypes.bool,
  msg: PropTypes.string.isRequired,
  time: PropTypes.number.isRequired,
  count: PropTypes.number.isRequired,
  hide: PropTypes.func,
  isNew: PropTypes.bool,
};

export default HeaderNotification;
