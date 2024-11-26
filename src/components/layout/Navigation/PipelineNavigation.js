import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import Navigation from './Navigation.js';
import withLinks from '../../../helpers/withLinks.js';
import { PipelineIcon, PipelineStructureIcon, EditIcon } from '../../icons';

const PipelineNavigation = ({
  pipelineId,
  canViewDetail = false,
  canEdit = false,
  links: { PIPELINE_URI_FACTORY, PIPELINE_EDIT_URI_FACTORY, PIPELINE_EDIT_STRUCT_URI_FACTORY },
}) => (
  <Navigation
    pipelineId={pipelineId}
    links={[
      canViewDetail && {
        caption: <FormattedMessage id="app.navigation.pipeline" defaultMessage="Pipeline" />,
        link: PIPELINE_URI_FACTORY(pipelineId),
        icon: <PipelineIcon gapRight={2} />,
      },
      canEdit && {
        caption: <FormattedMessage id="app.navigation.edit" defaultMessage="Edit" />,
        link: PIPELINE_EDIT_URI_FACTORY(pipelineId),
        icon: <EditIcon gapRight={2} />,
      },
      canEdit && {
        caption: <FormattedMessage id="app.navigation.pipelineStructure" defaultMessage="Structure" />,
        link: PIPELINE_EDIT_STRUCT_URI_FACTORY(pipelineId),
        icon: <PipelineStructureIcon gapRight={2} />,
      },
    ]}
  />
);

PipelineNavigation.propTypes = {
  pipelineId: PropTypes.string.isRequired,
  canViewDetail: PropTypes.bool,
  canEdit: PropTypes.bool,
  isLoggedInUser: PropTypes.bool,
  links: PropTypes.object.isRequired,
};

export default withLinks(PipelineNavigation);
