import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Table } from 'react-bootstrap';
import prettyMs from 'pretty-ms';

import { prettyPrintBytes } from '../../helpers/stringFormatters.js';
import Box from '../../widgets/Box';
import { getLimitsConstraintsOfSingleGroup } from '../../../helpers/exercise/limits.js';
import Icon from '../../icons';

const HardwareGroupMetadata = ({ hardwareGroup, isSuperAdmin = false }) => {
  const constraints = getLimitsConstraintsOfSingleGroup(hardwareGroup);
  return (
    <Box
      title={<FormattedMessage id="app.hardwareGroupMetadata.title" defaultMessage="Hardware Group Metadata" />}
      description={<h5 className="fw-bold">{hardwareGroup.name}</h5>}
      type="primary"
      unlimitedHeight>
      <Table className="card-table">
        <tbody>
          {Boolean(isSuperAdmin) && (
            <tr>
              <th>
                <FormattedMessage id="app.hardwareGroupMetadata.id" defaultMessage="Internal Identifier:" />
              </th>
              <td>
                <code>{hardwareGroup.id}</code>
              </td>
            </tr>
          )}
          {Boolean(isSuperAdmin) && (
            <tr>
              <th>
                <FormattedMessage id="app.hardwareGroupMetadata.description" defaultMessage="Internal Description:" />
              </th>
              <td>{hardwareGroup.description}</td>
            </tr>
          )}
          <tr>
            <th>
              <FormattedMessage id="app.hardwareGroupMetadata.memoryConstraints" defaultMessage="Memory Constraints:" />
            </th>
            <td>
              <span>
                <Icon
                  icon="braille"
                  tooltipId="memory-icon"
                  tooltipPlacement="top"
                  tooltip={
                    <FormattedMessage
                      id="app.hardwareGroupMetadata.memoryOverlay"
                      defaultMessage="Memory limit constraints"
                    />
                  }
                />
                &nbsp;&nbsp;
                {prettyPrintBytes(constraints.memory.min * 1024)} ... {prettyPrintBytes(constraints.memory.max * 1024)}
              </span>
            </td>
          </tr>
          <tr>
            <th>
              <FormattedMessage
                id="app.hardwareGroupMetadata.timePerTestConstraints"
                defaultMessage="Time Per Test Constraints:"
              />
            </th>
            <td>
              {constraints.cpuTimePerTest.min === constraints.wallTimePerTest.min &&
              constraints.cpuTimePerTest.max === constraints.wallTimePerTest.max ? (
                <span className="text-nowrap">
                  <Icon
                    icon={['far', 'clock']}
                    tooltipId="time-test-icon"
                    tooltipPlacement="top"
                    tooltip={
                      <FormattedMessage
                        id="app.hardwareGroupMetadata.timeOverlay"
                        defaultMessage="Both precise (CPU) and wall time limit constraints"
                      />
                    }
                  />
                  &nbsp;&nbsp;
                  {prettyMs(constraints.cpuTimePerTest.min * 1000)} ...{' '}
                  {prettyMs(constraints.cpuTimePerTest.max * 1000)}
                </span>
              ) : (
                <span className="text-nowrap">
                  <Icon
                    icon="microchip"
                    tooltipId="cpu-time-test-icon"
                    tooltipPlacement="top"
                    tooltip={
                      <FormattedMessage
                        id="app.hardwareGroupMetadata.cpuTimeOverlay"
                        defaultMessage="Precise (CPU) time limit constraints"
                      />
                    }
                  />
                  &nbsp;&nbsp;
                  {prettyMs(constraints.cpuTimePerTest.min * 1000)} ...{' '}
                  {prettyMs(constraints.cpuTimePerTest.max * 1000)}
                  &nbsp;&nbsp;&nbsp;&nbsp;
                  <Icon
                    icon={['far', 'clock']}
                    tooltipId="wall-time-test-icon"
                    tooltipPlacement="top"
                    tooltip={
                      <FormattedMessage
                        id="app.hardwareGroupMetadata.wallTimeOverlay"
                        defaultMessage="Wall time limit constraints"
                      />
                    }
                  />
                  &nbsp;&nbsp;
                  {prettyMs(constraints.wallTimePerTest.min * 1000)} ...{' '}
                  {prettyMs(constraints.wallTimePerTest.max * 1000)}
                </span>
              )}
            </td>
          </tr>
          <tr>
            <th>
              <FormattedMessage
                id="app.hardwareGroupMetadata.timePerExerciseConstraints"
                defaultMessage="Total Time Per Exercise Constraints:"
              />
            </th>
            <td>
              {constraints.cpuTimePerExercise.min === constraints.wallTimePerExercise.min &&
              constraints.cpuTimePerExercise.max !== constraints.wallTimePerExercise.max ? (
                <span className="text-nowrap">
                  <Icon
                    icon={['far', 'clock']}
                    tooltipId="time-test-icon"
                    tooltipPlacement="top"
                    tooltip={
                      <FormattedMessage
                        id="app.hardwareGroupMetadata.timeOverlay"
                        defaultMessage="Both precise (CPU) and wall time limit constraints"
                      />
                    }
                  />
                  &nbsp;&nbsp;
                  {prettyMs(constraints.cpuTimePerExercise.min * 1000)} ...{' '}
                  {prettyMs(constraints.cpuTimePerExercise.max * 1000)}
                </span>
              ) : (
                <span className="text-nowrap">
                  <Icon
                    icon="microchip"
                    tooltipId="cpu-time-test-icon"
                    tooltipPlacement="top"
                    tooltip={
                      <FormattedMessage
                        id="app.hardwareGroupMetadata.cpuTimeOverlay"
                        defaultMessage="Precise (CPU) time limit constraints"
                      />
                    }
                  />
                  &nbsp;&nbsp;
                  {prettyMs(constraints.cpuTimePerExercise.min * 1000)} ...{' '}
                  {prettyMs(constraints.cpuTimePerExercise.max * 1000)}
                  &nbsp;&nbsp;&nbsp;&nbsp;
                  <Icon
                    icon={['far', 'clock']}
                    tooltipId="wall-time-test-icon"
                    tooltipPlacement="top"
                    tooltip={
                      <FormattedMessage
                        id="app.hardwareGroupMetadata.wallTimeOverlay"
                        defaultMessage="Wall time limit constraints"
                      />
                    }
                  />
                  &nbsp;&nbsp;
                  {prettyMs(constraints.wallTimePerExercise.min * 1000)} ...{' '}
                  {prettyMs(constraints.wallTimePerExercise.max * 1000)}
                </span>
              )}
            </td>
          </tr>
        </tbody>
      </Table>
    </Box>
  );
};

HardwareGroupMetadata.propTypes = {
  hardwareGroup: PropTypes.object.isRequired,
  isSuperAdmin: PropTypes.bool,
  links: PropTypes.object,
};

export default HardwareGroupMetadata;
