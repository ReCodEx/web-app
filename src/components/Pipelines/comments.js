import React from 'react';
import { FormattedMessage } from 'react-intl';

const BOX_TYPE_DESCRIPTIONS = {
  bison: (
    <FormattedMessage
      id="app.pipelines.boxTypeDescription.bison"
      defaultMessage="Specialized box that executes bison parser generator."
    />
  ),
  'custom-compilation': (
    <FormattedMessage
      id="app.pipelines.boxTypeDescription.custom-compilation"
      defaultMessage="Generic compilation box that invokes any executable and treats it as a compiler. It may also be used for similar tools (e.g., macro preprocessor or liker)."
    />
  ),
  'elf-exec': (
    <FormattedMessage
      id="app.pipelines.boxTypeDescription.elf-exec"
      defaultMessage="Generic box for running solutions which were compiled as ELF executables."
    />
  ),
  'fetch-file': (
    <FormattedMessage
      id="app.pipelines.boxTypeDescription.fetch-file"
      defaultMessage="Input box which ensures download of a single pipeline file into the sandbox."
    />
  ),
  'fetch-files': (
    <FormattedMessage
      id="app.pipelines.boxTypeDescription.fetch-files"
      defaultMessage="Input box which ensures download of pipeline files into the sandbox."
    />
  ),
  'file-name': (
    <FormattedMessage
      id="app.pipelines.boxTypeDescription.file-name"
      defaultMessage="Converts a file into a string which holds internal path to the file. Particularly useful when files needs to be listed in command line arguments."
    />
  ),
  'file-to-array': (
    <FormattedMessage
      id="app.pipelines.boxTypeDescription.file-to-array"
      defaultMessage="Converts a single file into a file-list type with one item."
    />
  ),
  'files-names': (
    <FormattedMessage
      id="app.pipelines.boxTypeDescription.files-names"
      defaultMessage="Converts a list of files into a list of strings where each string holds internal path to the corresponding file. Particularly useful when files needs to be listed in command line arguments."
    />
  ),
  fpc: (
    <FormattedMessage
      id="app.pipelines.boxTypeDescription.fpc"
      defaultMessage="Specialized box that invokes FreePascal compiler."
    />
  ),
  'g++': (
    <FormattedMessage
      id="app.pipelines.boxTypeDescription.gpp"
      defaultMessage="Specialized box that invokes g++ compiler."
    />
  ),
  gcc: (
    <FormattedMessage
      id="app.pipelines.boxTypeDescription.gcc"
      defaultMessage="Specialized box that invokes gcc compiler."
    />
  ),
  'haskell-compilation': (
    <FormattedMessage
      id="app.pipelines.boxTypeDescription.haskell-compilation"
      defaultMessage="Specialized box that invokes Haskell compiler."
    />
  ),
  'haskell-exec': (
    <FormattedMessage
      id="app.pipelines.boxTypeDescription.haskell-exec"
      defaultMessage="Specialized box for executing Haskell programs."
    />
  ),
  'file-in': (
    <FormattedMessage
      id="app.pipelines.boxTypeDescription.file-in"
      defaultMessage="Input box for retrieving a single external file (i.e., file from the user, exercise configuration, or exported from the previous pipeline)."
    />
  ),
  'files-in': (
    <FormattedMessage
      id="app.pipelines.boxTypeDescription.files-in"
      defaultMessage="Input box for retrieving a list of external files (i.e., files from the user, exercise configuration, or exported from the previous pipeline)."
    />
  ),
  'jvm-compilation': (
    <FormattedMessage
      id="app.pipelines.boxTypeDescription.jvm-compilation"
      defaultMessage="Specialized box for invoking Java-based compilers (i.e., compilers that produce JVM bytecode)."
    />
  ),
  'jvm-runner': (
    <FormattedMessage
      id="app.pipelines.boxTypeDescription.jvm-runner"
      defaultMessage="Specialized box for running solutions which were compiled into JVM bytecode."
    />
  ),
  'merge-files': (
    <FormattedMessage
      id="app.pipelines.boxTypeDescription.merge-files"
      defaultMessage="Helper box that concatenates two file lists into one."
    />
  ),
  'merge-strings': (
    <FormattedMessage
      id="app.pipelines.boxTypeDescription.merge-strings"
      defaultMessage="Helper box that concatenates two string lists into one."
    />
  ),
  mcs: (
    <FormattedMessage
      id="app.pipelines.boxTypeDescription.mcs"
      defaultMessage="Specialized box that invokes mcs (Mono C#) compiler. (DEPRECATED)"
    />
  ),
  'mono-exec': (
    <FormattedMessage
      id="app.pipelines.boxTypeDescription.mono-exec"
      defaultMessage="Specialized box that executes C# solution compiled for Mono runtime. (DEPRECATED)"
    />
  ),
  node: (
    <FormattedMessage
      id="app.pipelines.boxTypeDescription.node"
      defaultMessage="Specialized box that executes JavaScript solutions in Nodejs runtime."
    />
  ),
  'file-out': (
    <FormattedMessage
      id="app.pipelines.boxTypeDescription.file-out"
      defaultMessage="Output box that represents a file which is being exported from the pipeline (e.g., to pass newly created executable from compilation pipeline into the next one)."
    />
  ),
  'files-out': (
    <FormattedMessage
      id="app.pipelines.boxTypeDescription.files-out"
      defaultMessage="Output box that represents a list of file which are being exported from the pipeline (e.g., to pass newly created executables from compilation pipeline into the next one)."
    />
  ),
  php: (
    <FormattedMessage
      id="app.pipelines.boxTypeDescription.php"
      defaultMessage="Specialized box that executes PHP solutions using PHP-CLI runtime."
    />
  ),
  python3: (
    <FormattedMessage
      id="app.pipelines.boxTypeDescription.python3"
      defaultMessage="Specialized box that executes Python solutions."
    />
  ),
  judge: (
    <FormattedMessage
      id="app.pipelines.boxTypeDescription.judge"
      defaultMessage="Box that invokes judge that determines correctness of the result yielded by tested solution."
    />
  ),
  'script-exec': (
    <FormattedMessage
      id="app.pipelines.boxTypeDescription.script-exec"
      defaultMessage="Generic box for running solutions in a scripting environment (Bash, Python, PHP, ...)."
    />
  ),
  'string-to-array': (
    <FormattedMessage
      id="app.pipelines.boxTypeDescription.string-to-array"
      defaultMessage="Converts a single string into a string-list type with one item."
    />
  ),
  'prolog-compilation': (
    <FormattedMessage
      id="app.pipelines.boxTypeDescription.prolog-compilation"
      defaultMessage="Specialized box that invokes SWI prolog compiler."
    />
  ),
  'wrapped-exec': (
    <FormattedMessage
      id="app.pipelines.boxTypeDescription.wrapped-exec"
      defaultMessage="Generic box for running solutions in a particular execution environment (Java, Mono, ...)."
    />
  ),
};

export const getBoxTypeDescription = type => BOX_TYPE_DESCRIPTIONS[type] || null;
