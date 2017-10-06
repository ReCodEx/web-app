import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Icon from 'react-fontawesome';
import Button from '../../widgets/FlatButton';
import { LinkContainer } from 'react-router-bootstrap';
import { TreeView, TreeViewItem } from '../../widgets/TreeView';
import { isReady, getJsData } from '../../../redux/helpers/resourceManager';
import DeleteGroupButtonContainer from '../../../containers/DeleteGroupButtonContainer';

import withLinks from '../../../hoc/withLinks';

class GroupTree extends Component {
  renderLoading = level =>
    <TreeView>
      <TreeViewItem
        level={level}
        loading
        title={
          <FormattedMessage
            id="app.groupTree.loading"
            defaultMessage="Loading ..."
          />
        }
      />
    </TreeView>;

  renderButtons = groupId => {
    const { isAdmin, links: { GROUP_URI_FACTORY } } = this.props;
    return (
      <span>
        <LinkContainer to={GROUP_URI_FACTORY(groupId)}>
          <Button bsStyle="primary" bsSize="xs" className="btn-flat">
            <Icon name="group" />{' '}
            <FormattedMessage
              id="app.groupTree.detailButton"
              defaultMessage="See group's page"
            />
          </Button>
        </LinkContainer>

        {isAdmin &&
          <DeleteGroupButtonContainer
            id={groupId}
            bsSize="xs"
            className="btn-flat"
          />}
      </span>
    );
  };

  render() {
    const {
      id,
      level = 0,
      isOpen,
      isAdmin,
      isPublic = true,
      groups,
      currentGroupId = null,
      links: { GROUP_URI_FACTORY }
    } = this.props;

    const group = groups.get(id);
    if (!group || !isReady(group)) {
      return isPublic ? this.renderLoading(level) : null;
    }

    const {
      name,
      externalId,
      childGroups: { all: allChildGroups, public: publicChildGroups },
      canView
    } = getJsData(group);

    return (
      <TreeView>
        {level !== 0 &&
          <TreeViewItem
            title={name}
            level={level}
            externalId={externalId}
            isOpen={currentGroupId === id || isOpen}
            actions={
              currentGroupId !== id && canView
                ? this.renderButtons(id, GROUP_URI_FACTORY(id), isAdmin)
                : undefined
            }
          >
            {allChildGroups.map(id =>
              <GroupTree
                {...this.props}
                key={id}
                id={id}
                isAdmin={isAdmin}
                deletable={true}
                level={level + 1}
                isPublic={publicChildGroups.indexOf(id) >= 0}
              />
            )}
          </TreeViewItem>}
        {level === 0 &&
          allChildGroups.map(id =>
            <GroupTree
              {...this.props}
              key={id}
              id={id}
              isAdmin={isAdmin}
              deletable={true}
              level={level + 1}
              isPublic={publicChildGroups.indexOf(id) >= 0}
            />
          )}
      </TreeView>
    );
  }
}

GroupTree.propTypes = {
  id: PropTypes.string.isRequired,
  groups: PropTypes.object.isRequired,
  level: PropTypes.number,
  isAdmin: PropTypes.bool,
  isOpen: PropTypes.bool,
  isPublic: PropTypes.bool,
  deletable: PropTypes.bool,
  currentGroupId: PropTypes.string,
  links: PropTypes.object
};

export default withLinks(GroupTree);
