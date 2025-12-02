import { handleActions } from 'redux-actions';
import { Map, List, fromJS } from 'immutable';
import factory, {
  initialState,
  createRecord,
  resourceStatus,
  createActionsWithPostfixes,
} from '../helpers/resourceManager';
import { createApiAction } from '../middleware/apiMiddleware.js';

import { actionTypes as exerciseFilesActionTypes } from './exerciseFiles.js';
import { actionTypes as attachmentFilesActionTypes } from './attachmentFiles.js';
import { actionTypes as paginationActionTypes } from './pagination.js';

import { arrayToObject, unique } from '../../helpers/common.js';

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
  GET_PIPELINE_VARIABLES: 'recodex/exercises/GET_PIPELINE_VARIABLES',
  SET_HARDWARE_GROUPS: 'recodex/exercises/SET_HARDWARE_GROUPS',
  SET_HARDWARE_GROUPS_FULFILLED: 'recodex/exercises/SET_HARDWARE_GROUPS_FULFILLED',
  SEND_NOTIFICATION: 'recodex/exercises/SEND_NOTIFICATION',
  ...createActionsWithPostfixes('FORK_EXERCISE', 'recodex/exercises'),
  ...createActionsWithPostfixes('ATTACH_EXERCISE_GROUP', 'recodex/exercises'),
  ...createActionsWithPostfixes('DETACH_EXERCISE_GROUP', 'recodex/exercises'),
  ...createActionsWithPostfixes('FETCH_TAGS', 'recodex/exercises'),
  ...createActionsWithPostfixes('ADD_TAG', 'recodex/exercises'),
  ...createActionsWithPostfixes('REMOVE_TAG', 'recodex/exercises'),
  ...createActionsWithPostfixes('SET_ARCHIVED', 'recodex/exercises'),
  ...createActionsWithPostfixes('SET_AUTHOR', 'recodex/exercises'),
  ...createActionsWithPostfixes('SET_ADMINS', 'recodex/exercises'),
};

export const loadExercise = actions.pushResource;
export const fetchExercisesIfNeeded = actions.fetchIfNeeded;
export const fetchExercise = actions.fetchResource;
export const reloadExercise = (id, meta = {}) => actions.fetchResource(id, { allowReload: true, ...meta });
export const fetchExerciseIfNeeded = actions.fetchOneIfNeeded;
export const invalidateExercise = actions.invalidate;

export const forkStatuses = {
  PENDING: 'PENDING',
  REJECTED: 'REJECTED',
  FULFILLED: 'FULFILLED',
};

