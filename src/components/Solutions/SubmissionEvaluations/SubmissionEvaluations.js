import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import Button from '../../widgets/TheButton';
import Callout from '../../widgets/Callout';
import Confirm from '../../forms/Confirm';
import Box from '../../widgets/Box';
import EvaluationTable from '../../ReferenceSolutions/EvaluationTable';
import Icon, { DeleteIcon } from '../../icons';

const deleteButton = (id, onDelete, confirmation = null) =>
  confirmation ? (
    <Confirm id={id} onConfirmed={() => onDelete(id)} question={confirmation}>
      <Button variant="danger" size="xs">
        <DeleteIcon gapRight />
        <FormattedMessage id="generic.delete" defaultMessage="Delete" />
      </Button>
    </Confirm>
  ) : (
    <Button variant="danger" size="xs" onClick={() => onDelete(id)}>
      <DeleteIcon gapRight />
      <FormattedMessage id="generic.delete" defaultMessage="Delete" />
    </Button>
  );

const SubmissionEvaluations = ({
  evaluations,
  activeSubmissionId,
  showInfo = true,
  onSelect,
  onDelete = null,
  confirmDeleteLastSubmit = false,
}) => (
  <Box
    title={
      <FormattedMessage
        id="app.submissionEvaluation.title"
        defaultMessage="All Submission Evaluations of The Solution"
      />
    }
    noPadding={true}
    collapsable={true}
    isOpen={true}>
    <>
      {showInfo && (
        <Callout variant="info" className="small em-margin">
          <FormattedMessage
            id="app.submissionEvaluation.tableInfo"
            defaultMessage="This table shows the history of evaluations. You may select which evaluation you would like to display, but only the most recent evaluation is considered the valid one (and it is also the only one visible to the student)."
          />
        </Callout>
      )}
      <EvaluationTable
        evaluations={evaluations}
        selectedRowId={activeSubmissionId}
        renderButtons={(id, idx) => (
          <td className="text-right">
            {id === activeSubmissionId ? (
              <Button variant="success" size="xs" disabled>
                <Icon icon={['far', 'eye']} gapRight />
                <FormattedMessage id="app.submissionEvaluation.visible" defaultMessage="Visible" />
              </Button>
            ) : (
              <>
                <Button variant="primary" size="xs" onClick={() => onSelect(id)}>
                  <Icon icon={['far', 'eye']} gapRight />
                  <FormattedMessage id="app.submissionEvaluation.show" defaultMessage="Show" />
                </Button>
                {onDelete &&
                  deleteButton(
                    id,
                    onDelete,
                    confirmDeleteLastSubmit && idx === 0 && (
                      <FormattedMessage
                        id="app.submissionEvaluation.confirmDeleteLastSubmission"
                        defaultMessage="This is the last submission. If you delete it, you may alter the grading of this solution. Do you wish to proceed?"
                      />
                    )
                  )}
              </>
            )}
          </td>
        )}
      />
    </>
  </Box>
);

SubmissionEvaluations.propTypes = {
  evaluations: PropTypes.array.isRequired,
  submissionId: PropTypes.string.isRequired,
  activeSubmissionId: PropTypes.string.isRequired,
  showInfo: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  confirmDeleteLastSubmit: PropTypes.bool,
};

export default SubmissionEvaluations;
