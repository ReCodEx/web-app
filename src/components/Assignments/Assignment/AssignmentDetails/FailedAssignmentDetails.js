import React, { PropTypes } from 'react';
import Box from '../../../AdminLTE/Box';
import { FailedIcon } from '../../../Icons';
import { Grid, Row, Col, Table } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import { FormatedMessage } from 'react-intl';

const FailedAssignmentDetails = () => (
  <Box
    title={(
      <span>
        <FailedIcon /> <FormattedMessage id='app.assignment.error' defaultMessage='Exercise assignment could not be loaded.' />
      </span>
    )}
    noPadding={false}
    collapsable={true}
    isOpen={false}>
    <p>
      <FormattedMessage
        id='app.assignment.errorExplanation'
        defaultMessage='The assignment of this exercise could not be loaded. Make sure you are connected to the Internet and try again later.' />
    </p>
  </Box>
);

export default FailedAssignmentDetails;
