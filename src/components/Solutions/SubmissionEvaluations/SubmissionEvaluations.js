import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '../../widgets/FlatButton';

import Box from '../../widgets/Box';
import EvaluationTable from '../../ReferenceSolutions/EvaluationTable';
import Icon, { DeleteIcon } from '../../icons';

const SubmissionEvaluations = ({
  evaluations,
  activeSubmissionId,
  showInfo = true,
  onSelect,
  onDelete = null
}) =>
  <Box
    title={
      <FormattedMessage
        id="app.submissionEvaluation.title"
        defaultMessage="All Submission Evaluations of The Solution"
      />
    }
    noPadding={true}
    collapsable={true}
    isOpen={true}
  >
    <React.Fragment>
      {showInfo &&
        <p className="callout callout-info small em-margin">
          <FormattedMessage
            id="app.submissionEvaluation.tableInfo"
            defaultMessage="This table shows the history of evaluations. You may select which evaluation you would like to display, but only the most recent evaluation is considered the valid one (and it is also the only one visible to the student)."
          />
        </p>}
      <EvaluationTable
        evaluations={evaluations}
        selectedRowId={activeSubmissionId}
        renderButtons={id =>
          <td className="text-right">
            {id === activeSubmissionId
              ? <Button bsStyle="success" bsSize="xs" disabled>
                  <Icon icon={['far', 'eye']} gapRight />
                  <FormattedMessage
                    id="app.submissionEvaluation.selected"
                    defaultMessage="Selected"
                  />
                </Button>
              : <React.Fragment>
                  <Button
                    bsStyle="primary"
                    bsSize="xs"
                    onClick={() => onSelect(id)}
                  >
                    <Icon icon={['far', 'eye']} gapRight />
                    <FormattedMessage
                      id="app.submissionEvaluation.select"
                      defaultMessage="Select"
                    />
                  </Button>
                  {onDelete &&
                    <Button
                      bsStyle="danger"
                      bsSize="xs"
                      onClick={() => onDelete(id)}
                    >
                      <DeleteIcon gapRight />
                      <FormattedMessage
                        id="generic.delete"
                        defaultMessage="Delete"
                      />
                    </Button>}
                </React.Fragment>}
          </td>}
      />
    </React.Fragment>
  </Box>;

SubmissionEvaluations.propTypes = {
  evaluations: PropTypes.array.isRequired,
  submissionId: PropTypes.string.isRequired,
  activeSubmissionId: PropTypes.string.isRequired,
  showInfo: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
  onDelete: PropTypes.func
};

export default SubmissionEvaluations;
