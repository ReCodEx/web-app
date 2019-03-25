import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Table } from 'react-bootstrap';

import Box from '../../widgets/Box';
import Markdown from '../../widgets/Markdown';
import { getLocalizedDescription } from '../../../helpers/localizedData';

const getDescription = (localizedTexts, locale) => {
  const description = getLocalizedDescription({ localizedTexts }, locale);
  return description ? (
    <Markdown source={description} />
  ) : (
    <p className="small text-muted text-center well well-sm">
      <FormattedMessage
        id="app.instanceDetail.noDescription"
        defaultMessage="The instance has no description in any language."
      />
    </p>
  );
};

const InstanceInfoTable = ({
  instance: {
    id,
    hasValidLicence,
    isOpen,
    isAllowed,
    rootGroup: { localizedTexts },
  },
  locale,
}) => (
  <div>
    <Box
      title={<FormattedMessage id="app.instanceDetail.description" defaultMessage="Instance Description" />}
      description={getDescription(localizedTexts, locale)}
      type="primary"
      collapsable
      noPadding
      unlimitedHeight>
      <Table>
        <tbody />
      </Table>
    </Box>
  </div>
);

InstanceInfoTable.propTypes = {
  instance: PropTypes.shape({
    id: PropTypes.string.isRequired,
    hasValidLicence: PropTypes.bool.isRequired,
    isOpen: PropTypes.bool.isRequired,
    isAllowed: PropTypes.bool.isRequired,
    rootGroup: PropTypes.shape({
      localizedTexts: PropTypes.object.isRequired,
    }),
  }),
  locale: PropTypes.string.isRequired,
};

export default InstanceInfoTable;
