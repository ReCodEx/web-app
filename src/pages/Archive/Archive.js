import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { push } from 'react-router-redux';
import { Grid, Row, Col } from 'react-bootstrap';

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
import { getLocalizedName } from '../../helpers/getLocalizedData';
import ArchiveGroupButtonContainer from '../../containers/ArchiveGroupButtonContainer/ArchiveGroupButtonContainer';
import { GroupIcon, FailureIcon, SuccessIcon } from '../../components/icons';

// lowercase and remove accents and this kind of stuff
const normalizeString = str =>
  str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const getVisibleArchiveGroupsMap = (
  groups,
  showAll,
  search,
  locale,
  rootGroup
) => {
  var result = {};
  const groupArray = groups.toArray();

  // first mark all possibly visible
  groupArray.forEach(groupObj => {
    const group = getJsData(groupObj);
    const rootGroupIncludes =
      rootGroup === null
        ? true
        : group.parentGroupsIds.includes(rootGroup) || rootGroup === group.id;
    if (showAll || group.archived) {
      result[group.id] = rootGroupIncludes;
    }
  });

  // then remove that not matching search pattern
  groupArray.forEach(groupObj => {
    const group = getJsData(groupObj);
    if (result[group.id] && search && search !== '') {
      const name = getLocalizedName(group, locale);
      result[group.id] =
        normalizeString(name).indexOf(normalizeString(search)) !== -1;
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

const buttonsCreator = (
  { GROUP_INFO_URI_FACTORY, GROUP_DETAIL_URI_FACTORY },
  setRootGroup
) => groupId =>
  <span>
    <Button
      bsStyle="default"
      bsSize="xs"
      onClick={ev => {
        ev.stopPropagation();
        setRootGroup(groupId);
      }}
    >
      <SuccessIcon gapRight />
      <FormattedMessage
        id="app.group.setRoot"
        defaultMessage="Set Root Group"
      />
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
    <ArchiveGroupButtonContainer id={groupId} bsSize="xs" />
  </span>;

class Archive extends Component {
  state = { showAll: false, search: '', rootGroup: null };

  static loadAsync = (params, dispatch, { instanceId }) =>
    Promise.all([
      dispatch(fetchInstancesIfNeeded(instanceId)),
      dispatch(fetchAllGroups())
    ]);

  componentWillMount() {
    this.props.loadAsync(this.props.instanceId);
  }

  render() {
    const { instance, groups, intl: { locale }, links } = this.props;

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
                defaultMessage="Archived Groups"
              />
            }
            unlimitedHeight
          >
            <React.Fragment>
              <FilterArchiveGroupsForm
                form="archive-filters"
                initialValues={{ showAll: false, search: '' }}
                onSubmit={data => {
                  this.setState({
                    showAll: Boolean(data.showAll),
                    search: data.search || ''
                  });
                  return Promise.resolve();
                }}
              />
              <Grid fluid>
                <Row>
                  <Col xs={12} className="no-padding">
                    <Button
                      className="pull-right"
                      bsStyle="link"
                      disabled={this.state.rootGroup === null}
                      onClick={() => this.setState({ rootGroup: null })}
                    >
                      <FailureIcon gapRight />
                      <FormattedMessage
                        id="app.group.unsetRoot"
                        defaultMessage="Unset Root Group"
                      />
                    </Button>
                  </Col>
                </Row>
              </Grid>

              {data.rootGroupId !== null &&
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
                  buttonsCreator={buttonsCreator(links, groupId =>
                    this.setState({ rootGroup: groupId })
                  )}
                  currentGroupId={this.state.rootGroup}
                />}
            </React.Fragment>
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
  groups: ImmutablePropTypes.map,
  intl: intlShape
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
  )(injectIntl(Archive))
);
