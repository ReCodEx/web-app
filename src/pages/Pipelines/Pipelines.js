import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import Button from '../../components/widgets/FlatButton';
import { push } from 'react-router-redux';

import Page from '../../components/layout/Page';
import Box from '../../components/widgets/Box';
import { AddIcon } from '../../components/icons';
import { pipelinesSelector } from '../../redux/selectors/pipelines';
import {
  fetchPipelines,
  create as createPipeline
} from '../../redux/modules/pipelines';
import PipelinesList from '../../components/Pipelines/PipelinesList';

import withLinks from '../../hoc/withLinks';

class Pipelines extends Component {
  static loadAsync = (params, dispatch) =>
    Promise.all([dispatch(fetchPipelines())]);

  componentWillMount() {
    this.props.loadAsync();
  }

  newPipeline = () => {
    const {
      createPipeline,
      push,
      links: { PIPELINE_EDIT_URI_FACTORY }
    } = this.props;
    createPipeline().then(({ value: pipeline }) =>
      push(PIPELINE_EDIT_URI_FACTORY(pipeline.id))
    );
  };

  render() {
    const { pipelines } = this.props;

    return (
      <Page
        resource={pipelines.toArray()}
        title={
          <FormattedMessage
            id="app.pipelines.title"
            defaultMessage="Pipeline list"
          />
        }
        description={
          <FormattedMessage
            id="app.pipelines.description"
            defaultMessage="List and modify available pipelines."
          />
        }
        breadcrumbs={[
          {
            text: (
              <FormattedMessage
                id="app.pipelines.title"
                defaultMessage="Pipeline list"
              />
            ),
            iconName: 'random'
          }
        ]}
      >
        {(...pipelines) =>
          <div>
            <Box
              title={
                <FormattedMessage
                  id="app.pipelines.listTitle"
                  defaultMessage="Pipelines"
                />
              }
              footer={
                <p className="text-center">
                  <Button
                    bsStyle="success"
                    className="btn-flat"
                    bsSize="sm"
                    onClick={() => {
                      this.newPipeline();
                    }}
                  >
                    <AddIcon />{' '}
                    <FormattedMessage
                      id="app.pipelines.add"
                      defaultMessage="Add pipeline"
                    />
                  </Button>
                </p>
              }
              noPadding
              unlimitedHeight
            >
              <PipelinesList pipelines={pipelines} />
            </Box>
          </div>}
      </Page>
    );
  }
}

Pipelines.propTypes = {
  loadAsync: PropTypes.func.isRequired,
  pipelines: ImmutablePropTypes.map,
  createPipeline: PropTypes.func.isRequired,
  push: PropTypes.func.isRequired,
  links: PropTypes.object.isRequired
};

export default withLinks(
  connect(
    state => ({
      pipelines: pipelinesSelector(state)
    }),
    dispatch => ({
      push: url => dispatch(push(url)),
      createPipeline: () => dispatch(createPipeline()),
      loadAsync: () => Pipelines.loadAsync({}, dispatch)
    })
  )(Pipelines)
);
