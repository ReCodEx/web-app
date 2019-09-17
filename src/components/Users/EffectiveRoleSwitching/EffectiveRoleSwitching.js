import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import classnames from 'classnames';

import { knownRoles, roleLabels, UserRoleIcon } from '../../helpers/usersRoles';

const EffectiveRoleSwitching = ({ effectiveRole, setEffectiveRole, updating = null }) => (
  <Table hover className="no-margin">
    <tbody>
      {knownRoles.map(role => (
        <tr
          key={role}
          className={classnames({
            'bg-info': role === (updating || effectiveRole),
          })}
          onClick={ev => {
            ev.preventDefault();
            setEffectiveRole(role);
          }}>
          <td className="shrink-col">
            <input
              type="radio"
              name="effectiveRole"
              value={role}
              checked={role === (updating || effectiveRole)}
              disabled={Boolean(updating)}
              readOnly
            />
          </td>
          <td className="shrink-col">
            <UserRoleIcon role={role}></UserRoleIcon>
          </td>
          <td>{roleLabels[role]}</td>
        </tr>
      ))}
    </tbody>
  </Table>
);

EffectiveRoleSwitching.propTypes = {
  effectiveRole: PropTypes.string,
  updating: PropTypes.string,
  setEffectiveRole: PropTypes.func.isRequired,
};

export default EffectiveRoleSwitching;
