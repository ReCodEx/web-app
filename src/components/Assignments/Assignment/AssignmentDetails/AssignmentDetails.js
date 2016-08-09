import React, { PropTypes } from 'react';
import Box from '../../../AdminLTE/Box';
import Icon from 'react-fontawesome';
import { Grid, Row, Col, Table } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import { FormattedDate, FormattedTime, FormattedMessage } from 'react-intl';
import classnames from 'classnames';

const AssignmentDetails = ({
  assignment,
  isOpen,
  isAfterFirstDeadline,
  isAfterSecondDeadline
}) => (
  <Box
    title={<FormattedMessage id='app.assignment.title' defaultMessage='Exercise assignment' />}
    noPadding={true}
    collapsable={true}
    isOpen={isOpen}>
    <div style={{ padding: 20 }}>
      <ReactMarkdown
        source={assignment.description} />
    </div>
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
          <td>
            <FormattedMessage id='app.assignment.deadline' defaultMessage='Deadline:' />
          </td>
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
            <td>
              <FormattedMessage id='app.assignment.secondDedline' defaultMessage='Second deadline:' />
            </td>
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
          <td>
            <FormattedMessage id='app.assignment.submissionsCountLimit' defaultMessage='Submission count limit:' />
          </td>
          <td>{assignment.submissionsCountLimit === null ? '-' : assignment.submissionsCountLimit}</td>
        </tr>
      </tbody>
    </Table>
  </Box>
);

AssignmentDetails.propTypes = {
  assignment: PropTypes.object.isRequired
};

export default AssignmentDetails;
