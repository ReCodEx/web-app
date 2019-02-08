import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '../../widgets/FlatButton';
import Icon from '../../icons';

const AcceptSolution = ({ accepted, acceptPending, accept, unaccept }) =>
  accepted === true ? (
    <Button bsStyle="info" onClick={unaccept} disabled={acceptPending}>
      <Icon icon="check-circle" gapRight />
      <FormattedMessage
        id="app.acceptSolution.accepted"
        defaultMessage="Revoke as Final"
      />
    </Button>
  ) : (
    <Button bsStyle="primary" onClick={accept} disabled={acceptPending}>
      <Icon icon={['far', 'check-circle']} gapRight />
      <FormattedMessage
        id="app.acceptSolution.notAccepted"
        defaultMessage="Accept as Final"
      />
    </Button>
  );

AcceptSolution.propTypes = {
  accepted: PropTypes.bool.isRequired,
  acceptPending: PropTypes.bool.isRequired,
  accept: PropTypes.func.isRequired,
  unaccept: PropTypes.func.isRequired,
};

export default AcceptSolution;
