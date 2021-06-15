import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

import Icon from '../../icons';
import AssignmentStatusIcon, { getStatusDesc } from '../Assignment/AssignmentStatusIcon';
import CommentsIcon from './CommentsIcon';

const SolutionTableRowIcons = ({
  id,
  accepted,
  reviewed,
  isBestSolution,
  status,
  lastSubmission,
  commentsStats = null,
}) => (
  <>
    <AssignmentStatusIcon
      id={id}
      status={getStatusDesc(status, lastSubmission)}
      accepted={accepted}
      isBestSolution={isBestSolution}
    />

    {reviewed && (
      <OverlayTrigger
        placement="right"
        overlay={
          <Tooltip id={`reviewed-${id}`}>
            <FormattedMessage
              id="app.solutionsTable.reviewedTooltip"
              defaultMessage="The solution has been reviewed by the supervisor."
            />
          </Tooltip>
        }>
        <Icon icon="stamp" className="text-muted" gapLeft />
      </OverlayTrigger>
    )}

    <CommentsIcon id={id} commentsStats={commentsStats} gapLeft />
  </>
);

SolutionTableRowIcons.propTypes = {
  id: PropTypes.string.isRequired,
  commentsStats: PropTypes.object,
  accepted: PropTypes.bool.isRequired,
  reviewed: PropTypes.bool.isRequired,
  isBestSolution: PropTypes.bool.isRequired,
  status: PropTypes.string,
  lastSubmission: PropTypes.shape({
    evaluation: PropTypes.shape({
      score: PropTypes.number.isRequired,
      points: PropTypes.number.isRequired,
    }),
  }),
};

export default SolutionTableRowIcons;
