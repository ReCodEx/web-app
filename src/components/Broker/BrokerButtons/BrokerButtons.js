import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { ButtonGroup } from 'react-bootstrap';

import { resourceStatus } from '../../../redux/helpers/resourceManager';
import Button from '../../widgets/FlatButton';
import Icon, { LoadingIcon, RefreshIcon, WarningIcon } from '../../icons';

const BrokerButtons = ({
  refreshBrokerStats,
  freezeBroker,
  unfreezeBroker,
  freezeActionStatus = null,
  unfreezeActionStatus = null,
}) => {
  const pending =
    freezeActionStatus === resourceStatus.PENDING ||
    unfreezeActionStatus === resourceStatus.PENDING;
  return (
    <div className="em-margin-bottom em-margin-right">
      <ButtonGroup>
        <Button onClick={refreshBrokerStats} bsStyle="primary">
          <RefreshIcon gapRight />
          <FormattedMessage id="generic.refresh" defaultMessage="Refresh" />
        </Button>

        <Button
          bsStyle="danger"
          onClick={freezeBroker}
          disabled={pending}
          confirmId="freeze-broker"
          confirm={
            pending ? null : (
              <FormattedMessage
                id="app.broker.confirmFreeze"
                defaultMessage="Are you sure you want to freeze broker? Broker will not longer accept evaluation requests!"
              />
            )
          }>
          {freezeActionStatus === resourceStatus.PENDING ? (
            <LoadingIcon gapRight />
          ) : freezeActionStatus === resourceStatus.FAILED ? (
            <WarningIcon gapRight />
          ) : (
            <Icon icon={['far', 'hand-paper']} gapRight />
          )}
          <FormattedMessage id="app.broker.freeze" defaultMessage="Freeze" />
        </Button>

        <Button
          bsStyle="success"
          onClick={unfreezeBroker}
          disabled={pending}
          confirmId="unfreeze-broker"
          confirm={
            pending ? null : (
              <FormattedMessage
                id="app.broker.confirmUnfreeze"
                defaultMessage="Are you sure you want to unfreeze broker?"
              />
            )
          }>
          {unfreezeActionStatus === resourceStatus.PENDING ? (
            <LoadingIcon gapRight />
          ) : unfreezeActionStatus === resourceStatus.FAILED ? (
            <WarningIcon gapRight />
          ) : (
            <Icon icon="sun" gapRight />
          )}

          <FormattedMessage
            id="app.broker.unfreeze"
            defaultMessage="Unfreeze"
          />
        </Button>
      </ButtonGroup>
    </div>
  );
};

BrokerButtons.propTypes = {
  refreshBrokerStats: PropTypes.func.isRequired,
  freezeBroker: PropTypes.func.isRequired,
  unfreezeBroker: PropTypes.func.isRequired,
  freezeActionStatus: PropTypes.string,
  unfreezeActionStatus: PropTypes.string,
};

export default BrokerButtons;
