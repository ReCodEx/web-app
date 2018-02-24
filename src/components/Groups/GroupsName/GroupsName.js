import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import withLinks from '../../../helpers/withLinks';
import { LocalizedGroupName } from '../../helpers/LocalizedNames';

const GroupsName = ({
  id,
  name,
  localizedTexts,
  noLink,
  links: { GROUP_URI_FACTORY }
}) =>
  <span>
    {noLink
      ? <span>
          <LocalizedGroupName entity={{ name, localizedTexts }} />
        </span>
      : <Link to={GROUP_URI_FACTORY(id)}>
          <LocalizedGroupName entity={{ name, localizedTexts }} />
        </Link>}
  </span>;

GroupsName.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  localizedTexts: PropTypes.array.isRequired,
  noLink: PropTypes.bool,
  links: PropTypes.object
};

export default withLinks(GroupsName);
