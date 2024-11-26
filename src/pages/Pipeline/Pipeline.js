import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';

import Page from '../../components/layout/Page';
import { PipelineNavigation } from '../../components/layout/Navigation';
import Box from '../../components/widgets/Box';
import Icon, { PipelineIcon, ForkIcon } from '../../components/icons';
import Button, { TheButtonGroup } from '../../components/widgets/TheButton';
import Confirm from '../../components/forms/Confirm';
import Callout from '../../components/widgets/Callout';

import { fetchPipelineIfNeeded, fetchPipelineExercises, forkPipeline } from '../../redux/modules/pipelines.js';
import { fetchByIds } from '../../redux/modules/users.js';
import { fetchRuntimeEnvironments } from '../../redux/modules/runtimeEnvironments.js';
import { getPipeline, getPipelineExercises, pipelineEnvironmentsSelector } from '../../redux/selectors/pipelines.js';

import { getVariablesUtilization } from '../../helpers/pipelines.js';
import PipelineDetail from '../../components/Pipelines/PipelineDetail';
import PipelineGraph from '../../components/Pipelines/PipelineGraph';
import PipelineExercisesList from '../../components/Pipelines/PipelineExercisesList';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import { hasPermissions, identity } from '../../helpers/common.js';
import withLinks from '../../helpers/withLinks.js';
import withRouter, { withRouterProps } from '../../helpers/withRouter.js';
import { suspendAbortPendingRequestsOptimization } from '../../pages/routes.js';

class Pipeline extends Component {
  state = {
    justForked: null,
  };

  static loadAsync = ({ pipelineId }, dispatch) =>
    Promise.all([
      dispatch(fetchPipelineIfNeeded(pipelineId))
        .then(() => dispatch(fetchPipelineExercises(pipelineId)))
        .then(({ value: exercises }) => {
          const ids = new Set(exercises.map(exercise => exercise && exercise.authorId).filter(identity));
          return dispatch(fetchByIds(Array.from(ids)));
        }),
      dispatch(fetchRuntimeEnvironments()),
    ]);

  componentDidMount() {
    this.props.loadAsync();
  }

  componentDidUpdate(prevProps) {
    if (this.props.params.pipelineId !== prevProps.params.pipelineId) {
      this.props.loadAsync();
      if (this.state.justForked !== this.props.params.pipelineId) {
        this.setState({ justForked: null });
      }
    }
  }

  fork = () => {
    const {
      forkPipeline,
      navigate,
      links: { PIPELINE_URI_FACTORY },
    } = this.props;
    forkPipeline().then(({ value: newPipeline }) => {
      if (newPipeline) {
        suspendAbortPendingRequestsOptimization();
        this.setState({ justForked: newPipeline.id });
        navigate(PIPELINE_URI_FACTORY(newPipeline.id));
      }
    });
  };

  acknowledgeFork = (goBack = null) => {
    const {
      navigate,
      links: { PIPELINE_URI_FACTORY },
    } = this.props;

    this.setState({ justForked: null });
    if (goBack) {
      suspendAbortPendingRequestsOptimization();
      navigate(PIPELINE_URI_FACTORY(goBack));
    }
  };

