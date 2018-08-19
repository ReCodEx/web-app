import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { push } from 'react-router-redux';

import Page from '../../components/layout/Page';
import Box from '../../components/widgets/Box';

import withLinks from '../../helpers/withLinks';
import { fetchAllGroups } from '../../redux/modules/groups';
import { fetchInstancesIfNeeded } from '../../redux/modules/instances';
import { selectedInstanceId } from '../../redux/selectors/auth';
import { selectedInstance } from '../../redux/selectors/instances';
import { groupsSelector } from '../../redux/selectors/groups';
import GroupTree from '../../components/Groups/GroupTree';

class Archive extends Component {
  static loadAsync = (params, dispatch, { instanceId }) =>
    Promise.all([
      dispatch(fetchInstancesIfNeeded(instanceId)),
      dispatch(fetchAllGroups())
    ]);

  componentWillMount() {
    this.props.loadAsync(this.props.instanceId);
  }

  render() {
    const { instance, groups } = this.props;

    return (
      <Page
        resource={instance}
        title={
          <FormattedMessage id="app.archive.title" defaultMessage="Archive" />
        }
        description={
          <FormattedMessage
            id="app.archive.description"
            defaultMessage="List of archived groups."
          />
        }
        breadcrumbs={[
          {
            text: (
              <FormattedMessage
                id="app.archive.title"
                defaultMessage="Archive"
              />
            ),
            iconName: 'archive'
          }
        ]}
      >
        {data =>
          <Box
            title={
              <FormattedMessage
                id="app.archive.archivedGroups"
                defaultMessage="All Groups Including Archived"
              />
            }
            unlimitedHeight
          >
            {data.rootGroupId !== null &&
              <GroupTree
                id={data.rootGroupId}
                isAdmin={false}
                groups={groups}
              />}
          </Box>}
      </Page>
    );
  }
}

Archive.propTypes = {
  loadAsync: PropTypes.func.isRequired,
  push: PropTypes.func.isRequired,
  links: PropTypes.object.isRequired,
  instanceId: PropTypes.string.isRequired,
  instance: ImmutablePropTypes.map,
  groups: ImmutablePropTypes.map
};

export default withLinks(
  connect(
    state => {
      return {
        instanceId: selectedInstanceId(state),
        instance: selectedInstance(state),
        groups: groupsSelector(state)
      };
    },
    dispatch => ({
      loadAsync: instanceId => Archive.loadAsync({}, dispatch, { instanceId }),
      push: url => dispatch(push(url))
    })
  )(Archive)
);
