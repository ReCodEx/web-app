import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-bootstrap';

import Button, { TheButtonGroup } from '../../../widgets/TheButton';
import Callout from '../../../widgets/Callout';
import DateTime from '../../../widgets/DateTime';
import { getSyncMessages } from '../../../helpers/assignments.js';
import { SYNC_OPTIONS_ALL, SYNC_OPTIONS_TEXTS, SYNC_OPTIONS_CONFIG } from '../../../../redux/modules/assignments.js';

const AssignmentSync = ({ syncInfo, exerciseSync }) => {
  const messages = getSyncMessages(syncInfo);
  return messages.length > 0 ? (
    <Row>
      <Col sm={12}>
        <Callout variant="warning">
          <h4>
            <FormattedMessage
              id="app.assignment.syncRequiredTitle"
              defaultMessage="The exercise data are newer than assignment data"
            />
          </h4>
          <p>
            <FormattedMessage
              id="app.assignment.syncRequired"
              defaultMessage="Exercise was updated at <strong>{exerciseUpdated}</strong>, but the assignment was synchronized with the exercise at <strong>{assignmentUpdated}</strong>!"
              values={{
                exerciseUpdated: <DateTime unixTs={syncInfo.updatedAt.exercise} emptyPlaceholder="??" />,
                assignmentUpdated: <DateTime unixTs={syncInfo.updatedAt.assignment} emptyPlaceholder="??" />,
                strong: contents => <strong>{contents}</strong>,
              }}
            />
          </p>
          <div>
            <FormattedMessage
              id="app.assignment.syncDescription"
              defaultMessage="The following sections were updated:"
            />
            <ul>{messages}</ul>
          </div>
          <p>
            <TheButtonGroup>
              {(syncInfo.localizedTexts?.upToDate === false || syncInfo.fileLinks?.upToDate === false) && (
                <Button
                  variant="primary"
                  onClick={() => exerciseSync(SYNC_OPTIONS_TEXTS)}
                  disabled={!syncInfo.isSynchronizationPossible}>
                  <FormattedMessage id="app.assignment.syncTextsButton" defaultMessage="Update Texts" />
                </Button>
              )}

              {(syncInfo.files?.upToDate === false ||
                syncInfo.exerciseTests?.upToDate === false ||
                syncInfo.configurationType?.upToDate === false ||
                syncInfo.scoreConfig?.upToDate === false ||
                syncInfo.exerciseConfig?.upToDate === false ||
                syncInfo.runtimeEnvironments?.upToDate === false ||
                syncInfo.exerciseEnvironmentConfigs?.upToDate === false ||
                syncInfo.hardwareGroups?.upToDate === false ||
                syncInfo.limits?.upToDate === false ||
                syncInfo.mergeJudgeLogs?.upToDate === false) && (
                <Button
                  variant="primary"
                  onClick={() => exerciseSync(SYNC_OPTIONS_CONFIG)}
                  disabled={!syncInfo.isSynchronizationPossible}>
                  <FormattedMessage id="app.assignment.syncConfigButton" defaultMessage="Update Configuration" />
                </Button>
              )}

              <Button
                variant="primary"
                onClick={() => exerciseSync(SYNC_OPTIONS_ALL)}
                disabled={!syncInfo.isSynchronizationPossible}>
                <FormattedMessage id="app.assignment.syncAllButton" defaultMessage="Update Whole Assignment" />
              </Button>
            </TheButtonGroup>

            {!syncInfo.isSynchronizationPossible && (
              <span style={{ marginLeft: '2em' }} className="text-body-secondary">
                <FormattedMessage
                  id="app.assignment.syncButton.exerciseBroken"
                  defaultMessage="The update button is disabled since the exercise is broken. The exercise configuration must be mended first."
                />
              </span>
            )}
          </p>
        </Callout>
      </Col>
    </Row>
  ) : (
    <div />
  );
};

AssignmentSync.propTypes = {
  syncInfo: PropTypes.object.isRequired,
  exerciseSync: PropTypes.func.isRequired,
};

export default AssignmentSync;
