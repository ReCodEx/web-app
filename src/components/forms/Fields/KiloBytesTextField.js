import React from 'react';
import PropTypes from 'prop-types';
import prettyBytes from 'pretty-bytes';
import TextField from './TextField';
import { HelpBlock } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

const KiloBytesTextField = ({ input, ...props }) => (
  <div>
    <TextField {...props} input={input} />
    <HelpBlock>
      <FormattedMessage
        id="app.bytesTextField.humanReadable"
        defaultMessage="Human readable variant:"
      />{' '}
      <b>{prettyBytes(Number(input.value) * 1000)}</b>
    </HelpBlock>
  </div>
);

KiloBytesTextField.propTypes = {
  input: PropTypes.shape({
    value: PropTypes.any.isRequired
  }).isRequired
};

export default KiloBytesTextField;
