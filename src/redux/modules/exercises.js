import { handleActions } from 'redux-actions';
import { Map, List, fromJS } from 'immutable';
import factory, {
  initialState,
  createRecord,
  resourceStatus,
} from '../helpers/resourceManager';
import { createApiAction } from '../middleware/apiMiddleware';

import { actionTypes as supplementaryFilesActionTypes } from './supplementaryFiles';
import { actionTypes as attachmentFilesActionTypes } from './attachmentFiles';
import { actionTypes as paginationActionTypes } from './pagination';

import { arrayToObject } from '../../helpers/common';

const resourceName = 'exercises';
const { actions, reduceActions, actionTypes } = factory({
  resourceName,
});

export { actionTypes };

/**
 * Actions
 */

export const additionalActionTypes = {
  VALIDATE_EXERCISE: 'recodex/exercises/VALIDATE_EXERCISE',
  FORK_EXERCISE: 'recodex/exercises/FORK_EXERCISE',
  FORK_EXERCISE_PENDING: 'recodex/exercises/FORK_EXERCISE_PENDING',
  FORK_EXERCISE_REJECTED: 'recodex/exercises/FORK_EXERCISE_REJECTED',
  FORK_EXERCISE_FULFILLED: 'recodex/exercises/FORK_EXERCISE_FULFILLED',
  GET_PIPELINE_VARIABLES: 'recodex/exercises/GET_PIPELINE_VARIABLES',
  SET_HARDWARE_GROUPS: 'recodex/exercises/SET_HARDWARE_GROUPS',
  SET_HARDWARE_GROUPS_FULFILLED:
    'recodex/exercises/SET_HARDWARE_GROUPS_FULFILLED',
  ATTACH_EXERCISE_GROUP: 'recodex/exercises/ATTACH_EXERCISE_GROUP',
  ATTACH_EXERCISE_GROUP_PENDING:
    'recodex/exercises/ATTACH_EXERCISE_GROUP_PENDING',
  ATTACH_EXERCISE_GROUP_REJECTED:
    'recodex/exercises/ATTACH_EXERCISE_GROUP_REJECTED',
  ATTACH_EXERCISE_GROUP_FULFILLED:
    'recodex/exercises/ATTACH_EXERCISE_GROUP_FULFILLED',
  DETACH_EXERCISE_GROUP: 'recodex/exercises/DETACH_EXERCISE_GROUP',
  DETACH_EXERCISE_GROUP_PENDING:
    'recodex/exercises/DETACH_EXERCISE_GROUP_PENDING',
  DETACH_EXERCISE_GROUP_REJECTED:
    'recodex/exercises/DETACH_EXERCISE_GROUP_REJECTED',
  DETACH_EXERCISE_GROUP_FULFILLED:
    'recodex/exercises/DETACH_EXERCISE_GROUP_FULFILLED',
};

export const loadExercise = actions.pushResource;
export const fetchExercisesIfNeeded = actions.fetchIfNeeded;
export const fetchExercise = actions.fetchResource;
export const fetchExerciseIfNeeded = actions.fetchOneIfNeeded;

export const fetchGroupExercises = groupId =>
  actions.fetchMany({
    endpoint: `/groups/${groupId}/exercises`,
  });

export const forkStatuses = {
  PENDING: 'PENDING',
  REJECTED: 'REJECTED',
  FULFILLED: 'FULFILLED',
};

export const forkExercise = (id, forkId, formData = null) => {
  let actionData = {
    type: additionalActionTypes.FORK_EXERCISE,
    endpoint: `/exercises/${id}/fork`,
    method: 'POST',
    meta: { id, forkId },
  };
  if (formData && formData.groupId) {
    actionData.body = {
      groupId: formData.groupId,
    };
  }
  return createApiAction(actionData);
};

export const create = actions.addResource;
export const editExercise = actions.updateResource;
export const editRuntimeConfigs = (id, body) =>
  actions.updateResource(id, body, `/exercises/${id}/runtime-configs`);
export const deleteExercise = actions.removeResource;

export const validateExercise = (id, version) =>
  createApiAction({
    type: additionalActionTypes.VALIDATE_EXERCISE,
    endpoint: `/exercises/${id}/validate`,
    method: 'POST',
    body: { version },
  });

export const getVariablesForPipelines = (
  exerciseId,
  runtimeEnvironmentId,
  pipelinesIds
) => {
  const body =
    runtimeEnvironmentId === 'default'
      ? { pipelinesIds }
      : { runtimeEnvironmentId, pipelinesIds };
  return createApiAction({
    type: additionalActionTypes.GET_PIPELINE_VARIABLES,
    method: 'POST',
    endpoint: `/exercises/${exerciseId}/config/variables`,
    meta: {
      exerciseId,
      runtimeEnvironmentId,
      pipelinesIds,
    },
    body,
  });
};

export const setExerciseHardwareGroups = (id, hwGroups) => {
  let actionData = {
    type: additionalActionTypes.SET_HARDWARE_GROUPS,
    endpoint: `/exercises/${id}/hardware-groups`,
    method: 'POST',
    meta: { id },
    body: { hwGroups },
  };
  return createApiAction(actionData);
};

export const attachExerciseToGroup = (exerciseId, groupId) =>
  createApiAction({
    type: additionalActionTypes.ATTACH_EXERCISE_GROUP,
    method: 'POST',
    endpoint: `/exercises/${exerciseId}/groups/${groupId}`,
    meta: { exerciseId, groupId },
  });

