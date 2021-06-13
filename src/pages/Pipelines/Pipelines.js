import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import Button from '../../components/widgets/FlatButton';
import { LinkContainer } from 'react-router-bootstrap';
import { defaultMemoize } from 'reselect';

import App from '../../containers/App';
import PaginationContainer, { createSortingIcon, showRangeInfo } from '../../containers/PaginationContainer';
import SimpleTextSearch from '../../components/helpers/SimpleTextSearch';
import DeletePipelineButtonContainer from '../../containers/DeletePipelineButtonContainer';
import PageContent from '../../components/layout/PageContent';
import Box from '../../components/widgets/Box';
import { canEditPipeline } from '../../redux/selectors/users';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { AddIcon, EditIcon } from '../../components/icons';
import { create as createPipeline } from '../../redux/modules/pipelines';
import PipelinesList from '../../components/Pipelines/PipelinesList';

import withLinks from '../../helpers/withLinks';

const submitHandler = defaultMemoize(setFilters => search => {
  const filters = {};
  if (search && search.trim()) {
    filters.search = search.trim();
  }
  return setFilters(filters);
});

class Pipelines extends Component {
  headingCreator = ({ offset, limit, totalCount, orderByColumn, orderByDescending, setOrderBy }) => (
    <tr>
      <th className="shrink-col" />
      <th className="shrink-col" />
      <th className="shrink-col" />
      <th>
        <FormattedMessage id="generic.name" defaultMessage="Name" />
        {createSortingIcon('name', orderByColumn, orderByDescending, setOrderBy)}
      </th>
      <th>
        <FormattedMessage id="generic.author" defaultMessage="Author" />
      </th>
      <th>
        <FormattedMessage id="generic.created" defaultMessage="Created" />
        {createSortingIcon('createdAt', orderByColumn, orderByDescending, setOrderBy)}
      </th>
      <td>{showRangeInfo(offset, limit, totalCount)}</td>
    </tr>
  );

  newPipeline = () => {
    const {
      createPipeline,
      history: { push },
      links: { PIPELINE_EDIT_URI_FACTORY },
    } = this.props;
    createPipeline().then(({ value: pipeline }) => {
      App.ignoreNextLocationChange();
      push(PIPELINE_EDIT_URI_FACTORY(pipeline.id));
    });
  };

  render() {
    const {
      isAuthorOfPipeline,
      links: { PIPELINE_EDIT_URI_FACTORY },
    } = this.props;

    return (
      <PageContent
        title={<FormattedMessage id="app.pipelines.title" defaultMessage="Pipeline list" />}
        description={
          <FormattedMessage id="app.pipelines.description" defaultMessage="List and modify available pipelines." />
        }
        breadcrumbs={[
          {
            text: <FormattedMessage id="app.pipelines.title" defaultMessage="Pipeline list" />,
            iconName: 'random',
          },
        ]}>
        <Box
          title={<FormattedMessage id="app.pipelines.listTitle" defaultMessage="Pipelines" />}
          footer={
            <p className="text-center">
              <Button
                variant="success"
                className="btn-flat"
                size="sm"
                onClick={() => {
                  this.newPipeline();
                }}>
                <AddIcon gapRight />
                <FormattedMessage id="app.pipelines.createNew" defaultMessage="Create New Pipeline" />
              </Button>
            </p>
          }
          unlimitedHeight>
          <PaginationContainer
            id="pipelines-all"
            endpoint="pipelines"
            defaultOrderBy="name"
            filtersCreator={(filters, setFilters) => (
              <SimpleTextSearch
                query={filters.search || ''}
                isLoading={setFilters === null}
                onSubmit={submitHandler(setFilters)}
              />
            )}>
            {({ data, offset, limit, totalCount, orderByColumn, orderByDescending, setOrderBy, reload }) => (
              <PipelinesList
                pipelines={data}
                heading={this.headingCreator({
                  offset,
                  limit,
                  totalCount,
                  orderByColumn,
                  orderByDescending,
                  setOrderBy,
                })}
                createActions={id =>
                  isAuthorOfPipeline(id) && (
                    <div>
                      <LinkContainer to={PIPELINE_EDIT_URI_FACTORY(id)}>
                        <Button size="xs" variant="warning">
                          <EditIcon gapRight />
                          <FormattedMessage id="generic.edit" defaultMessage="Edit" />
                        </Button>
                      </LinkContainer>
                      <DeletePipelineButtonContainer id={id} size="xs" resourceless={true} onDeleted={() => reload()} />
                    </div>
                  )
                }
              />
            )}
          </PaginationContainer>
        </Box>
      </PageContent>
    );
  }
}

Pipelines.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
  }),
  createPipeline: PropTypes.func.isRequired,
  isAuthorOfPipeline: PropTypes.func.isRequired,
  links: PropTypes.object.isRequired,
};

export default withLinks(
  connect(
    state => {
      const userId = loggedInUserIdSelector(state);
      return {
        isAuthorOfPipeline: pipelineId => canEditPipeline(userId, pipelineId)(state),
      };
    },
    dispatch => ({
      createPipeline: () => dispatch(createPipeline()),
    })
  )(Pipelines)
);
