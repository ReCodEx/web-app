import { identity } from '../../../helpers/common';

class SortableTableColumnDescriptor {
  constructor(
    id,
    header,
    {
      comparator = null,
      cellRenderer = null,
      style = null,
      className = null,
      headerStyle = null,
      headerClassName = null,
      headerSuffix = null,
      headerSuffixStyle = null,
      headerSuffixClassName = null,
    } = {}
  ) {
    this.id = id;
    this.header = header;
    this.comparator = comparator;
    this.cellRenderer = cellRenderer || identity;
    this.style = style;
    this.headerStyle = headerStyle;
    this.className = className;
    this.headerClassName = headerClassName;
    this.headerSuffix = headerSuffix;
    this.headerSuffixStyle = headerSuffixStyle;
    this.headerSuffixClassName = headerSuffixClassName;
  }

  getHeaderStyle = () => this.headerStyle || this.style;

  getHeaderClassName = () => this.headerClassName || this.className;

  getHeaderSuffixStyle = () => this.headerSuffixStyle || this.headerStyle || this.style;

  getHeaderSuffixClassName = () => this.headerSuffixClassName || this.headerClassName || this.className;
}

export default SortableTableColumnDescriptor;
