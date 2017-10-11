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

import withLinks from '../../hoc/withLinks';
import Page from '../../components/layout/Page';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';

import {
  fetchReferenceSolutionsIfNeeded,
  downloadEvaluationArchive,
  evaluateReferenceSolution
} from '../../redux/modules/referenceSolutions';
import { fetchEnvironmentReferenceEvaluations } from '../../redux/modules/environmentReferenceSolutionEvaluations';
import { referenceSolutionsSelector } from '../../redux/selectors/referenceSolutions';
import { getEnvironmentReferenceEvaluations } from '../../redux/selectors/environmentReferenceSolutionEvaluations';
import ReferenceSolutionDetail from '../../components/ReferenceSolutions/ReferenceSolutionDetail';
import ReferenceSolutionEvaluations from '../../components/ReferenceSolutions/ReferenceSolutionEvaluations';
import SourceCodeInfoBox from '../../components/widgets/SourceCodeInfoBox';
import SourceCodeViewerContainer from '../../containers/SourceCodeViewerContainer';
import { RefreshIcon, SendIcon } from '../../components/icons';

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
      dispatch(fetchEnvironmentReferenceEvaluations(referenceSolutionId))
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
      fetchEnvironmentEvaluations,
      evaluateReferenceSolution,
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
          return (
            <div>
              <Row>
                <Col lg={6}>
                  <ReferenceSolutionDetail
                    {...referenceSolution}
                    exerciseId={exerciseId}
                  />
                  <Row>
                    {referenceSolution.solution.files.map(file => (
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
                    ))}
                  </Row>
                </Col>
                <Col lg={6}>
                  <Row>
                    <Col xs={12}>
                      <p>
                        <Button
                          bsStyle="default"
                          className="btn-flat"
                          onClick={fetchEnvironmentEvaluations}
                        >
                          <RefreshIcon />{' '}
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
                          <SendIcon />{' '}
                          <FormattedMessage
                            id="app.referenceSolutionDetail.resubmit"
                            defaultMessage="Resubmit"
                          />
                        </Button>
                      </p>
                    </Col>
                  </Row>
                  <ResourceRenderer resource={environments}>
                    {environments => (
                      <div>
                        {Object.keys(environments).map(env => (
                          <ReferenceSolutionEvaluations
                            key={env}
                            referenceSolutionId={referenceSolutionId}
                            environment={env}
                            evaluations={environments[env]}
                            exerciseId={exerciseId}
                          />
                        ))}
                      </div>
                    )}
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
  router: PropTypes.object
};

ReferenceSolution.propTypes = {
  params: PropTypes.shape({
    exerciseId: PropTypes.string.isRequired,
    referenceSolutionId: PropTypes.string.isRequired
  }).isRequired,
  loadAsync: PropTypes.func.isRequired,
  fetchEnvironmentEvaluations: PropTypes.func.isRequired,
  evaluateReferenceSolution: PropTypes.func.isRequired,
  referenceSolutions: ImmutablePropTypes.map,
  environments: ImmutablePropTypes.map,
  downloadEvaluationArchive: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  links: PropTypes.object.isRequired
};

export default withLinks(
  injectIntl(
    connect(
      (state, { params: { exerciseId, referenceSolutionId } }) => ({
        referenceSolutions: referenceSolutionsSelector(exerciseId)(state),
        environments: getEnvironmentReferenceEvaluations(referenceSolutionId)(
          state
        )
      }),
      (dispatch, { params }) => ({
        loadAsync: () => ReferenceSolution.loadAsync(params, dispatch),
        downloadEvaluationArchive: evaluationId =>
          dispatch(downloadEvaluationArchive(evaluationId)),
        fetchEnvironmentEvaluations: () =>
          dispatch(
            fetchEnvironmentReferenceEvaluations(params.referenceSolutionId)
          ),
        evaluateReferenceSolution: () =>
          dispatch(evaluateReferenceSolution(params.referenceSolutionId))
      })
    )(ReferenceSolution)
  )
);
