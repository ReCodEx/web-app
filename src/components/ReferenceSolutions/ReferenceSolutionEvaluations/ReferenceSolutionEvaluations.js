import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, intlShape, injectIntl } from 'react-intl';

import Box from '../../widgets/Box';
import EvaluationTable from '../EvaluationTable';

const messages = defineMessages({
  title: {
    id: 'app.referenceSolutionEvaluation.title',
    defaultMessage: 'Evaluations of reference solution'
  }
});

class ReferenceSolutionEvaluations extends Component {
  render() {
    const {
      evaluations,
      referenceSolutionId,
      exerciseId,
      intl: { formatMessage }
    } = this.props;

    return (
      <Box
        title={formatMessage(messages.title)}
        noPadding={true}
        collapsable={true}
        isOpen={true}
      >
        <EvaluationTable
          evaluations={evaluations}
          referenceSolutionId={referenceSolutionId}
          exerciseId={exerciseId}
        />
      </Box>
    );
  }
}

ReferenceSolutionEvaluations.propTypes = {
  evaluations: PropTypes.array.isRequired,
  referenceSolutionId: PropTypes.string.isRequired,
  exerciseId: PropTypes.string.isRequired,
  intl: intlShape.isRequired
};

export default injectIntl(ReferenceSolutionEvaluations);
