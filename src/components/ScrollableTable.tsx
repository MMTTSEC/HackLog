import { useRef, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

type ScrollableTableProps = {
  children: ReactNode;
};

export default function ScrollableTable({ children }: ScrollableTableProps) {
  const tableRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (tableRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tableRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (tableRef.current) {
      const scrollAmount = tableRef.current.clientWidth * 0.8;
      tableRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <div className="table-scroll-wrapper">
      <div 
        ref={tableRef} 
        className="table-responsive" 
        onScroll={checkScroll}
      >
        {children}
      </div>
      <div className="table-scroll-controls">
        <button
          className="table-scroll-btn"
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          aria-label="Scroll left"
        >
          ‹
        </button>
        <button
          className="table-scroll-btn"
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          aria-label="Scroll right"
        >
          ›
        </button>
      </div>
    </div>
  );
}

