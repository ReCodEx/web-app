import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { ButtonGroup } from 'react-bootstrap';
import Confirm from '../../forms/Confirm';

import Button from '../../widgets/FlatButton';
import Icon, { RefreshIcon } from '../../icons';

const BrokerButtons = ({ refreshBrokerStats, freezeBroker, unfreezeBroker }) =>
  <div className="em-margin-bottom em-margin-right">
    <ButtonGroup>
      <Button onClick={refreshBrokerStats} bsStyle="primary">
        <RefreshIcon gapRight />
        <FormattedMessage id="generic.refresh" defaultMessage="Refresh" />
      </Button>

      <Confirm
        id={'freeze-broker'}
        onConfirmed={() => freezeBroker()}
        question={
          <FormattedMessage
            id="app.broker.confirmFreeze"
            defaultMessage="Are you sure you want to freeze broker? Broker will not longer accept evaluation requests!"
          />
        }
      >
        <Button bsStyle="danger">
          <Icon icon="times" gapRight />
          <FormattedMessage id="app.broker.freeze" defaultMessage="Freeze" />
        </Button>
      </Confirm>

      <Confirm
        id={'unfreeze-broker'}
        onConfirmed={() => unfreezeBroker()}
        question={
          <FormattedMessage
            id="app.broker.confirmUnfreeze"
            defaultMessage="Are you sure you want to unfreeze broker?"
          />
        }
      >
        <Button bsStyle="success">
          <Icon icon="sun" gapRight />
          <FormattedMessage
            id="app.broker.unfreeze"
            defaultMessage="Unfreeze"
          />
        </Button>
      </Confirm>
    </ButtonGroup>
  </div>;

BrokerButtons.propTypes = {
  refreshBrokerStats: PropTypes.func.isRequired,
  freezeBroker: PropTypes.func.isRequired,
  unfreezeBroker: PropTypes.func.isRequired
};

export default BrokerButtons;
