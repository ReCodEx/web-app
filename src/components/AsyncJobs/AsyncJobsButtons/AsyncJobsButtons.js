import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { resourceStatus } from '../../../redux/helpers/resourceManager';
import Button, { TheButtonGroup } from '../../widgets/TheButton';
import Icon, { LoadingIcon, RefreshIcon, WarningIcon } from '../../icons';

const AsyncJobsButtons = ({ refresh, pingAction, pingStatus = null }) => {
  return (
    <div className="mb-3 me-3">
      <TheButtonGroup>
        <Button onClick={refresh} variant="primary">
          <RefreshIcon gapRight />
          <FormattedMessage id="generic.refresh" defaultMessage="Refresh" />
        </Button>
        <Button
          onClick={pingAction}
          variant={pingStatus === resourceStatus.FAILED ? 'danger' : 'success'}
          disabled={pingStatus === resourceStatus.PENDING}>
          {pingStatus ? (
            pingStatus === resourceStatus.PENDING ? (
              <LoadingIcon gapRight />
            ) : (
              <WarningIcon gapRight />
            )
          ) : (
            <Icon icon="table-tennis" gapRight />
          )}
          <FormattedMessage id="app.asyncJobs.ping" defaultMessage="Ping Worker" />
        </Button>
      </TheButtonGroup>
    </div>
  );
};

AsyncJobsButtons.propTypes = {
  refresh: PropTypes.func.isRequired,
  pingAction: PropTypes.func.isRequired,
  pingStatus: PropTypes.string,
};

export default AsyncJobsButtons;
