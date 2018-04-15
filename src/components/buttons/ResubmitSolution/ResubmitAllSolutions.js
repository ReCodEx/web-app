import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import Button from '../../widgets/FlatButton';
import Confirm from '../../forms/Confirm';

const ResubmitAllSolutions = ({
  id,
  resubmit,
  question = (
    <FormattedMessage
      id="app.resubmitSolution.resubmitAllConfirm"
      defaultMessage="Are you sure you want to resubmit all solutions of all students for this assignment? This can take serious amount of time."
    />
  )
}) =>
  <Confirm id={id} onConfirmed={resubmit} question={question}>
    <Button bsStyle="danger">
      <FontAwesomeIcon icon="redo" />{' '}
      <FormattedMessage
        id="app.resubmitSolution.resubmitAll"
        defaultMessage="Resubmit All Solutions"
      />
    </Button>
  </Confirm>;

ResubmitAllSolutions.propTypes = {
  id: PropTypes.string.isRequired,
  resubmit: PropTypes.func.isRequired,
  question: PropTypes.any
};

export default ResubmitAllSolutions;
