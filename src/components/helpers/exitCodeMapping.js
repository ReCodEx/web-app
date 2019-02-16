import React from 'react';
import { FormattedMessage } from 'react-intl';

/**
 * Free Pascal Runtime Error Codes
 * https://www.freepascal.org/docs-html/user/userap4.html
 */
const pascalCodes = {
  0: <FormattedMessage id="app.exitCodes.pascal.0" defaultMessage="OK" />,
  1: <FormattedMessage id="app.exitCodes.pascal.1" defaultMessage="Invalid function number" />,
  2: <FormattedMessage id="app.exitCodes.pascal.2" defaultMessage="File not found" />,
  3: <FormattedMessage id="app.exitCodes.pascal.3" defaultMessage="Path not found" />,
  4: <FormattedMessage id="app.exitCodes.pascal.4" defaultMessage="Too many open files" />,
  5: <FormattedMessage id="app.exitCodes.pascal.5" defaultMessage="File access denied" />,
  6: <FormattedMessage id="app.exitCodes.pascal.6" defaultMessage="Invalid file handle" />,
  12: <FormattedMessage id="app.exitCodes.pascal.12" defaultMessage="Invalid file access code" />,
  15: <FormattedMessage id="app.exitCodes.pascal.15" defaultMessage="Invalid drive number" />,
  16: <FormattedMessage id="app.exitCodes.pascal.16" defaultMessage="Cannot remove current directory" />,
  17: <FormattedMessage id="app.exitCodes.pascal.17" defaultMessage="Cannot rename across drives" />,
  100: <FormattedMessage id="app.exitCodes.pascal.100" defaultMessage="Disk read error" />,
  101: <FormattedMessage id="app.exitCodes.pascal.101" defaultMessage="Disk write error" />,
  102: <FormattedMessage id="app.exitCodes.pascal.102" defaultMessage="File not assigned" />,
  103: <FormattedMessage id="app.exitCodes.pascal.103" defaultMessage="File not open" />,
  104: <FormattedMessage id="app.exitCodes.pascal.104" defaultMessage="File not open for input" />,
  105: <FormattedMessage id="app.exitCodes.pascal.105" defaultMessage="File not open for output" />,
  106: <FormattedMessage id="app.exitCodes.pascal.106" defaultMessage="Invalid numeric format" />,
  150: <FormattedMessage id="app.exitCodes.pascal.150" defaultMessage="Disk is write-protected" />,
  151: <FormattedMessage id="app.exitCodes.pascal.151" defaultMessage="Bad drive request struct length" />,
  152: <FormattedMessage id="app.exitCodes.pascal.152" defaultMessage="Drive not ready" />,
  154: <FormattedMessage id="app.exitCodes.pascal.154" defaultMessage="CRC error in data" />,
  156: <FormattedMessage id="app.exitCodes.pascal.156" defaultMessage="Disk seek error" />,
  157: <FormattedMessage id="app.exitCodes.pascal.157" defaultMessage="Unknown media type" />,
  158: <FormattedMessage id="app.exitCodes.pascal.158" defaultMessage="Sector Not Found" />,
  159: <FormattedMessage id="app.exitCodes.pascal.159" defaultMessage="Printer out of paper" />,
  160: <FormattedMessage id="app.exitCodes.pascal.160" defaultMessage="Device write fault" />,
  161: <FormattedMessage id="app.exitCodes.pascal.161" defaultMessage="Device read fault" />,
  162: <FormattedMessage id="app.exitCodes.pascal.162" defaultMessage="Hardware failure" />,
  200: <FormattedMessage id="app.exitCodes.pascal.200" defaultMessage="Division by zero" />,
  201: <FormattedMessage id="app.exitCodes.pascal.201" defaultMessage="Range check error" />,
  202: <FormattedMessage id="app.exitCodes.pascal.202" defaultMessage="Stack overflow error" />,
  203: <FormattedMessage id="app.exitCodes.pascal.203" defaultMessage="Heap overflow error" />,
  204: <FormattedMessage id="app.exitCodes.pascal.204" defaultMessage="Invalid pointer operation" />,
  205: <FormattedMessage id="app.exitCodes.pascal.205" defaultMessage="Floating point overflow" />,
  206: <FormattedMessage id="app.exitCodes.pascal.206" defaultMessage="Floating point underflow" />,
  207: <FormattedMessage id="app.exitCodes.pascal.207" defaultMessage="Invalid floating point operation" />,
  210: <FormattedMessage id="app.exitCodes.pascal.210" defaultMessage="Object not initialized" />,
  211: <FormattedMessage id="app.exitCodes.pascal.211" defaultMessage="Call to abstract method" />,
  212: <FormattedMessage id="app.exitCodes.pascal.212" defaultMessage="Stream registration error" />,
  213: <FormattedMessage id="app.exitCodes.pascal.213" defaultMessage="Collection index out of range" />,
  214: <FormattedMessage id="app.exitCodes.pascal.214" defaultMessage="Collection overflow error" />,
  215: <FormattedMessage id="app.exitCodes.pascal.215" defaultMessage="Arithmetic overflow error" />,
  216: <FormattedMessage id="app.exitCodes.pascal.216" defaultMessage="General Protection fault" />,
  217: <FormattedMessage id="app.exitCodes.pascal.217" defaultMessage="Unhandled exception occurred" />,
  218: <FormattedMessage id="app.exitCodes.pascal.218" defaultMessage="Invalid value specified" />,
  219: <FormattedMessage id="app.exitCodes.pascal.219" defaultMessage="Invalid typecast" />,
  222: <FormattedMessage id="app.exitCodes.pascal.222" defaultMessage="Variant dispatch error" />,
  223: <FormattedMessage id="app.exitCodes.pascal.223" defaultMessage="Variant array create" />,
  224: <FormattedMessage id="app.exitCodes.pascal.224" defaultMessage="Variant is not an array" />,
  225: <FormattedMessage id="app.exitCodes.pascal.225" defaultMessage="Var Array Bounds check error" />,
  227: <FormattedMessage id="app.exitCodes.pascal.227" defaultMessage="Assertion failed error" />,
  229: <FormattedMessage id="app.exitCodes.pascal.229" defaultMessage="Safecall error check" />,
  231: <FormattedMessage id="app.exitCodes.pascal.231" defaultMessage="Exception stack corrupted" />,
  232: <FormattedMessage id="app.exitCodes.pascal.232" defaultMessage="Threads not supported" />,
};

