import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Table } from 'react-bootstrap';
import ResourceRenderer from '../../ResourceRenderer';
import Icon from 'react-fontawesome';

import withLinks from '../../../hoc/withLinks';

const GroupsList = (
  {
    groups = [],
    renderButtons = () => null,
    ...props,
    links: { GROUP_URI_FACTORY }
  }
) => (
  <ResourceRenderer resource={groups.toArray()}>
    {(...groups) => (
      <Table hover {...props}>
        <tbody>
          {groups.map(({ id, name }) => (
            <tr key={id}>
              <td className="text-center">
                <Icon name="group" />
              </td>
              <td>
                <Link to={GROUP_URI_FACTORY(id)}>{name}</Link>
              </td>
              <td className="text-right">
                {renderButtons(id)}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    )}
  </ResourceRenderer>
);

GroupsList.propTypes = {
  groups: ImmutablePropTypes.map.isRequired,
  renderButtons: PropTypes.func,
  links: PropTypes.object
};

export default withLinks(GroupsList);
