import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '../../widgets/FlatButton';
import Icon from '../../icons';

const AcceptSolution = ({ accepted, acceptPending, accept, unaccept, shortLabel = false, bsSize = undefined }) =>
  accepted === true ? (
    <Button bsStyle="warning" bsSize={bsSize} onClick={unaccept} disabled={acceptPending}>
      <Icon icon="check-circle" gapRight />
      {shortLabel ? (
        <FormattedMessage id="app.acceptSolution.acceptedShort" defaultMessage="Revoke" />
      ) : (
        <FormattedMessage id="app.acceptSolution.accepted" defaultMessage="Revoke as Final" />
      )}
    </Button>
  ) : (
    <Button bsStyle="success" bsSize={bsSize} onClick={accept} disabled={acceptPending}>
      <Icon icon={['far', 'check-circle']} gapRight />
      {shortLabel ? (
        <FormattedMessage id="app.acceptSolution.notAcceptedShort" defaultMessage="Accept" />
      ) : (
        <FormattedMessage id="app.acceptSolution.notAccepted" defaultMessage="Accept as Final" />
      )}
    </Button>
  );

AcceptSolution.propTypes = {
  accepted: PropTypes.bool.isRequired,
  acceptPending: PropTypes.bool.isRequired,
  accept: PropTypes.func.isRequired,
  unaccept: PropTypes.func.isRequired,
  shortLabel: PropTypes.bool,
  bsSize: PropTypes.string,
};

export default AcceptSolution;
