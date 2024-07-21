import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import { reset } from 'redux-form';
import { lruMemoize } from 'reselect';

import Page from '../../components/layout/Page';
import { PipelineNavigation } from '../../components/layout/Navigation';
import Box from '../../components/widgets/Box';
import Callout from '../../components/widgets/Callout';
import EditPipelineForm from '../../components/forms/EditPipelineForm';
import EditPipelineEnvironmentsForm from '../../components/forms/EditPipelineEnvironmentsForm';
import { EditIcon } from '../../components/icons';
import DeletePipelineButtonContainer from '../../containers/DeletePipelineButtonContainer';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';

import { fetchPipelineIfNeeded, editPipeline, setPipelineRuntimeEnvironments } from '../../redux/modules/pipelines.js';
import { fetchBoxTypes } from '../../redux/modules/boxes.js';
import { fetchRuntimeEnvironments } from '../../redux/modules/runtimeEnvironments.js';
import { getPipeline } from '../../redux/selectors/pipelines.js';
import { runtimeEnvironmentsSelector } from '../../redux/selectors/runtimeEnvironments.js';
import { isLoggedAsSuperAdmin } from '../../redux/selectors/users.js';

import { arrayToObject, hasPermissions } from '../../helpers/common.js';
import withLinks from '../../helpers/withLinks.js';
import { withRouterProps } from '../../helpers/withRouter.js';

// convert pipeline data into initial structure for pipeline edit metadata form
const perpareInitialPipelineData = ({ name, description, version, parameters, author }) => ({
  name,
  description,
  version,
  parameters,
  global: author === null,
});

// get selected runtimes and all runtimes and prepare object for environment selection form
const perpareInitialEnvironmentsData = lruMemoize((selectedIds, runtimeEnvironments) =>
  arrayToObject(
    runtimeEnvironments.map(rte => rte.id),
    id => id,
    id => selectedIds.includes(id)
  )
);

class EditPipeline extends Component {
  componentDidMount() {
    this.props.loadAsync();
  }

  componentDidUpdate(prevProps) {
    if (this.props.params.pipelineId !== prevProps.params.pipelineId) {
      this.props.reset();
      this.props.loadAsync();
    }
  }

  static loadAsync = ({ pipelineId }, dispatch) =>
    Promise.all([
      dispatch(fetchPipelineIfNeeded(pipelineId)),
      dispatch(fetchRuntimeEnvironments()),
      dispatch(fetchBoxTypes()),
    ]);

  // save pipeline metadata (not the structure)
  savePipeline = ({
    name,
    description,
    version,
    parameters: {
      isCompilationPipeline = false,
      isExecutionPipeline = false,
      judgeOnlyPipeline = false,
      producesStdout = false,
      producesFiles = false,
      hasEntryPoint = false,
      hasExtraFiles = false,
      hasSuccessExitCodes = false,
    },
    global,
  }) => {
    const dataForApi = { name, description, version };
    if (this.props.isSuperadmin) {
      dataForApi.parameters = {
        isCompilationPipeline,
        isExecutionPipeline,
        judgeOnlyPipeline,
        producesStdout,
        producesFiles,
        hasEntryPoint,
        hasExtraFiles,
        hasSuccessExitCodes,
      };
      dataForApi.global = global;
    }
    return this.props.editPipeline(dataForApi);
  };

  // save associations between pipeline and runtime environments
  saveEnvironments = formData =>
    this.props.setPipelineRuntimeEnvironments(Object.keys(formData).filter(id => formData[id]));

  render() {
    const {
      links: { PIPELINES_URI },
      navigate,
      pipeline,
      runtimeEnvironments,
      isSuperadmin,
    } = this.props;

    return (
      <Page
        resource={pipeline}
        icon={<EditIcon />}
        title={<FormattedMessage id="app.editPipeline.title" defaultMessage="Update Pipeline Settings" />}>
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
              <Col lg={6}>
                <EditPipelineForm
                  initialValues={perpareInitialPipelineData(pipeline)}
                  onSubmit={this.savePipeline}
                  isSuperadmin={isSuperadmin}
                />
              </Col>
              <Col lg={6}>
                {isSuperadmin && (
                  <ResourceRenderer resourceArray={runtimeEnvironments}>
                    {environments => (
                      <EditPipelineEnvironmentsForm
                        initialValues={perpareInitialEnvironmentsData(pipeline.runtimeEnvironmentIds, environments)}
                        onSubmit={this.saveEnvironments}
                        runtimeEnvironments={environments}
                      />
                    )}
                  </ResourceRenderer>
                )}
              </Col>
            </Row>

            <Row>
              <Col lg={12}>
                <Box
                  type="danger"
                  title={<FormattedMessage id="app.editPipeline.delete" defaultMessage="Delete the pipeline" />}>
                  <Row className="align-items-center">
                    <Col xs={false} sm="auto">
                      <DeletePipelineButtonContainer
                        id={pipeline.id}
                        size="lg"
                        className="m-2"
                        onDeleted={() => navigate(PIPELINES_URI, { replace: true })}
                      />
                    </Col>
                    <Col xs={12} sm className="text-muted">
                      <FormattedMessage
                        id="app.editPipeline.deleteWarning"
                        defaultMessage="Deleting an pipeline will break all exercises using the pipeline."
                      />
                    </Col>
                  </Row>
                </Box>
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
  runtimeEnvironments: ImmutablePropTypes.map.isRequired,
  isSuperadmin: PropTypes.bool.isRequired,
  loadAsync: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  editPipeline: PropTypes.func.isRequired,
  setPipelineRuntimeEnvironments: PropTypes.func.isRequired,
  params: PropTypes.shape({
    pipelineId: PropTypes.string.isRequired,
  }).isRequired,
  links: PropTypes.object.isRequired,
  navigate: withRouterProps.navigate,
};

export default withLinks(
  connect(
    (state, { params: { pipelineId } }) => {
      return {
        pipeline: getPipeline(pipelineId)(state),
        runtimeEnvironments: runtimeEnvironmentsSelector(state),
        isSuperadmin: isLoggedAsSuperAdmin(state),
      };
    },
    (dispatch, { params: { pipelineId } }) => ({
      reset: () => dispatch(reset('editPipeline')),
      loadAsync: () => EditPipeline.loadAsync({ pipelineId }, dispatch),
      editPipeline: data => dispatch(editPipeline(pipelineId, data)),
      setPipelineRuntimeEnvironments: environments =>
        dispatch(setPipelineRuntimeEnvironments(pipelineId, environments)),
    })
  )(EditPipeline)
);