  render() {
    const {
      params: { pipelineId },
      pipeline,
      pipelineExercises,
      runtimeEnvironments,
    } = this.props;

    return (
      <Page
        resource={pipeline}
        icon={<PipelineIcon />}
        titleWindow={pipeline => pipeline.name}
        title={<FormattedMessage id="app.pipeline.title" defaultMessage="Pipeline Detail" />}>
        {pipeline => (
          <>
            <PipelineNavigation
              pipelineId={pipelineId}
              canViewDetail={hasPermissions(pipeline, 'viewDetail')}
              canEdit={hasPermissions(pipeline, 'update')}
            />

            {this.state.justForked !== pipelineId && hasPermissions(pipeline, 'fork') && (
              <TheButtonGroup className="mb-3">
                <Confirm
                  id="fork-pipeline"
                  onConfirmed={this.fork}
                  question={
                    <FormattedMessage
                      id="app.pipeline.forkPipelineConfirm"
                      defaultMessage="The whole pipeline will be duplicated and the newly created copy will be displayed to you. Do you wish to proceed?"
                    />
                  }>
                  <Button variant="success">
                    <ForkIcon gapRight={2} />
                    <FormattedMessage id="app.pipeline.forkPipeline" defaultMessage="Duplicate Pipeline" />
                  </Button>
                </Confirm>
              </TheButtonGroup>
            )}

            {this.state.justForked === pipelineId && (
              <Callout variant="success">
                <h4>
                  <FormattedMessage id="app.pipeline.forkSuccessTitle" defaultMessage="The pipeline was duplicated" />
                </h4>
                <p>
                  <FormattedMessage
                    id="app.pipeline.forkSuccess"
                    defaultMessage="You have successfully created a copy of a pipeline. This copy is being displayed to you."
                  />
                </p>
                <TheButtonGroup>
                  <Button variant="success" onClick={() => this.acknowledgeFork()}>
                    <Icon icon={['far', 'smile']} gapRight={2} />
                    <FormattedMessage id="generic.acknowledge" defaultMessage="Acknowledge" />
                  </Button>
                  <Button variant="primary" onClick={() => this.acknowledgeFork(pipeline.forkedFrom)}>
                    <Icon icon="reply" gapRight={2} />
                    <FormattedMessage id="app.pipeline.forkSuccess.backButton" defaultMessage="Back to original" />
                  </Button>
                </TheButtonGroup>
              </Callout>
            )}

            <Row>
              <ResourceRenderer resource={[...runtimeEnvironments]}>
                {(...runtimes) => (
                  <Col lg={12}>
                    <PipelineDetail {...pipeline} runtimeEnvironments={runtimes} />
                  </Col>
                )}
              </ResourceRenderer>

              <Col lg={12}>
                <Box
                  title={<FormattedMessage id="app.pipeline.visualization" defaultMessage="Visualization" />}
                  unlimitedHeight>
                  <PipelineGraph
                    boxes={pipeline.pipeline.boxes}
                    variables={pipeline.pipeline.variables}
                    utilization={getVariablesUtilization(pipeline.pipeline.boxes)}
                  />
                </Box>
              </Col>

              <Col lg={12}>
                <Box
                  title={
                    <FormattedMessage id="app.pipeline.associatedExercises" defaultMessage="Associated exercises" />
                  }
                  unlimitedHeight
                  noPadding>
                  <PipelineExercisesList pipelineExercises={pipelineExercises} />
                </Box>
              </Col>
            </Row>
          </>
        )}
      </Page>
    );
  }
}

Pipeline.propTypes = {
  pipeline: ImmutablePropTypes.map,
  pipelineExercises: PropTypes.any,
  runtimeEnvironments: PropTypes.array,
  loadAsync: PropTypes.func.isRequired,
  forkPipeline: PropTypes.func.isRequired,
  links: PropTypes.object.isRequired,
  navigate: withRouterProps.navigate,
  params: PropTypes.shape({ pipelineId: PropTypes.string }).isRequired,
};

export default withRouter(
  withLinks(
    connect(
      (state, { params: { pipelineId } }) => {
        return {
          pipeline: getPipeline(pipelineId)(state),
          pipelineExercises: getPipelineExercises(state, pipelineId),
          runtimeEnvironments: pipelineEnvironmentsSelector(pipelineId)(state),
        };
      },
      (dispatch, { params: { pipelineId } }) => ({
        loadAsync: () => Pipeline.loadAsync({ pipelineId }, dispatch),
        forkPipeline: () => dispatch(forkPipeline(pipelineId)),
      })
    )(Pipeline)
  )
);
