import React from 'react';
import PropTypes from 'prop-types';
import UsersNameContainer from '../../../containers/UsersNameContainer';
import { Link } from 'react-router';

import withLinks from '../../../hoc/withLinks';

const PipelinesSimpleListItem = ({
  id,
  name,
  authorId,
  createActions,
  links: { PIPELINE_URI_FACTORY }
}) =>
  <tr>
    <td>
      <strong>
        <Link to={PIPELINE_URI_FACTORY(id)}>
          {name}
        </Link>
      </strong>
    </td>
    <td>
      <UsersNameContainer userId={authorId} />
    </td>
    {createActions &&
      <td>
        {createActions(id)}
      </td>}
  </tr>;

PipelinesSimpleListItem.propTypes = {
  id: PropTypes.string.isRequired,
  authorId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  createdAt: PropTypes.number.isRequired,
  createActions: PropTypes.func,
  links: PropTypes.object
};

export default withLinks(PipelinesSimpleListItem);
