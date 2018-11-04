import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

import Icon from '../../icons';
import {
  getLocalizedName,
  getOtherLocalizedNames
} from '../../../helpers/localizedData';

const LocalizedGroupName = ({ entity, intl: { locale } }) => {
  const otherNames = getOtherLocalizedNames(entity, locale);
  return (
    <span>
      {getLocalizedName(entity, locale)}
      {otherNames.length > 0 &&
        <span className="small">
          <OverlayTrigger
            placement="right"
            overlay={
              <Tooltip id={otherNames.map(n => n.name).join(', ')}>
                {otherNames.map((name, i) =>
                  <div key={i}>
                    <strong>{name.name}</strong>&nbsp;[{name.locale}]
                  </div>
                )}
              </Tooltip>
            }
          >
            <Icon icon={['far', 'flag']} className="text-muted" gapLeft />
          </OverlayTrigger>
        </span>}
    </span>
  );
};

LocalizedGroupName.propTypes = {
  entity: PropTypes.object,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired
};

export default injectIntl(LocalizedGroupName);
