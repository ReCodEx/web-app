import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import Icon from 'react-fontawesome';
import { ButtonGroup, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { TreeView, TreeViewItem } from '../../AdminLTE/TreeView';
import { isReady, getJsData } from '../../../redux/helpers/resourceManager';

class GroupTree extends Component {

  renderLoading = level => (
    <TreeView>
      <TreeViewItem
        level={level}
        loading
        title={<FormattedMessage id='app.groupTree.loading' defaultMessage='Loading ...' />} />
    </TreeView>
  );

  renderButtons = link => (
    <ButtonGroup>
      <LinkContainer to={link}>
        <Button bsStyle='primary' bsSize='xs' className='btn-flat'>
          <Icon name='group' /> <FormattedMessage id='app.groupTree.detailButton' defaultMessage="See group's page" />
        </Button>
      </LinkContainer>
    </ButtonGroup>
  );

  render() {
    const {
      id,
      level = 0,
      isOpen,
      groups
    } = this.props;

    const {
      links: { GROUP_URI_FACTORY }
    } = this.context;

    const group = groups.get(id);
    if (!group || !isReady(group)) {
      return this.renderLoading(level);
    }

    const { name, childGroups } = getJsData(group);
    return (
      <TreeView>
        <TreeViewItem
          title={name}
          level={level}
          isOpen={isOpen}
          actions={this.renderButtons(GROUP_URI_FACTORY(id))}>
          {childGroups.map(id =>
            <GroupTree {...this.props} key={id} id={id} level={level + 1} />)}
        </TreeViewItem>
      </TreeView>
    );
  }

}

GroupTree.propTypes = {
  id: PropTypes.string.isRequired,
  groups: PropTypes.object.isRequired,
  level: PropTypes.number,
  isOpen: PropTypes.bool
};

GroupTree.contextTypes = {
  links: PropTypes.object
};

export default GroupTree;
