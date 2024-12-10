import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { EvaluationFailedIcon, InfoIcon } from '../../icons';
import DateTime from '../../widgets/DateTime';
import Callout from '../../widgets/Callout';
import InsetPanel from '../../widgets/InsetPanel';

const FAILURE_TYPES = {
  broker_reject: (
    <FormattedMessage
      id="app.submissionEvaluation.evaluationFailed.brokerReject"
      defaultMessage="The backend rejected the evaluation job."
    />
  ),
  evaluation_failure: (
    <FormattedMessage
      id="app.submissionEvaluation.evaluationFailed.evaluationFailure"
      defaultMessage="The evaluation failed during processing."
    />
  ),
  config_error: (
    <FormattedMessage
      id="app.submissionEvaluation.evaluationFailed.configError"
      defaultMessage="Exercise configuration could not be compiled in the evaluation execution plan."
    />
  ),
  soft_config_error: (
    <FormattedMessage
      id="app.submissionEvaluation.evaluationFailed.softConfigError"
      defaultMessage="The evaluation execution plan could not be compiled due to problems with submission."
    />
  ),
};

const FAILURE_DETAILS = {
  broker_reject: (
    <FormattedMessage
      id="app.submissionEvaluation.evaluationFailed.brokerRejectDetails"
      defaultMessage="This type of error occurs when the backend cannot accept the evaluation job. The exercise configuration is not valid or the backend workers responsible for this type of submissions are currently offline."
    />
  ),
  evaluation_failure: (
    <FormattedMessage
      id="app.submissionEvaluation.evaluationFailed.evaluationFailureDetails"
      defaultMessage="This type of error could be caused by invalid exercise configuration or by internal error of the backend worker. Complex exercises may also run into this error when names of the submitted or compiled files are clashing."
    />
  ),
  config_error: (
    <FormattedMessage
      id="app.submissionEvaluation.evaluationFailed.configErrorDetails"
      defaultMessage="This type of error usually occurs if the exercise is not configured properly. Please contact the author of the exercise."
    />
  ),
  soft_config_error: (
    <FormattedMessage
      id="app.submissionEvaluation.evaluationFailed.softConfigErrorDetails"
      defaultMessage="This type of error often occurs if the submission contains inapropriate files. Please consult the assignments specification to verify that you have submitted expected files and these files are properly named."
    />
  ),
};

const FailureReport = ({ failure }) => (
  <>
    <Callout variant="danger" icon={<EvaluationFailedIcon />}>
      <span className="small float-end">
        (<DateTime unixts={failure.createdAt} />)
      </span>
      <h4>
        <FormattedMessage
          id="app.submissionEvaluation.evaluationFailedHeading"
          defaultMessage="The evaluation has failed!"
        />
      </h4>

      {typeof failure === 'object' ? (
        <>
          <p>
            {FAILURE_TYPES[failure.type] || (
              <>
                (
                <FormattedMessage
                  id="app.submissionEvaluation.evaluationFailed.unknown"
                  defaultMessage="Unknown error type"
                />
                ) (<code>{failure.type}</code>)
              </>
            )}
          </p>
          {FAILURE_DETAILS[failure.type] ? (
            <p className="small text-body-secondary">
              <InfoIcon gapRight={2} />
              {FAILURE_DETAILS[failure.type]}
            </p>
          ) : null}
          <hr />
          <FormattedMessage id="app.submissionEvaluation.evaluationFailedMessage" defaultMessage="Backend message" />:
          <InsetPanel className="py-2 px-3 mt-1">
            <code>{failure.description}</code>
          </InsetPanel>
        </>
      ) : (
        <p>
          <FormattedMessage
            id="app.submissionEvaluation.evaluationFailedInternalError"
            defaultMessage="Internal backend error."
          />
        </p>
      )}
    </Callout>

    {Boolean(typeof failure === 'object' && failure.resolvedAt && failure.resolutionNote) && (
      <Callout variant="success" icon="fire-extinguisher">
        <span className="small float-end">
          (<DateTime unixts={failure.resolvedAt} />)
        </span>
        <h4>
          <FormattedMessage
            id="app.submissionEvaluation.evaluationFailureResolved"
            defaultMessage="The failure has been resolved by admin!"
          />
        </h4>
        <p>
          <FormattedMessage
            id="app.submissionEvaluation.evaluationFailureResolvedNote"
            defaultMessage="Resolution note"
          />
          : <em>{failure.resolutionNote}</em>
        </p>
      </Callout>
    )}
  </>
);

FailureReport.propTypes = {
  failure: PropTypes.any,
};

export default FailureReport;
