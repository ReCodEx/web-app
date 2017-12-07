import React from 'react';
import PropTypes from 'prop-types';
import prettyMs from 'pretty-ms';
import TextField from './TextField';
import { HelpBlock } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

// !!! this component is no longer used in EditSimpleLimits, but it so may happen it will be recycled for the complex edit form...
const SecondsTextField = ({ input, ...props }) =>
  <div>
    <TextField {...props} input={input} />
    {!props.meta.error &&
      !isNaN(Number(input.value)) &&
      false &&
      <HelpBlock>
        <FormattedMessage
          id="app.milisecondsTextField.humanReadable"
          defaultMessage="Human readable variant:"
        />{' '}
        <b>{prettyMs(Number(input.value) * 1000)}</b>
      </HelpBlock>}
  </div>;

SecondsTextField.propTypes = {
  input: PropTypes.shape({
    value: PropTypes.any.isRequired
  }).isRequired,
  meta: PropTypes.shape({
    error: PropTypes.any
  }).isRequired
};

export default SecondsTextField;
