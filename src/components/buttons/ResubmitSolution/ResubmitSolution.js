import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Icon from 'react-fontawesome';
import Button from '../../widgets/FlatButton';

const ResubmitSolution = ({ resubmit }) =>
  <Button bsStyle="success" onClick={resubmit}>
    <Icon name="mail-forward" />
    {' '}
    <FormattedMessage
      id="app.resubmitSolution.resubmit"
      defaultMessage="Resubmit this solution"
    />
  </Button>;

ResubmitSolution.propTypes = {
  resubmit: PropTypes.func.isRequired
};

export default ResubmitSolution;
