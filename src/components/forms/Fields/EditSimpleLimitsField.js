import React from 'react';
import PropTypes from 'prop-types';
import { Field, formValues } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import Icon from 'react-fontawesome';

import { TextField } from '../Fields';
import FlatButton from '../../widgets/FlatButton';
import Confirm from '../../forms/Confirm';

import { prettyPrintBytes } from '../../helpers/stringFormatters';
import prettyMs from 'pretty-ms';

import styles from './EditSimpleLimitsField.less';

const EditSimpleLimitsField = ({
  prefix,
  id,
  memoryValue,
  wallTimeValue,
  testsCount,
  environmentsCount,
  setHorizontally,
  setVertically,
  setAll,
  ...props
}) =>
  <div>
    <Row>
      <Col lg={environmentsCount >= 3 ? 12 : 6} md={12}>
        <table>
          <tbody>
            <tr>
              <td width="100%">
                <Field
                  name={`${prefix}.memory`}
                  component={TextField}
                  label={
                    <FormattedMessage
                      id="app.fields.limits.memory"
                      defaultMessage="Memory Limit [KiB]:"
                    />
                  }
                  {...props}
                />
              </td>
              <td className={styles.buttonsCol}>
                <b>
                  {Number.isNaN(Number(memoryValue))
                    ? '-'
                    : prettyPrintBytes(Number(memoryValue) * 1024)}
                </b>
                <br />

                {testsCount > 1 &&
                  <FlatButton onClick={setVertically} bsSize="xs">
                    <Icon name="arrows-v" />
                  </FlatButton>}
                {environmentsCount > 1 &&
                  <Confirm
                    id={`confirm.${id}.memory.horizontal`}
                    onConfirmed={setHorizontally}
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
                    onConfirmed={setAll}
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
            <tr>
              <td width="100%">
                <Field
                  name={`${prefix}.wall-time`}
                  component={TextField}
                  label={
                    <FormattedMessage
                      id="app.fields.limits.time"
                      defaultMessage="Time Limit [s]:"
                    />
                  }
                  {...props}
                />
              </td>
              <td className={styles.buttonsCol}>
                <b>
                  {Number.isNaN(Number(wallTimeValue))
                    ? '-'
                    : prettyMs(Number(wallTimeValue) * 1000)}
                </b>
                <br />

                {testsCount > 1 &&
                  <FlatButton onClick={setVertically} bsSize="xs">
                    <Icon name="arrows-v" />
                  </FlatButton>}
                {environmentsCount > 1 &&
                  <Confirm
                    id={`confirm.${id}.wall-time.horizontal`}
                    onConfirmed={setHorizontally}
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
                    onConfirmed={setAll}
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
  setHorizontally: PropTypes.func.isRequired,
  setVertically: PropTypes.func.isRequired,
  setAll: PropTypes.func.isRequired,
  prefix: PropTypes.string.isRequired,
  memoryValue: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    .isRequired,
  wallTimeValue: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    .isRequired,
  testsCount: PropTypes.number.isRequired,
  environmentsCount: PropTypes.number.isRequired
};

export default formValues(props => ({
  memoryValue: `${props.prefix}.memory`,
  wallTimeValue: `${props.prefix}.wall-time`
}))(EditSimpleLimitsField);
