import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { Container, Row, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';
import prettyMs from 'pretty-ms';

import Button from '../../widgets/TheButton';
import Confirm from '../../forms/Confirm';
import LimitsValueField from './LimitsValueField.js';

import { validateLimitsField } from '../../../helpers/exercise/limits.js';
import { prettyPrintBytes } from '../../helpers/stringFormatters.js';
import Icon from '../../icons';

const prettyPrintBytesWrap = value => (Number.isNaN(Number(value)) ? '-' : prettyPrintBytes(Number(value) * 1024));

const prettyPrintMsWrap = value => (Number.isNaN(Number(value)) ? '-' : prettyMs(Number(value) * 1000));

const validateValue =
  constraintKey =>
  (value, allValues, { constraints }) => {
    const num = validateLimitsField(value, constraints && constraints[constraintKey]);
    if (Number.isNaN(num)) {
      return <FormattedMessage id="app.EditLimitsForm.validation.NaN" defaultMessage="Given value is not a number." />;
    } else if (num === false) {
      return (
        <FormattedMessage
          id="app.EditLimitsForm.validation.outOfRange"
          defaultMessage="Given value is out of range. See HW group constraints for details."
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
  disabled = false,
  ...props
}) => {
  return (
    <Container fluid>
      <Row>
        <Col lg={environmentsCount >= 3 ? 12 : 6} md={12}>
          <Field
            name={`${prefix}.memory`}
            component={LimitsValueField}
            prettyPrint={prettyPrintBytesWrap}
            label={<FormattedMessage id="app.fields.limits.memory" defaultMessage="Memory [KiB]:" />}
            validate={validateMemory}
            disabled={disabled}
            maxLength={12}
            append={
              disabled ? null : (
                <>
                  {testsCount > 1 && (
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip.${id}.memory.vertical`}>
                          <FormattedMessage
                            id="app.editLimitsField.tooltip.cloneVertical"
                            defaultMessage="Copy this value vertically to all tests within the environment."
                          />
                        </Tooltip>
                      }>
                      <Button onClick={cloneVertically('memory')} size="xs" noShadow>
                        <Icon icon="arrows-alt-v" fixedWidth />
                      </Button>
                    </OverlayTrigger>
                  )}
                  {environmentsCount > 1 && (
                    <Confirm
                      id={`confirm.${id}.memory.horizontal`}
                      onConfirmed={cloneHorizontally('memory')}
                      tooltip={
                        <FormattedMessage
                          id="app.editLimitsField.tooltip.cloneHorizontal"
                          defaultMessage="Copy this value horizontally to all environments of the test."
                        />
                      }
                      tooltipPlacement="top"
                      question={
                        <FormattedMessage
                          id="app.EditLimitsForm.cloneHorizontal.yesNoQuestion"
                          defaultMessage="Do you really want to use these limits for all runtime environments of this test? Please note, that individual environments have different performance characteristics."
                        />
                      }>
                      <Button size="xs" noShadow>
                        <Icon icon="arrows-alt-h" fixedWidth />
                      </Button>
                    </Confirm>
                  )}
                  {testsCount > 1 && environmentsCount > 1 && (
                    <Confirm
                      id={`confirm.${id}.memory.all`}
                      onConfirmed={cloneAll('memory')}
                      tooltip={
                        <FormattedMessage
                          id="app.editLimitsField.tooltip.cloneAll"
                          defaultMessage="Copy this value to all tests in all environments."
                        />
                      }
                      tooltipPlacement="top"
                      question={
                        <FormattedMessage
                          id="app.EditLimitsForm.cloneAll.yesNoQuestion"
                          defaultMessage="Do you really want to use these limits for all the tests of all runtime environments? Please note, that individual environments have different performance characteristics."
                        />
                      }>
                      <Button size="xs" noShadow>
                        <Icon icon="arrows-alt" fixedWidth />
                      </Button>
                    </Confirm>
                  )}
                </>
              )
            }
            {...props}
          />
        </Col>
        <Col lg={environmentsCount >= 3 ? 12 : 6} md={12}>
          <Field
            name={`${prefix}.time`}
            component={LimitsValueField}
            prettyPrint={prettyPrintMsWrap}
            validate={validateTime}
            label={<FormattedMessage id="app.fields.limits.time" defaultMessage="Time [s]:" />}
            maxLength={6}
            disabled={disabled}
            append={
              disabled ? null : (
                <>
                  {testsCount > 1 && (
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip.${id}.time.vertical`}>
                          <FormattedMessage
                            id="app.editLimitsField.tooltip.cloneVertical"
                            defaultMessage="Copy this value vertically to all tests within the environment."
                          />
                        </Tooltip>
                      }>
                      <Button onClick={cloneVertically('time')} size="xs" noShadow>
                        <Icon icon="arrows-alt-v" fixedWidth />
                      </Button>
                    </OverlayTrigger>
                  )}
                  {environmentsCount > 1 && (
                    <Confirm
                      id={`confirm.${id}.time.horizontal`}
                      onConfirmed={cloneHorizontally('time')}
                      tooltip={
                        <FormattedMessage
                          id="app.editLimitsField.tooltip.cloneHorizontal"
                          defaultMessage="Copy this value horizontally to all environments of the test."
                        />
                      }
                      tooltipPlacement="top"
                      question={
                        <FormattedMessage
                          id="app.EditLimitsForm.cloneHorizontal.yesNoQuestion"
                          defaultMessage="Do you really want to use these limits for all runtime environments of this test? Please note, that individual environments have different performance characteristics."
                        />
                      }>
                      <Button size="xs" noShadow>
                        <Icon icon="arrows-alt-h" fixedWidth />
                      </Button>
                    </Confirm>
                  )}
                  {testsCount > 1 && environmentsCount > 1 && (
                    <Confirm
                      id={`confirm.${id}.time.all`}
                      onConfirmed={cloneAll('time')}
                      tooltip={
                        <FormattedMessage
                          id="app.editLimitsField.tooltip.cloneAll"
                          defaultMessage="Copy this value to all tests in all environments."
                        />
                      }
                      tooltipPlacement="top"
                      question={
                        <FormattedMessage
                          id="app.EditLimitsForm.cloneAll.yesNoQuestion"
                          defaultMessage="Do you really want to use these limits for all the tests of all runtime environments? Please note, that individual environments have different performance characteristics."
                        />
                      }>
                      <Button size="xs" noShadow>
                        <Icon icon="arrows-alt" fixedWidth />
                      </Button>
                    </Confirm>
                  )}
                </>
              )
            }
            {...props}
          />
        </Col>
      </Row>
    </Container>
  );
};

EditLimitsField.propTypes = {
  id: PropTypes.string.isRequired,
  cloneVertically: PropTypes.func.isRequired,
  cloneHorizontally: PropTypes.func.isRequired,
  cloneAll: PropTypes.func.isRequired,
  prefix: PropTypes.string.isRequired,
  testsCount: PropTypes.number.isRequired,
  environmentsCount: PropTypes.number.isRequired,
  disabled: PropTypes.bool,
};

export default EditLimitsField;
