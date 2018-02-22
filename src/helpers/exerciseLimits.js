import { defaultMemoize } from 'reselect';
import { encodeId, encodeNumId } from '../helpers/common';
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
