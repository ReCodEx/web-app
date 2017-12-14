import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Row, Col, Alert } from 'react-bootstrap';

import Button from '../../../widgets/FlatButton';

const AssignmentSync = ({ syncInfo, exerciseSync }) =>
  !syncInfo.exerciseConfig.upToDate ||
  !syncInfo.configurationType.upToDate ||
  !syncInfo.exerciseEnvironmentConfigs.upToDate ||
  !syncInfo.hardwareGroups.upToDate ||
  !syncInfo.localizedTexts.upToDate ||
  !syncInfo.limits.upToDate ||
  !syncInfo.scoreConfig.upToDate ||
  !syncInfo.scoreCalculator.upToDate ||
  !syncInfo.exerciseTests.upToDate
    ? <Row>
        <Col sm={12}>
          <Alert bsStyle="warning">
            <h4>
              <FormattedMessage
                id="app.assignment.syncRequired"
                defaultMessage="The exercise was updated!"
              />
            </h4>
            <div>
              <FormattedMessage
                id="app.assignment.syncDescription"
                defaultMessage="The exercise for this assignment was updated in following categories:"
              />
              <ul>
                {!syncInfo.exerciseConfig.upToDate &&
                  <li>
                    <FormattedMessage
                      id="app.assignment.syncExerciseConfig"
                      defaultMessage="Exercise configuration"
                    />
                  </li>}
                {!syncInfo.configurationType.upToDate &&
                  <li>
                    <FormattedMessage
                      id="app.assignment.syncConfigType"
                      defaultMessage="Type of exercise configuration"
                    />
                  </li>}
                {!syncInfo.exerciseEnvironmentConfigs.upToDate &&
                  <li>
                    <FormattedMessage
                      id="app.assignment.syncExerciseEnvironmentConfigs"
                      defaultMessage="Environment configuration"
                    />
                  </li>}
                {!syncInfo.hardwareGroups.upToDate &&
                  <li>
                    <FormattedMessage
                      id="app.assignment.syncHardwareGroups"
                      defaultMessage="Hardware groups"
                    />
                  </li>}
                {!syncInfo.localizedTexts.upToDate &&
                  <li>
                    <FormattedMessage
                      id="app.assignment.syncLocalizedTexts"
                      defaultMessage="Localized texts"
                    />
                  </li>}
                {!syncInfo.limits.upToDate &&
                  <li>
                    <FormattedMessage
                      id="app.assignment.syncLimits"
                      defaultMessage="Limits"
                    />
                  </li>}
                {!syncInfo.scoreConfig.upToDate &&
                  <li>
                    <FormattedMessage
                      id="app.assignment.syncScoreConfig"
                      defaultMessage="Score configuration"
                    />
                  </li>}
                {!syncInfo.scoreCalculator.upToDate &&
                  <li>
                    <FormattedMessage
                      id="app.assignment.syncScoreCalculator"
                      defaultMessage="Score calculator"
                    />
                  </li>}
                {!syncInfo.exerciseTests.upToDate &&
                  <li>
                    <FormattedMessage
                      id="app.assignment.syncExerciseTests"
                      defaultMessage="Exercise tests"
                    />
                  </li>}
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

AssignmentSync.propTypes = {
  syncInfo: PropTypes.object.isRequired,
  exerciseSync: PropTypes.func.isRequired
};

export default AssignmentSync;
