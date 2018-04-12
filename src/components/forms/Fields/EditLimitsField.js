import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { Row, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';

import FlatButton from '../../widgets/FlatButton';
import Confirm from '../../forms/Confirm';
import LimitsValueField from './LimitsValueField';

import { validateLimitsField } from '../../../helpers/exerciseLimits';
import { prettyPrintBytes } from '../../helpers/stringFormatters';
import prettyMs from 'pretty-ms';

import styles from './EditLimitsField.less';

const prettyPrintBytesWrap = value =>
  Number.isNaN(Number(value)) ? '-' : prettyPrintBytes(Number(value) * 1024);

const prettyPrintMsWrap = value =>
  Number.isNaN(Number(value)) ? '-' : prettyMs(Number(value) * 1000);

const validateValue = constraintKey => (value, allValues, { constraints }) => {
  const num = validateLimitsField(
    value,
    constraints && constraints[constraintKey]
  );
  if (Number.isNaN(num)) {
    return (
      <FormattedMessage
        id="app.EditLimitsForm.validation.NaN"
        defaultMessage="Given value is not a number."
      />
    );
  } else if (num === false) {
    return (
      <FormattedMessage
        id="app.EditLimitsForm.validation.outOfRange"
        defaultMessage="Given value is out of range. See limits constraints for details."
      />
    );
  }
  return undefined;
};

const validateMemory = validateValue('memory');
const validateTime = validateValue('time');

const EditLimitsField = ({
  prefix,
  id,
  testsCount,
  environmentsCount,
  cloneVertically,
  cloneHorizontally,
  cloneAll,
  ...props
}) => {
  return (
    <div>
      <Row>
        <Col lg={environmentsCount >= 3 ? 12 : 6} md={12}>
          <table>
            <tbody>
              <Field
                name={`${prefix}.memory`}
                component={LimitsValueField}
                prettyPrint={prettyPrintBytesWrap}
                label={
                  <FormattedMessage
                    id="app.fields.limits.memory"
                    defaultMessage="Memory [KiB]:"
                  />
                }
                validate={validateMemory}
                {...props}
              />
              <tr>
                <td className={styles.buttonsCol}>
                  {testsCount > 1 &&
                    <OverlayTrigger
                      placement="bottom"
                      overlay={
                        <Tooltip id={Date.now()}>
                          <FormattedMessage
                            id="app.editLimitsField.tooltip.cloneVertical"
                            defaultMessage="Copy this value vertically to all tests within the environment."
                          />
                        </Tooltip>
                      }
                    >
                      <FlatButton
                        onClick={cloneVertically('memory')}
                        bsSize="xs"
                      >
                        <FontAwesomeIcon icon="arrows-alt-v" />
                      </FlatButton>
                    </OverlayTrigger>}
                  {environmentsCount > 1 &&
                    <Confirm
                      id={`confirm.${id}.memory.horizontal`}
                      onConfirmed={cloneHorizontally('memory')}
                      question={
                        <FormattedMessage
                          id="app.EditLimitsForm.cloneHorizontal.yesNoQuestion"
                          defaultMessage="Do you really want to use these limits for all runtime environments of this test? Please note, that individual environments have different performance characteristics."
                        />
                      }
                    >
                      <OverlayTrigger
                        placement="bottom"
                        overlay={
                          <Tooltip id={Date.now()}>
                            <FormattedMessage
                              id="app.editLimitsField.tooltip.cloneHorizontal"
                              defaultMessage="Copy this value horizontally to all environments of the test."
                            />
                          </Tooltip>
                        }
                      >
                        <FlatButton bsSize="xs">
                          <FontAwesomeIcon icon="arrows-alt-h" />
                        </FlatButton>
                      </OverlayTrigger>
                    </Confirm>}
                  {testsCount > 1 &&
                    environmentsCount > 1 &&
                    <Confirm
                      id={`confirm.${id}.memory.all`}
                      onConfirmed={cloneAll('memory')}
                      question={
                        <FormattedMessage
                          id="app.EditLimitsForm.cloneAll.yesNoQuestion"
                          defaultMessage="Do you really want to use these limits for all the tests of all runtime environments? Please note, that individual environments have different performance characteristics."
                        />
                      }
                    >
                      <OverlayTrigger
                        placement="bottom"
                        overlay={
                          <Tooltip id={Date.now()}>
                            <FormattedMessage
                              id="app.editLimitsField.tooltip.cloneAll"
                              defaultMessage="Copy this value to all tests in all environments."
                            />
                          </Tooltip>
                        }
                      >
                        <FlatButton bsSize="xs">
                          <FontAwesomeIcon icon="arrows-alt" />
                        </FlatButton>
                      </OverlayTrigger>
                    </Confirm>}
                </td>
              </tr>
            </tbody>
          </table>
        </Col>
        <Col lg={environmentsCount >= 3 ? 12 : 6} md={12}>
          <table>
            <tbody>
              <Field
                name={`${prefix}.time`}
                component={LimitsValueField}
                prettyPrint={prettyPrintMsWrap}
                validate={validateTime}
                label={
                  <FormattedMessage
                    id="app.fields.limits.time"
                    defaultMessage="Time [s]:"
                  />
                }
                {...props}
              />
              <tr>
                <td className={styles.buttonsCol}>
                  {testsCount > 1 &&
                    <OverlayTrigger
                      placement="bottom"
                      overlay={
                        <Tooltip id={Date.now()}>
                          <FormattedMessage
                            id="app.editLimitsField.tooltip.cloneVertical"
                            defaultMessage="Copy this value vertically to all tests within the environment."
                          />
                        </Tooltip>
                      }
                    >
                      <FlatButton onClick={cloneVertically('time')} bsSize="xs">
                        <FontAwesomeIcon icon="arrows-alt-v" />
                      </FlatButton>
                    </OverlayTrigger>}
                  {environmentsCount > 1 &&
                    <Confirm
                      id={`confirm.${id}.time.horizontal`}
                      onConfirmed={cloneHorizontally('time')}
                      question={
                        <FormattedMessage
                          id="app.EditLimitsForm.cloneHorizontal.yesNoQuestion"
                          defaultMessage="Do you really want to use these limits for all runtime environments of this test? Please note, that individual environments have different performance characteristics."
                        />
                      }
                    >
                      <OverlayTrigger
                        placement="bottom"
                        overlay={
                          <Tooltip id={Date.now()}>
                            <FormattedMessage
                              id="app.editLimitsField.tooltip.cloneHorizontal"
                              defaultMessage="Copy this value horizontally to all environments of the test."
                            />
                          </Tooltip>
                        }
                      >
                        <FlatButton bsSize="xs">
                          <FontAwesomeIcon icon="arrows-alt-h" />
                        </FlatButton>
                      </OverlayTrigger>
                    </Confirm>}
                  {testsCount > 1 &&
                    environmentsCount > 1 &&
                    <Confirm
                      id={`confirm.${id}.time.all`}
                      onConfirmed={cloneAll('time')}
                      question={
                        <FormattedMessage
                          id="app.EditLimitsForm.cloneAll.yesNoQuestion"
                          defaultMessage="Do you really want to use these limits for all the tests of all runtime environments? Please note, that individual environments have different performance characteristics."
                        />
                      }
                    >
                      <OverlayTrigger
                        placement="bottom"
                        overlay={
                          <Tooltip id={Date.now()}>
                            <FormattedMessage
                              id="app.editLimitsField.tooltip.cloneAll"
                              defaultMessage="Copy this value to all tests in all environments."
                            />
                          </Tooltip>
                        }
                      >
                        <FlatButton bsSize="xs">
                          <FontAwesomeIcon icon="arrows-alt" />
                        </FlatButton>
                      </OverlayTrigger>
                    </Confirm>}
                </td>
              </tr>
            </tbody>
          </table>
        </Col>
      </Row>
    </div>
  );
};

EditLimitsField.propTypes = {
  id: PropTypes.string.isRequired,
  cloneVertically: PropTypes.func.isRequired,
  cloneHorizontally: PropTypes.func.isRequired,
  cloneAll: PropTypes.func.isRequired,
  prefix: PropTypes.string.isRequired,
  testsCount: PropTypes.number.isRequired,
  environmentsCount: PropTypes.number.isRequired
};

export default EditLimitsField;
