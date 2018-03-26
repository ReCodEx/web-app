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
import { Row, Col, Button } from 'react-bootstrap';
import Icon from 'react-fontawesome';

import withLinks from '../../helpers/withLinks';
import Page from '../../components/layout/Page';

import {
  fetchReferenceSolutionsIfNeeded,
  fetchReferenceSolutions,
  resubmitReferenceSolution
} from '../../redux/modules/referenceSolutions';
import { fetchExerciseIfNeeded } from '../../redux/modules/exercises';

import { referenceSolutionsSelector } from '../../redux/selectors/referenceSolutions';
import { getExercise } from '../../redux/selectors/exercises';
import ReferenceSolutionDetail from '../../components/ReferenceSolutions/ReferenceSolutionDetail';
import SourceCodeInfoBox from '../../components/widgets/SourceCodeInfoBox';
import SourceCodeViewerContainer from '../../containers/SourceCodeViewerContainer';
import { RefreshIcon, SendIcon } from '../../components/icons';
import ReferenceSolutionEvaluationsContainer from '../../containers/ReferenceSolutionEvaluationsContainer';
import SolutionArchiveInfoBox from '../../components/Submissions/SolutionArchiveInfoBox';
import { downloadSolutionArchive } from '../../redux/modules/referenceSolutionEvaluations';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';

const messages = defineMessages({
  title: {
    id: 'app.exercise.referenceSolutionTitle',
    defaultMessage: 'Reference solution overview'
  }
});

class ReferenceSolution extends Component {
  state = { openFileId: null };
  openFile = id => this.setState({ openFileId: id });
  hideFile = () => this.setState({ openFileId: null });

  static loadAsync = ({ exerciseId }, dispatch) =>
    Promise.all([
      dispatch(fetchExerciseIfNeeded(exerciseId)),
      dispatch(fetchReferenceSolutionsIfNeeded(exerciseId))
    ]);

  componentWillMount() {
    this.props.loadAsync();
  }

  componentWillReceiveProps(newProps) {
    if (
      this.props.params.referenceSolutionId !==
      newProps.params.referenceSolutionId
    ) {
      newProps.loadAsync();
    }
  }

