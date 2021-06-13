import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Table } from 'react-bootstrap';

import AddExerciseTagForm from '../../components/forms/AddExerciseTagForm';
import { addTag, removeTag } from '../../redux/modules/exercises';
import {
  exerciseSelector,
  getExerciseTags,
  getExerciseTagsLoading,
  getExerciseTagsUpdatePending,
} from '../../redux/selectors/exercises';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import { getTagCSSColor } from '../../helpers/exercise/tags';
import { LoadingIcon, RemoveIcon, TagIcon } from '../../components/icons';
import Button from '../../components/widgets/FlatButton';

const ADD_TAG_INITIAL_VALUES = { tag: '' };

const ExercisesTagsEditContainer = ({ exercise, tags, tagsLoading, updatePending, addTag, removeTag }) => (
  <ResourceRenderer resource={exercise}>
    {exercise => (
      <div>
        {exercise.tags && exercise.tags.length > 0 ? (
          <Table hover condensed>
            <tbody>
              {exercise.tags.sort().map(tag => (
                <tr key={`${exercise.id}:${tag}`}>
                  <td>
                    <TagIcon style={{ color: getTagCSSColor(tag) }} />
                  </td>
                  <td className="full-width">{tag}</td>
                  <td>
                    <Button variant="danger" bsSize="xs" onClick={() => removeTag(tag)} disabled={updatePending}>
                      {updatePending ? <LoadingIcon gapRight /> : <RemoveIcon gapRight />}
                      <FormattedMessage id="generic.remove" defaultMessage="Remove" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <p className="small text-muted text-center">
            <FormattedMessage id="app.editExerciseTags.noTags" defaultMessage="no tags assigned" />
          </p>
        )}
        <hr />
        {tagsLoading ? (
          <LoadingIcon />
        ) : (
          <AddExerciseTagForm
            exercise={exercise}
            tags={tags}
            onSubmit={data => addTag(data.tag)}
            initialValues={ADD_TAG_INITIAL_VALUES}
            updatePending={updatePending}
          />
        )}
      </div>
    )}
  </ResourceRenderer>
);

ExercisesTagsEditContainer.propTypes = {
  exerciseId: PropTypes.string.isRequired,
  exercise: ImmutablePropTypes.map,
  tags: PropTypes.array,
  tagsLoading: PropTypes.bool.isRequired,
  updatePending: PropTypes.bool.isRequired,
  addTag: PropTypes.func.isRequired,
  removeTag: PropTypes.func.isRequired,
};

export default connect(
  (state, { exerciseId }) => ({
    exercise: exerciseSelector(exerciseId)(state),
    tags: getExerciseTags(state),
    tagsLoading: getExerciseTagsLoading(state),
    updatePending: getExerciseTagsUpdatePending(state) !== null,
  }),
  (dispatch, { exerciseId }) => ({
    addTag: tagName => dispatch(addTag(exerciseId, tagName)),
    removeTag: tagName => dispatch(removeTag(exerciseId, tagName)),
  })
)(ExercisesTagsEditContainer);
