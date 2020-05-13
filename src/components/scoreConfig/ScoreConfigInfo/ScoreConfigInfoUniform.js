import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

const ScoreConfigInfoUniform = ({ scoreConfig }) => (
  <div>
    <h4>
      <FormattedMessage id="app.scoreConfigInfoUniform.title" defaultMessage="Arithmetic average" />
    </h4>
    <p>
      <FormattedMessage
        id="app.scoreConfigInfoUniform.description"
        defaultMessage="The overall correctness is computed as a simple arithmetic average of the individual test results."
      />
    </p>
  </div>
);

ScoreConfigInfoUniform.propTypes = {
  scoreConfig: PropTypes.object,
};

export default ScoreConfigInfoUniform;
