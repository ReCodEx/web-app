import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

import EnvironmentsListItem from '../../helpers/EnvironmentsList/EnvironmentsListItem';
import Icon, { EvaluationFailedIcon, LoadingIcon } from '../../icons';
import UsersNameContainer from '../../../containers/UsersNameContainer';
import DateTime from '../../widgets/DateTime';

const ReferenceSolutionsTableRow = ({
  id,
  description,
  runtimeEnvironmentId,
  permissionHints = null,
  authorId,
  createdAt,
  lastSubmission,
  runtimeEnvironments,
  renderButtons,
}) => {
  const rte = runtimeEnvironments.find(e => e.id === runtimeEnvironmentId);

  return (
    <tbody>
      <tr>
        <td rowSpan={2} className="valign-middle text-muted">
          <Icon icon="book" size="lg" gapLeft gapRight />
        </td>
        <td colSpan={4}>
          {description || (
            <i className="text-muted small">
              <FormattedMessage id="app.referenceSolutionTable.noDescription" defaultMessage="no description given" />
            </i>
          )}
        </td>
        <td className="text-right valign-middle" rowSpan={2}>
          {renderButtons(id, permissionHints)}
        </td>
      </tr>
      <tr>
        <td className="text-nowrap">
          <DateTime unixts={createdAt} showOverlay overlayTooltipId={`datetime-${id}`} />
        </td>
        <td className="text-nowrap text-center shrink-col">
          {rte ? <EnvironmentsListItem runtimeEnvironment={rte} /> : '-'}
        </td>
        <td className="text-nowrap text-center shrink-col">
          {!lastSubmission || (!lastSubmission.evaluation && !lastSubmission.failure) ? (
            <OverlayTrigger
              placement="bottom"
              overlay={
                <Tooltip id="evaluating">
                  <FormattedMessage
                    id="app.referenceSolutionTable.stillEvaluating"
                    defaultMessage="Last submission is still evaluating"
                  />
                </Tooltip>
              }>
              <LoadingIcon />
            </OverlayTrigger>
          ) : lastSubmission.failure ? (
            <OverlayTrigger
              placement="bottom"
              overlay={
                <Tooltip id="failure">
                  {lastSubmission.failure.description || (
                    <FormattedMessage
                      id="app.referenceSolutionTable.evaluationFailed"
                      defaultMessage="Last evaluation failed"
                    />
                  )}
                </Tooltip>
              }>
              <EvaluationFailedIcon className="text-danger" />
            </OverlayTrigger>
          ) : (
            <strong className={lastSubmission.isCorrect ? 'text-success' : 'text-danger'}>
              <FormattedNumber style="percent" value={lastSubmission.evaluation.score} />
            </strong>
          )}
        </td>
        <td className="text-nowrap">
          <UsersNameContainer userId={authorId} isSimple listItem />
        </td>
      </tr>
    </tbody>
  );
};

ReferenceSolutionsTableRow.propTypes = {
  id: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  runtimeEnvironmentId: PropTypes.string.isRequired,
  authorId: PropTypes.string.isRequired,
  createdAt: PropTypes.number.isRequired,
  lastSubmission: PropTypes.object,
  runtimeEnvironments: PropTypes.array.isRequired,
  permissionHints: PropTypes.object,
  renderButtons: PropTypes.func.isRequired,
};

export default ReferenceSolutionsTableRow;
