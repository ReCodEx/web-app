import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { ButtonGroup } from 'react-bootstrap';

import { resourceStatus } from '../../../redux/helpers/resourceManager';
import Button from '../../widgets/FlatButton';
import Icon, { LoadingIcon, RefreshIcon, WarningIcon } from '../../icons';

const AsyncJobsButtons = ({ refresh, pingAction, pingStatus = null }) => {
  return (
    <div className="em-margin-bottom em-margin-right">
      <ButtonGroup>
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
      </ButtonGroup>
    </div>
  );
};

AsyncJobsButtons.propTypes = {
  refresh: PropTypes.func.isRequired,
  pingAction: PropTypes.func.isRequired,
  pingStatus: PropTypes.string,
};

export default AsyncJobsButtons;
