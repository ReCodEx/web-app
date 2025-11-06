import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

import Button from '../../widgets/TheButton';
import Icon, { RefreshIcon } from '../../icons';
import { storageGetItem, storageSetItem, listenForChanges, removeListener } from '../../../helpers/localStorage';

const COUNTER_KEY = 'refreshButtonCounter';
const UPDATE_INTERVAL = 15; // s
const CHANGE_PER_INTERVAL = 15;
const COOL_DOWN_TIME = 60;
const CLICK_LIMIT = 15;

class RefreshButton extends Component {
  // >=0 - counter counts number of clicks; <0 - in cool down mode (returning to 0)
  state = { counter: 0 };

  constructor(props) {
    super(props);
    this.intervalId = null;
    this.storageListenerId = null;
  }

  componentDidMount() {
    this.setState({ counter: Number(storageGetItem(COUNTER_KEY, 0)) });

    this.storageListenerId = listenForChanges(COUNTER_KEY, newVal => {
      this.setState({ counter: newVal || 0 });
    });

    // periodic counter update
    this.intervalId = window.setInterval(() => {
      const newCounter =
        this.state.counter < 0
          ? Math.min(this.state.counter + CHANGE_PER_INTERVAL, 0) // cool down
          : Math.max(this.state.counter - CHANGE_PER_INTERVAL, 0); // counting clicks

      if (newCounter !== this.state.counter) {
        this.setState({ counter: newCounter });
        if (newCounter === 0) {
          // let's make sure all clients have their buttons enabled again
          storageSetItem(COUNTER_KEY, newCounter);
        }
      }
    }, UPDATE_INTERVAL * 1000);
  }

  componentWillUnmount() {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.storageListenerId !== null) {
      removeListener(this.storageListenerId);
      this.storageListenerId = null;
    }
  }

  clickHandler = () => {
    if (this.state.counter < 0) {
      return; // in cool down mode
    }

    const newCounter = this.state.counter >= CLICK_LIMIT ? -COOL_DOWN_TIME : this.state.counter + 1;
    this.setState({ counter: newCounter });

    const storageCounter = Number(storageGetItem(COUNTER_KEY, 0));
    if (newCounter < 0 || storageCounter < newCounter) {
      storageSetItem(COUNTER_KEY, newCounter);
    }

    this.props.onClick();
  };

  render() {
    const { onClick, ...props } = this.props;
    return this.state.counter < 0 ? (
      <OverlayTrigger
        placement="bottom"
        overlay={
          <Tooltip id="refreshButtonTooltip">
            <FormattedMessage
              id="app.refreshButton.coolingDownTooltip"
              defaultMessage="The refresh button is too tired from all the refreshing. Please give it some time to recover."
            />
          </Tooltip>
        }>
        <span>
          <Button {...props} disabled>
            <Icon icon="bed" gapRight={2} />
            <FormattedMessage id="generic.refresh" defaultMessage="Refresh" />
          </Button>
        </span>
      </OverlayTrigger>
    ) : (
      <Button {...props} onClick={this.clickHandler}>
        <RefreshIcon gapRight={2} />
        <FormattedMessage id="generic.refresh" defaultMessage="Refresh" />
      </Button>
    );
  }
}

RefreshButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default RefreshButton;
