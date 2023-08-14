import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Table } from 'react-bootstrap';

import Box from '../../widgets/Box';
import DateTime from '../../widgets/DateTime';
import Explanation from '../../widgets/Explanation';
import UsersNameContainer from '../../../containers/UsersNameContainer';
import ExercisesNameContainer from '../../../containers/ExercisesNameContainer';
import Icon, { EditIcon, CodeIcon, VisibleIcon } from '../../icons';
import EnvironmentsListItem from '../../helpers/EnvironmentsList/EnvironmentsListItem';

const ReferenceSolutionStatus = ({
  description,
  authorId,
  submittedAt,
  submittedBy,
  exerciseId,
  environment,
  visibility,
}) => (
  <Box
    title={
      <FormattedMessage id="app.referenceSolutionDetail.title.details" defaultMessage="Reference Solution Detail" />
    }
    noPadding={true}
    collapsable={true}
    isOpen={true}>
    <Table responsive size="sm" className="mb-1">
      <tbody>
        <tr>
          <td className="text-center text-muted shrink-col px-2">
            <CodeIcon />
          </td>
          <th>
            <FormattedMessage id="app.referenceSolutionDetail.exercise" defaultMessage="Exercise" />:
          </th>
          <td>{exerciseId && <ExercisesNameContainer exerciseId={exerciseId} />}</td>
        </tr>

        <tr>
          <td className="text-center text-muted shrink-col px-2">
            <EditIcon />
          </td>
          <th>
            <FormattedMessage id="generic.description" defaultMessage="Description" />:
          </th>
          <td>{description}</td>
        </tr>

        <tr>
          <td className="text-center text-muted shrink-col px-2">
            <Icon icon={['far', 'clock']} />
          </td>
          <th>
            <FormattedMessage id="generic.uploadedAt" defaultMessage="Uploaded at" />:
          </th>
          <td>
            <DateTime unixts={submittedAt} showRelative />
          </td>
        </tr>

        <tr>
          <td className="text-center text-muted shrink-col px-2">
            <Icon icon="user" />
          </td>
          <th>
            <FormattedMessage id="generic.author" defaultMessage="Author" />:
          </th>
          <td>
            <UsersNameContainer userId={authorId} link />
          </td>
        </tr>

        {Boolean(submittedBy) && submittedBy !== authorId && (
          <tr>
            <td className="text-center text-muted shrink-col px-2">
              <Icon icon="user" />
            </td>
            <th className="text-nowrap">
              <FormattedMessage id="generic.reevaluatedBy" defaultMessage="Re-evaluated by" />:
            </th>
            <td>
              <UsersNameContainer userId={submittedBy} showEmail="icon" link />
            </td>
          </tr>
        )}

        {Boolean(environment) && Boolean(environment.name) && (
          <tr>
            <td className="text-center text-muted shrink-col px-2">
              <CodeIcon />
            </td>
            <th className="text-nowrap">
              <FormattedMessage id="app.solution.environment" defaultMessage="Used language:" />
            </th>
            <td>
              <EnvironmentsListItem runtimeEnvironment={environment} longNames={true} />
            </td>
          </tr>
        )}

        <tr>
          <td className="text-center text-muted shrink-col px-2">
            <VisibleIcon visible={visibility > 0} />
          </td>
          <th>
            <FormattedMessage id="generic.visibility" defaultMessage="Visibility" />:
          </th>
          <td>
            {visibility <= 0 && (
              <FormattedMessage id="app.referenceSolutionDetail.visibility.private" defaultMessage="Private" />
            )}
            {visibility === 1 && (
              <FormattedMessage id="app.referenceSolutionDetail.visibility.public" defaultMessage="Public" />
            )}
            {visibility > 1 && (
              <FormattedMessage id="app.referenceSolutionDetail.visibility.promoted" defaultMessage="Promoted" />
            )}
            <Explanation id="assigned-at">
              {visibility <= 0 && (
                <FormattedMessage
                  id="app.referenceSolutionDetail.visibility.privateExplanation"
                  defaultMessage="Private solutions are visible only to their author. Experimental and temporary submissions should be kept private so other suprevisors are not overwhelmed with abundance of irrelevant source codes."
                />
              )}
              {visibility === 1 && (
                <FormattedMessage
                  id="app.referenceSolutionDetail.visibility.publicExplanation"
                  defaultMessage="Public solutions are visible to all supervisors who can see the exercise."
                />
              )}
              {visibility > 1 && (
                <FormattedMessage
                  id="app.referenceSolutionDetail.visibility.promotedExplanation"
                  defaultMessage="Promoted solutions are public solutions explicitly recommended by the author of the exercise as the ones that are worth checking out by supervisors who consider to assign the exercise."
                />
              )}
            </Explanation>
          </td>
        </tr>
      </tbody>
    </Table>
  </Box>
);

ReferenceSolutionStatus.propTypes = {
  description: PropTypes.string.isRequired,
  authorId: PropTypes.string.isRequired,
  submittedBy: PropTypes.string.isRequired,
  submittedAt: PropTypes.number.isRequired,
  exerciseId: PropTypes.string.isRequired,
  environment: PropTypes.object,
  visibility: PropTypes.number.isRequired,
};

export default ReferenceSolutionStatus;
