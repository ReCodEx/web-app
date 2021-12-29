import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import { fetchPipelineIfNeeded } from '../../redux/modules/pipelines';
import { getPipeline } from '../../redux/selectors/pipelines';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import { LoadingIcon } from '../../components/icons';
import withLinks from '../../helpers/withLinks';

class PipelineNameContainer extends Component {
  componentDidMount = () => this.props.loadPipelineIfNeeded();

  componentDidUpdate(prevProps) {
    if (this.props.pipelineId !== prevProps.pipelineId) {
      this.props.loadPipelineIfNeeded();
    }
  }

  render() {
    const {
      pipelineId,
      pipeline,
      noLink = false,
      links: { PIPELINE_URI_FACTORY },
    } = this.props;
    return (
      <ResourceRenderer
        resource={pipeline}
        loading={
          <>
            <LoadingIcon gapRight />
            <FormattedMessage id="generic.loading" defaultMessage="Loading..." />
          </>
        }>
        {pipeline =>
          noLink ? <>{pipeline.name}</> : <Link to={PIPELINE_URI_FACTORY(pipelineId)}>{pipeline.name}</Link>
        }
      </ResourceRenderer>
    );
  }
}

PipelineNameContainer.propTypes = {
  pipelineId: PropTypes.string.isRequired,
  pipeline: ImmutablePropTypes.map,
  noLink: PropTypes.bool,
  loadPipelineIfNeeded: PropTypes.func.isRequired,
  links: PropTypes.object.isRequired,
};

export default withLinks(
  connect(
    (state, { pipelineId }) => ({
      pipeline: getPipeline(pipelineId)(state),
    }),
    (dispatch, { pipelineId }) => ({
      loadPipelineIfNeeded: () => dispatch(fetchPipelineIfNeeded(pipelineId)),
    })
  )(PipelineNameContainer)
);
