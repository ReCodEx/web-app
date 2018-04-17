import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import Button from '../../components/widgets/FlatButton';
import { push } from 'react-router-redux';
import { LinkContainer } from 'react-router-bootstrap';
import { ButtonGroup } from 'react-bootstrap';

import SearchContainer from '../../containers/SearchContainer';
import DeletePipelineButtonContainer from '../../containers/DeletePipelineButtonContainer';
import PageContent from '../../components/layout/PageContent';
import Box from '../../components/widgets/Box';
import { canEditPipeline } from '../../redux/selectors/users';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { AddIcon, EditIcon } from '../../components/icons';
import { create as createPipeline } from '../../redux/modules/pipelines';
import { searchPipelines } from '../../redux/modules/search';
import PipelinesList from '../../components/Pipelines/PipelinesList';

import withLinks from '../../helpers/withLinks';
import { getSearchQuery } from '../../redux/selectors/search';

class Pipelines extends Component {
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
    const {
      isAuthorOfPipeline,
      search,
      query,
      links: { PIPELINE_EDIT_URI_FACTORY }
    } = this.props;

    return (
      <PageContent
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
                <AddIcon gapRight />
                <FormattedMessage
                  id="app.pipelines.add"
                  defaultMessage="Add pipeline"
                />
              </Button>
            </p>
          }
          unlimitedHeight
        >
          <SearchContainer
            type="pipelines"
            id="pipelines-page"
            search={search}
            showAllOnEmptyQuery={true}
            renderList={pipelines =>
              <PipelinesList
                pipelines={pipelines}
                createActions={id =>
                  isAuthorOfPipeline(id) &&
                  <ButtonGroup>
                    <LinkContainer to={PIPELINE_EDIT_URI_FACTORY(id)}>
                      <Button bsSize="xs" bsStyle="warning">
                        <EditIcon gapRight />
                        <FormattedMessage
                          id="generic.edit"
                          defaultMessage="Edit"
                        />
                      </Button>
                    </LinkContainer>
                    <DeletePipelineButtonContainer
                      id={id}
                      bsSize="xs"
                      resourceless={true}
                      onDeleted={() => search(query)}
                    />
                  </ButtonGroup>}
              />}
          />
        </Box>
      </PageContent>
    );
  }
}

Pipelines.propTypes = {
  createPipeline: PropTypes.func.isRequired,
  isAuthorOfPipeline: PropTypes.func.isRequired,
  push: PropTypes.func.isRequired,
  links: PropTypes.object.isRequired,
  search: PropTypes.func,
  query: PropTypes.string
};

export default withLinks(
  connect(
    state => {
      const userId = loggedInUserIdSelector(state);

      return {
        isAuthorOfPipeline: pipelineId =>
          canEditPipeline(userId, pipelineId)(state),
        query: getSearchQuery('pipelines-page')(state)
      };
    },
    dispatch => ({
      push: url => dispatch(push(url)),
      createPipeline: () => dispatch(createPipeline()),
      search: query => dispatch(searchPipelines()('pipelines-page', query))
    })
  )(Pipelines)
);
