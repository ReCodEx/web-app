import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedDate, FormattedTime } from 'react-intl';
import { Row, Col, Alert } from 'react-bootstrap';

import Button from '../../../widgets/FlatButton';

const syncMessages = {
  supplementaryFiles: (
    <FormattedMessage
      id="app.assignment.syncSupplementaryFiles"
      defaultMessage="Supplementary files"
    />
  ),
  attachmentFiles: (
    <FormattedMessage
      id="app.assignment.syncAttachmentFiles"
      defaultMessage="Text attachment files"
    />
  ),
  exerciseTests: (
    <FormattedMessage
      id="app.assignment.syncExerciseTests"
      defaultMessage="Exercise tests"
    />
  ),
  localizedTexts: (
    <FormattedMessage
      id="app.assignment.syncLocalizedTexts"
      defaultMessage="Localized texts"
    />
  ),
  configurationType: (
    <FormattedMessage
      id="app.assignment.syncConfigurationType"
      defaultMessage="Configuration was switched to advanced mode"
    />
  ),
  scoreConfig: (
    <FormattedMessage
      id="app.assignment.syncScoreConfig"
      defaultMessage="Test score configuration"
    />
  ),
  scoreCalculator: (
    <FormattedMessage
      id="app.assignment.syncScoreCalculator"
      defaultMessage="Test score calculator"
    />
  ),
  exerciseConfig: (
    <FormattedMessage
      id="app.assignment.syncExerciseConfig"
      defaultMessage="Exercise configuration"
    />
  ),
  runtimeEnvironments: (
    <FormattedMessage
      id="app.assignment.syncRuntimeEnvironments"
      defaultMessage="Selection of runtime environments"
    />
  ),
  exerciseEnvironmentConfigs: (
    <FormattedMessage
      id="app.assignment.syncExerciseEnvironmentConfigs"
      defaultMessage="Environment configuration"
    />
  ),
  hardwareGroups: (
    <FormattedMessage
      id="app.assignment.syncHardwareGroups"
      defaultMessage="Hardware groups"
    />
  ),
  limits: (
    <FormattedMessage id="app.assignment.syncLimits" defaultMessage="Limits" />
  )
};

const getSyncMessages = syncInfo => {
  const res = [];
  for (const field in syncMessages) {
    if (!syncInfo[field]) {
      console.log('Field ' + field + ' not present.');
      continue;
    }

    if (!syncInfo[field].upToDate) {
      res.push(
        <li key={field}>
          {syncMessages[field]}
        </li>
      );
    }
  }
  return res;
};

const AssignmentSync = ({ syncInfo, exerciseSync }) => {
  const messages = getSyncMessages(syncInfo);
  return messages.length > 0
    ? <Row>
        <Col sm={12}>
          <Alert bsStyle="warning">
            <h4>
              <FormattedMessage
                id="app.assignment.syncRequired"
                defaultMessage="The exercise data are newer than assignment data. Exercise was updated {exerciseUpdated}, but the assignment was last updated {assignmentUpdated}!"
                values={{
                  exerciseUpdated: syncInfo.updatedAt.exercise
                    ? <span>
                        <FormattedDate
                          value={new Date(syncInfo.updatedAt.exercise * 1000)}
                        />
                        {' ('}
                        <FormattedTime
                          value={new Date(syncInfo.updatedAt.exercise * 1000)}
                        />
                        {')'}
                      </span>
                    : '??',
                  assignmentUpdated: syncInfo.updatedAt.assignment
                    ? <span>
                        <FormattedDate
                          value={new Date(syncInfo.updatedAt.assignment * 1000)}
                        />
                        {' ('}
                        <FormattedTime
                          value={new Date(syncInfo.updatedAt.assignment * 1000)}
                        />
                        {')'}
                      </span>
                    : '??'
                }}
              />
            </h4>
            <div>
              <FormattedMessage
                id="app.assignment.syncDescription"
                defaultMessage="The exercise for this assignment was updated in following categories:"
              />
              <ul>
                {messages}
              </ul>
            </div>
            <p>
              <Button bsStyle="primary" onClick={exerciseSync}>
                <FormattedMessage
                  id="app.assignment.syncButton"
                  defaultMessage="Update this assignment"
                />
              </Button>
            </p>
          </Alert>
        </Col>
      </Row>
    : <div />;
};

AssignmentSync.propTypes = {
  syncInfo: PropTypes.object.isRequired,
  exerciseSync: PropTypes.func.isRequired
};

export default AssignmentSync;
