import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tooltip, OverlayTrigger, Overlay, Badge } from 'react-bootstrap';
import { FormattedDate, FormattedTime, FormattedMessage } from 'react-intl';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import classNames from 'classnames';

import { SuccessIcon, WarningIcon, DeleteIcon, CopyIcon } from '../../icons';

import styles from './headerNotification.less';

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
      <li className={classNames({
        [styles.newNotification]: isNew
      })}>
        <OverlayTrigger
          placement="bottom"
          overlay={
            <Tooltip id={`notification-${id}-tooltip`}>
              <span>
                <FormattedDate value={time} /> <FormattedTime value={time} />
                <br />
                {msg}
              </span>
            </Tooltip>
          }
        >
          <a>
            <span
              className="fa"
              onMouseOver={() => this.setState({ hovering: true })}
              onMouseOut={() => this.setState({ hovering: false })}
            >
              {deleteOnClick
                ? <span
                    className={styles.delete}
                    href={hide ? '#' : undefined}
                    onClick={e => {
                      e.preventDefault();
                      hide && hide(id);
                    }}
                  >
                    <DeleteIcon className="fa text-red" />
                  </span>
                : successful ? <SuccessIcon /> : <WarningIcon />}
            </span>
            <span className="fa">
              <span className={styles.copy} ref={copy => (this.copy = copy)}>
                <CopyToClipboard text={msg} onCopy={() => this.onCopy()}>
                  <CopyIcon />
                </CopyToClipboard>
              </span>
              <Overlay
                show={clickedCopy}
                container={this}
                target={() => this.copy}
                placement="bottom"
              >
                <Tooltip id={`clicked-copy-${id}`}>
                  <FormattedMessage
                    id="app.headerNotification.copiedToClippboard"
                    defaultMessage="Copied to clippboard."
                  />
                </Tooltip>
              </Overlay>
            </span>
            <span>
              {msg}
            </span>
            {count > 1 &&
              <span className={styles.container}>
                <Badge pullRight>
                  {count}
                </Badge>
              </span>}
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
  count: PropTypes.number.isRequired,
  hide: PropTypes.func,
  isNew: PropTypes.bool
};

export default HeaderNotification;
