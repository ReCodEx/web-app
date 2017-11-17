import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '../../widgets/FlatButton';

import Box from '../../widgets/Box';
import EvaluationTable from '../../ReferenceSolutions/EvaluationTable';
import withLinks from '../../../hoc/withLinks';

const SubmissionEvaluations = ({
  evaluations,
  submissionId,
  assignmentId,
  activeSubmissionId,
  onSelect,
  links: { REFERENCE_SOLUTION_EVALUATION_URI_FACTORY }
}) =>
  <Box
    title={
      <FormattedMessage
        id="app.submissionEvaluation.title"
        defaultMessage="Other submissions of this solution"
      />
    }
    noPadding={true}
    collapsable={true}
    isOpen={true}
  >
    <EvaluationTable
      evaluations={evaluations}
      selectedRowId={activeSubmissionId}
      renderButtons={id =>
        <td className="text-right">
          {id === activeSubmissionId
            ? <Button bsStyle="success" bsSize="xs" disabled>
                <FormattedMessage
                  id="app.submissionEvaluation.selected"
                  defaultMessage="Selected"
                />
              </Button>
            : <Button
                bsStyle="primary"
                bsSize="xs"
                onClick={() => onSelect(id)}
              >
                <FormattedMessage
                  id="app.submissionEvaluation.select"
                  defaultMessage="Select"
                />
              </Button>}
        </td>}
    />
  </Box>;

SubmissionEvaluations.propTypes = {
  evaluations: PropTypes.array.isRequired,
  submissionId: PropTypes.string.isRequired,
  assignmentId: PropTypes.string.isRequired,
  activeSubmissionId: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
  links: PropTypes.object
};

export default withLinks(SubmissionEvaluations);
