import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedNumber } from 'react-intl';

import EnvironmentsListItem from '../../helpers/EnvironmentsList/EnvironmentsListItem.js';
import Icon, { EvaluationFailedIcon, LoadingIcon } from '../../icons';
import UsersNameContainer from '../../../containers/UsersNameContainer';
import DateTime from '../../widgets/DateTime';

const ReferenceSolutionsTableRow = ({
  id,
  description,
  runtimeEnvironmentId,
  authorId,
  createdAt,
  lastSubmission,
  runtimeEnvironments,
  onClick = null,
}) => {
  const rte = runtimeEnvironments.find(e => e.id === runtimeEnvironmentId);

  return (
    <tbody onClick={onClick} className={onClick ? 'clickable' : null}>
      <tr>
        <td rowSpan={2} className="shrink-col pe-0">
          <Icon icon="star" className="text-warning" />
        </td>
        <td colSpan={4} className="pb-1">
          {description || (
            <i className="text-body-secondary small">
              <FormattedMessage id="app.referenceSolutionTable.noDescription" defaultMessage="no description given" />
            </i>
          )}
        </td>
      </tr>
      <tr>
        <td className="text-nowrap text-body-secondary small pt-0">
          <DateTime unixTs={createdAt} showOverlay overlayTooltipId={`datetime-${id}`} />
        </td>
        <td className="text-nowrap text-center shrink-col small pt-0">
          {rte ? <EnvironmentsListItem runtimeEnvironment={rte} /> : '-'}
        </td>
        <td className="text-nowrap text-center shrink-col pt-0">
          {!lastSubmission || (!lastSubmission.evaluation && !lastSubmission.failure) ? (
            <LoadingIcon
              tooltipId="evaluating"
              tooltipPlacement="bottom"
              tooltip={
                <FormattedMessage
                  id="app.referenceSolutionTable.stillEvaluating"
                  defaultMessage="Last submission is still evaluating"
                />
              }
            />
          ) : lastSubmission.failure ? (
            <EvaluationFailedIcon
              className="text-danger"
              tooltipId="failure"
              tooltipPlacement="bottom"
              tooltip={
                lastSubmission.failure.description || (
                  <FormattedMessage
                    id="app.referenceSolutionTable.evaluationFailed"
                    defaultMessage="Last evaluation failed"
                  />
                )
              }
            />
          ) : (
            <strong className={lastSubmission.evaluation.score >= 1.0 ? 'text-success' : 'text-danger'}>
              <FormattedNumber style="percent" value={lastSubmission.evaluation.score} />
            </strong>
          )}
        </td>
        <td className="text-nowrap text-body-secondary small pt-0">
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
  onClick: PropTypes.func,
};

export default ReferenceSolutionsTableRow;
