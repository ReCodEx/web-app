import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import Navigation from './Navigation';
import withLinks from '../../../helpers/withLinks';
import { PipelineIcon, EditIcon } from '../../icons';

const PipelineNavigation = ({
  pipelineId,
  canViewDetail = false,
  canEdit = false,
  links: { PIPELINE_URI_FACTORY, PIPELINE_EDIT_URI_FACTORY },
}) => (
  <Navigation
    pipelineId={pipelineId}
    links={[
      canViewDetail && {
        caption: <FormattedMessage id="app.navigation.pipeline" defaultMessage="Pipeline" />,
        link: PIPELINE_URI_FACTORY(pipelineId),
        icon: <PipelineIcon gapRight />,
      },
      canEdit && {
        caption: <FormattedMessage id="app.navigation.edit" defaultMessage="Edit" />,
        link: PIPELINE_EDIT_URI_FACTORY(pipelineId),
        icon: <EditIcon gapRight />,
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
