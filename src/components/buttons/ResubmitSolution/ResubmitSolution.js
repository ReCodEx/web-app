import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Icon from 'react-fontawesome';
import Button from '../../widgets/FlatButton';

const ResubmitSolution = ({ resubmit, isDebug }) =>
  <Button bsStyle="success" onClick={() => resubmit(isDebug)}>
    <Icon name="mail-forward" />{' '}
    {isDebug &&
      <FormattedMessage
        id="app.resubmitSolution.resubmitDebug"
        defaultMessage="Resubmit (debug mode)"
      />}
    {!isDebug &&
      <FormattedMessage
        id="app.resubmitSolution.resubmitNondebug"
        defaultMessage="Resubmit (normal mode)"
      />}
  </Button>;

ResubmitSolution.propTypes = {
  resubmit: PropTypes.func.isRequired,
  isDebug: PropTypes.bool.isRequired
};

export default ResubmitSolution;
