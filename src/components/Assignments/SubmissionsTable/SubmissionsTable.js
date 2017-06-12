import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import { FormattedMessage } from 'react-intl';

import { Table } from 'react-bootstrap';
import Box from '../../widgets/Box';

import withLinks from '../../../hoc/withLinks';

import ResourceRenderer from '../../helpers/ResourceRenderer';
import LoadingSubmissionTableRow from './LoadingSubmissionTableRow';
import NoSolutionYetTableRow from './NoSolutionYetTableRow';
import SuccessfulSubmissionTableRow from './SuccessfulSubmissionTableRow';
import FailedSubmissionTableRow from './FailedSubmissionTableRow';
import FailedLoadingSubmissionTableRow from './FailedLoadingSubmissionTableRow';
import NotEvaluatedSubmissionTableRow from './NotEvaluatedSubmissionTableRow';
import EvaluationFailedTableRow from './EvaluationFailedTableRow';

const SubmissionsTable = ({
  title,
  assignmentId,
  submissions,
  links: { SUBMISSION_DETAIL_URI_FACTORY }
}) =>
  <Box title={title} collapsable isOpen noPadding>
    <Table responsive>
      <thead>
        <tr>
          <th />
          <th>
            <FormattedMessage
              id="app.submissionsTable.submissionDate"
              defaultMessage="Date of submission"
            />
          </th>
          <th className="text-center">
            <FormattedMessage
              id="app.submissionsTable.solutionValidity"
              defaultMessage="Solution validity"
            />
          </th>
          <th className="text-center">
            <FormattedMessage
              id="app.submissionsTable.receivedPoints"
              defaultMessage="Received points"
            />
          </th>
          <th>
            <FormattedMessage
              id="app.submissionsTable.note"
              defaultMessage="Note"
            />
          </th>
          <th />
        </tr>
      </thead>
      <ResourceRenderer
        resource={submissions.toArray()}
        loading={<LoadingSubmissionTableRow />}
        failed={<FailedLoadingSubmissionTableRow />}
      >
        {(...submissions) =>
          <tbody>
            {submissions.map((data, i) => {
              const id = data.id;
              const link = SUBMISSION_DETAIL_URI_FACTORY(assignmentId, id);

              switch (data.evaluationStatus) {
                case 'done':
                  return (
                    <SuccessfulSubmissionTableRow
                      {...data}
                      key={id}
                      link={link}
                    />
                  );
                case 'failed':
                  return (
                    <FailedSubmissionTableRow {...data} key={id} link={link} />
                  );
                case 'work-in-progress':
                  return (
                    <NotEvaluatedSubmissionTableRow
                      {...data}
                      key={id}
                      link={link}
                    />
                  );
                case 'evaluation-failed':
                  return (
                    <EvaluationFailedTableRow {...data} key={id} link={link} />
                  );
                default:
                  return null;
              }
            })}
          </tbody>}
      </ResourceRenderer>
      {submissions.size === 0 && <tbody><NoSolutionYetTableRow /></tbody>}
    </Table>
  </Box>;

SubmissionsTable.propTypes = {
  title: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) }),
    PropTypes.element
  ]).isRequired,
  assignmentId: PropTypes.string.isRequired,
  submissions: PropTypes.instanceOf(List),
  links: PropTypes.object
};

export default withLinks(SubmissionsTable);
