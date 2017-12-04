import React from 'react';
import PropTypes from 'prop-types';
import { HelpBlock, Col, Row, Confirm } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import Icon from 'react-fontawesome';

import { prettyPrintBytes } from '../../helpers/stringFormatters';
import FlatButton from '../../widgets/FlatButton';
import TextField from './TextField';

const KiloBytesTextField = ({ input, ...props }) =>
  <div>
    <TextField {...props} input={input} />
    {/*

        <Confirm
          key="h-button"
          question={
            <FormattedMessage
              id="app.EditEnvironmentLimitsForm.cloneHorizontal.yesNoQuestion"
              defaultMessage="Do you really want to use these limits for all runtime environments of this test? Pleae note, that individual environments have different performance characteristics."
            />
          }
        >
          <FlatButton bsSize="xs">
            <Icon name="arrows-h" />
          </FlatButton>
        </Confirm>,
        <Confirm
          key="all-button"
          question={
            <FormattedMessage
              id="app.EditEnvironmentLimitsForm.cloneAll.yesNoQuestion"
              defaultMessage="Do you really want to use these limits for all the tests of all runtime environments? Pleae note, that individual environments have different performance characteristics."
            />
          }
        >
          <FlatButton bsSize="xs">
            <Icon name="arrows" />
          </FlatButton>
        </Confirm>,

        <span key="span2">&nbsp;</span>,
        <b key="human-readable">
          {prettyPrintBytes(Number(input.value) * 1024)}
        </b>

<FlatButton bsSize="xs">
      <Icon name="arrows-h" />
    </FlatButton>
    <FlatButton bsSize="xs">
      <Icon name="arrows-v" />
    </FlatButton>
    <Confirm
      onConfirmed={f => f}
      question={
        <FormattedMessage
          id="app.EditEnvironmentLimitsForm.cloneAll.yesNoQuestion"
          defaultMessage="Do you really want to use these limits for all the tests of all runtime environments?"
        />
      }
    >
      <FlatButton bsSize="xs">
        <Icon name="arrows" />
      </FlatButton>
    </Confirm>
    <HelpBlock>
      <FormattedMessage
        id="app.bytesTextField.humanReadable"
        defaultMessage="Human readable variant:"
      />{' '}
      <b>{prettyPrintBytes(Number(input.value) * 1024)}</b>
    </HelpBlock>
    */}
  </div>;

KiloBytesTextField.propTypes = {
  input: PropTypes.shape({
    value: PropTypes.any.isRequired
  }).isRequired
};

export default KiloBytesTextField;
