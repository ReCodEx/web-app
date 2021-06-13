import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { Row, Col, ButtonGroup } from 'react-bootstrap';
import { connect } from 'react-redux';
import { LinkContainer } from 'react-router-bootstrap';

import Page from '../../components/layout/Page';
import Box from '../../components/widgets/Box';
import Button from '../../components/widgets/FlatButton';
import InsetPanel from '../../components/widgets/InsetPanel';
import { EditIcon } from '../../components/icons';
// import ForkPipelineForm from '../../components/forms/ForkPipelineForm';

import { fetchPipelineIfNeeded, forkPipeline } from '../../redux/modules/pipelines';
import { getPipeline, pipelineEnvironmentsSelector } from '../../redux/selectors/pipelines';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { canEditPipeline } from '../../redux/selectors/users';

import { createGraphFromNodes } from '../../helpers/pipelineGraph';
import withLinks from '../../helpers/withLinks';
import PipelineDetail from '../../components/Pipelines/PipelineDetail';
import PipelineVisualisation from '../../components/Pipelines/PipelineVisualisation';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import { fetchRuntimeEnvironments } from '../../redux/modules/runtimeEnvironments';

class Pipeline extends Component {
  state = {
    graph: { dependencies: [], nodes: [] },
    forkId: null,
  };

  componentDidMount() {
    this.props.loadAsync(val => this.setState(val));
    this.reset();
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params.pipelineId !== prevProps.match.params.pipelineId) {
      this.props.loadAsync(val => this.setState(val));
      this.reset();
    }
  }

  reset = () => this.setState({ forkId: Math.random().toString() });

  static loadAsync = ({ pipelineId }, dispatch, { setState = null }) =>
    Promise.all([
      dispatch(fetchPipelineIfNeeded(pipelineId))
        .then(res => res.value)
        .then(pipeline => {
          const graph = createGraphFromNodes(pipeline.pipeline.boxes);
          if (setState) {
            setState({ graph });
          }
        }),
      dispatch(fetchRuntimeEnvironments()),
    ]);

  render() {
    const {
      links: { PIPELINES_URI, PIPELINE_EDIT_URI_FACTORY },
      pipeline,
      isAuthorOfPipeline,
      // forkPipeline,
      runtimeEnvironments,
    } = this.props;
    const { graph } = this.state;

    return (
      <Page
        resource={pipeline}
        title={pipeline => pipeline.name}
        description={<FormattedMessage id="app.pipeline.description" defaultMessage="Pipeline overview" />}
        breadcrumbs={[
          {
            text: <FormattedMessage id="app.pipelines.title" defaultMessage="Pipelines" />,
            iconName: 'random',
            link: PIPELINES_URI,
          },
          {
            text: <FormattedMessage id="app.pipeline.title" defaultMessage="Pipeline" />,
            iconName: 'random',
          },
        ]}>
        {pipeline => (
          <div>
            <div>
              <ButtonGroup>
                {isAuthorOfPipeline(pipeline.id) && (
                  <LinkContainer to={PIPELINE_EDIT_URI_FACTORY(pipeline.id)}>
                    <Button bsStyle="warning" bsSize="sm">
                      <EditIcon />
                      &nbsp;
                      <FormattedMessage id="app.pipeline.editSettings" defaultMessage="Edit pipeline" />
                    </Button>
                  </LinkContainer>
                )}
                {/* TODO Fork form needs redesigning (better selection of exercises).
                <ForkPipelineForm
                  pipelineId={pipeline.id}
                  exercises={exercises}
                  forkId={forkId}
                  onSubmit={formData => forkPipeline(forkId, formData)}
                /> */}
              </ButtonGroup>
            </div>
            <p />
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
                  noPadding
                  unlimitedHeight>
                  <InsetPanel className="pipeline">
                    {graph.nodes.length > 0 && <PipelineVisualisation graph={graph} />}
                  </InsetPanel>
                </Box>
              </Col>
            </Row>
          </div>
        )}
      </Page>
    );
  }
}

Pipeline.propTypes = {
  pipeline: ImmutablePropTypes.map,
  loadAsync: PropTypes.func.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      pipelineId: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  isAuthorOfPipeline: PropTypes.func.isRequired,
  links: PropTypes.object.isRequired,
  forkPipeline: PropTypes.func.isRequired,
  runtimeEnvironments: PropTypes.array,
};

export default withLinks(
  connect(
    (
      state,
      {
        match: {
          params: { pipelineId },
        },
      }
    ) => {
      const userId = loggedInUserIdSelector(state);

      return {
        pipeline: getPipeline(pipelineId)(state),
        userId: loggedInUserIdSelector(state),
        isAuthorOfPipeline: pipelineId => canEditPipeline(userId, pipelineId)(state),
        runtimeEnvironments: pipelineEnvironmentsSelector(pipelineId)(state),
      };
    },
    (
      dispatch,
      {
        match: {
          params: { pipelineId },
        },
      }
    ) => ({
      loadAsync: setState => Pipeline.loadAsync({ pipelineId }, dispatch, { setState }),
      forkPipeline: (forkId, data) => dispatch(forkPipeline(pipelineId, forkId, data)),
    })
  )(Pipeline)
);
