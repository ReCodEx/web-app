import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { lruMemoize } from 'reselect';

import Page from '../../components/layout/Page';
import Box from '../../components/widgets/Box';
import Button, { TheButtonGroup } from '../../components/widgets/TheButton';
import GroupsTreeContainer from '../../containers/GroupsTreeContainer';
import withLinks from '../../helpers/withLinks.js';
import FilterArchiveGroupsForm from '../../components/forms/FilterArchiveGroupsForm/FilterArchiveGroupsForm.js';
import { getLocalizedName } from '../../helpers/localizedData.js';
import ArchiveGroupButtonContainer from '../../containers/ArchiveGroupButtonContainer/ArchiveGroupButtonContainer.js';
import { ArchiveIcon, GroupIcon, SuccessOrFailureIcon, AssignmentsIcon, StudentsIcon } from '../../components/icons';

import { fetchAllGroups } from '../../redux/modules/groups.js';
import { fetchInstancesIfNeeded } from '../../redux/modules/instances.js';
import { fetchByIds } from '../../redux/modules/users.js';
import { selectedInstanceId } from '../../redux/selectors/auth.js';
import { selectedInstance } from '../../redux/selectors/instances.js';
import { getGroupsAdmins } from '../../redux/selectors/groups.js';
import { hasPermissions } from '../../helpers/common.js';

// lowercase and remove accents and this kind of stuff
const normalizeString = str =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const prepareGroupsFilter = lruMemoize((search, showAll, locale) => {
  search = normalizeString(search);
  return group => (showAll || group.archived) && (!search || getLocalizedName(group, locale).includes(search));
});

class Archive extends Component {
  state = { showAll: false, search: '', selectedGroup: null };

  static customLoadGroups = true; // Marker for the App async load, that we will load groups ourselves.

  static loadAsync = (params, dispatch, { instanceId }) =>
    Promise.all([
      dispatch(fetchInstancesIfNeeded(instanceId)),
      dispatch(fetchAllGroups({ archived: true })).then(({ value: groups }) =>
        dispatch(fetchByIds(getGroupsAdmins(groups)))
      ),
    ]);

  componentDidMount() {
    this.props.loadAsync(this.props.instanceId);
  }

  buttonsCreator = (
    group,
    selectedGroupId,
    { GROUP_INFO_URI_FACTORY, GROUP_ASSIGNMENTS_URI_FACTORY, GROUP_STUDENTS_URI_FACTORY }
  ) => {
    const { instanceId, loadAsync } = this.props;

    return (
      <TheButtonGroup>
        <Button
          variant="outline-secondary"
          size="xs"
          onClick={ev => {
            ev.stopPropagation();
            this.setState({ selectedGroup: selectedGroupId !== group.id ? group.id : null });
          }}>
          <SuccessOrFailureIcon success={selectedGroupId !== group.id} gapRight />
          {selectedGroupId !== group.id ? (
            <FormattedMessage id="app.group.setRoot" defaultMessage="Select" />
          ) : (
            <FormattedMessage id="app.group.unsetRoot" defaultMessage="Unset" />
          )}
        </Button>

        {hasPermissions(group, 'viewDetail') && (
          <Link to={GROUP_INFO_URI_FACTORY(group.id)}>
            <Button variant="primary" size="xs">
              <GroupIcon gapRight />
              <FormattedMessage id="app.group.info" defaultMessage="Group Info" />
            </Button>
          </Link>
        )}

        {hasPermissions(group, 'viewAssignments') && (
          <Link to={GROUP_ASSIGNMENTS_URI_FACTORY(group.id)}>
            <Button variant="primary" size="xs">
              <AssignmentsIcon gapRight />
              <FormattedMessage id="app.group.assignments" defaultMessage="Assignments" />
            </Button>
          </Link>
        )}

        {!group.organizational && hasPermissions(group, 'viewAssignments') && (
          <Link to={GROUP_STUDENTS_URI_FACTORY(group.id)}>
            <Button variant="primary" size="xs">
              <StudentsIcon gapRight />
              <FormattedMessage id="app.group.students" defaultMessage="Students" />
            </Button>
          </Link>
        )}

        {hasPermissions(group, 'archive') && (!group.archived || group.directlyArchived) && (
          <ArchiveGroupButtonContainer id={group.id} size="xs" shortLabels onChange={() => loadAsync(instanceId)} />
        )}
      </TheButtonGroup>
    );
  };

  render() {
    const {
      instance,
      intl: { locale },
    } = this.props;

    return (
      <Page
        resource={instance}
        icon={<ArchiveIcon />}
        title={<FormattedMessage id="app.archive.title" defaultMessage="List of Old Archived Groups" />}>
        {data => (
          <Box
            title={
              <FormattedMessage
                id="app.archive.archivedGroups"
                defaultMessage="All Groups Including The Archived Ones"
              />
            }
            unlimitedHeight>
            <>
              <FilterArchiveGroupsForm
                form="archive-filters"
                initialValues={{
                  showAll: this.state.showAll,
                  search: this.state.search,
                }}
                onSubmit={data => {
                  this.setState({
                    showAll: Boolean(data.showAll),
                    search: data.search || '',
                  });
                  return Promise.resolve();
                }}
              />

              {data.rootGroupId !== null && (
                <GroupsTreeContainer
                  showArchived
                  buttonsCreator={this.buttonsCreator}
                  selectedGroupId={this.state.selectedGroup}
                  groupsFilter={prepareGroupsFilter(this.state.search, this.state.showAll, locale)}
                />
              )}
            </>
          </Box>
        )}
      </Page>
    );
  }
}

Archive.propTypes = {
  loadAsync: PropTypes.func.isRequired,
  links: PropTypes.object.isRequired,
  instanceId: PropTypes.string.isRequired,
  instance: ImmutablePropTypes.map,
  intl: PropTypes.object,
};

export default withLinks(
  connect(
    state => {
      return {
        instanceId: selectedInstanceId(state),
        instance: selectedInstance(state),
      };
    },
    dispatch => ({
      loadAsync: instanceId => Archive.loadAsync({}, dispatch, { instanceId }),
    })
  )(injectIntl(Archive))
);
