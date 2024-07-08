import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import withLinks from '../../../helpers/withLinks.js';
import { LocalizedGroupName } from '../../helpers/LocalizedNames';

const GroupsName = ({
  id,
  localizedTexts,
  organizational = false,
  isPublic = false,
  asLink = false,
  translations,
  links: { GROUP_INFO_URI_FACTORY, GROUP_ASSIGNMENTS_URI_FACTORY },
}) => (
  <>
    {asLink ? (
      <Link
        to={
          // this is inacurate, but public groups are visible to students who cannot see detail until they join
          organizational || isPublic ? GROUP_INFO_URI_FACTORY(id) : GROUP_ASSIGNMENTS_URI_FACTORY(id)
        }>
        <LocalizedGroupName entity={{ localizedTexts }} translations={translations} />
      </Link>
    ) : (
      <LocalizedGroupName entity={{ localizedTexts }} translations={translations} />
    )}
  </>
);

GroupsName.propTypes = {
  id: PropTypes.string.isRequired,
  localizedTexts: PropTypes.array.isRequired,
  organizational: PropTypes.bool,
  isPublic: PropTypes.bool,
  asLink: PropTypes.bool,
  translations: PropTypes.bool,
  links: PropTypes.object,
};

export default withLinks(GroupsName);
