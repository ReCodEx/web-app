import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';

import Page from '../../components/layout/Page';
import { PipelineNavigation } from '../../components/layout/Navigation';
import Callout from '../../components/widgets/Callout';
import { PipelineStructureIcon } from '../../components/icons';
import PipelineFilesTableContainer from '../../containers/PipelineFilesTableContainer';
import PipelineEditContainer from '../../containers/PipelineEditContainer';

import { fetchPipelineIfNeeded } from '../../redux/modules/pipelines.js';
import { fetchBoxTypes } from '../../redux/modules/boxes.js';
import { fetchRuntimeEnvironments } from '../../redux/modules/runtimeEnvironments.js';
import { getPipeline } from '../../redux/selectors/pipelines.js';

import { hasPermissions } from '../../helpers/common.js';

class EditPipeline extends Component {
  componentDidMount() {
    this.props.loadAsync();
  }

  componentDidUpdate(prevProps) {
    if (this.props.params.pipelineId !== prevProps.params.pipelineId) {
      this.props.loadAsync();
    }
  }

  static loadAsync = ({ pipelineId }, dispatch) =>
    Promise.all([
      dispatch(fetchPipelineIfNeeded(pipelineId)),
      dispatch(fetchRuntimeEnvironments()),
      dispatch(fetchBoxTypes()),
    ]);

  render() {
    const { pipeline } = this.props;

    return (
      <Page
        resource={pipeline}
        icon={<PipelineStructureIcon />}
        title={<FormattedMessage id="app.editPipelineStructure.title" defaultMessage="Modify Pipeline Structure" />}>
        {pipeline => (
          <>
            <PipelineNavigation
              pipelineId={pipeline.id}
              canViewDetail={hasPermissions(pipeline, 'viewDetail')}
              canEdit={hasPermissions(pipeline, 'update')}
            />

            <Row>
              <Col lg={12}>
                <Callout variant="warning">
                  <h4>
                    <FormattedMessage id="app.editPipeline.disclaimer" defaultMessage="Disclaimer" />
                  </h4>
                  <p>
                    <FormattedMessage
                      id="app.editPipeline.disclaimerWarning"
                      defaultMessage="Modifying the pipeline might break all exercises using the pipeline!"
                    />
                  </p>
                </Callout>
              </Col>
            </Row>

            <Row>
              <Col lg={12}>
                <PipelineEditContainer pipeline={pipeline} />
              </Col>
            </Row>

            <Row>
              <Col xl={6}>
                <PipelineFilesTableContainer pipeline={pipeline} />
              </Col>
            </Row>
          </>
        )}
      </Page>
    );
  }
}

EditPipeline.propTypes = {
  pipeline: ImmutablePropTypes.map,
  loadAsync: PropTypes.func.isRequired,
  params: PropTypes.shape({
    pipelineId: PropTypes.string.isRequired,
  }).isRequired,
};

export default connect(
  (state, { params: { pipelineId } }) => {
    return {
      pipeline: getPipeline(pipelineId)(state),
    };
  },
  (dispatch, { params: { pipelineId } }) => ({
    loadAsync: () => EditPipeline.loadAsync({ pipelineId }, dispatch),
  })
)(EditPipeline);
