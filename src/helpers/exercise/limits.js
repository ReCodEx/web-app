import { defaultMemoize } from 'reselect';

import { encodeId, encodeNumId, safeGet } from '../common';

/*
 * Memory and Time limits
 */
export const getLimitsInitValues = defaultMemoize((limits, tests, environments, hwGroup) => {
  let res = {};
  let wallTimeCount = 0;
  let cpuTimeCount = 0;
  limits = limits && limits[hwGroup];

  tests.forEach(test => {
    const testEnc = encodeNumId(test.id);
    res[testEnc] = {};
    environments.forEach(environment => {
      const envId = encodeId(environment.id);
      let lim = safeGet(limits, [environment.id, String(test.id)]);

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
        time,
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
          : time[secondaryTime] !== undefined
          ? time[secondaryTime]
          : '0';
    }
  }

  return {
    limits: res,
    preciseTime,
  };
});

const transformLimitsObject = ({ memory, time }, timeField = 'wall-time') => {
  let res = {
    memory,
  };
  res[timeField] = time;
  return res;
};

/**
 * Transform form data and pass them to dispatching function.
 * The data have to be re-assembled, since they use different format and keys are encoded.
 * The dispatching function is invoked for every environment and all promise is returned.
 */
export const transformLimitsValues = (formData, hwGroupId, runtimeEnvironments, tests) => {
  const data = {};
  runtimeEnvironments.forEach(environment => {
    const envId = encodeId(environment.id);
    data[environment.id] = tests.reduce((acc, test) => {
      acc[test.id] = transformLimitsObject(
        formData.limits[encodeNumId(test.id)][envId],
        formData.preciseTime ? 'cpu-time' : 'wall-time'
      );
      return acc;
    }, {});
  });
  return { [hwGroupId]: data };
};

/**
 * Validation
 */

const LIMITS_CONSTRAINTS_DEFAULTS = {
  memory: 1024 * 1024,
  cpuTimePerTest: 60, // 1 minute
  cpuTimePerExercise: 300, // 5 minutes
  wallTimePerTest: 60,
  wallTimePerExercise: 300,
};

const combineHardwareGroupLimitsConstraints = exerciseHwGroups => {
  // Reduce all hwGroup metadata using min function
  const res = {};
  exerciseHwGroups.forEach(({ metadata }) =>
    Object.keys(LIMITS_CONSTRAINTS_DEFAULTS).forEach(key => {
      if (metadata[key]) {
        res[key] = res[key] !== undefined ? Math.min(res[key], metadata[key]) : metadata[key];
      }
    })
  );

  // Make sure all keys exists (use defaults for missing ones).
  Object.keys(LIMITS_CONSTRAINTS_DEFAULTS).forEach(key => {
    res[key] = res[key] || LIMITS_CONSTRAINTS_DEFAULTS[key];
  });

  return res;
};

// Compute limit constraints from hwGroup metadata
export const getLimitsConstraints = defaultMemoize((exerciseHwGroups, preciseTime) => {
  const res = combineHardwareGroupLimitsConstraints(exerciseHwGroups);
  return {
    memory: { min: 128, max: res.memory },
    time: {
      min: 0.1,
      max: res[preciseTime ? 'cpuTimePerTest' : 'wallTimePerTest'],
    },
    totalTime: {
      min: 0.1,
      max: res[preciseTime ? 'cpuTimePerExercise' : 'wallTimePerExercise'],
    },
  };
});

// Compute complete list for visualization of a single
export const getLimitsConstraintsOfSingleGroup = defaultMemoize(exerciseHwGroup => {
  const res = combineHardwareGroupLimitsConstraints([exerciseHwGroup]);
  for (const key in res) {
    res[key] = {
      min: key === 'memory' ? 128 : 0.1,
      max: res[key],
    };
  }
  return res;
});

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
      if (limits[test][env].time) {
        const val = Number(limits[test][env].time);
        if (!Number.isNaN(val) && val > 0) {
          sums[env] = (sums[env] || 0) + val;
        }
      }
    })
  );

  return Object.keys(sums).filter(env => sums[env] > range.max || sums[env] < range.min);
};

