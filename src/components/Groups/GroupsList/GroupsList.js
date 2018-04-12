import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Table } from 'react-bootstrap';
import ResourceRenderer from '../../helpers/ResourceRenderer';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';

import GroupsName from '../GroupsName';

const GroupsList = ({ groups = [], renderButtons = () => null, ...props }) =>
  <ResourceRenderer resource={groups.toArray()}>
    {(...groups) =>
      <Table hover {...props}>
        <tbody>
          {groups.map(({ id, name, localizedTexts, organizational }) =>
            <tr key={id}>
              <td className="text-center">
                <FontAwesomeIcon icon="users" />
              </td>
              <td>
                <GroupsName
                  id={id}
                  name={name}
                  localizedTexts={localizedTexts}
                  organizational={organizational}
                />
              </td>
              <td className="text-right">
                {renderButtons(id)}
              </td>
            </tr>
          )}
        </tbody>
      </Table>}
  </ResourceRenderer>;

GroupsList.propTypes = {
  groups: ImmutablePropTypes.map.isRequired,
  renderButtons: PropTypes.func
};

export default GroupsList;
