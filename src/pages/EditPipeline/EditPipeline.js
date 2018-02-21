import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { Row, Col, Alert } from 'react-bootstrap';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { reset, formValueSelector } from 'redux-form';

import Page from '../../components/layout/Page';
import Box from '../../components/widgets/Box';

import EditPipelineForm from '../../components/forms/EditPipelineForm';
import PipelineFilesTableContainer from '../../containers/PipelineFilesTableContainer';
import DeletePipelineButtonContainer from '../../containers/DeletePipelineButtonContainer';

import {
  fetchPipelineIfNeeded,
  editPipeline
} from '../../redux/modules/pipelines';
import { getPipeline } from '../../redux/selectors/pipelines';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { getBoxTypes } from '../../redux/selectors/boxes';

import withLinks from '../../helpers/withLinks';
import {
  transformPipelineDataForApi,
  extractVariables
} from '../../helpers/boxes';

class EditPipeline extends Component {
  componentWillMount = () => this.props.loadAsync();
  componentWillReceiveProps = props => {
    if (this.props.params.pipelineId !== props.params.pipelineId) {
      props.reset();
      props.loadAsync();
    }
  };

  static loadAsync = ({ pipelineId }, dispatch) =>
    Promise.all([dispatch(fetchPipelineIfNeeded(pipelineId))]);

  render() {
    const {
      links: { PIPELINES_URI, PIPELINE_URI_FACTORY },
      params: { pipelineId },
      pipeline,
      boxTypes,
      editPipeline,
      push,
      variables: extractedVariables
    } = this.props;

    return (
      <Page
        resource={pipeline}
        title={pipeline => pipeline.name}
        description={
          <FormattedMessage
            id="app.editPipeline.description"
            defaultMessage="Change pipeline settings"
          />
        }
        breadcrumbs={[
          {
            text: (
              <FormattedMessage
                id="app.pipeline.title"
                defaultMessage="Pipeline"
              />
            ),
            iconName: 'random',
            link: PIPELINE_URI_FACTORY(pipelineId)
          },
          {
            text: (
              <FormattedMessage
                id="app.editPipeline.title"
                defaultMessage="Edit pipeline"
              />
            ),
            iconName: 'pencil'
          }
        ]}
      >
        {({ pipeline: { boxes, variables }, ...data }) =>
          <div>
            <Row>
              <Col lg={12}>
                <Alert bsStyle="warning">
                  <h4>
                    <FormattedMessage
                      id="app.editPipeline.disclaimer"
                      defaultMessage="Disclaimer"
                    />
                  </h4>
                  <p>
                    <FormattedMessage
                      id="app.editPipeline.disclaimerWarning"
                      defaultMessage="Modifying the pipeline might break all exercises using the pipeline!"
                    />
                  </p>
                </Alert>
              </Col>
            </Row>
            <Row>
              <Col lg={12}>
                <Row>
                  <Col lg={12}>
                    <EditPipelineForm
                      initialValues={{
                        ...data,
                        pipeline: {
                          boxes,
                          variables: variables.reduce(
                            (acc, variable) => ({
                              ...acc,
                              [btoa(variable.name)]: variable.value
                            }),
                            {}
                          )
                        }
                      }}
                      onSubmit={({ pipeline, ...formData }) =>
                        editPipeline(data.version, {
                          pipeline: transformPipelineDataForApi(
                            boxTypes,
                            pipeline,
                            extractedVariables
                          ),
                          ...formData
                        })}
                      pipeline={data}
                    />
                  </Col>
                </Row>
              </Col>
              <Col lg={6}>
                <div />
              </Col>
            </Row>
            <Row>
              <Col lg={6}>
                <PipelineFilesTableContainer pipeline={data} />
              </Col>
            </Row>
            <Row>
              <Col lg={12}>
                <Box
                  type="danger"
                  title={
                    <FormattedMessage
                      id="app.editPipeline.delete"
                      defaultMessage="Delete the pipeline"
                    />
                  }
                >
                  <div>
                    <p>
                      <FormattedMessage
                        id="app.editPipeline.deleteWarning"
                        defaultMessage="Deleting an pipeline will break all exercises using the pipeline."
                      />
                    </p>
                    <p className="text-center">
                      <DeletePipelineButtonContainer
                        id={data.id}
                        onDeleted={() => push(PIPELINES_URI)}
                      />
                    </p>
                  </div>
                </Box>
              </Col>
            </Row>
          </div>}
      </Page>
    );
  }
}

EditPipeline.propTypes = {
  pipeline: ImmutablePropTypes.map,
  loadAsync: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  editPipeline: PropTypes.func.isRequired,
  params: PropTypes.shape({
    pipelineId: PropTypes.string.isRequired
  }).isRequired,
  links: PropTypes.object.isRequired,
  boxTypes: PropTypes.array.isRequired,
  push: PropTypes.func.isRequired,
  variables: PropTypes.array
};

export default withLinks(
  connect(
    (state, { params: { pipelineId } }) => {
      return {
        pipeline: getPipeline(pipelineId)(state),
        boxTypes: getBoxTypes(state),
        userId: loggedInUserIdSelector(state),
        variables: extractVariables(
          formValueSelector('editPipeline')(state, 'pipeline.boxes')
        )
      };
    },
    (dispatch, { params: { pipelineId } }) => ({
      push: url => dispatch(push(url)),
      reset: () => dispatch(reset('editPipeline')),
      loadAsync: () => EditPipeline.loadAsync({ pipelineId }, dispatch),
      editPipeline: (version, data) =>
        dispatch(editPipeline(pipelineId, { ...data, version }))
    })
  )(EditPipeline)
);
