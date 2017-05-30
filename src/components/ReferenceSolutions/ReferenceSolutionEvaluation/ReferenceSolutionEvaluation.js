import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, intlShape, injectIntl } from 'react-intl';

import Box from '../../widgets/Box';
import EvaluationTable from '../EvaluationTable';

const messages = defineMessages({
  titlePrefix: {
    id: 'app.referenceSolutionEvaluation.titlePrefix',
    defaultMessage: 'Evaluations for runtime:'
  }
});

class ReferenceSolutionEvaluation extends Component {
  render() {
    const {
      environment,
      evaluations,
      referenceSolutionId,
      renderButtons,
      intl: { formatMessage }
    } = this.props;

    return (
      <Box
        title={formatMessage(messages.titlePrefix) + ' ' + environment}
        noPadding={true}
        collapsable={true}
        isOpen={true}
      >
        <EvaluationTable
          evaluations={evaluations}
          referenceSolutionId={referenceSolutionId}
          renderButtons={renderButtons}
        />
      </Box>
    );
  }
}

ReferenceSolutionEvaluation.propTypes = {
  environment: PropTypes.string.isRequired,
  evaluations: PropTypes.array.isRequired,
  referenceSolutionId: PropTypes.string.isRequired,
  renderButtons: PropTypes.func,
  intl: intlShape.isRequired
};

export default injectIntl(ReferenceSolutionEvaluation);
