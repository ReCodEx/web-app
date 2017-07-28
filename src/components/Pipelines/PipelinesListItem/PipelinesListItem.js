import React from 'react';
import PropTypes from 'prop-types';
import Icon from 'react-fontawesome';
import UsersNameContainer from '../../../containers/UsersNameContainer';
import { Link } from 'react-router';

import withLinks from '../../../hoc/withLinks';

const PipelinesListItem = ({
  id,
  name,
  author,
  createActions,
  links: { PIPELINE_URI_FACTORY }
}) =>
  <tr>
    <td className="text-center">
      <Icon name="code" />
    </td>
    <td>
      <strong>
        <Link to={PIPELINE_URI_FACTORY(id)}>
          {name}
        </Link>
      </strong>
    </td>
    <td>
      <UsersNameContainer userId={author} />
    </td>
    {createActions &&
      <td className="text-right">
        {createActions(id)}
      </td>}
  </tr>;

PipelinesListItem.propTypes = {
  id: PropTypes.string.isRequired,
  author: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  createActions: PropTypes.func,
  links: PropTypes.object
};

export default withLinks(PipelinesListItem);