export const forkExercise = (id, forkId, formData = null) => {
  const actionData = {
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
export const editRuntimeConfigs = (id, body) => actions.updateResource(id, body, `/exercises/${id}/runtime-configs`);
export const deleteExercise = actions.removeResource;

export const validateExercise = (id, version) =>
  createApiAction({
    type: additionalActionTypes.VALIDATE_EXERCISE,
    endpoint: `/exercises/${id}/validate`,
    method: 'POST',
    body: { version },
  });

export const getVariablesForPipelines = (exerciseId, runtimeEnvironmentId, pipelinesIds) => {
  const body = runtimeEnvironmentId === 'secondary' ? { pipelinesIds } : { runtimeEnvironmentId, pipelinesIds };
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
  const actionData = {
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

/*
 * Tags
 */

export const fetchTags = () =>
  createApiAction({
    type: additionalActionTypes.FETCH_TAGS,
    method: 'GET',
    endpoint: '/exercises/tags',
  });

export const addTag = (exerciseId, tagName) =>
  createApiAction({
    type: additionalActionTypes.ADD_TAG,
    method: 'POST',
    endpoint: `/exercises/${exerciseId}/tags/${tagName}`,
    meta: { exerciseId, tagName },
  });

export const removeTag = (exerciseId, tagName) =>
  createApiAction({
    type: additionalActionTypes.REMOVE_TAG,
    method: 'DELETE',
    endpoint: `/exercises/${exerciseId}/tags/${tagName}`,
    meta: { exerciseId, tagName },
  });

/*
 * Others
 */

export const setArchived = (exerciseId, archived) =>
  createApiAction({
    type: additionalActionTypes.SET_ARCHIVED,
    method: 'POST',
    endpoint: `/exercises/${exerciseId}/archived`,
    meta: { exerciseId },
    body: { archived },
  });

export const setAuthor = (exerciseId, author) =>
  createApiAction({
    type: additionalActionTypes.SET_AUTHOR,
    method: 'POST',
    endpoint: `/exercises/${exerciseId}/author`,
    meta: { exerciseId },
    body: { author },
  });

export const setAdmins = (exerciseId, admins) =>
  createApiAction({
    type: additionalActionTypes.SET_ADMINS,
    method: 'POST',
    endpoint: `/exercises/${exerciseId}/admins`,
    meta: { exerciseId },
    body: { admins },
  });

export const sendNotification = (id, message) =>
  createApiAction({
    type: additionalActionTypes.SEND_NOTIFICATION,
    endpoint: `/exercises/${id}/notification`,
    method: 'POST',
    body: { message },
  });

/*
 * Reducer
 */

const reducer = handleActions(
  Object.assign({}, reduceActions, {
    [additionalActionTypes.SET_HARDWARE_GROUPS_FULFILLED]: (state, { payload, meta: { id } }) =>
      state.setIn(['resources', id, 'data'], fromJS(payload)),

    // Forking ...

    [additionalActionTypes.FORK_EXERCISE_PENDING]: (state, { meta: { id, forkId } }) =>
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

    [additionalActionTypes.FORK_EXERCISE_REJECTED]: (state, { meta: { id, forkId } }) =>
      state.setIn(['resources', id, 'data', 'forks', forkId], {
        status: forkStatuses.REJECTED,
      }),

    [additionalActionTypes.FORK_EXERCISE_FULFILLED]: (state, { payload: { id: exerciseId }, meta: { id, forkId } }) =>
      state.setIn(['resources', id, 'data', 'forks', forkId], {
        status: forkStatuses.FULFILLED,
        exerciseId,
      }),

    // Files ...

    [exerciseFilesActionTypes.ADD_FILES_FULFILLED]: (state, { payload: files, meta: { exerciseId } }) =>
      state.hasIn(['resources', exerciseId]) ? updateFiles(state, exerciseId, files, 'filesIds') : state,

    [attachmentFilesActionTypes.ADD_FILES_FULFILLED]: (state, { payload: files, meta: { exerciseId } }) =>
      state.hasIn(['resources', exerciseId]) ? updateFiles(state, exerciseId, files, 'attachmentFilesIds') : state,

    // Attach exercise group ...

    [additionalActionTypes.ATTACH_EXERCISE_GROUP_PENDING]: (state, { meta: { exerciseId, groupId } }) =>
      state.hasIn(['resources', exerciseId, 'data']) &&
      !state.hasIn(['resources', exerciseId, 'data', 'groupsIds', groupId])
        ? state.setIn(['resources', exerciseId, 'data', 'attachingGroupId'], groupId)
        : state,

    [additionalActionTypes.ATTACH_EXERCISE_GROUP_FULFILLED]: (state, { payload: data, meta: { exerciseId } }) =>
      state.setIn(
        ['resources', exerciseId],
        createRecord({
          data,
          state: resourceStatus.FULFILLED,
          didInvalidate: false,
          lastUpdate: Date.now(),
        })
      ),

    [additionalActionTypes.ATTACH_EXERCISE_GROUP_REJECTED]: (state, { meta: { exerciseId, groupId } }) =>
      state.getIn(['resources', exerciseId, 'data', 'attachingGroupId']) === groupId
        ? state.deleteIn(['resources', exerciseId, 'data', 'attachingGroupId'])
        : state,

    // Detach exercises group ...

    [additionalActionTypes.DETACH_EXERCISE_GROUP_PENDING]: (state, { meta: { exerciseId, groupId } }) =>
      state.hasIn(['resources', exerciseId, 'data', 'groupsIds']) &&
      state.getIn(['resources', exerciseId, 'data', 'groupsIds']).includes(groupId)
        ? state.setIn(['resources', exerciseId, 'data', 'detachingGroupId'], groupId)
        : state,

    [additionalActionTypes.DETACH_EXERCISE_GROUP_FULFILLED]: (state, { payload: data, meta: { exerciseId } }) =>
      state.setIn(
        ['resources', exerciseId],
        createRecord({
          data,
          state: resourceStatus.FULFILLED,
          didInvalidate: false,
          lastUpdate: Date.now(),
        })
      ),

    [additionalActionTypes.DETACH_EXERCISE_GROUP_REJECTED]: (state, { meta: { exerciseId, groupId } }) =>
      state.getIn(['resources', exerciseId, 'data', 'detachingGroupId']) === groupId
        ? state.deleteIn(['resources', exerciseId, 'data', 'detachingGroupId'])
        : state,

    // Pagination result needs to store entity data here whilst indices are stored in pagination module
    [paginationActionTypes.FETCH_PAGINATED_FULFILLED]: (state, { payload: { items }, meta: { endpoint } }) =>
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

    [additionalActionTypes.FETCH_TAGS_PENDING]: state => state.set('tags', null),
    [additionalActionTypes.FETCH_TAGS_REJECTED]: state => state.delete('tags'),
    [additionalActionTypes.FETCH_TAGS_FULFILLED]: (state, { payload }) => state.set('tags', payload.sort()),

    [additionalActionTypes.ADD_TAG_PENDING]: (state, { meta: { exerciseId } }) => state.set('tagsPending', exerciseId),
    [additionalActionTypes.ADD_TAG_REJECTED]: state => state.delete('tagsPending'),
    [additionalActionTypes.ADD_TAG_FULFILLED]: (state, { payload: data, meta: { exerciseId, tagName } }) =>
      state
        .delete('tagsPending')
        .setIn(
          ['resources', exerciseId],
          createRecord({
            data,
            state: resourceStatus.FULFILLED,
            didInvalidate: false,
            lastUpdate: Date.now(),
          })
        )
        .update('tags', [], tags => unique([...tags, tagName]).sort()),

    [additionalActionTypes.REMOVE_TAG_PENDING]: (state, { meta: { exerciseId } }) =>
      state.set('tagsPending', exerciseId),
    [additionalActionTypes.REMOVE_TAG_REJECTED]: state => state.delete('tagsPending'),
    [additionalActionTypes.REMOVE_TAG_FULFILLED]: (state, { payload: data, meta: { exerciseId, tagName } }) =>
      state.delete('tagsPending').setIn(
        ['resources', exerciseId],
        createRecord({
          data,
          state: resourceStatus.FULFILLED,
          didInvalidate: false,
          lastUpdate: Date.now(),
        })
      ),

    [additionalActionTypes.SET_ARCHIVED_PENDING]: (state, { meta: { exerciseId } }) =>
      state.setIn(['resources', exerciseId, 'archived'], true),
    [additionalActionTypes.SET_ARCHIVED_REJECTED]: (state, { meta: { exerciseId } }) =>
      state.setIn(['resources', exerciseId, 'archived'], false),
    [additionalActionTypes.SET_ARCHIVED_FULFILLED]: (state, { payload: data }) =>
      state.setIn(
        ['resources', data.id],
        createRecord({
          data,
          state: resourceStatus.FULFILLED,
          didInvalidate: false,
          lastUpdate: Date.now(),
        })
      ),

    [additionalActionTypes.SET_AUTHOR_PENDING]: (state, { meta: { exerciseId } }) =>
      state.setIn(['resources', exerciseId, 'author'], true),
    [additionalActionTypes.SET_AUTHOR_REJECTED]: (state, { meta: { exerciseId } }) =>
      state.setIn(['resources', exerciseId, 'author'], false),
    [additionalActionTypes.SET_AUTHOR_FULFILLED]: (state, { payload: data }) =>
      state.setIn(
        ['resources', data.id],
        createRecord({
          data,
          state: resourceStatus.FULFILLED,
          didInvalidate: false,
          lastUpdate: Date.now(),
        })
      ),

    [additionalActionTypes.SET_ADMINS_PENDING]: (state, { meta: { exerciseId } }) =>
      state.setIn(['resources', exerciseId, 'admins'], true),
    [additionalActionTypes.SET_ADMINS_REJECTED]: (state, { meta: { exerciseId } }) =>
      state.setIn(['resources', exerciseId, 'admins'], false),
    [additionalActionTypes.SET_ADMINS_FULFILLED]: (state, { payload: data }) =>
      state.setIn(
        ['resources', data.id],
        createRecord({
          data,
          state: resourceStatus.FULFILLED,
          didInvalidate: false,
          lastUpdate: Date.now(),
        })
      ),
  }),
  initialState
);

const updateFiles = (state, exerciseId, files, field) =>
  state.updateIn(['resources', exerciseId, 'data', field], list => List(files.map(file => file.id)));

export default reducer;
