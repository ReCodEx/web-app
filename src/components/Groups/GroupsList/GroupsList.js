import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import ImmutablePropTypes from 'react-immutable-proptypes';
import GroupTree from '../GroupTree';
import { getJsData, getId } from '../../../redux/helpers/resourceManager';
import { ListGroup, ListGroupItem } from 'react-bootstrap';

const GroupsList = ({
  groups = [],
  renderButtons = () => null,
  ...props
}, {
  links: { GROUP_URI_FACTORY }
}) => (
  <ListGroup {...props}>
    {groups
      .toList()
      .map(getJsData)
      .filter(group => group !== null)
      .map(({ id, name }) => (
        <ListGroupItem key={id}>
          <Link to={GROUP_URI_FACTORY(id)}>{name}</Link> <span className='pull-right'>{renderButtons(id)}</span>
        </ListGroupItem>
      ))}
  </ListGroup>
);

GroupsList.propTypes = {
  groups: ImmutablePropTypes.map.isRequired
};

GroupsList.contextTypes = {
  links: PropTypes.object
};

export default GroupsList;
