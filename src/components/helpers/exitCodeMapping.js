import React from 'react';
import { FormattedMessage } from 'react-intl';
import {
  ENV_FREEPASCAL_ID,
  ENV_CS_DOTNET_CORE_ID,
  ENV_JAVA_ID,
  ENV_PYTHON3_ID,
} from '../../helpers/exercise/environments.js';

const TRANSLATIONS = {
  [ENV_FREEPASCAL_ID]: {
    /*
     * Free Pascal Runtime Error Codes
     * https://www.freepascal.org/docs-html/user/userap4.html
     */
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
  },
  [ENV_PYTHON3_ID]: {
    // translation from exceptions to exit codes provided by python wrapper
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
    115: <FormattedMessage id="app.exitCodes.python3.115" defaultMessage="Recursion error" />,
  },
  [ENV_JAVA_ID]: {
    // translation from exceptions to exit codes provided by java wrapper
    1: <FormattedMessage id="app.exitCodes.java.1" defaultMessage="Unknown error" />,
    2: <FormattedMessage id="app.exitCodes.java.2" defaultMessage="Other invocation target exception" />,
    100: <FormattedMessage id="app.exitCodes.java.100" defaultMessage="Out of memory exception" />,
    101: <FormattedMessage id="app.exitCodes.java.101" defaultMessage="Security exception" />,
    102: <FormattedMessage id="app.exitCodes.java.102" defaultMessage="Main class not found exception" />,
    103: <FormattedMessage id="app.exitCodes.java.103" defaultMessage="Multiple main classes found" />,
    104: <FormattedMessage id="app.exitCodes.java.104" defaultMessage="Illegal access exception" />,
    105: <FormattedMessage id="app.exitCodes.java.105" defaultMessage="Illegal argument exception" />,
    106: <FormattedMessage id="app.exitCodes.java.106" defaultMessage="Stack overflow exception" />,
    107: <FormattedMessage id="app.exitCodes.java.107" defaultMessage="Array index out of bounds exception" />,
    108: <FormattedMessage id="app.exitCodes.java.108" defaultMessage="Index out of bounds exception" />,
    109: <FormattedMessage id="app.exitCodes.java.109" defaultMessage="Null pointer exception" />,
    110: <FormattedMessage id="app.exitCodes.java.110" defaultMessage="Arithmetic exception" />,
    111: <FormattedMessage id="app.exitCodes.java.111" defaultMessage="Out of memory error" />,
    112: <FormattedMessage id="app.exitCodes.java.112" defaultMessage="Security exception" />,
    113: <FormattedMessage id="app.exitCodes.java.113" defaultMessage="IO exception" />,
  },
  [ENV_CS_DOTNET_CORE_ID]: {
    // translation from exceptions to exit codes provided by C# wrapper
    1: <FormattedMessage id="app.exitCodes.csharp.1" defaultMessage="User error" />,
    101: <FormattedMessage id="app.exitCodes.csharp.101" defaultMessage="Unhandled exception" />,
    102: <FormattedMessage id="app.exitCodes.csharp.102" defaultMessage="Null reference error" />,
    103: <FormattedMessage id="app.exitCodes.csharp.103" defaultMessage="Memory allocation error" />,
    104: <FormattedMessage id="app.exitCodes.csharp.104" defaultMessage="Index out of range error" />,
    105: <FormattedMessage id="app.exitCodes.csharp.105" defaultMessage="Overflow error" />,
    106: <FormattedMessage id="app.exitCodes.csharp.106" defaultMessage="IO error" />,
    107: <FormattedMessage id="app.exitCodes.csharp.107" defaultMessage="File not found error" />,
    108: <FormattedMessage id="app.exitCodes.csharp.108" defaultMessage="Invalid operation error" />,
    109: <FormattedMessage id="app.exitCodes.csharp.109" defaultMessage="Division by zero error" />,
    200: <FormattedMessage id="app.exitCodes.csharp.200" defaultMessage="Internal error" />,
    201: <FormattedMessage id="app.exitCodes.csharp.201" defaultMessage="No main method" />,
    202: <FormattedMessage id="app.exitCodes.csharp.202" defaultMessage="More main methods" />,
  },
};

const exitCodeMapping = (runtimeEnvironmentId, exitCode) => {
  if (exitCode === -1) {
    return <FormattedMessage id="app.exitCodes.unknown" defaultMessage="Unknown" />;
  }
  return TRANSLATIONS[runtimeEnvironmentId]?.[exitCode] || exitCode;
};

export default exitCodeMapping;
