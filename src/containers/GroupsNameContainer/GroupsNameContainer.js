import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';

import { fetchGroupIfNeeded } from '../../redux/modules/groups';
import { groupSelector, groupAccessorSelector } from '../../redux/selectors/groups';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import { hasPermissions } from '../../helpers/common';
import GroupsName from '../../components/Groups/GroupsName';
import Icon, { LoadingIcon } from '../../components/icons';
import UsersNameContainer from '../UsersNameContainer';

class GroupsNameContainer extends Component {
  componentDidMount() {
    this.props.loadAsync(this.props.groupId);
  }

  componentDidUpdate(prevProps) {
    if (this.props.groupId !== prevProps.groupId) {
      this.props.loadAsync(this.props.groupId);
    }
  }

  render() {
    const {
      group,
      groupAccessor,
      fullName = false,
      translations = false,
      links = false,
      ancestorLinks = false,
      admins = false,
      separator = <Icon icon="link" className="small half-opaque" largeGapLeft largeGapRight />,
    } = this.props;
    return (
      <ResourceRenderer
        resource={group}
        loading={
          <span>
            <LoadingIcon gapRight />
            <FormattedMessage id="generic.loading" defaultMessage="Loading..." />
          </span>
        }>
        {group => (
          <>
            {fullName &&
              group.parentGroupsIds
                .filter((_, idx) => idx > 0)
                .map(gid => (
                  <React.Fragment key={gid}>
                    <ResourceRenderer
                      resource={groupAccessor(gid)}
                      loading={
                        <span>
                          <LoadingIcon />
                        </span>
                      }>
                      {parent => (
                        <GroupsName
                          {...parent}
                          translations={translations}
                          asLink={(links || ancestorLinks) && hasPermissions(parent, 'viewDetail')}
                        />
                      )}
                    </ResourceRenderer>
                    {separator}
                  </React.Fragment>
                ))}

            <GroupsName {...group} translations={translations} asLink={links && hasPermissions(group, 'viewDetail')} />

            {admins && group.primaryAdminsIds.length > 0 && (
              <small className="half-opaque ml-3">
                (
                <em>
                  {group.primaryAdminsIds.map(id => (
                    <UsersNameContainer key={id} userId={id} isSimple />
                  ))}
                </em>
                )
              </small>
            )}
          </>
        )}
      </ResourceRenderer>
    );
  }
}

GroupsNameContainer.propTypes = {
  groupId: PropTypes.string.isRequired,
  fullName: PropTypes.bool,
  translations: PropTypes.bool,
  links: PropTypes.bool,
  ancestorLinks: PropTypes.bool,
  admins: PropTypes.bool,
  separator: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  group: ImmutablePropTypes.map,
  groupAccessor: PropTypes.func.isRequired,
  loadAsync: PropTypes.func.isRequired,
};

export default connect(
  (state, { groupId }) => ({
    group: groupSelector(state, groupId),
    groupAccessor: groupAccessorSelector(state),
  }),
  dispatch => ({
    loadAsync: groupId => dispatch(fetchGroupIfNeeded(groupId)),
  })
)(GroupsNameContainer);
