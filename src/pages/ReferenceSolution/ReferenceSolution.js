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
import Page from '../../components/layout/Page';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';

import {
  fetchReferenceSolutionsIfNeeded,
  downloadEvaluationArchive,
  evaluateReferenceSolution
} from '../../redux/modules/referenceSolutions';
import { fetchReferenceEvaluations } from '../../redux/modules/referenceSolutionEvaluations';
import { referenceSolutionsSelector } from '../../redux/selectors/referenceSolutions';
import { getReferenceEvaluations } from '../../redux/selectors/referenceSolutionEvaluations';
import ReferenceSolutionDetail from '../../components/ReferenceSolutions/ReferenceSolutionDetail';
import ReferenceSolutionEvaluation from '../../components/ReferenceSolutions/ReferenceSolutionEvaluation';
import SourceCodeInfoBox from '../../components/widgets/SourceCodeInfoBox';
import SourceCodeViewerContainer from '../../containers/SourceCodeViewerContainer';
import { DownloadIcon, RefreshIcon, SendIcon } from '../../components/icons';

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

  static loadAsync = ({ exerciseId, referenceSolutionId }, dispatch) =>
    Promise.all([
      dispatch(fetchReferenceSolutionsIfNeeded(exerciseId)),
      dispatch(fetchReferenceEvaluations(referenceSolutionId))
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
      environments,
      params: { exerciseId, referenceSolutionId },
      downloadEvaluationArchive,
      fetchEvaluations,
      evaluateReferenceSolution,
      intl: { formatMessage }
    } = this.props;
    const { openFileId } = this.state;

    const { links: { EXERCISES_URI, EXERCISE_URI_FACTORY } } = this.context;

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
          return (
            <div>
              <Row>
                <Col lg={6}>
                  <ReferenceSolutionDetail {...referenceSolution} />
                  <Row>
                    {referenceSolution.solution.files.map(file =>
                      <Col lg={6} md={12} key={file.id}>
                        <a href="#" onClick={() => this.openFile(file.id)}>
                          <SourceCodeInfoBox {...file} />
                        </a>
                      </Col>
                    )}
                  </Row>
                </Col>
                <Col lg={6}>
                  <Row>
                    <Col xs={12}>
                      <p>
                        <Button
                          bsStyle="default"
                          className="btn-flat"
                          onClick={fetchEvaluations}
                        >
                          <RefreshIcon />
                          {' '}
                          <FormattedMessage
                            id="app.referenceSolutionDetail.refreshEvaluations"
                            defaultMessage="Refresh"
                          />
                        </Button>
                        <Button
                          bsStyle="success"
                          className="btn-flat"
                          onClick={evaluateReferenceSolution}
                        >
                          <SendIcon />
                          {' '}
                          <FormattedMessage
                            id="app.referenceSolutionDetail.resubmit"
                            defaultMessage="Resubmit"
                          />
                        </Button>
                      </p>
                    </Col>
                  </Row>
                  <ResourceRenderer resource={environments}>
                    {environments =>
                      <div>
                        {Object.keys(environments).map(env =>
                          <ReferenceSolutionEvaluation
                            key={env}
                            referenceSolutionId={referenceSolutionId}
                            environment={env}
                            evaluations={environments[env]}
                            renderButtons={evaluationId =>
                              <Button
                                bsSize="xs"
                                className="btn-flat"
                                onClick={() =>
                                  downloadEvaluationArchive(evaluationId)}
                              >
                                <DownloadIcon />
                                {' '}
                                <FormattedMessage
                                  id="app.referenceSolutionEvaluation.downloadResults"
                                  defaultMessage="Download results"
                                />
                              </Button>}
                          />
                        )}
                      </div>}
                  </ResourceRenderer>
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
  router: PropTypes.object,
  links: PropTypes.object
};

ReferenceSolution.propTypes = {
  params: PropTypes.shape({
    exerciseId: PropTypes.string.isRequired,
    referenceSolutionId: PropTypes.string.isRequired
  }).isRequired,
  loadAsync: PropTypes.func.isRequired,
  fetchEvaluations: PropTypes.func.isRequired,
  evaluateReferenceSolution: PropTypes.func.isRequired,
  referenceSolutions: ImmutablePropTypes.map,
  environments: ImmutablePropTypes.map,
  downloadEvaluationArchive: PropTypes.func.isRequired,
  intl: intlShape.isRequired
};

export default injectIntl(
  connect(
    (state, { params: { exerciseId, referenceSolutionId } }) => ({
      referenceSolutions: referenceSolutionsSelector(exerciseId)(state),
      environments: getReferenceEvaluations(referenceSolutionId)(state)
    }),
    (dispatch, { params }) => ({
      loadAsync: () => ReferenceSolution.loadAsync(params, dispatch),
      downloadEvaluationArchive: evaluationId =>
        dispatch(downloadEvaluationArchive(evaluationId)),
      fetchEvaluations: () =>
        dispatch(fetchReferenceEvaluations(params.referenceSolutionId)),
      evaluateReferenceSolution: () =>
        dispatch(evaluateReferenceSolution(params.referenceSolutionId))
    })
  )(ReferenceSolution)
);
