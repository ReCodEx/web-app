import React, { PropTypes } from 'react';
import Box from '../../Box';
import { FailedIcon } from '../../Icons';
import { Grid, Row, Col, Table } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import { FormattedDate, FormattedTime } from 'react-intl';

const FailedAssignmentDetails = () => (
  <Box
    title={(
      <span>
        <FailedIcon /> Chyba načítání dat
      </span>
    )}
    noPadding={false}
    collapsable={true}
    isOpen={false}>
    <p>
      Zadání této úlohy se nepodařilo načíst. Ujistěte se, že jste připojen(a) k Internetu a opakujte prosíme akci o chvíli později.
    </p>
  </Box>
);

export default FailedAssignmentDetails;
