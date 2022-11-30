import React from 'react';
import { FormattedMessage } from 'react-intl';
import { defaultMemoize } from 'reselect';
import Explanation from '../../widgets/Explanation';

const syncMessages = {
  supplementaryFiles: (
    <FormattedMessage id="app.assignment.syncSupplementaryFiles" defaultMessage="Supplementary files" />
  ),
  attachmentFiles: <FormattedMessage id="app.assignment.syncAttachmentFiles" defaultMessage="Text attachment files" />,
  exerciseTests: <FormattedMessage id="app.assignment.syncExerciseTests" defaultMessage="Exercise tests" />,
  localizedTexts: <FormattedMessage id="app.assignment.syncLocalizedTexts" defaultMessage="Localized texts" />,
  configurationType: (
    <FormattedMessage
      id="app.assignment.syncConfigurationType"
      defaultMessage="Configuration was switched to advanced mode"
    />
  ),
  scoreConfig: <FormattedMessage id="app.assignment.syncScoreConfig" defaultMessage="Score configuration" />,
  exerciseConfig: <FormattedMessage id="app.assignment.syncExerciseConfig" defaultMessage="Exercise configuration" />,
  runtimeEnvironments: (
    <FormattedMessage id="app.assignment.syncRuntimeEnvironments" defaultMessage="Selection of runtime environments" />
  ),
  exerciseEnvironmentConfigs: (
    <FormattedMessage id="app.assignment.syncExerciseEnvironmentConfigs" defaultMessage="Environment configuration" />
  ),
  hardwareGroups: <FormattedMessage id="app.assignment.syncHardwareGroups" defaultMessage="Hardware groups" />,
  limits: <FormattedMessage id="app.assignment.syncLimits" defaultMessage="Limits" />,
  mergeJudgeLogs: (
    <span>
      <FormattedMessage id="app.assignment.syncMergeJudgeLogs" defaultMessage="Judge logs merge flag" />
      <Explanation id="syncMergeJudgeLogs">
        <FormattedMessage
          id="app.exercise.mergeJudgeLogsExplanation"
          defaultMessage="The merge flag indicates whether primary (stdout) and secondary (stderr) judge logs are are concatenated in one log (which should be default for built-in judges). If the logs are separated, the visibility of each part may be controlled idividually in assignments. That might be helpful if you need to pass two separate logs from a custom judge (e.g., one is for students and one is for supervisors)."
        />
      </Explanation>
    </span>
  ),
};

export const getSyncMessages = syncInfo => {
  const res = [];
  for (const field in syncMessages) {
    if (!syncInfo[field]) {
      continue;
    }

    if (!syncInfo[field].upToDate) {
      res.push(<li key={field}>{syncMessages[field]}</li>);
    }
  }
  return res;
};

export const isUpToDate = defaultMemoize(syncInfo =>
  Object.keys(syncMessages).every(field => syncInfo[field] && syncInfo[field].upToDate)
);
