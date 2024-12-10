import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { resourceStatus } from '../../../redux/helpers/resourceManager';
import Button, { TheButtonGroup } from '../../widgets/TheButton';
import Icon, { LoadingIcon, RefreshIcon, WarningIcon } from '../../icons';

const BrokerButtons = ({
  refreshBrokerStats,
  freezeBroker,
  unfreezeBroker,
  freezeActionStatus = null,
  unfreezeActionStatus = null,
}) => {
  const pending = freezeActionStatus === resourceStatus.PENDING || unfreezeActionStatus === resourceStatus.PENDING;
  return (
    <TheButtonGroup className="mb-3 me-3">
      <Button onClick={refreshBrokerStats} variant="primary">
        <RefreshIcon gapRight={2} />
        <FormattedMessage id="generic.refresh" defaultMessage="Refresh" />
      </Button>

      <Button
        variant="danger"
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
          <LoadingIcon gapRight={2} />
        ) : freezeActionStatus === resourceStatus.FAILED ? (
          <WarningIcon gapRight={2} />
        ) : (
          <Icon icon={['far', 'hand-paper']} gapRight={2} />
        )}
        <FormattedMessage id="app.broker.freeze" defaultMessage="Freeze" />
      </Button>

      <Button
        variant="success"
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
          <LoadingIcon gapRight={2} />
        ) : unfreezeActionStatus === resourceStatus.FAILED ? (
          <WarningIcon gapRight={2} />
        ) : (
          <Icon icon="sun" gapRight={2} />
        )}

        <FormattedMessage id="app.broker.unfreeze" defaultMessage="Unfreeze" />
      </Button>
    </TheButtonGroup>
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
