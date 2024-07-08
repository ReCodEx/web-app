import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { lruMemoize } from 'reselect';

import Button, { TheButtonGroup } from '../../components/widgets/TheButton';
import PaginationContainer, { createSortingIcon, showRangeInfo } from '../../containers/PaginationContainer';
import SimpleTextSearch from '../../components/helpers/SimpleTextSearch';
import DeletePipelineButtonContainer from '../../containers/DeletePipelineButtonContainer';
import PageContent from '../../components/layout/PageContent';
import Box from '../../components/widgets/Box';
import { canEditPipeline } from '../../redux/selectors/users.js';
import { loggedInUserIdSelector } from '../../redux/selectors/auth.js';
import { AddIcon, EditIcon, PipelineIcon } from '../../components/icons';
import { create as createPipeline } from '../../redux/modules/pipelines.js';
import PipelinesList from '../../components/Pipelines/PipelinesList';

import withLinks from '../../helpers/withLinks.js';
import { withRouterProps } from '../../helpers/withRouter.js';
import { suspendAbortPendingRequestsOptimization } from '../../pages/routes.js';

const submitHandler = lruMemoize(setFilters => search => {
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
      navigate,
      links: { PIPELINE_EDIT_URI_FACTORY },
    } = this.props;
    createPipeline().then(({ value: pipeline }) => {
      suspendAbortPendingRequestsOptimization();
      navigate(PIPELINE_EDIT_URI_FACTORY(pipeline.id));
    });
  };

  render() {
    const {
      isAuthorOfPipeline,
      links: { PIPELINE_EDIT_URI_FACTORY },
    } = this.props;

    return (
      <PageContent
        icon={<PipelineIcon />}
        title={<FormattedMessage id="app.pipelines.title" defaultMessage="List of All Pipelines" />}>
        <Box
          title={<FormattedMessage id="app.pipelines.listTitle" defaultMessage="Pipelines" />}
          footer={
            <div className="text-center">
              <Button
                variant="success"
                size="sm"
                onClick={() => {
                  this.newPipeline();
                }}>
                <AddIcon gapRight />
                <FormattedMessage id="app.pipelines.createNew" defaultMessage="Create New Pipeline" />
              </Button>
            </div>
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
                    <TheButtonGroup>
                      <Link to={PIPELINE_EDIT_URI_FACTORY(id)}>
                        <Button size="xs" variant="warning">
                          <EditIcon gapRight />
                          <FormattedMessage id="generic.edit" defaultMessage="Edit" />
                        </Button>
                      </Link>
                      <DeletePipelineButtonContainer id={id} size="xs" resourceless={true} onDeleted={() => reload()} />
                    </TheButtonGroup>
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
  createPipeline: PropTypes.func.isRequired,
  isAuthorOfPipeline: PropTypes.func.isRequired,
  links: PropTypes.object.isRequired,
  navigate: withRouterProps.navigate,
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
