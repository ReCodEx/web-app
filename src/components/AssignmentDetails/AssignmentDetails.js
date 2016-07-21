import React, { PropTypes } from 'react';
import Box from '../Box';
import Icon from 'react-fontawesome';
import { Grid, Row, Col, Table } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import { FormattedDate, FormattedTime } from 'react-intl';

const AssignmentDetails = ({
  assignment
}) => (
  <Box
    title={assignment.title}
    noPadding={false}>
    <Row>
      <Col md={7}>
        <ReactMarkdown source={assignment.description} />
      </Col>
      <Col md={5}>
        <Table>
          <tbody>
            <tr>
              <td><Icon name='clock-o' /></td>
              <td>Deadline:</td>
              <td>
                <strong>
                  <FormattedDate value={new Date(assignment.deadline * 1000)} /> &nbsp; <FormattedTime value={new Date(assignment.deadline * 1000)} />
                </strong>
              </td>
            </tr>
          </tbody>
        </Table>
      </Col>
    </Row>
  </Box>
);

AssignmentDetails.propTypes = {
  assignment: PropTypes.object.isRequired
};

export default AssignmentDetails;