const python3Codes = {
  0: <FormattedMessage id="app.exitCodes.python3.0" defaultMessage="OK" />,
  1: <FormattedMessage id="app.exitCodes.python3.1" defaultMessage="Base exception" />,
  101: <FormattedMessage id="app.exitCodes.python3.101" defaultMessage="Assertion error" />,
  102: <FormattedMessage id="app.exitCodes.python3.102" defaultMessage="Type error" />,
  103: <FormattedMessage id="app.exitCodes.python3.103" defaultMessage="Name error" />,
  104: <FormattedMessage id="app.exitCodes.python3.104" defaultMessage="End of file error" />,
  105: <FormattedMessage id="app.exitCodes.python3.105" defaultMessage="Attribute error" />,
  106: <FormattedMessage id="app.exitCodes.python3.106" defaultMessage="IO error" />,
  107: <FormattedMessage id="app.exitCodes.python3.107" defaultMessage="OS error" />,
  108: <FormattedMessage id="app.exitCodes.python3.108" defaultMessage="Lookup error" />,
  109: <FormattedMessage id="app.exitCodes.python3.109" defaultMessage="Value error" />,
  110: <FormattedMessage id="app.exitCodes.python3.110" defaultMessage="Zero division error" />,
  111: <FormattedMessage id="app.exitCodes.python3.111" defaultMessage="Arithmetic error" />,
  112: <FormattedMessage id="app.exitCodes.python3.112" defaultMessage="Import error" />,
  113: <FormattedMessage id="app.exitCodes.python3.113" defaultMessage="Memory error" />,
  114: <FormattedMessage id="app.exitCodes.python3.114" defaultMessage="Syntax error" />,
};

const exitCodeMapping = (runtimeEnvironmentId, exitCode) => {
  if (exitCode === -1) {
    return <FormattedMessage id="app.exitCodes.unknown" defaultMessage="Unknown" />;
  }

  switch (runtimeEnvironmentId) {
    case 'java':
      return javaMapping(exitCode);
    case 'mono':
      return monoMapping(exitCode);
    case 'freepascal-linux':
      if (pascalCodes[exitCode]) {
        return pascalCodes[exitCode];
      } else {
        return exitCode;
      }
    case 'python3':
      if (python3Codes[exitCode]) {
        return python3Codes[exitCode];
      } else {
        return exitCode;
      }
    default:
      return exitCode;
  }
};

