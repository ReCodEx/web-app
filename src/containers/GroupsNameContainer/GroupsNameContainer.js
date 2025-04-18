import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';

import { fetchGroupIfNeeded } from '../../redux/modules/groups.js';
import { groupSelector, groupAccessorSelector } from '../../redux/selectors/groups.js';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import { hasPermissions } from '../../helpers/common.js';
import GroupsName from '../../components/Groups/GroupsName';
import Icon, { GroupIcon, LoadingIcon } from '../../components/icons';
import UsersNameContainer from '../UsersNameContainer';

class GroupsNameContainer extends Component {
  componentDidMount() {
    if (!this.props.noLoadAsync) {
      this.props.loadAsync(this.props.groupId);
    }
  }

  componentDidUpdate(prevProps) {
    if (!this.props.noLoadAsync) {
      if (this.props.groupId !== prevProps.groupId || this.props.noLoadAsync !== prevProps.noLoadAsync) {
        this.props.loadAsync(this.props.groupId);
      }
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
      separator = <Icon icon="link" className="small opacity-50" gapLeft={3} gapRight={3} />,
      showIcon = false,
      iconTooltip = null,
    } = this.props;
    return (
      <ResourceRenderer
        resource={group}
        loading={
          <span>
            <LoadingIcon gapRight={2} />
            <FormattedMessage id="generic.loading" defaultMessage="Loading..." />
          </span>
        }>
        {group => (
          <>
            {showIcon && (
              <GroupIcon
                gapRight={2}
                className="text-body-secondary"
                organizational={group.organizational}
                archived={group.archived}
                exam={group.exam}
                tooltipId={`groupIcon-${group.id}`}
                tooltipPlacement="bottom"
                tooltip={iconTooltip && typeof iconTooltip === 'function' ? iconTooltip(group) : iconTooltip || null}
              />
            )}
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
              <small className="opacity-50 ms-3">
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
  noLoadAsync: PropTypes.bool,
  group: ImmutablePropTypes.map,
  groupAccessor: PropTypes.func.isRequired,
  showIcon: PropTypes.bool,
  iconTooltip: PropTypes.oneOfType([PropTypes.string, PropTypes.element, PropTypes.func]),
  loadAsync: PropTypes.func.isRequired,
};

export default connect(
  (state, { groupId }) => ({
    group: groupSelector(state, groupId),
    groupAccessor: groupAccessorSelector(state),
  }),
  dispatch => ({
    loadAsync: groupId =>
      dispatch(fetchGroupIfNeeded(groupId)).then(({ value: group }) =>
        Promise.all(group && group.archived ? group.parentGroupsIds.map(id => dispatch(fetchGroupIfNeeded(id))) : [])
      ),
  })
)(GroupsNameContainer);
