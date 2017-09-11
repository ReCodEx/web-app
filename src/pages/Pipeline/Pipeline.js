import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { Row, Col, Well } from 'react-bootstrap';
import { connect } from 'react-redux';

import Page from '../../components/layout/Page';
import Box from '../../components/widgets/Box';

import { fetchPipelineIfNeeded } from '../../redux/modules/pipelines';
import { getPipeline } from '../../redux/selectors/pipelines';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';

import { createGraphFromNodes } from '../../helpers/pipelineGraph';
import withLinks from '../../hoc/withLinks';
import PipelineDetail from '../../components/Pipelines/PipelineDetail';
import PipelineVisualisation from '../../components/Pipelines/PipelineVisualisation';

class Pipeline extends Component {
  state = {
    graph: { dependencies: [], nodes: [] }
  };

  componentWillMount() {
    this.props.loadAsync(val => this.setState(val));
  }
  componentWillReceiveProps = props => {
    if (this.props.params.pipelineId !== props.params.pipelineId) {
      props.loadAsync(val => this.setState(val));
    }
  };

  static loadAsync = ({ pipelineId }, dispatch, setState) =>
    dispatch(fetchPipelineIfNeeded(pipelineId))
      .then(res => res.value)
      .then(pipeline => {
        const graph = createGraphFromNodes(pipeline.pipeline.boxes);
        setState({ graph });
      });

  render() {
    const { links: { PIPELINES_URI }, pipeline } = this.props;
    const { graph } = this.state;

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
  links: PropTypes.object.isRequired
};

export default withLinks(
  connect(
    (state, { params: { pipelineId } }) => ({
      pipeline: getPipeline(pipelineId)(state),
      userId: loggedInUserIdSelector(state)
    }),
    (dispatch, { params: { pipelineId } }) => ({
      loadAsync: setState =>
        Pipeline.loadAsync({ pipelineId }, dispatch, setState)
    })
  )(Pipeline)
);
