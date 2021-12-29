import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';

import Page from '../../components/layout/Page';
import { PipelineNavigation } from '../../components/layout/Navigation';
import Box from '../../components/widgets/Box';
import { PipelineIcon } from '../../components/icons';
// import ForkPipelineForm from '../../components/forms/ForkPipelineForm';

import { fetchPipelineIfNeeded, forkPipeline } from '../../redux/modules/pipelines';
import { getPipeline, pipelineEnvironmentsSelector } from '../../redux/selectors/pipelines';

import { getVariablesUtilization } from '../../helpers/pipelines';
import PipelineDetail from '../../components/Pipelines/PipelineDetail';
import PipelineGraph from '../../components/Pipelines/PipelineGraph';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import { fetchRuntimeEnvironments } from '../../redux/modules/runtimeEnvironments';
import { hasPermissions } from '../../helpers/common';

class Pipeline extends Component {
  state = {
    forkId: null,
  };

  static loadAsync = ({ pipelineId }, dispatch) =>
    Promise.all([dispatch(fetchPipelineIfNeeded(pipelineId)), dispatch(fetchRuntimeEnvironments())]);

  componentDidMount() {
    this.props.loadAsync();
    this.reset();
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params.pipelineId !== prevProps.match.params.pipelineId) {
      this.props.loadAsync();
      this.reset();
    }
  }

  reset = () => this.setState({ forkId: Math.random().toString() });

  render() {
    const {
      pipeline,
      // forkPipeline,
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
              pipelineId={pipeline.id}
              canViewDetail={hasPermissions(pipeline, 'viewDetail')}
              canEdit={hasPermissions(pipeline, 'update')}
            />

            {/* TODO Fork form needs redesigning (better selection of exercises).
            <div>
              <ButtonGroup>
                <ForkPipelineForm
                  pipelineId={pipeline.id}
                  exercises={exercises}
                  forkId={forkId}
                  onSubmit={formData => forkPipeline(forkId, formData)}
                />
              </ButtonGroup>
            </div>
             */}

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
            </Row>
          </>
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
  forkPipeline: PropTypes.func.isRequired,
  runtimeEnvironments: PropTypes.array,
};

export default connect(
  (
    state,
    {
      match: {
        params: { pipelineId },
      },
    }
  ) => {
    return {
      pipeline: getPipeline(pipelineId)(state),
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
    loadAsync: () => Pipeline.loadAsync({ pipelineId }, dispatch),
    forkPipeline: (forkId, data) => dispatch(forkPipeline(pipelineId, forkId, data)),
  })
)(Pipeline);
