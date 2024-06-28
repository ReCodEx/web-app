import React from 'react';
import PropTypes from 'prop-types';
import { Pagination } from 'react-bootstrap';

const prepareButtonsIndices = (activePage, items, maxButtons) => {
  const radius = Math.max(0, Math.floor(maxButtons / 2 - 2));
  let fromIdx = Math.max(2, activePage - radius);
  let toIdx = Math.min(activePage + radius, items - 1);

  const buttons = [];
  if (fromIdx > 3) {
    buttons.push(1, null); // showing 1 and ellipsis at the beginning
  } else {
    fromIdx = 1; // lets start regularly counting from 1
  }

  if (toIdx >= items - 2) {
    toIdx = items;
  }

  while (fromIdx <= toIdx) {
    buttons.push(fromIdx++);
  }

  if (toIdx < items) {
    buttons.push(null, items); // showing ellipsis and last page at the end
  }

  return buttons;
};

const PaginationButtons = ({
  prev = false,
  next = false,
  maxButtons = 10,
  items,
  activePage = 1,
  size = 'sm',
  className = '',
  onSelect = null,
}) => {
  return (
    <Pagination size={size} className={className}>
      {prev && <Pagination.Prev disabled={activePage <= 1} onClick={() => onSelect && onSelect(activePage - 1)} />}
      {prepareButtonsIndices(activePage, items, maxButtons).map((index, i) =>
        index ? (
          <Pagination.Item key={index} active={activePage === index} onClick={() => onSelect && onSelect(index)}>
            {index}
          </Pagination.Item>
        ) : (
          <Pagination.Ellipsis key={`elips-${i}`} />
        )
      )}
      {next && <Pagination.Next disabled={activePage >= items} onClick={() => onSelect && onSelect(activePage + 1)} />}
    </Pagination>
  );
};

PaginationButtons.propTypes = {
  prev: PropTypes.bool,
  next: PropTypes.bool,
  maxButtons: PropTypes.number,
  items: PropTypes.number.isRequired,
  activePage: PropTypes.number,
  size: PropTypes.string,
  className: PropTypes.string,
  onSelect: PropTypes.func,
};

export default PaginationButtons;
