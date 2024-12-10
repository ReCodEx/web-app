import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Container, Row, Col } from 'react-bootstrap';

import Button, { TheButtonGroup } from '../../widgets/TheButton';
import { CheckboxField } from '../Fields';
import Icon, { InfoIcon, InvertIcon, SquareIcon } from '../../icons';
import { STANDALONE_ENVIRONMENTS } from '../../../helpers/exercise/environments.js';

const EditEnvironmentList = ({
  runtimeEnvironments,
  namePrefix = '',
  selectAllRuntimesHandler,
  clearAllRuntimesHandler,
  invertRuntimeSelectionHandler,
  showExclusive = false,
  fullWidth = false,
  intl: { locale },
}) => (
  <Container fluid>
    <Row>
      {runtimeEnvironments
        .sort((a, b) => a.longName.localeCompare(b.longName, locale))
        .map(environment => (
          <Col key={environment.id} sm={12} md={fullWidth ? 6 : 12} lg={fullWidth ? 4 : 12} xl={fullWidth ? 3 : 6}>
            <Field
              name={`${namePrefix}${environment.id}`}
              component={CheckboxField}
              label={
                <span>
                  {environment.longName}

                  <InfoIcon
                    gapLeft={2}
                    className="text-primary"
                    timid
                    tooltipId={`environment-${environment.id}`}
                    tooltipPlacement="bottom"
                    tooltip={`${environment.description} ${environment.extensions}`}
                  />

                  {showExclusive && STANDALONE_ENVIRONMENTS.includes(environment.id) && (
                    <Icon
                      icon={['far', 'star']}
                      gapLeft={1}
                      className="text-warning opacity-50"
                      tooltipId={`environment-standalone-${environment.id}`}
                      tooltipPlacement="bottom"
                      tooltip={
                        <FormattedMessage
                          id="app.editEnvironmentSimpleForm.exclusiveEnvironment"
                          defaultMessage="Exclusive runtime environment"
                        />
                      }
                    />
                  )}
                </span>
              }
            />
          </Col>
        ))}
    </Row>
    {(Boolean(selectAllRuntimesHandler) ||
      Boolean(clearAllRuntimesHandler) ||
      Boolean(invertRuntimeSelectionHandler)) && (
      <Row>
        <Col>
          <div className="text-center">
            <TheButtonGroup>
              {Boolean(selectAllRuntimesHandler) && (
                <Button onClick={selectAllRuntimesHandler} variant="primary" size="sm">
                  <SquareIcon checked gapRight={2} />
                  <FormattedMessage id="generic.selectAll" defaultMessage="Select All" />
                </Button>
              )}
              {Boolean(clearAllRuntimesHandler) && (
                <Button onClick={clearAllRuntimesHandler} variant="primary" size="sm">
                  <SquareIcon gapRight={2} />
                  <FormattedMessage id="generic.clearAll" defaultMessage="Clear All" />
                </Button>
              )}
              {Boolean(invertRuntimeSelectionHandler) && (
                <Button onClick={invertRuntimeSelectionHandler} variant="primary" size="sm">
                  <InvertIcon gapRight={2} />
                  <FormattedMessage id="generic.invertSelection" defaultMessage="Invert Selection" />
                </Button>
              )}
            </TheButtonGroup>
          </div>
        </Col>
      </Row>
    )}
  </Container>
);

EditEnvironmentList.propTypes = {
  runtimeEnvironments: PropTypes.array,
  namePrefix: PropTypes.string,
  selectAllRuntimesHandler: PropTypes.func,
  clearAllRuntimesHandler: PropTypes.func,
  invertRuntimeSelectionHandler: PropTypes.func,
  showExclusive: PropTypes.bool,
  fullWidth: PropTypes.bool,
  intl: PropTypes.object.isRequired,
};

export default injectIntl(EditEnvironmentList);
