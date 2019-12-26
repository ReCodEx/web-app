import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import classnames from 'classnames';

import Box from '../../widgets/Box';
import DateTime from '../../widgets/DateTime';
import AssignmentStatusIcon from '../../Assignments/Assignment/AssignmentStatusIcon';
import UsersNameContainer from '../../../containers/UsersNameContainer';
import EnvironmentsListItem from '../../helpers/EnvironmentsList/EnvironmentsListItem';
import withLinks from '../../../helpers/withLinks';
import Icon, { EditIcon, SuccessOrFailureIcon, CodeIcon } from '../../icons';

const SolutionStatus = ({
  assignment: { firstDeadline, allowSecondDeadline, secondDeadline },
  evaluationStatus,
  submittedAt,
  userId,
  submittedBy,
  note,
  accepted,
  reviewed,
  environment,
  maxPoints,
  bonusPoints,
  actualPoints,
  links: { SOLUTION_DETAIL_URI_FACTORY },
}) => (
  <Box
    title={<FormattedMessage id="app.solution.title" defaultMessage="The Solution" />}
    noPadding={true}
    collapsable={true}
    isOpen={true}>
    <Table>
      <tbody>
        {note.length > 0 && (
          <tr>
            <td className="text-center">
              <EditIcon />
            </td>
            <th className="text-nowrap">
              <FormattedMessage id="app.solution.note" defaultMessage="Note:" />
            </th>
            <td>{note}</td>
          </tr>
        )}

        <tr>
          <td className="text-center">
            <Icon icon={['far', 'clock']} />
          </td>
          <th className="text-nowrap">
            <FormattedMessage id="app.solution.submittedAt" defaultMessage="Submitted at" />:
          </th>
          <td>
            <DateTime unixts={submittedAt} showRelative />
          </td>
        </tr>

        <tr>
          <td className="text-center">
            <Icon icon="hourglass-start" />
          </td>
          <th className="text-nowrap">
            <FormattedMessage id="app.solution.beforeFirstDeadline" defaultMessage="Before the deadline" />:
          </th>
          <td>
            <SuccessOrFailureIcon success={submittedAt < firstDeadline} />
          </td>
        </tr>

        {submittedAt >= firstDeadline && allowSecondDeadline === true && (
          <tr>
            <td className="text-center">
              <Icon icon="hourglass-end" />
            </td>
            <th className="text-nowrap">
              <FormattedMessage id="app.solution.beforeSecondDeadline" defaultMessage="Before the second deadline" />:
            </th>
            <td>
              <SuccessOrFailureIcon success={submittedAt < secondDeadline} />
            </td>
          </tr>
        )}

        <tr>
          <td className="text-center">
            <Icon icon="user" />
          </td>
          <th className="text-nowrap">
            <FormattedMessage id="generic.author" defaultMessage="Author" />:
          </th>
          <td>
            <UsersNameContainer userId={userId} showEmail="icon" />
          </td>
        </tr>

        {Boolean(submittedBy) && submittedBy !== userId && (
          <tr>
            <td className="text-center">
              <Icon icon="user" />
            </td>
            <th className="text-nowrap">
              <FormattedMessage id="generic.reevaluatedBy" defaultMessage="Re-evaluated by" />:
            </th>
            <td>
              <UsersNameContainer userId={submittedBy} showEmail="icon" />
            </td>
          </tr>
        )}

        {Boolean(environment) && Boolean(environment.name) && (
          <tr>
            <td className="text-center">
              <CodeIcon />
            </td>
            <th className="text-nowrap">
              <FormattedMessage id="app.solution.environment" defaultMessage="Target language:" />
            </th>
            <td>
              <EnvironmentsListItem runtimeEnvironment={environment} longNames={true} />
            </td>
          </tr>
        )}

        <tr>
          <td className="text-center">
            <AssignmentStatusIcon id={String(submittedAt)} status={evaluationStatus} accepted={accepted} />
          </td>
          <th className="text-nowrap">
            <FormattedMessage id="app.solution.scoredPoints" defaultMessage="Final score" />:
          </th>
          <td
            className={classnames({
              'text-danger': actualPoints + bonusPoints <= 0,
              'text-success': actualPoints + bonusPoints > 0,
            })}>
            <b>
              {actualPoints || 0}
              {bonusPoints !== 0 ? (bonusPoints >= 0 ? '+' : '') + bonusPoints : ''} / {maxPoints}
            </b>
          </td>
        </tr>

        <tr>
          <td className="text-center">
            <Icon icon="check-circle" />
          </td>
          <th className="text-nowrap">
            <FormattedMessage id="app.solution.acceptedAsFinal" defaultMessage="Accepted as final" />:
          </th>
          <td>
            <SuccessOrFailureIcon success={accepted} />
          </td>
        </tr>

        <tr>
          <td className="text-center">
            <Icon icon="stamp" />
          </td>
          <th className="text-nowrap">
            <FormattedMessage id="app.solution.reviewed" defaultMessage="Reviewed" />:
          </th>
          <td>
            <SuccessOrFailureIcon success={reviewed} />
          </td>
        </tr>
      </tbody>
    </Table>
  </Box>
);

SolutionStatus.propTypes = {
  assignment: PropTypes.shape({
    firstDeadline: PropTypes.number.isRequired,
    allowSecondDeadline: PropTypes.bool.isRequired,
    secondDeadline: PropTypes.number,
  }).isRequired,
  evaluationStatus: PropTypes.string.isRequired,
  submittedAt: PropTypes.number.isRequired,
  userId: PropTypes.string.isRequired,
  submittedBy: PropTypes.string,
  note: PropTypes.string,
  accepted: PropTypes.bool.isRequired,
  reviewed: PropTypes.bool.isRequired,
  environment: PropTypes.object,
  maxPoints: PropTypes.number.isRequired,
  bonusPoints: PropTypes.number.isRequired,
  actualPoints: PropTypes.number,
  links: PropTypes.object.isRequired,
};

export default withLinks(SolutionStatus);
