import React from 'react';
import PropTypes from 'prop-types';
import UsersNameContainer from '../../../containers/UsersNameContainer';
import { Link } from 'react-router';

import withLinks from '../../../helpers/withLinks';

const PipelinesSimpleListItem = ({
  id,
  name,
  author,
  createActions,
  links: { PIPELINE_URI_FACTORY },
}) => (
  <tr>
    <td>
      <strong>
        <Link to={PIPELINE_URI_FACTORY(id)}>{name}</Link>
      </strong>
    </td>
    <td>
      <UsersNameContainer userId={author} />
    </td>
    {createActions && <td>{createActions(id)}</td>}
  </tr>
);

PipelinesSimpleListItem.propTypes = {
  id: PropTypes.string.isRequired,
  author: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  createdAt: PropTypes.number.isRequired,
  createActions: PropTypes.func,
  links: PropTypes.object,
};

export default withLinks(PipelinesSimpleListItem);
