import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Icon from 'react-fontawesome';
import Button from '../../widgets/FlatButton';

const AcceptSolution = ({ accepted, acceptPending, accept, unaccept }) =>
  accepted === true
    ? <Button bsStyle="info" onClick={unaccept} disabled={acceptPending}>
        <Icon name="check-circle" />{' '}
        <FormattedMessage
          id="app.acceptSolution.accepted"
          defaultMessage="Revoke as Final"
        />
      </Button>
    : <Button bsStyle="primary" onClick={accept} disabled={acceptPending}>
        <Icon name="check-circle-o" />{' '}
        <FormattedMessage
          id="app.acceptSolution.notAccepted"
          defaultMessage="Accept as Final"
        />
      </Button>;

AcceptSolution.propTypes = {
  accepted: PropTypes.bool.isRequired,
  acceptPending: PropTypes.bool.isRequired,
  accept: PropTypes.func.isRequired,
  unaccept: PropTypes.func.isRequired
};

export default AcceptSolution;
