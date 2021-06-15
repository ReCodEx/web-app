import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import ScoreConfigInfoDefault from './ScoreConfigInfoDefault';
import DateTime from '../../widgets/DateTime';
import ScoreConfigInfoUniform from './ScoreConfigInfoUniform';
import ScoreConfigInfoWeighted from './ScoreConfigInfoWeighted';
import ScoreConfigInfoUniversal from './ScoreConfigInfoUniversal';
import { UNIFORM_ID, WEIGHTED_ID, UNIVERSAL_ID } from '../../../helpers/exercise/testsAndScore';

const knownCalculators = {
  [UNIFORM_ID]: ScoreConfigInfoUniform,
  [WEIGHTED_ID]: ScoreConfigInfoWeighted,
  [UNIVERSAL_ID]: ScoreConfigInfoUniversal,
};

const ScoreConfigInfo = ({ scoreConfig, testResults, canResubmit = false }) => {
  const ScoreConfigCalculatorPresenter =
    (scoreConfig && scoreConfig.calculator && knownCalculators[scoreConfig.calculator]) || ScoreConfigInfoDefault;

  return (
    <>
      {scoreConfig ? (
        <>
          <ScoreConfigCalculatorPresenter scoreConfig={scoreConfig} testResults={testResults} />
          <p className="small text-right text-nowrap text-muted em-padding-right">
            <FormattedMessage id="app.scoreConfigInfo.createdAt" defaultMessage="Configured at" />
            :&nbsp;
            <DateTime unixts={scoreConfig.createdAt} showRelative />
          </p>
        </>
      ) : (
        <div className="callout callout-info">
          <h4>
            <FormattedMessage
              id="app.scoreConfigInfo.missingTitle"
              defaultMessage="The algorithm specification is missing"
            />
          </h4>
          <p>
            <FormattedMessage
              id="app.scoreConfigInfo.missing"
              defaultMessage="The submission was evaluated before this feature was implemented. The overall correctness must have been computed as (possibly weighted) average of individual tests."
            />
          </p>
          {canResubmit && (
            <p>
              <FormattedMessage
                id="app.scoreConfigInfo.missingButCanResubmit"
                defaultMessage="You may resubmit the solution and then the current correctness algorithm from the configuration of the assignment will be attached to the new submission (and incidently visible in this dialog)."
              />
            </p>
          )}
        </div>
      )}
    </>
  );
};

ScoreConfigInfo.propTypes = {
  scoreConfig: PropTypes.object,
  testResults: PropTypes.array,
  canResubmit: PropTypes.bool,
};

export default ScoreConfigInfo;
