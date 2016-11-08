import React, { PropTypes } from 'react';
import prettyMs from 'pretty-ms';
import TextField from './TextField';
import { HelpBlock } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

const SecondsTextField = ({
  input,
  ...props
}) => (
  <div>
      <TextField {...props} input={input} />
      {!props.meta.error && !isNaN(Number(input.value)) && (
        <HelpBlock>
          <FormattedMessage
            id='app.milisecondsTextField.humanReadable'
            defaultMessage='Human readable variant:' />
          {' '}<b>{prettyMs(Number(input.value) * 1000)}</b>
        </HelpBlock>
      )}
  </div>
);

SecondsTextField.propTypes = {
  input: PropTypes.shape({
    value: PropTypes.any.isRequired
  }).isRequired,
  meta: PropTypes.shape({
    error: PropTypes.any
  }).isRequired
};

export default SecondsTextField;
