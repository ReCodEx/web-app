import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { push } from 'react-router-redux';

import Page from '../../components/layout/Page';
import Box from '../../components/widgets/Box';

import { LinkContainer } from 'react-router-bootstrap';
import Button from '../../components/widgets/FlatButton';
import withLinks from '../../helpers/withLinks';
import { fetchAllGroups } from '../../redux/modules/groups';
import { fetchInstancesIfNeeded } from '../../redux/modules/instances';
import { selectedInstanceId } from '../../redux/selectors/auth';
import { selectedInstance } from '../../redux/selectors/instances';
import { groupsSelector } from '../../redux/selectors/groups';
import GroupTree from '../../components/Groups/GroupTree';
import { getJsData } from '../../redux/helpers/resourceManager';
import FilterArchiveGroupsForm from '../../components/forms/FilterArchiveGroupsForm/FilterArchiveGroupsForm';
import { getLocalizedName } from '../../helpers/localizedData';
import ArchiveGroupButtonContainer from '../../containers/ArchiveGroupButtonContainer/ArchiveGroupButtonContainer';
import { GroupIcon, SuccessOrFailureIcon } from '../../components/icons';

// lowercase and remove accents and this kind of stuff
const normalizeString = str =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const getVisibleArchiveGroupsMap = (groups, showAll, search, locale, rootGroup) => {
  var result = {};
  const groupArray = groups.toArray();

  // first mark all possibly visible
  groupArray.forEach(groupObj => {
    const group = getJsData(groupObj);
    const rootGroupIncludes =
      rootGroup === null ? true : group.parentGroupsIds.includes(rootGroup) || rootGroup === group.id;
    if (showAll || group.archived) {
      result[group.id] = rootGroupIncludes;
    }
  });

  // then remove that not matching search pattern
  groupArray.forEach(groupObj => {
    const group = getJsData(groupObj);
    if (result[group.id] && search && search !== '') {
      const name = getLocalizedName(group, locale);
      result[group.id] = normalizeString(name).indexOf(normalizeString(search)) !== -1;
    }
  });

  // and finally add parent groups of selected ones
  groupArray.forEach(groupObj => {
    const group = getJsData(groupObj);
    if (result[group.id]) {
      group.parentGroupsIds.forEach(parentGroupId => {
        result[parentGroupId] = true;
      });
    }
  });

  return result;
};

class Archive extends Component {
  state = { showAll: false, search: '', rootGroup: null };

  static loadAsync = (params, dispatch, { instanceId }) =>
    Promise.all([dispatch(fetchInstancesIfNeeded(instanceId)), dispatch(fetchAllGroups({ archived: true }))]);

  componentDidMount() {
    this.props.loadAsync(this.props.instanceId);
  }

  buttonsCreator = (groupId, isRoot) => {
    const {
      instanceId,
      loadAsync,
      links: { GROUP_INFO_URI_FACTORY, GROUP_DETAIL_URI_FACTORY },
    } = this.props;

    return (
      <span>
        <Button
          bsStyle="default"
          bsSize="xs"
          onClick={ev => {
            ev.stopPropagation();
            this.setState({ rootGroup: isRoot ? null : groupId });
          }}>
          <SuccessOrFailureIcon success={!isRoot} gapRight />
          {isRoot ? (
            <FormattedMessage id="app.group.unsetRoot" defaultMessage="Unset" />
          ) : (
            <FormattedMessage id="app.group.setRoot" defaultMessage="Select" />
          )}
        </Button>
        <LinkContainer to={GROUP_INFO_URI_FACTORY(groupId)}>
          <Button bsStyle="primary" bsSize="xs">
            <GroupIcon gapRight />
            <FormattedMessage id="app.group.info" defaultMessage="Group Info" />
          </Button>
        </LinkContainer>
        <LinkContainer to={GROUP_DETAIL_URI_FACTORY(groupId)}>
          <Button bsStyle="primary" bsSize="xs">
            <GroupIcon gapRight />
            <FormattedMessage id="app.group.detail" defaultMessage="Group Detail" />
          </Button>
        </LinkContainer>
        <ArchiveGroupButtonContainer id={groupId} bsSize="xs" shortLabels onChange={() => loadAsync(instanceId)} />
      </span>
    );
  };

  render() {
    const {
      instance,
      groups,
      intl: { locale },
    } = this.props;

    return (
      <Page
        resource={instance}
        title={<FormattedMessage id="app.archive.title" defaultMessage="Archive" />}
        description={<FormattedMessage id="app.archive.description" defaultMessage="List of archived groups." />}
        breadcrumbs={[
          {
            text: <FormattedMessage id="app.archive.title" defaultMessage="Archive" />,
            iconName: 'archive',
          },
        ]}>
        {data => (
          <Box
            title={<FormattedMessage id="app.archive.archivedGroups" defaultMessage="All Groups Including Archived" />}
            unlimitedHeight>
            <React.Fragment>
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
                <GroupTree
                  id={data.rootGroupId}
                  isAdmin={false}
                  groups={groups}
                  visibleGroupsMap={getVisibleArchiveGroupsMap(
                    groups,
                    this.state.showAll,
                    this.state.search,
                    locale,
                    this.state.rootGroup
                  )}
                  buttonsCreator={this.buttonsCreator}
                  currentGroupId={this.state.rootGroup}
                  forceRootButtons={true}
                />
              )}
            </React.Fragment>
          </Box>
        )}
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
  groups: ImmutablePropTypes.map,
  intl: intlShape,
};

export default withLinks(
  connect(
    state => {
      return {
        instanceId: selectedInstanceId(state),
        instance: selectedInstance(state),
        groups: groupsSelector(state),
      };
    },
    dispatch => ({
      loadAsync: instanceId => Archive.loadAsync({}, dispatch, { instanceId }),
      push: url => dispatch(push(url)),
    })
  )(injectIntl(Archive))
);
