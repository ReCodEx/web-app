import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import Icon from 'react-fontawesome';

import FlatButton from '../../widgets/FlatButton';
import Confirm from '../../forms/Confirm';
import LimitsValueField from './LimitsValueField';

import { prettyPrintBytes } from '../../helpers/stringFormatters';
import prettyMs from 'pretty-ms';

import styles from './EditSimpleLimitsField.less';

const prettyPrintBytesWrap = value =>
  Number.isNaN(Number(value)) ? '-' : prettyPrintBytes(Number(value) * 1024);

const prettyPrintMsWrap = value =>
  Number.isNaN(Number(value)) ? '-' : prettyMs(Number(value) * 1000);

/**
 * These limits are only soft limits applied in webapp.
 * Note that hard maxima are in worker configuration /etc/recodex/worker on all worker hosts.
 * If you need to change this, worker limits should probably be changed as well.
 */
const limitRanges = {
  memory: {
    min: 128,
    max: 1024 * 1024 // 1GiB
  },
  time: {
    min: 0.1,
    max: 60
  }
};

const validateValue = (ranges, pretty) => value => {
  const num = Number(value);
  if (Number.isNaN(num)) {
    return (
      <FormattedMessage
        id="app.EditSimpleLimitsForm.validation.NaN"
        defaultMessage="Given value is not a number."
      />
    );
  }

  if (num < ranges.min) {
    return (
      <FormattedMessage
        id="app.EditSimpleLimitsForm.validation.tooLow"
        defaultMessage="Given value is below the recommended minimum ({min})."
        values={{ min: pretty(ranges.min) }}
      />
    );
  }
  if (num > ranges.max) {
    return (
      <FormattedMessage
        id="app.EditSimpleLimitsForm.validation.tooHigh"
        defaultMessage="Given value exceeds the recommended maximum ({max})."
        values={{ max: pretty(ranges.max) }}
      />
    );
  }
  return undefined;
};

const validateMemory = validateValue(limitRanges.memory, prettyPrintBytesWrap);
const validateTime = validateValue(limitRanges.time, prettyPrintMsWrap);

const EditSimpleLimitsField = ({
  prefix,
  id,
  testsCount,
  environmentsCount,
  cloneVertically,
  cloneHorizontally,
  cloneAll,
  ...props
}) =>
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
                  defaultMessage="Memory Limit [KiB]:"
                />
              }
              validate={validateMemory}
              {...props}
            />
            <tr>
              <td className={styles.buttonsCol}>
                {testsCount > 1 &&
                  <FlatButton onClick={cloneVertically('memory')} bsSize="xs">
                    <Icon name="arrows-v" />
                  </FlatButton>}
                {environmentsCount > 1 &&
                  <Confirm
                    id={`confirm.${id}.memory.horizontal`}
                    onConfirmed={cloneHorizontally('memory')}
                    question={
                      <FormattedMessage
                        id="app.EditLimitsForm.cloneHorizontal.yesNoQuestion"
                        defaultMessage="Do you really want to use these limits for all runtime environments of this test? Pleae note, that individual environments have different performance characteristics."
                      />
                    }
                  >
                    <FlatButton bsSize="xs">
                      <Icon name="arrows-h" />
                    </FlatButton>
                  </Confirm>}
                {testsCount > 1 &&
                  environmentsCount > 1 &&
                  <Confirm
                    id={`confirm.${id}.memory.all`}
                    onConfirmed={cloneAll('memory')}
                    question={
                      <FormattedMessage
                        id="app.EditLimitsForm.cloneAll.yesNoQuestion"
                        defaultMessage="Do you really want to use these limits for all the tests of all runtime environments? Pleae note, that individual environments have different performance characteristics."
                      />
                    }
                  >
                    <FlatButton bsSize="xs">
                      <Icon name="arrows" />
                    </FlatButton>
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
              name={`${prefix}.wall-time`}
              component={LimitsValueField}
              prettyPrint={prettyPrintMsWrap}
              validate={validateTime}
              label={
                <FormattedMessage
                  id="app.fields.limits.time"
                  defaultMessage="Time Limit [s]:"
                />
              }
              {...props}
            />
            <tr>
              <td className={styles.buttonsCol}>
                {testsCount > 1 &&
                  <FlatButton
                    onClick={cloneVertically('wall-time')}
                    bsSize="xs"
                  >
                    <Icon name="arrows-v" />
                  </FlatButton>}
                {environmentsCount > 1 &&
                  <Confirm
                    id={`confirm.${id}.wall-time.horizontal`}
                    onConfirmed={cloneHorizontally('wall-time')}
                    question={
                      <FormattedMessage
                        id="app.EditLimitsForm.cloneHorizontal.yesNoQuestion"
                        defaultMessage="Do you really want to use these limits for all runtime environments of this test? Pleae note, that individual environments have different performance characteristics."
                      />
                    }
                  >
                    <FlatButton bsSize="xs">
                      <Icon name="arrows-h" />
                    </FlatButton>
                  </Confirm>}
                {testsCount > 1 &&
                  environmentsCount > 1 &&
                  <Confirm
                    id={`confirm.${id}.wall-time.all`}
                    onConfirmed={cloneAll('wall-time')}
                    question={
                      <FormattedMessage
                        id="app.EditLimitsForm.cloneAll.yesNoQuestion"
                        defaultMessage="Do you really want to use these limits for all the tests of all runtime environments? Pleae note, that individual environments have different performance characteristics."
                      />
                    }
                  >
                    <FlatButton bsSize="xs">
                      <Icon name="arrows" />
                    </FlatButton>
                  </Confirm>}
              </td>
            </tr>
          </tbody>
        </table>
      </Col>
    </Row>
  </div>;

EditSimpleLimitsField.propTypes = {
  id: PropTypes.string.isRequired,
  cloneVertically: PropTypes.func.isRequired,
  cloneHorizontally: PropTypes.func.isRequired,
  cloneAll: PropTypes.func.isRequired,
  prefix: PropTypes.string.isRequired,
  testsCount: PropTypes.number.isRequired,
  environmentsCount: PropTypes.number.isRequired
};

export default EditSimpleLimitsField;
