import React, { PropTypes } from 'react';
import Box from '../../Box';
import Icon from 'react-fontawesome';
import { Grid, Row, Col, Table } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import { FormattedDate, FormattedTime } from 'react-intl';

const AssignmentDetails = ({
  assignment,
  isOpen
}) => (
  <Box
    title={'Zadání úlohy'}
    noPadding={false}
    collapsable={true}
    isOpen={isOpen}>
    <Table responsive condensed>
      <tbody>
        <tr>
          <td>
            <strong>
              <Icon name='clock-o' />
            </strong>
          </td>
          <td>Termín pro odevzdání:</td>
          <td>
            <strong>
              <FormattedDate value={new Date(assignment.deadline.first * 1000)} /> &nbsp; <FormattedTime value={new Date(assignment.deadline.first * 1000)} />
            </strong>
          </td>
        </tr>
        {assignment.deadline.second && (
          <tr>
            <td>
              <strong className='text-warning'>
                <Icon name='clock-o' />
              </strong>
            </td>
            <td>Druhý termín pro odevzdání:</td>
            <td>
              <strong>
                <FormattedDate value={new Date(assignment.deadline.second * 1000)} /> &nbsp; <FormattedTime value={new Date(assignment.deadline.second * 1000)} />
              </strong>
            </td>
          </tr>)}
      </tbody>
    </Table>
    <ReactMarkdown source={assignment.description} />
  </Box>
);

AssignmentDetails.propTypes = {
  assignment: PropTypes.object.isRequired
};

export default AssignmentDetails;
