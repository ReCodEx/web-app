import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { LoadingIcon } from '../Icons';
import Box from '../Box';

const LoadingGroupDetail = ({
  group,
  assignments
}) => (
  <div>
    <p>
      <LoadingIcon /> Načítám popis skupiny ...
    </p>
    <Row>
      <Col lg={6}>
        <Box title={<span><LoadingIcon /> Načítám seznam cvičících ...</span>} collapsable isOpen={true} noPadding={false}>
          <p>Načítám obsah ...</p>
        </Box>
        <Box title={<span><LoadingIcon /> Načítám seznam studentů ...</span>} collapsable isOpen={true} npPadding={false}>
          <p>Načítám obsah ...</p>
        </Box>
      </Col>

      <Col lg={6}>
        <Box title={<span><LoadingIcon /> Načítám zadané úlohy ...</span>} collapsable isOpen={true} noPadding={false}>
          <p>Načítám obsah ...</p>
        </Box>
      </Col>
    </Row>
  </div>
);

export default LoadingGroupDetail;
