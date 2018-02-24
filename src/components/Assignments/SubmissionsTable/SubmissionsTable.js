import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import { FormattedMessage } from 'react-intl';
import { OverlayTrigger, Tooltip, Table } from 'react-bootstrap';

import Box from '../../widgets/Box';
import withLinks from '../../../helpers/withLinks';

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
  runtimeEnvironments,
  noteMaxlen = 32,
  links: { SUBMISSION_DETAIL_URI_FACTORY }
}) =>
  <Box title={title} collapsable isOpen noPadding unlimitedHeight>
    <Table responsive>
      <thead>
        <tr>
          <th />
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
          <th className="text-center">
            <FormattedMessage
              id="app.submissionsTable.environment"
              defaultMessage="Target language"
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
              const runtimeEnvironment =
                data.runtimeEnvironmentId &&
                runtimeEnvironments &&
                runtimeEnvironments.find(
                  ({ id }) => id === data.runtimeEnvironmentId
                );

              const note =
                !data.note || data.note.length <= noteMaxlen
                  ? data.note
                  : <OverlayTrigger
                      placement="left"
                      overlay={
                        <Tooltip id={id}>
                          {data.note}
                        </Tooltip>
                      }
                    >
                      <span>
                        {data.note.substr(0, noteMaxlen - 3).trim()}&hellip;
                      </span>
                    </OverlayTrigger>;

              switch (data.lastSubmission
                ? data.lastSubmission.evaluationStatus
                : null) {
                case 'done':
                  return (
                    <SuccessfulSubmissionTableRow
                      {...data}
                      key={id}
                      link={link}
                      runtimeEnvironment={runtimeEnvironment}
                      note={note}
                    />
                  );
                case 'failed':
                  return (
                    <FailedSubmissionTableRow
                      {...data}
                      key={id}
                      link={link}
                      runtimeEnvironment={runtimeEnvironment}
                      note={note}
                    />
                  );
                case null:
                case 'work-in-progress':
                  return (
                    <NotEvaluatedSubmissionTableRow
                      {...data}
                      key={id}
                      link={link}
                      lastSubmission={data.lastSubmission}
                      runtimeEnvironment={runtimeEnvironment}
                      note={note}
                    />
                  );
                case 'evaluation-failed':
                  return (
                    <EvaluationFailedTableRow
                      {...data}
                      key={id}
                      link={link}
                      runtimeEnvironment={runtimeEnvironment}
                      note={note}
                    />
                  );
                default:
                  return null;
              }
            })}
          </tbody>}
      </ResourceRenderer>
      {submissions.size === 0 &&
        <tbody>
          <NoSolutionYetTableRow />
        </tbody>}
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
  runtimeEnvironments: PropTypes.array,
  noteMaxlen: PropTypes.number,
  links: PropTypes.object
};

export default withLinks(SubmissionsTable);
