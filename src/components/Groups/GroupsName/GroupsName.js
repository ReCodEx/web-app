import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import withLinks from '../../../hoc/withLinks';

const GroupsName = ({ id, name, noLink, links: { GROUP_URI_FACTORY } }) => (
  <span>
    {noLink ? (
      <span>{name}</span>
    ) : (
      <Link to={GROUP_URI_FACTORY(id)}>{name}</Link>
    )}
  </span>
);

GroupsName.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  noLink: PropTypes.bool,
  links: PropTypes.object
};

export default withLinks(GroupsName);
