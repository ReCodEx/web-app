import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Icon from 'react-fontawesome';
import Button from '../../widgets/FlatButton';

const AcceptSolution = ({ accepted, accept, unaccept }) =>
  accepted === true
    ? <Button bsStyle="info" onClick={unaccept}>
        <Icon name="check-circle" />{' '}
        <FormattedMessage
          id="app.acceptSolution.accepted"
          defaultMessage="Remove grading mark"
        />
      </Button>
    : <Button bsStyle="primary" onClick={accept}>
        <Icon name="check-circle-o" />{' '}
        <FormattedMessage
          id="app.acceptSolution.notAccepted"
          defaultMessage="Mark for grading"
        />
      </Button>;

AcceptSolution.propTypes = {
  accepted: PropTypes.bool.isRequired,
  accept: PropTypes.func.isRequired,
  unaccept: PropTypes.func.isRequired
};

export default AcceptSolution;
