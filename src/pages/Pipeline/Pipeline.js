import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { Row, Col, Well, ButtonGroup } from 'react-bootstrap';
import { connect } from 'react-redux';
import { LinkContainer } from 'react-router-bootstrap';

import Page from '../../components/layout/Page';
import Box from '../../components/widgets/Box';
import Button from '../../components/widgets/FlatButton';
import { EditIcon } from '../../components/icons';
import ForkPipelineForm from '../../components/forms/ForkPipelineForm';

import {
  fetchPipelineIfNeeded,
  forkPipeline
} from '../../redux/modules/pipelines';
import { getPipeline } from '../../redux/selectors/pipelines';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { canEditPipeline } from '../../redux/selectors/users';
import { fetchExercises } from '../../redux/modules/exercises';
import { exercisesSelector } from '../../redux/selectors/exercises';

import { createGraphFromNodes } from '../../helpers/pipelineGraph';
import withLinks from '../../helpers/withLinks';
import PipelineDetail from '../../components/Pipelines/PipelineDetail';
import PipelineVisualisation from '../../components/Pipelines/PipelineVisualisation';

class Pipeline extends Component {
  state = {
    graph: { dependencies: [], nodes: [] },
    forkId: null
  };

  componentWillMount() {
    this.props.loadAsync(val => this.setState(val));
    this.reset();
  }
  componentWillReceiveProps = props => {
    if (this.props.params.pipelineId !== props.params.pipelineId) {
      props.loadAsync(val => this.setState(val));
      this.reset();
    }
  };

  reset() {
    this.setState({ forkId: Math.random().toString() });
  }

  static loadAsync = (
    { pipelineId },
    dispatch,
    userId,
    isSuperadmin,
    setState = null
  ) =>
    Promise.all([
      dispatch(fetchPipelineIfNeeded(pipelineId))
        .then(res => res.value)
        .then(pipeline => {
          const graph = createGraphFromNodes(pipeline.pipeline.boxes);
          if (setState) {
            setState({ graph });
          }
        }),
      dispatch(fetchExercises())
    ]);

  render() {
    const {
      links: { PIPELINES_URI, PIPELINE_EDIT_URI_FACTORY },
      pipeline,
      exercises,
      isAuthorOfPipeline,
      forkPipeline
    } = this.props;
    const { graph, forkId } = this.state;

    return (
      <Page
        resource={pipeline}
        title={pipeline => pipeline.name}
        description={
          <FormattedMessage
            id="app.pipeline.description"
            defaultMessage="Pipeline overview"
          />
        }
        breadcrumbs={[
          {
            text: (
              <FormattedMessage
                id="app.pipelines.title"
                defaultMessage="Pipelines"
              />
            ),
            iconName: 'random',
            link: PIPELINES_URI
          },
          {
            text: (
              <FormattedMessage
                id="app.pipeline.title"
                defaultMessage="Pipeline"
              />
            ),
            iconName: 'random'
          }
        ]}
      >
        {pipeline =>
          <div>
            <div>
              <ButtonGroup>
                {isAuthorOfPipeline(pipeline.id) &&
                  <LinkContainer to={PIPELINE_EDIT_URI_FACTORY(pipeline.id)}>
                    <Button bsStyle="warning" bsSize="sm">
                      <EditIcon />
                      &nbsp;
                      <FormattedMessage
                        id="app.pipeline.editSettings"
                        defaultMessage="Edit pipeline"
                      />
                    </Button>
                  </LinkContainer>}
                <ForkPipelineForm
                  pipelineId={pipeline.id}
                  exercises={exercises}
                  forkId={forkId}
                  onSubmit={formData => forkPipeline(forkId, formData)}
                />
              </ButtonGroup>
            </div>
            <p />
            <Row>
              <Col lg={6}>
                <PipelineDetail {...pipeline} />
              </Col>
              <Col lg={6}>
                <Box
                  title={
                    <FormattedMessage
                      id="app.pipeline.visualization"
                      defaultMessage="Visualization"
                    />
                  }
                  noPadding
                  unlimitedHeight
                >
                  <Well className="pipeline">
                    {graph.nodes.length > 0 &&
                      <PipelineVisualisation graph={graph} />}
                  </Well>
                </Box>
              </Col>
            </Row>
          </div>}
      </Page>
    );
  }
}

Pipeline.propTypes = {
  pipeline: ImmutablePropTypes.map,
  loadAsync: PropTypes.func.isRequired,
  params: PropTypes.shape({
    pipelineId: PropTypes.string.isRequired
  }).isRequired,
  isAuthorOfPipeline: PropTypes.func.isRequired,
  links: PropTypes.object.isRequired,
  forkPipeline: PropTypes.func.isRequired,
  exercises: ImmutablePropTypes.map
};

export default withLinks(
  connect(
    (state, { params: { pipelineId } }) => {
      const userId = loggedInUserIdSelector(state);

      return {
        pipeline: getPipeline(pipelineId)(state),
        userId: loggedInUserIdSelector(state),
        isAuthorOfPipeline: pipelineId =>
          canEditPipeline(userId, pipelineId)(state),
        exercises: exercisesSelector(state)
      };
    },
    (dispatch, { params: { pipelineId } }) => ({
      loadAsync: setState =>
        Pipeline.loadAsync({ pipelineId }, dispatch, null, false, setState),
      forkPipeline: (forkId, data) =>
        dispatch(forkPipeline(pipelineId, forkId, data))
    })
  )(Pipeline)
);
