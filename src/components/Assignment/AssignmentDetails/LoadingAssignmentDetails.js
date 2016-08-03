import React, { PropTypes } from 'react';
import Box from '../../Box';
import { LoadingIcon } from '../../Icons';
import { Grid, Row, Col, Table } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import { FormattedDate, FormattedTime } from 'react-intl';

const LoadingAssignmentDetails = () => (
  <Box
    title={(
      <span>
        <LoadingIcon /> Načítám zadání úlohy ...
      </span>
    )}
    noPadding={false}
    collapsable={true}
    isOpen={false}>
    <p>
      Načítám zadání ...
    </p>
  </Box>
);

export default LoadingAssignmentDetails;