/**
 * Validate time limits form data against given hw group constraints.
 * @param {*} formData
 * @param {*} constraints
 */
export const validateLimitsConstraints = ({ limits }, constraints) => {
  if (!limits || !constraints) {
    return false;
  }

  // Compute sum of times for each environment.
  let envTimeSums = {};
  const fieldChecks = Object.keys(limits).every(test => {
    return Object.keys(limits[test]).every(envEnc => {
      const memory = validateLimitsField(safeGet(limits, [test, envEnc, 'memory']), constraints.memory);
      if (Number.isNaN(memory) || memory === false) {
        return false;
      }

      const time = validateLimitsField(safeGet(limits, [test, envEnc, 'time']), constraints.time);
      if (Number.isNaN(time) || time === false) {
        return false;
      }

      envTimeSums[envEnc] = (envTimeSums[envEnc] || 0) + time; // we don't need no initialization
      return true;
    });
  });

  return (
    fieldChecks &&
    Object.values(envTimeSums).every(sum => sum >= constraints.totalTime.min && sum <= constraints.totalTime.max)
  );
};

const saturateField = (limits, envId, test, fieldName, max, min = 0.1, patchFactor = null) => {
  let value = safeGet(limits, [envId, test, fieldName]);
  if (value !== undefined) {
    if (patchFactor) {
      value = Math.floor(value * patchFactor * 10) / 10;
    }
    value = Math.max(value, min);
    value = Math.min(value, max);
    limits[envId][test][fieldName] = value;
  }
  return value || 0;
};

/**
 * Saturate limits (in API format, single hwGroup) so they fit given constraints if possible.
 * The saturation is rather complex as time constraints have both individual and total ranges.
 * If the saturation fails for particular environment, its limits are nullified.
 * @param {*} limits Limits of pargicular hwGroup to be saturated (inplace).
 * @param {*} exerciseHwGroups HW group records (containing metadata with constraints).
 */
export const saturateLimitsConstraints = (limits, exerciseHwGroups) => {
  const {
    memory,
    cpuTimePerTest,
    wallTimePerTest,
    cpuTimePerExercise,
    wallTimePerExercise,
  } = combineHardwareGroupLimitsConstraints(exerciseHwGroups);

  Object.keys(limits).forEach(envId => {
    // First round
    let cpuSum = 0;
    let wallSum = 0;
    Object.keys(limits[envId]).forEach(test => {
      saturateField(limits, envId, test, 'memory', memory, 128);
      cpuSum += saturateField(limits, envId, test, 'cpu-time', cpuTimePerTest);
      wallSum += saturateField(limits, envId, test, 'wall-time', wallTimePerTest);
    });

    // Attempt to adjust for total limits if necessary...
    if (cpuSum > cpuTimePerExercise) {
      const newTimeSum = Math.min(cpuSum, cpuTimePerExercise);
      const patchFactor = newTimeSum / cpuSum;

      // Multiply all times by patch factor...
      cpuSum = 0;
      Object.keys(limits[envId]).forEach(test => {
        cpuSum += saturateField(limits, envId, test, 'cpu-time', cpuTimePerTest, 0.1, patchFactor);
      });
    }

    if (wallSum > wallTimePerExercise) {
      const newTimeSum = Math.min(wallSum, wallTimePerExercise);
      const patchFactor = newTimeSum / wallSum;

      // Multiply all times by patch factor...
      wallSum = 0;
      Object.keys(limits[envId]).forEach(test => {
        wallSum += saturateField(limits, envId, test, 'wall-time', wallTimePerTest, 0.1, patchFactor);
      });
    }

    // Check whether we were successful
    if (cpuSum > cpuTimePerExercise || wallSum > wallTimePerExercise) {
      limits[envId] = null; // ok, we give up
    }
  });

  return limits;
};
