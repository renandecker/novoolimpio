import {useState} from 'react';
import type {ReactNode} from 'react';

export interface TabItem<T extends string = string> {
    key: T;
    label: string;
    content: ReactNode;
    icon?: ReactNode;
}

interface TabsProps<T extends string = string> {
    tabs: TabItem<T>[];
    initial?: T;
    onChange?: (key: T) => void;
    className?: string;
}

export function Tabs<T extends string = string>({tabs, initial, onChange, className}: TabsProps<T>) {
    const [active, setActive] = useState<T>(initial ?? tabs[0]?.key);

    const current = tabs.find((tab) => tab.key === active) ?? tabs[0];

    const select = (key: T) => {
        setActive(key);
        onChange?.(key);
    };

    return (
        <div className={`tabs-container${className ? ` ${className}` : ''}`}>
            <nav className="tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        className={tab.key === current?.key ? 'tab tab-active' : 'tab'}
                        onClick={() => select(tab.key)}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </nav>
            <div className="tab-content" key={current?.key}>{current?.content}</div>
        </div>
    );
}
