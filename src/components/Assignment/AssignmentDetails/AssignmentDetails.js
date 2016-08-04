import React, { PropTypes } from 'react';
import Box from '../../Box';
import Icon from 'react-fontawesome';
import { Grid, Row, Col, Table } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import { FormattedDate, FormattedTime } from 'react-intl';
import classnames from 'classnames';

const AssignmentDetails = ({
  assignment,
  isOpen,
  isAfterFirstDeadline,
  isAfterSecondDeadline
}) => (
  <Box
    title={'Zadání úlohy'}
    noPadding={true}
    collapsable={true}
    isOpen={isOpen}>
    <Table responsive condensed>
      <tbody>
        <tr className={classnames({
          'text-danger': isAfterFirstDeadline
        })}>
          <td className='text-center'>
            <strong>
              {!isAfterFirstDeadline && <Icon name='hourglass-start' />}
              {isAfterFirstDeadline && <Icon name='hourglass-end'/>}
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
          <tr className={classnames({
            'text-danger': isAfterSecondDeadline
          })}>
            <td className='text-center'>
              <strong>
                {!isAfterSecondDeadline && <Icon name='hourglass-half' />}
                {isAfterSecondDeadline && <Icon name='hourglass-end'/>}
              </strong>
            </td>
            <td>Druhý termín pro odevzdání:</td>
            <td>
              <strong>
                <FormattedDate value={new Date(assignment.deadline.second * 1000)} /> &nbsp; <FormattedTime value={new Date(assignment.deadline.second * 1000)} />
              </strong>
            </td>
          </tr>)}
        <tr>
          <td className='text-center'>
            <Icon name='cloud-upload' />
          </td>
          <td>Limit počtu odevzdání:</td>
          <td>{assignment.submissionsCountLimit === null ? '-' : assignment.submissionsCountLimit}</td>
        </tr>
      </tbody>
    </Table>
    <div style={{ paddingLeft: 20, paddingRight: 20, paddingBottom: 20 }}>
      <ReactMarkdown
        source={assignment.description} />
    </div>
  </Box>
);

AssignmentDetails.propTypes = {
  assignment: PropTypes.object.isRequired
};

export default AssignmentDetails;
