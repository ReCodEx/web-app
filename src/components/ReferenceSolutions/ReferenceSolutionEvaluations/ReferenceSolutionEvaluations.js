import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router';

import Box from '../../widgets/Box';
import EvaluationTable from '../EvaluationTable';
import withLinks from '../../../helpers/withLinks';

const ReferenceSolutionEvaluations = ({
  evaluations,
  referenceSolutionId,
  exerciseId,
  links: { REFERENCE_SOLUTION_EVALUATION_URI_FACTORY }
}) =>
  <Box
    title={
      <FormattedMessage
        id="app.referenceSolutionEvaluation.title"
        defaultMessage="Evaluations of reference solution"
      />
    }
    noPadding={true}
    collapsable={true}
    isOpen={true}
  >
    <EvaluationTable
      evaluations={evaluations}
      renderButtons={id =>
        <td className="text-right">
          <Link
            to={REFERENCE_SOLUTION_EVALUATION_URI_FACTORY(
              exerciseId,
              referenceSolutionId,
              id
            )}
            className="btn btn-flat btn-default btn-xs"
          >
            <FormattedMessage
              id="app.evaluationTable.showDetails"
              defaultMessage="Show details"
            />
          </Link>
        </td>}
    />
  </Box>;

ReferenceSolutionEvaluations.propTypes = {
  evaluations: PropTypes.array.isRequired,
  referenceSolutionId: PropTypes.string.isRequired,
  exerciseId: PropTypes.string.isRequired,
  links: PropTypes.object
};

export default withLinks(ReferenceSolutionEvaluations);
