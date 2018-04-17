import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Icon from '../../icons';
import Button from '../../widgets/FlatButton';
import Confirm from '../../forms/Confirm';

const ResubmitSolution = ({ id, resubmit, isDebug }) =>
  <Confirm
    id={id}
    onConfirmed={() => resubmit(isDebug)}
    question={
      <FormattedMessage
        id="app.resubmitSolution.confirm"
        defaultMessage="Are you sure you want to resubmit this solution?"
      />
    }
  >
    <Button bsStyle={isDebug ? 'danger' : 'success'}>
      <Icon icon="redo" gapRight />
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
    </Button>
  </Confirm>;

ResubmitSolution.propTypes = {
  id: PropTypes.string.isRequired,
  resubmit: PropTypes.func.isRequired,
  isDebug: PropTypes.bool.isRequired
};

export default ResubmitSolution;
