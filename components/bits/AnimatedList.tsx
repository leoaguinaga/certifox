"use client";

import React, { useRef, useState, useEffect, useCallback, ReactNode, MouseEventHandler, UIEvent } from 'react';
import { motion, useInView } from 'motion/react';

interface AnimatedItemProps {
  children: ReactNode;
  delay?: number;
  index: number;
  wrapperClassName?: string;
  onMouseEnter?: MouseEventHandler<HTMLDivElement>;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

const AnimatedItem: React.FC<AnimatedItemProps> = ({ children, delay = 0, index, wrapperClassName = 'mb-4', onMouseEnter, onClick }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.5, once: false });
  return (
    <motion.div
      ref={ref}
      data-index={index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
      transition={{ duration: 0.2, delay }}
      className={`${wrapperClassName} cursor-pointer`}
    >
      {children}
    </motion.div>
  );
};

interface AnimatedListProps<T = string> {
  items?: T[];
  onItemSelect?: (item: T, index: number) => void;
  selectedIndex?: number;
  onSelectedIndexChange?: (index: number) => void;
  renderItem?: (item: T, index: number, selected: boolean) => ReactNode;
  showGradients?: boolean;
  enableArrowNavigation?: boolean;
  selectOnHover?: boolean;
  allowDeselect?: boolean;
  className?: string;
  itemClassName?: string;
  itemWrapperClassName?: string;
  listClassName?: string;
  displayScrollbar?: boolean;
  initialSelectedIndex?: number;
}

const AnimatedList = <T,>({
  items = [
    'Item 1',
    'Item 2',
    'Item 3',
    'Item 4',
    'Item 5',
    'Item 6',
    'Item 7',
    'Item 8',
    'Item 9',
    'Item 10',
    'Item 11',
    'Item 12',
    'Item 13',
    'Item 14',
    'Item 15'
  ] as unknown as T[],
  onItemSelect,
  selectedIndex,
  onSelectedIndexChange,
  renderItem,
  showGradients = true,
  enableArrowNavigation = true,
  selectOnHover = true,
  allowDeselect = false,
  className = '',
  itemClassName = '',
  itemWrapperClassName = 'mb-4',
  listClassName = '',
  displayScrollbar = true,
  initialSelectedIndex = -1
}: AnimatedListProps<T>) => {
  const listRef = useRef<HTMLDivElement>(null);
  const [internalSelectedIndex, setInternalSelectedIndex] = useState<number>(initialSelectedIndex);
  const [topGradientOpacity, setTopGradientOpacity] = useState<number>(0);
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState<number>(1);

  const currentSelectedIndex = selectedIndex ?? internalSelectedIndex;

  const setSelectedIndex = useCallback(
    (index: number) => {
      if (selectedIndex === undefined) {
        setInternalSelectedIndex(index);
      }
      onSelectedIndexChange?.(index);
    },
    [onSelectedIndexChange, selectedIndex]
  );

  const handleItemMouseEnter = useCallback((index: number) => {
    if (!selectOnHover) return;
    setSelectedIndex(index);
  }, [selectOnHover, setSelectedIndex]);

  const handleItemClick = useCallback(
    (item: T, index: number) => {
      const nextIndex = allowDeselect && currentSelectedIndex === index ? -1 : index;
      setSelectedIndex(nextIndex);
      if (onItemSelect) {
        onItemSelect(item, index);
      }
    },
    [allowDeselect, currentSelectedIndex, onItemSelect, setSelectedIndex]
  );

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target as HTMLDivElement;
    setTopGradientOpacity(Math.min(scrollTop / 50, 1));
    const bottomDistance = scrollHeight - (scrollTop + clientHeight);
    setBottomGradientOpacity(scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1));
  };

  useEffect(() => {
    if (!enableArrowNavigation) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
        e.preventDefault();
        setSelectedIndex(Math.min(currentSelectedIndex + 1, items.length - 1));
      } else if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
        e.preventDefault();
        setSelectedIndex(Math.max(currentSelectedIndex - 1, 0));
      } else if (e.key === 'Enter') {
        if (currentSelectedIndex >= 0 && currentSelectedIndex < items.length) {
          e.preventDefault();
          if (onItemSelect) {
            onItemSelect(items[currentSelectedIndex], currentSelectedIndex);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items, currentSelectedIndex, onItemSelect, enableArrowNavigation, setSelectedIndex]);

  useEffect(() => {
    if (currentSelectedIndex < 0 || !listRef.current) return;
    const container = listRef.current;
    const selectedItem = container.querySelector(`[data-index="${currentSelectedIndex}"]`) as HTMLElement | null;
    if (selectedItem) {
      const extraMargin = 50;
      const containerScrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const itemTop = selectedItem.offsetTop;
      const itemBottom = itemTop + selectedItem.offsetHeight;
      if (itemTop < containerScrollTop + extraMargin) {
        container.scrollTo({ top: itemTop - extraMargin, behavior: 'smooth' });
      } else if (itemBottom > containerScrollTop + containerHeight - extraMargin) {
        container.scrollTo({
          top: itemBottom - containerHeight + extraMargin,
          behavior: 'smooth'
        });
      }
    }
  }, [currentSelectedIndex]);

  return (
    <div className={`relative w-full ${className}`}>
      <div
        ref={listRef}
        className={`overflow-y-auto p-4 ${
          displayScrollbar
            ? '[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#060010] [&::-webkit-scrollbar-thumb]:bg-[#222] [&::-webkit-scrollbar-thumb]:rounded-lg'
            : 'scrollbar-hide'
        } ${listClassName}`}
        onScroll={handleScroll}
        style={{
          scrollbarWidth: displayScrollbar ? 'thin' : 'none',
          scrollbarColor: '#222 #060010'
        }}
      >
        {items.map((item, index) => (
          <AnimatedItem
            key={index}
            delay={0.1}
            index={index}
            wrapperClassName={itemWrapperClassName}
            onMouseEnter={() => handleItemMouseEnter(index)}
            onClick={() => handleItemClick(item, index)}
          >
            {renderItem ? (
              renderItem(item, index, currentSelectedIndex === index)
            ) : (
              <div className={`rounded-lg border border-border bg-card p-4 ${currentSelectedIndex === index ? 'bg-muted' : ''} ${itemClassName}`}>
                <p className="m-0 text-foreground">{String(item)}</p>
              </div>
            )}
          </AnimatedItem>
        ))}
      </div>
      {showGradients && (
        <>
          <div
            className="pointer-events-none absolute left-0 right-0 top-0 h-12.5 bg-linear-to-b from-muted to-transparent transition-opacity duration-300 ease"
            style={{ opacity: topGradientOpacity }}
          ></div>
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 h-25 bg-linear-to-t from-muted to-transparent transition-opacity duration-300 ease"
            style={{ opacity: bottomGradientOpacity }}
          ></div>
        </>
      )}
    </div>
  );
};

export default AnimatedList;