export const detachExerciseFromGroup = (exerciseId, groupId) =>
  createApiAction({
    type: additionalActionTypes.DETACH_EXERCISE_GROUP,
    method: 'DELETE',
    endpoint: `/exercises/${exerciseId}/groups/${groupId}`,
    meta: { exerciseId, groupId },
  });

/**
 * Reducer
 */

const reducer = handleActions(
  Object.assign({}, reduceActions, {
    [additionalActionTypes.SET_HARDWARE_GROUPS_FULFILLED]: (
      state,
      { payload, meta: { id } }
    ) => state.setIn(['resources', id, 'data'], fromJS(payload)),

    // Forking ...

    [additionalActionTypes.FORK_EXERCISE_PENDING]: (
      state,
      { meta: { id, forkId } }
    ) =>
      state.updateIn(['resources', id, 'data'], exercise => {
        if (!exercise.has('forks')) {
          exercise = exercise.set('forks', Map());
        }

        return exercise.update('forks', forks =>
          forks.set(forkId, {
            status: forkStatuses.PENDING,
          })
        );
      }),

    [additionalActionTypes.FORK_EXERCISE_REJECTED]: (
      state,
      { meta: { id, forkId } }
    ) =>
      state.setIn(['resources', id, 'data', 'forks', forkId], {
        status: forkStatuses.REJECTED,
      }),

    [additionalActionTypes.FORK_EXERCISE_FULFILLED]: (
      state,
      { payload: { id: exerciseId }, meta: { id, forkId } }
    ) =>
      state.setIn(['resources', id, 'data', 'forks', forkId], {
        status: forkStatuses.FULFILLED,
        exerciseId,
      }),

    // Files ...

    [supplementaryFilesActionTypes.ADD_FILES_FULFILLED]: (
      state,
      { payload: files, meta: { exerciseId } }
    ) =>
      state.hasIn(['resources', exerciseId])
        ? updateFiles(state, exerciseId, files, 'supplementaryFilesIds')
        : state,

    [attachmentFilesActionTypes.ADD_FILES_FULFILLED]: (
      state,
      { payload: files, meta: { exerciseId } }
    ) =>
      state.hasIn(['resources', exerciseId])
        ? updateFiles(state, exerciseId, files, 'attachmentFilesIds')
        : state,

    // Attach exercise group ...

    [additionalActionTypes.ATTACH_EXERCISE_GROUP_PENDING]: (
      state,
      { meta: { exerciseId, groupId } }
    ) =>
      state.hasIn(['resources', exerciseId, 'data']) &&
      !state.hasIn(['resources', exerciseId, 'data', 'groupsIds', groupId])
        ? state.setIn(
            ['resources', exerciseId, 'data', 'attachingGroupId'],
            groupId
          )
        : state,

    [additionalActionTypes.ATTACH_EXERCISE_GROUP_FULFILLED]: (
      state,
      { payload: data, meta: { exerciseId } }
    ) =>
      state.setIn(
        ['resources', exerciseId],
        createRecord({
          data,
          state: resourceStatus.FULFILLED,
          didInvalidate: false,
          lastUpdate: Date.now(),
        })
      ),

    [additionalActionTypes.ATTACH_EXERCISE_GROUP_REJECTED]: (
      state,
      { meta: { exerciseId, groupId } }
    ) =>
      state.getIn(['resources', exerciseId, 'data', 'attachingGroupId']) ===
      groupId
        ? state.deleteIn(['resources', exerciseId, 'data', 'attachingGroupId'])
        : state,

    // Detach exercises group ...

    [additionalActionTypes.DETACH_EXERCISE_GROUP_PENDING]: (
      state,
      { meta: { exerciseId, groupId } }
    ) =>
      state.hasIn(['resources', exerciseId, 'data', 'groupsIds']) &&
      state
        .getIn(['resources', exerciseId, 'data', 'groupsIds'])
        .includes(groupId)
        ? state.setIn(
            ['resources', exerciseId, 'data', 'detachingGroupId'],
            groupId
          )
        : state,

    [additionalActionTypes.DETACH_EXERCISE_GROUP_FULFILLED]: (
      state,
      { payload: data, meta: { exerciseId } }
    ) =>
      state.setIn(
        ['resources', exerciseId],
        createRecord({
          data,
          state: resourceStatus.FULFILLED,
          didInvalidate: false,
          lastUpdate: Date.now(),
        })
      ),

    [additionalActionTypes.DETACH_EXERCISE_GROUP_REJECTED]: (
      state,
      { meta: { exerciseId, groupId } }
    ) =>
      state.getIn(['resources', exerciseId, 'data', 'detachingGroupId']) ===
      groupId
        ? state.deleteIn(['resources', exerciseId, 'data', 'detachingGroupId'])
        : state,

    // Pagination result needs to store entity data here whilst indices are stored in pagination module
    [paginationActionTypes.FETCH_PAGINATED_FULFILLED]: (
      state,
      { payload: { items }, meta: { endpoint } }
    ) =>
      endpoint === 'exercises'
        ? state.mergeIn(
            ['resources'],
            arrayToObject(
              items,
              obj => obj.id,
              data =>
                createRecord({
                  data,
                  state: resourceStatus.FULFILLED,
                  didInvalidate: false,
                  lastUpdate: Date.now(),
                })
            )
          )
        : state,
  }),
  initialState
);

const updateFiles = (state, exerciseId, files, field) =>
  state.updateIn(['resources', exerciseId, 'data', field], list =>
    List(files.map(file => file.id))
  );

export default reducer;