// TODO - eventually replace those switches with objects.
const javaMapping = exitCode => {
  switch (exitCode) {
    case 0:
      return <FormattedMessage id="app.exitCodes.java.0" defaultMessage="OK" />;
    case 1:
      return <FormattedMessage id="app.exitCodes.java.1" defaultMessage="Unknown error" />;
    case 2:
      return <FormattedMessage id="app.exitCodes.java.2" defaultMessage="Other invocation target exception" />;
    case 100:
      return <FormattedMessage id="app.exitCodes.java.100" defaultMessage="Out of memory exception" />;
    case 101:
      return <FormattedMessage id="app.exitCodes.java.101" defaultMessage="Security exception" />;
    case 102:
      return <FormattedMessage id="app.exitCodes.java.102" defaultMessage="Main class not found exception" />;
    case 103:
      return <FormattedMessage id="app.exitCodes.java.103" defaultMessage="Multiple main classes found" />;
    case 104:
      return <FormattedMessage id="app.exitCodes.java.104" defaultMessage="Illegal access exception" />;
    case 105:
      return <FormattedMessage id="app.exitCodes.java.105" defaultMessage="Illegal argument exception" />;
    case 106:
      return <FormattedMessage id="app.exitCodes.java.106" defaultMessage="Stack overflow exception" />;
    case 107:
      return <FormattedMessage id="app.exitCodes.java.107" defaultMessage="Array index out of bounds exception" />;
    case 108:
      return <FormattedMessage id="app.exitCodes.java.108" defaultMessage="Index out of bounds exception" />;
    case 109:
      return <FormattedMessage id="app.exitCodes.java.109" defaultMessage="Null pointer exception" />;
    case 110:
      return <FormattedMessage id="app.exitCodes.java.110" defaultMessage="Arithmetic exception" />;
    case 111:
      return <FormattedMessage id="app.exitCodes.java.111" defaultMessage="Out of memory error" />;
    case 112:
      return <FormattedMessage id="app.exitCodes.java.112" defaultMessage="Security exception" />;
    case 113:
      return <FormattedMessage id="app.exitCodes.java.113" defaultMessage="IO exception" />;
    default:
      return exitCode;
  }
};

const monoMapping = exitCode => {
  switch (exitCode) {
    case 0:
      return <FormattedMessage id="app.exitCodes.mono.0" defaultMessage="OK" />;
    case 1:
      return <FormattedMessage id="app.exitCodes.mono.1" defaultMessage="User error" />;
    case 101:
      return <FormattedMessage id="app.exitCodes.mono.101" defaultMessage="Unhandled exception" />;
    case 102:
      return <FormattedMessage id="app.exitCodes.mono.102" defaultMessage="Null reference error" />;
    case 103:
      return <FormattedMessage id="app.exitCodes.mono.103" defaultMessage="Memory allocation error" />;
    case 104:
      return <FormattedMessage id="app.exitCodes.mono.104" defaultMessage="Index out of range error" />;
    case 105:
      return <FormattedMessage id="app.exitCodes.mono.105" defaultMessage="Overflow error" />;
    case 106:
      return <FormattedMessage id="app.exitCodes.mono.106" defaultMessage="IO error" />;
    case 107:
      return <FormattedMessage id="app.exitCodes.mono.107" defaultMessage="File not found error" />;
    case 108:
      return <FormattedMessage id="app.exitCodes.mono.108" defaultMessage="Invalid operation error" />;
    case 109:
      return <FormattedMessage id="app.exitCodes.mono.109" defaultMessage="Division by zero error" />;
    case 200:
      return <FormattedMessage id="app.exitCodes.mono.200" defaultMessage="Internal error" />;
    case 201:
      return <FormattedMessage id="app.exitCodes.mono.201" defaultMessage="No main method" />;
    case 202:
      return <FormattedMessage id="app.exitCodes.mono.202" defaultMessage="More main methods" />;
    default:
      return exitCode;
  }
};

export default exitCodeMapping;