  render() {
    const {
      referenceSolutions,
      exercise,
      params: { exerciseId, referenceSolutionId },
      refreshSolutionEvaluations,
      resubmitReferenceSolution,
      resubmitReferenceSolutionInDebugMode,
      downloadSolutionArchive,
      intl: { formatMessage },
      links: { EXERCISES_URI, EXERCISE_URI_FACTORY }
    } = this.props;
    const { openFileId } = this.state;

    return (
      <Page
        title={formatMessage(messages.title)}
        resource={referenceSolutions}
        description={
          <FormattedMessage
            id="app.exercise.description"
            defaultMessage="Exercise overview"
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
            iconName: 'diamond'
          }
        ]}
      >
        {referenceSolutions => {
          const referenceSolution = referenceSolutions.find(
            solution => solution.id === referenceSolutionId
          );
          const permissionHints = referenceSolution.permissionHints;
          return (
            <div>
              <Row>
                <Col lg={6}>
                  <ReferenceSolutionDetail
                    {...referenceSolution}
                    exerciseId={exerciseId}
                  />
                  <Row>
                    {referenceSolution.solution.files.map(file =>
                      <Col lg={6} md={12} key={file.id}>
                        <a
                          href="#"
                          onClick={e => {
                            e.preventDefault();
                            this.openFile(file.id);
                          }}
                        >
                          <SourceCodeInfoBox {...file} />
                        </a>
                      </Col>
                    )}
                  </Row>
                  <Row>
                    <Col lg={6} md={12}>
                      <a href="#" onClick={downloadSolutionArchive}>
                        <SolutionArchiveInfoBox id={referenceSolution.id} />
                      </a>
                    </Col>
                  </Row>
                </Col>
                <Col lg={6}>
                  <Row>
                    <Col xs={12}>
                      <p>
                        <Button
                          bsStyle="primary"
                          className="btn-flat"
                          onClick={refreshSolutionEvaluations}
                        >
                          <RefreshIcon />{' '}
                          <FormattedMessage
                            id="app.referenceSolutionDetail.refreshEvaluations"
                            defaultMessage="Refresh"
                          />
                        </Button>
                        {permissionHints &&
                          permissionHints.evaluate !== false &&
                          <ResourceRenderer resource={exercise}>
                            {exercise =>
                              <span>
                                <Button
                                  bsStyle={
                                    !exercise || exercise.isBroken
                                      ? 'default'
                                      : 'success'
                                  }
                                  className="btn-flat"
                                  disabled={!exercise || exercise.isBroken}
                                  onClick={() =>
                                    resubmitReferenceSolution().then(
                                      refreshSolutionEvaluations
                                    )}
                                >
                                  {!exercise || exercise.isBroken
                                    ? <Icon name="medkit" />
                                    : <SendIcon />}{' '}
                                  <FormattedMessage
                                    id="app.referenceSolutionDetail.resubmit"
                                    defaultMessage="Resubmit"
                                  />
                                </Button>
                                <Button
                                  bsStyle={
                                    !exercise || exercise.isBroken
                                      ? 'default'
                                      : 'danger'
                                  }
                                  className="btn-flat"
                                  disabled={!exercise || exercise.isBroken}
                                  onClick={() =>
                                    resubmitReferenceSolutionInDebugMode().then(
                                      refreshSolutionEvaluations
                                    )}
                                >
                                  {!exercise || exercise.isBroken
                                    ? <Icon name="medkit" />
                                    : <SendIcon />}{' '}
                                  <FormattedMessage
                                    id="app.referenceSolutionDetail.resubmitDebug"
                                    defaultMessage="Resubmit in Debug Mode"
                                  />
                                </Button>
                              </span>}
                          </ResourceRenderer>}
                      </p>
                    </Col>
                  </Row>
                  <ReferenceSolutionEvaluationsContainer
                    referenceSolution={referenceSolution}
                    referenceSolutionId={referenceSolutionId}
                    exerciseId={exerciseId}
                  />
                </Col>
              </Row>

              <SourceCodeViewerContainer
                show={openFileId !== null}
                fileId={openFileId}
                onHide={() => this.hideFile()}
              />
            </div>
          );
        }}
      </Page>
    );
  }
}

ReferenceSolution.contextTypes = {
  router: PropTypes.object
};

ReferenceSolution.propTypes = {
  params: PropTypes.shape({
    exerciseId: PropTypes.string.isRequired,
    referenceSolutionId: PropTypes.string.isRequired
  }).isRequired,
  loadAsync: PropTypes.func.isRequired,
  refreshSolutionEvaluations: PropTypes.func.isRequired,
  resubmitReferenceSolution: PropTypes.func.isRequired,
  resubmitReferenceSolutionInDebugMode: PropTypes.func.isRequired,
  referenceSolutions: ImmutablePropTypes.map,
  exercise: ImmutablePropTypes.map,
  downloadSolutionArchive: PropTypes.func,
  intl: intlShape.isRequired,
  links: PropTypes.object.isRequired
};

export default withLinks(
  injectIntl(
    connect(
      (state, { params: { exerciseId, referenceSolutionId } }) => ({
        referenceSolutions: referenceSolutionsSelector(exerciseId)(state),
        exercise: getExercise(exerciseId)(state)
      }),
      (dispatch, { params }) => ({
        loadAsync: () => ReferenceSolution.loadAsync(params, dispatch),
        refreshSolutionEvaluations: () => {
          dispatch(fetchReferenceSolutions(params.exerciseId));
        },
        resubmitReferenceSolution: () =>
          dispatch(resubmitReferenceSolution(params.referenceSolutionId)),
        resubmitReferenceSolutionInDebugMode: () =>
          dispatch(resubmitReferenceSolution(params.referenceSolutionId, true)),
        downloadSolutionArchive: e => {
          e.preventDefault();
          dispatch(downloadSolutionArchive(params.referenceSolutionId));
        }
      })
    )(ReferenceSolution)
  )
);
