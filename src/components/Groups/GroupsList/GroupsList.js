import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import ResourceRenderer from '../../ResourceRenderer';

const GroupsList = ({
  groups = [],
  renderButtons = () => null,
  ...props
}, {
  links: { GROUP_URI_FACTORY }
}) => (
  <ResourceRenderer resource={groups.toArray()}>
    {(...groups) => (
      <ListGroup {...props}>
        {groups.map(({ id, name }) => (
            <ListGroupItem key={id}>
              <Link to={GROUP_URI_FACTORY(id)}>{name}</Link> <span className='pull-right'>{renderButtons(id)}</span>
            </ListGroupItem>
          ))}
      </ListGroup>
    )}
  </ResourceRenderer>
);

GroupsList.propTypes = {
  groups: ImmutablePropTypes.map.isRequired,
  renderButtons: PropTypes.func};

GroupsList.contextTypes = {
  links: PropTypes.object
};

export default GroupsList;
