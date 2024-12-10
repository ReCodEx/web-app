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
          <RefreshIcon gapRight={2} />
          <FormattedMessage id="generic.refresh" defaultMessage="Refresh" />
        </Button>
        <Button
          onClick={pingAction}
          variant={pingStatus === resourceStatus.FAILED ? 'danger' : 'success'}
          disabled={pingStatus === resourceStatus.PENDING}>
          {pingStatus ? (
            pingStatus === resourceStatus.PENDING ? (
              <LoadingIcon gapRight={2} />
            ) : (
              <WarningIcon gapRight={2} />
            )
          ) : (
            <Icon icon="table-tennis" gapRight={2} />
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
