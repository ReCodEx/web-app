import React from 'react';
import { FormattedMessage } from 'react-intl';
import { lruMemoize } from 'reselect';
import Explanation from '../widgets/Explanation';

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

export const isUpToDate = lruMemoize(syncInfo =>
  Object.keys(syncMessages).every(field => syncInfo[field] && syncInfo[field].upToDate)
);

export const compareAssignments = (a, b) => {
  // first compare by deadline
  if (a.firstDeadline < b.firstDeadline) {
    return -1;
  } else if (a.firstDeadline === b.firstDeadline) {
    // then compare by second deadline - if one of them does not have any,
    // it is lower -> higher position in the table
    if (a.allowSecondDeadline !== b.allowSecondDeadline) {
      // one has the second deadline and the other not
      return a.allowSecondDeadline ? 1 : -1;
    } else {
      // if both have second deadline, compare them
      if (a.allowSecondDeadline === true) {
        if (a.secondDeadline < b.secondDeadline) {
          return -1;
        } else if (a.secondDeadline > b.secondDeadline) {
          return 1;
        }
        // if second deadlines are equal, continue
      }

      // none of them have second deadline or they are equal, compare creation times
      return b.createdAt - a.createdAt || a.id.localeCompare(b.id);
    }
  } else {
    return 1;
  }
};

export const compareAssignmentsReverted = (a, b) => -compareAssignments(a, b);

export const compareShadowAssignments = (a, b) => {
  return a.createdAt - b.createdAt;
};

export const isBeforeDeadline = assignment => {
  const now = Date.now() / 1000;
  return assignment.firstDeadline > now || (assignment.secondDeadline && assignment.secondDeadline > now);
};
