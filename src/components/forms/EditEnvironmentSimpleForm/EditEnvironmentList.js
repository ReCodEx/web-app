import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { FormattedMessage, intlShape, injectIntl } from 'react-intl';
import { Grid, Row, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';

import { CheckboxField } from '../Fields';
import Icon, { InfoIcon } from '../../icons';
import { STANDALONE_ENVIRONMENTS } from '../../../helpers/exercise/environments';

const EditEnvironmentList = ({
  runtimeEnvironments,
  namePrefix = '',
  showExclusive = false,
  fullWidth = false,
  intl: { locale },
}) => (
  <Grid fluid>
    <Row>
      {runtimeEnvironments
        .sort((a, b) => a.longName.localeCompare(b.longName, locale))
        .map(environment => (
          <Col key={environment.id} xs={12} sm={6} md={fullWidth ? 4 : 6} lg={fullWidth ? 3 : 6}>
            <Field
              name={`${namePrefix}${environment.id}`}
              component={CheckboxField}
              onOff
              label={
                <span>
                  {environment.longName}

                  <OverlayTrigger
                    placement="bottom"
                    overlay={
                      <Tooltip id={`environment-${environment.id}`}>
                        {environment.description} {environment.extensions}
                      </Tooltip>
                    }>
                    <InfoIcon gapLeft className="text-primary" timid />
                  </OverlayTrigger>

                  {showExclusive && STANDALONE_ENVIRONMENTS.includes(environment.id) && (
                    <OverlayTrigger
                      placement="bottom"
                      overlay={
                        <Tooltip id={`environment-standalone-${environment.id}`}>
                          <FormattedMessage
                            id="app.editEnvironmentSimpleForm.exclusiveEnvironment"
                            defaultMessage="Exclusive runtime environment"
                          />
                        </Tooltip>
                      }>
                      <Icon icon={['far', 'star']} smallGapLeft className="text-warning half-opaque" />
                    </OverlayTrigger>
                  )}
                </span>
              }
            />
          </Col>
        ))}
    </Row>
  </Grid>
);

EditEnvironmentList.propTypes = {
  runtimeEnvironments: PropTypes.array,
  namePrefix: PropTypes.string,
  showExclusive: PropTypes.bool,
  fullWidth: PropTypes.bool,
  intl: intlShape.isRequired,
};

export default injectIntl(EditEnvironmentList);
