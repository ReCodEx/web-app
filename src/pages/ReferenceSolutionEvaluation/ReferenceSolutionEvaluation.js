import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  FormattedMessage,
  defineMessages,
  intlShape,
  injectIntl
} from 'react-intl';
import ImmutablePropTypes from 'react-immutable-proptypes';

import withLinks from '../../helpers/withLinks';
import Page from '../../components/layout/Page';

import { fetchReferenceSolutionsIfNeeded } from '../../redux/modules/referenceSolutions';
import { referenceSolutionsSelector } from '../../redux/selectors/referenceSolutions';
import {
  fetchReferenceSolutionEvaluationIfNeeded,
  downloadEvaluationArchive
} from '../../redux/modules/referenceSolutionEvaluations';
import { referenceSolutionEvaluationSelector } from '../../redux/selectors/referenceSolutionEvaluations';
import ReferenceSolutionEvaluationDetail from '../../components/ReferenceSolutions/ReferenceSolutionEvaluationDetail';

const messages = defineMessages({
  title: {
    id: 'app.exercise.referenceSolutionEvaluationTitle',
    defaultMessage: 'Reference solution evaluation'
  }
});

class ReferenceSolutionEvaluation extends Component {
  static loadAsync = ({ exerciseId, evaluationId }, dispatch) =>
    Promise.all([
      dispatch(fetchReferenceSolutionsIfNeeded(exerciseId)),
      dispatch(fetchReferenceSolutionEvaluationIfNeeded(evaluationId))
    ]);

  componentWillMount() {
    this.props.loadAsync();
  }

  componentWillReceiveProps(newProps) {
    if (this.props.params.evaluationId !== newProps.params.evaluationId) {
      newProps.loadAsync();
    }
  }

  render() {
    const {
      referenceSolutions,
      solutionEvaluation,
      downloadEvaluationArchive,
      params: { exerciseId, referenceSolutionId },
      intl: { formatMessage },
      links: {
        EXERCISES_URI,
        EXERCISE_URI_FACTORY,
        EXERCISE_REFERENCE_SOLUTION_URI_FACTORY
      }
    } = this.props;

    return (
      <Page
        title={formatMessage(messages.title)}
        resource={[referenceSolutions, solutionEvaluation]}
        description={
          <FormattedMessage
            id="app.exercise.referenceSolutionEvaluationDescription"
            defaultMessage="Evaluation"
          />
        }
        breadcrumbs={[
          {
            text: (
              <FormattedMessage
                id="app.exercises.title"
                defaultMessage="Exercises"
              />
            ),
            iconName: 'puzzle-piece',
            link: EXERCISES_URI
          },
          {
            text: (
              <FormattedMessage
                id="app.exercise.description"
                defaultMessage="Exercise overview"
              />
            ),
            iconName: 'lightbulb-o',
            link: EXERCISE_URI_FACTORY(exerciseId)
          },
          {
            text: (
              <FormattedMessage
                id="app.exercise.referenceSolutionDetail"
                defaultMessage="Reference solution detail"
              />
            ),
            iconName: 'diamond',
            link: EXERCISE_REFERENCE_SOLUTION_URI_FACTORY(
              exerciseId,
              referenceSolutionId
            )
          },
          {
            text: (
              <FormattedMessage
                id="app.exercise.referenceSolutionEvaluationDetail"
                defaultMessage="Evaluation detail"
              />
            ),
            iconName: 'codepen'
          }
        ]}
      >
        {(referenceSolutions, solutionEvaluation) => {
          const referenceSolution = referenceSolutions.find(
            solution => solution.id === referenceSolutionId
          );
          return (
            <ReferenceSolutionEvaluationDetail
              exerciseId={exerciseId}
              referenceSolution={referenceSolution}
              solutionEvaluation={solutionEvaluation}
              downloadEvaluationArchive={downloadEvaluationArchive}
            />
          );
        }}
      </Page>
    );
  }
}

ReferenceSolutionEvaluation.contextTypes = {
  router: PropTypes.object
};

ReferenceSolutionEvaluation.propTypes = {
  params: PropTypes.shape({
    exerciseId: PropTypes.string.isRequired,
    referenceSolutionId: PropTypes.string.isRequired,
    evaluationId: PropTypes.string.isRequired
  }).isRequired,
  loadAsync: PropTypes.func.isRequired,
  referenceSolutions: ImmutablePropTypes.map,
  solutionEvaluation: PropTypes.object,
  downloadEvaluationArchive: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  links: PropTypes.object.isRequired
};

export default withLinks(
  injectIntl(
    connect(
      (state, { params: { exerciseId, evaluationId } }) => ({
        referenceSolutions: referenceSolutionsSelector(exerciseId)(state),
        solutionEvaluation: referenceSolutionEvaluationSelector(evaluationId)(
          state
        )
      }),
      (dispatch, { params }) => ({
        loadAsync: () =>
          ReferenceSolutionEvaluation.loadAsync(params, dispatch),
        downloadEvaluationArchive: e => {
          e.preventDefault();
          dispatch(downloadEvaluationArchive(params.evaluationId));
        }
      })
    )(ReferenceSolutionEvaluation)
  )
);
