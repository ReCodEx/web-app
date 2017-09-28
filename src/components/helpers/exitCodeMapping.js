import React from 'react';
import { FormattedMessage } from 'react-intl';

const exitCodeMapping = (runtimeEnvironmentId, exitCode) => {
  switch (runtimeEnvironmentId) {
    case 'java':
      return javaMapping(exitCode);
    case 'mono':
      return monoMapping(exitCode);
    default:
      return exitCode;
  }
};

const javaMapping = exitCode => {
  switch (exitCode) {
    case 0:
      return <FormattedMessage id="app.exitCodes.java.0" defaultMessage="OK" />;
    case 1:
      return (
        <FormattedMessage
          id="app.exitCodes.java.1"
          defaultMessage="Unknown error"
        />
      );
    case 2:
      return (
        <FormattedMessage
          id="app.exitCodes.java.2"
          defaultMessage="Other invocation target exception"
        />
      );
    case 100:
      return (
        <FormattedMessage
          id="app.exitCodes.java.100"
          defaultMessage="Out of memory exception"
        />
      );
    case 101:
      return (
        <FormattedMessage
          id="app.exitCodes.java.101"
          defaultMessage="Security exception"
        />
      );
    case 102:
      return (
        <FormattedMessage
          id="app.exitCodes.java.102"
          defaultMessage="Class not found exception"
        />
      );
    case 103:
      return (
        <FormattedMessage
          id="app.exitCodes.java.103"
          defaultMessage="No such method exception"
        />
      );
    case 104:
      return (
        <FormattedMessage
          id="app.exitCodes.java.104"
          defaultMessage="Illegal access exception"
        />
      );
    case 105:
      return (
        <FormattedMessage
          id="app.exitCodes.java.105"
          defaultMessage="Illegal argument exception"
        />
      );
    case 106:
      return (
        <FormattedMessage
          id="app.exitCodes.java.106"
          defaultMessage="Stack overflow exception"
        />
      );
    case 107:
      return (
        <FormattedMessage
          id="app.exitCodes.java.107"
          defaultMessage="Array index out of bounds exception"
        />
      );
    case 108:
      return (
        <FormattedMessage
          id="app.exitCodes.java.108"
          defaultMessage="Index out of bounds exception"
        />
      );
    case 109:
      return (
        <FormattedMessage
          id="app.exitCodes.java.109"
          defaultMessage="Null pointer exception"
        />
      );
    case 110:
      return (
        <FormattedMessage
          id="app.exitCodes.java.110"
          defaultMessage="Arithmetic exception"
        />
      );
    case 111:
      return (
        <FormattedMessage
          id="app.exitCodes.java.111"
          defaultMessage="Out of memory error"
        />
      );
    case 112:
      return (
        <FormattedMessage
          id="app.exitCodes.java.112"
          defaultMessage="Security exception"
        />
      );
    case 113:
      return (
        <FormattedMessage
          id="app.exitCodes.java.113"
          defaultMessage="IO exception"
        />
      );
    default:
      return exitCode;
  }
};

const monoMapping = exitCode => {
  switch (exitCode) {
    case 0:
      return <FormattedMessage id="app.exitCodes.mono.0" defaultMessage="OK" />;
    case 1:
      return (
        <FormattedMessage
          id="app.exitCodes.mono.1"
          defaultMessage="User error"
        />
      );
    case 101:
      return (
        <FormattedMessage
          id="app.exitCodes.mono.101"
          defaultMessage="Unhandled exception"
        />
      );
    case 102:
      return (
        <FormattedMessage
          id="app.exitCodes.mono.102"
          defaultMessage="Null reference error"
        />
      );
    case 103:
      return (
        <FormattedMessage
          id="app.exitCodes.mono.103"
          defaultMessage="Memory allocation error"
        />
      );
    case 104:
      return (
        <FormattedMessage
          id="app.exitCodes.mono.104"
          defaultMessage="Index out of range error"
        />
      );
    case 105:
      return (
        <FormattedMessage
          id="app.exitCodes.mono.105"
          defaultMessage="Overflow error"
        />
      );
    case 106:
      return (
        <FormattedMessage
          id="app.exitCodes.mono.106"
          defaultMessage="IO error"
        />
      );
    case 107:
      return (
        <FormattedMessage
          id="app.exitCodes.mono.107"
          defaultMessage="File not found error"
        />
      );
    case 108:
      return (
        <FormattedMessage
          id="app.exitCodes.mono.108"
          defaultMessage="Invalid operation error"
        />
      );
    case 109:
      return (
        <FormattedMessage
          id="app.exitCodes.mono.109"
          defaultMessage="Division by zero error"
        />
      );
    case 200:
      return (
        <FormattedMessage
          id="app.exitCodes.mono.200"
          defaultMessage="Internal error"
        />
      );
    case 201:
      return (
        <FormattedMessage
          id="app.exitCodes.mono.201"
          defaultMessage="No main method"
        />
      );
    case 202:
      return (
        <FormattedMessage
          id="app.exitCodes.mono.202"
          defaultMessage="More main methods"
        />
      );
    default:
      return exitCode;
  }
};

export default exitCodeMapping;
