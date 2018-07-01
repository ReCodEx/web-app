import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

import Icon from '../../icons';
import {
  getLocalizedName,
  getOtherLocalizedNames
} from '../../../helpers/getLocalizedData';

const LocalizedExerciseName = ({ entity, intl: { locale } }) => {
  const otherNames = getOtherLocalizedNames(entity, locale);
  return (
    <span>
      {getLocalizedName(entity, locale)}
      {otherNames.length > 0 &&
        <span>
          &nbsp;<OverlayTrigger
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
            <Icon icon={['far', 'flag']} className="text-muted" />
          </OverlayTrigger>&nbsp;
        </span>}
    </span>
  );
};

LocalizedExerciseName.propTypes = {
  entity: PropTypes.object,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired
};

export default injectIntl(LocalizedExerciseName);
