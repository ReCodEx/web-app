import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Icon from 'react-fontawesome';
import Button from '../../widgets/FlatButton';

const AcceptSolution = ({ accepted, accept }) =>
  accepted === true
    ? <Button bsStyle="success" disabled>
        <Icon name="check-circle" />
        {' '}
        <FormattedMessage
          id="app.acceptSolution.accepted"
          defaultMessage="Accepted"
        />
      </Button>
    : <Button bsStyle="primary" onClick={accept}>
        <Icon name="check-circle-o" />
        {' '}
        <FormattedMessage
          id="app.acceptSolution.notAccepted"
          defaultMessage="Accept this solution"
        />
      </Button>;

AcceptSolution.propTypes = {
  accepted: PropTypes.bool.isRequired,
  accept: PropTypes.func.isRequired
};

export default AcceptSolution;
