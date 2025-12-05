import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { lruMemoize } from 'reselect';

import { FilesLinksTable } from '../../components/Exercises/FilesTable';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import Box from '../../components/widgets/Box';

import { fetchFilesForExercise } from '../../redux/modules/exerciseFiles.js';
import {
  fetchExerciseFilesLinksIfNeeded,
  createExerciseFileLink,
  updateExerciseFileLink,
  removeExerciseFileLink,
} from '../../redux/modules/exerciseFilesLinks.js';
import { getFilesForExercise, fetchFilesForExerciseStatus } from '../../redux/selectors/exerciseFiles.js';
import { getExerciseFilesLinks, getExerciseFilesLinksOperation } from '../../redux/selectors/exerciseFilesLinks.js';
import { isFailedState, isLoadingState } from '../../redux/helpers/resourceManager/status.js';
import { objectMap } from '../../helpers/common.js';

const extractExerciseFiles = lruMemoize((exerciseFiles, exerciseFilesStatus) => {
  if (!exerciseFilesStatus || !exerciseFiles || isLoadingState(exerciseFilesStatus)) {
    return null;
  }
  if (isFailedState(exerciseFilesStatus)) {
    return false;
  }
  return objectMap(exerciseFiles.toJS(), file => file.data);
});

class ExerciseFilesLinksContainer extends Component {
  componentDidMount() {
    this.props.loadLinks();
    this.props.loadFiles();
  }

  componentDidUpdate(prevProps) {
    if (this.props.exercise.id !== prevProps.exercise.id) {
      this.props.loadLinks();
      this.props.loadFiles();
    }
  }

  render() {
    const {
      exercise,
      exerciseFilesLinks,
      exerciseFilesLinksOperation,
      exerciseFiles,
      exerciseFilesStatus,
      createLink,
      updateLink,
      deleteLink,
      ...props
    } = this.props;

    return (
      <Box
        title={<FormattedMessage id="app.fileLinksTable.boxTitle" defaultMessage="Exercise File Links" />}
        collapsable
        unlimitedHeight>
        <ResourceRenderer resource={exerciseFilesLinks}>
          {links => (
            <FilesLinksTable
              exercise={exercise}
              links={Object.values(links)}
              files={extractExerciseFiles(exerciseFiles, exerciseFilesStatus)}
              operation={exerciseFilesLinksOperation}
              createLink={createLink}
              updateLink={updateLink}
              deleteLink={deleteLink}
              {...props}
            />
          )}
        </ResourceRenderer>
      </Box>
    );
  }
}

ExerciseFilesLinksContainer.propTypes = {
  exercise: PropTypes.shape({
    id: PropTypes.string.isRequired,
    filesIds: PropTypes.array.isRequired,
    permissionHints: PropTypes.object.isRequired,
  }).isRequired,
  exerciseFilesLinks: ImmutablePropTypes.map,
  exerciseFilesLinksOperation: ImmutablePropTypes.map,
  exerciseFiles: ImmutablePropTypes.map,
  exerciseFilesStatus: PropTypes.string,
  loadLinks: PropTypes.func.isRequired,
  loadFiles: PropTypes.func.isRequired,
  createLink: PropTypes.func.isRequired,
  updateLink: PropTypes.func.isRequired,
  deleteLink: PropTypes.func.isRequired,
};

const processLinkBody = ({ key, exerciseFileId, saveName, requiredRole }, update = false) => {
  const common = { key, saveName: saveName || null, requiredRole: requiredRole || null };
  return update ? common : { ...common, exerciseFileId };
};

export default connect(
  (state, { exercise }) => {
    return {
      exerciseFilesLinks: getExerciseFilesLinks(state, exercise.id),
      exerciseFilesLinksOperation: getExerciseFilesLinksOperation(state, exercise.id),
      exerciseFiles: getFilesForExercise(exercise.id)(state),
      exerciseFilesStatus: fetchFilesForExerciseStatus(state)(exercise.id),
    };
  },
  (dispatch, { exercise }) => ({
    loadLinks: () => dispatch(fetchExerciseFilesLinksIfNeeded(exercise.id)),
    loadFiles: () => dispatch(fetchFilesForExercise(exercise.id)),
    createLink: data => dispatch(createExerciseFileLink(exercise.id, processLinkBody(data, false))),
    updateLink: ({ id, ...data }) =>
      dispatch(updateExerciseFileLink(exercise.id, id, processLinkBody(data, true /* update */))),
    deleteLink: linkId => dispatch(removeExerciseFileLink(exercise.id, linkId)),
  })
)(ExerciseFilesLinksContainer);
