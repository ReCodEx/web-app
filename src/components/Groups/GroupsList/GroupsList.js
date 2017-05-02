import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Table } from 'react-bootstrap';
import ResourceRenderer from '../../helpers/ResourceRenderer';
import Icon from 'react-fontawesome';

import withLinks from '../../../hoc/withLinks';

const GroupsList = (
  {
    groups = [],
    renderButtons = () => null,
    links: { GROUP_URI_FACTORY },
    ...props
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
