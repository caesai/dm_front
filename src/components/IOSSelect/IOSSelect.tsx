import { useState, useRef, useEffect, TouchEvent, MouseEvent } from 'react';
import './IOSSelect.css';

interface IOSPickerProps {
    items: string[];
    selectedIndex: number;
    onChange: (index: number) => void;
}

export const IOSPicker = ({
    items,
    selectedIndex,
    onChange,
}: IOSPickerProps) => {
    const [isDragging, setIsDragging] = useState(false);
    const [offset, setOffset] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const startY = useRef(0);
    const lastY = useRef(0);
    const velocity = useRef(0);
    const lastTime = useRef(0);
    const animationFrame = useRef<number>();

    const ITEM_HEIGHT = 44;
    const VISIBLE_ITEMS = 5;

    // Инициализация и синхронизация с пропсами
    useEffect(() => {
        setOffset(-selectedIndex * ITEM_HEIGHT);
    }, [selectedIndex]);

    const handleStart = (clientY: number) => {
        setIsDragging(true);
        startY.current = clientY;
        lastY.current = clientY;
        lastTime.current = Date.now();
        cancelAnimationFrame(animationFrame.current!);
    };

    const handleMove = (clientY: number) => {
        if (!isDragging) return;

        const delta = clientY - startY.current;
        const newOffset = offset + delta;
        const maxOffset = 0;
        const minOffset = -(items.length - 1) * ITEM_HEIGHT;

        // Убираем коэффициент 0.8 для более точного отслеживания
        setOffset(Math.max(minOffset, Math.min(maxOffset, newOffset)));

        // Важно обновлять startY.current ДО расчета скорости
        startY.current = clientY;

        // Расчет скорости с учетом направления
        const now = Date.now();
        const deltaTime = now - lastTime.current;
        velocity.current = (clientY - lastY.current) / deltaTime;
        lastY.current = clientY;
        lastTime.current = now;
    };

    const animate = () => {
        if (Math.abs(velocity.current) < 0.01) {
            snapToNearest();
            return;
        }

        setOffset((prev) => {
            const newOffset = prev + velocity.current * 300;
            const min = -(items.length - 1) * ITEM_HEIGHT;
            const max = 0;

            // Добавляем "отскок" при достижении границ
            if (newOffset > max) {
                velocity.current = (max - prev) * 0.3;
                return max;
            }
            if (newOffset < min) {
                velocity.current = (min - prev) * 0.3;
                return min;
            }

            return newOffset;
        });

        velocity.current *= 0.85;
        animationFrame.current = requestAnimationFrame(animate);
    };

    const handleEnd = () => {
        setIsDragging(false);
        animate();
    };

    const snapToNearest = () => {
        const currentIndex = Math.round(-offset / ITEM_HEIGHT);
        const newIndex = Math.max(0, Math.min(items.length - 1, currentIndex));
        const newOffset = -newIndex * ITEM_HEIGHT;

        setOffset(newOffset);
        if (newIndex !== selectedIndex) {
            onChange(newIndex);
        }
    };

    // Обработчики для мыши и тача
    const handleMouseDown = (e: MouseEvent) => handleStart(e.clientY);
    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientY);
    const handleMouseUp = () => handleEnd();

    const handleTouchStart = (e: TouchEvent) =>
        handleStart(e.touches[0].clientY);
    const handleTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientY);
    const handleTouchEnd = () => handleEnd();

    // Клик по элементу
    const handleItemClick = (index: number) => {
        setOffset(-index * ITEM_HEIGHT);
        onChange(index);
    };

    return (
        <div
            className="ios-picker-container"
            style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS }}
        >
            <div
                ref={containerRef}
                className="ios-picker-wrapper"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleEnd}
                style={{
                    transform: `translateY(${offset}px)`,
                    transition: isDragging
                        ? 'none'
                        : 'transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
                }}
            >
                {items.map((item, index) => (
                    <div
                        key={index}
                        className={`ios-picker-item ${
                            Math.round(-offset / ITEM_HEIGHT) === index
                                ? 'selected'
                                : ''
                        }`}
                        onClick={() => handleItemClick(index)}
                    >
                        {item}
                    </div>
                ))}
            </div>

            <div className="ios-picker-highlight" />
        </div>
    );
};
