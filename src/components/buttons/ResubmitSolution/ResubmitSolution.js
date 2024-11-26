import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Icon from '../../icons';
import Button from '../../widgets/TheButton';
import Confirm from '../../forms/Confirm';

const ResubmitSolution = ({ id, resubmit, progressObserverId, isDebug }) => (
  <Confirm
    id={id}
    onConfirmed={() => resubmit(progressObserverId, isDebug)}
    question={
      <FormattedMessage
        id="app.resubmitSolution.confirm"
        defaultMessage="Are you sure you want to resubmit this solution?"
      />
    }>
    <Button variant={isDebug ? 'danger' : 'success'}>
      <Icon icon="redo" gapRight={2} />
      {isDebug && <FormattedMessage id="app.resubmitSolution.resubmitDebug" defaultMessage="Resubmit (debug mode)" />}
      {!isDebug && (
        <FormattedMessage id="app.resubmitSolution.resubmitNondebug" defaultMessage="Resubmit (normal mode)" />
      )}
    </Button>
  </Confirm>
);

ResubmitSolution.propTypes = {
  id: PropTypes.string.isRequired,
  resubmit: PropTypes.func.isRequired,
  progressObserverId: PropTypes.string,
  isDebug: PropTypes.bool.isRequired,
};

export default ResubmitSolution;
