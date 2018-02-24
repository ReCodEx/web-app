import { defaultMemoize } from 'reselect';

import { encodeId, encodeNumId, safeGet } from '../helpers/common';
import { endpointDisguisedAsIdFactory } from '../redux/modules/limits';

/*
 * Memory and Time limits
 */
export const getLimitsInitValues = defaultMemoize(
  (limits, tests, environments, exerciseId, hwGroup) => {
    let res = {};
    let wallTimeCount = 0;
    let cpuTimeCount = 0;

    tests.forEach(test => {
      const testEnc = encodeNumId(test.id);
      res[testEnc] = {};
      environments.forEach(environment => {
        const envId = encodeId(environment.id);
        let lim = limits.getIn([
          endpointDisguisedAsIdFactory({
            exerciseId,
            hwGroup,
            runtimeEnvironmentId: environment.id
          }),
          'data',
          String(test.id)
        ]);
        if (lim) {
          lim = lim.toJS();
        }

        // Prepare time object and aggregate data for heuristics ...
        const time = {};
        if (lim && lim['wall-time']) {
          time['wall-time'] = String(lim['wall-time']);
          ++wallTimeCount;
        }
        if (lim && lim['cpu-time']) {
          time['cpu-time'] = String(lim['cpu-time']);
          ++cpuTimeCount;
        }
        res[testEnc][envId] = {
          memory: lim ? String(lim.memory) : '0',
          time
        };
      });
    });

    // Use heuristics to decide, which time will be used, and postprocess the data
    const preciseTime = cpuTimeCount >= wallTimeCount;
    const primaryTime = preciseTime ? 'cpu-time' : 'wall-time';
    const secondaryTime = preciseTime ? 'wall-time' : 'cpu-time';
    for (const testEnc in res) {
      for (const envId in res[testEnc]) {
        const time = res[testEnc][envId].time;
        res[testEnc][envId].time =
          time[primaryTime] !== undefined
            ? time[primaryTime]
            : time[secondaryTime] !== undefined ? time[secondaryTime] : '0';
      }
    }

    return {
      limits: res,
      preciseTime
    };
  }
);

const transformLimitsObject = ({ memory, time }, timeField = 'wall-time') => {
  let res = {
    memory
  };
  res[timeField] = time;
  return res;
};

/**
 * Transform form data and pass them to dispatching function.
 * The data have to be re-assembled, since they use different format and keys are encoded.
 * The dispatching function is invoked for every environment and all promise is returned.
 */
export const transformLimitsValues = (formData, tests, runtimeEnvironments) =>
  runtimeEnvironments.map(environment => {
    const envId = encodeId(environment.id);
    const data = {
      limits: tests.reduce((acc, test) => {
        acc[test.id] = transformLimitsObject(
          formData.limits[encodeNumId(test.id)][envId],
          formData.preciseTime ? 'cpu-time' : 'wall-time'
        );
        return acc;
      }, {})
    };
    return { id: environment.id, data };
  });

/**
 * Validation
 */

// Compute limit constraints from hwGroup metadata
export const getLimitsConstraints = defaultMemoize(
  (exerciseHwGroups, preciseTime) => {
    const defaults = {
      memory: 1024 * 1024,
      cpuTimePerTest: 60, // 1 minute
      cpuTimePerExercise: 300, // 5 minutes
      wallTimePerTest: 60,
      wallTimePerExercise: 300
    };

    // Reduce all hwGroup metadata using min function
    const res = {};
    exerciseHwGroups.forEach(({ metadata }) =>
      Object.keys(defaults).forEach(key => {
        if (metadata[key]) {
          res[key] =
            res[key] !== undefined
              ? Math.min(res[key], metadata[key])
              : metadata[key];
        }
      })
    );

    // Make sure all keys exists (use defaults for missing ones).
    Object.keys(defaults).forEach(key => {
      res[key] = res[key] || defaults[key];
    });

    return {
      memory: { min: 128, max: res.memory },
      time: {
        min: 0.1,
        max: res[preciseTime ? 'cpuTimePerTest' : 'wallTimePerTest']
      },
      totalTime: {
        min: 0.1,
        max: res[preciseTime ? 'cpuTimePerExercise' : 'wallTimePerExercise']
      }
    };
  }
);

export const validateLimitsField = (value, range) => {
  const num = Number(value);
  if (Number.isNaN(num)) {
    return num;
  }
  if (range && (num < range.min || num > range.max)) {
    return false;
  }
  return num;
};

export const validateLimitsTimeTotals = (limits, range) => {
  // Compute sum of times for each environment.
  let sums = {};
  Object.keys(limits).forEach(test =>
    Object.keys(limits[test]).forEach(env => {
      if (limits[test][env]['time']) {
        const val = Number(limits[test][env]['time']);
        if (!Number.isNaN(val) && val > 0) {
          sums[env] = (sums[env] || 0) + val;
        }
      }
    })
  );

  // Check if some environemnts have exceeded the limit ...
  const limitsErrors = {};
  Object.keys(limits).forEach(test => {
    const testsErrors = {};
    Object.keys(sums).forEach(env => {
      if (sums[env] > range.max || sums[env] < range.min) {
        testsErrors[env] = sums[env];
      }
    });
    if (Object.keys(testsErrors).length > 0) {
      limitsErrors[test] = testsErrors;
    }
  });
  return limitsErrors;
};

export const validateLimitsSingleEnvironment = (
  { limits },
  env,
  constraints
) => {
  if (!limits || !env || !constraints) {
    return false;
  }
  const envEnc = encodeId(env);

  // Compute sum of times for each environment.
  let sum = 0;
  Object.keys(limits).forEach(test => {
    const memory = validateLimitsField(
      safeGet(limits, [test, envEnc, 'memory']),
      constraints.memory
    );
    if (Number.isNaN(memory) || memory === false) {
      return false;
    }

    const time = safeGet(limits, [test, envEnc, 'time']);
    const val = validateLimitsField(time, constraints.time);
    if (Number.isNaN(val) || val === false) {
      return false;
    }
    sum += val;
  });

  return sum >= constraints.totalTime.min && sum <= constraints.totalTime.max;
};
