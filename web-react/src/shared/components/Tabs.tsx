import {useState} from 'react';
import type {ReactNode} from 'react';

export interface TabItem<T extends string = string> {
    key: T;
    label: string;
    content: ReactNode;
}

interface TabsProps<T extends string = string> {
    tabs: TabItem<T>[];
    initial?: T;
}

export function Tabs<T extends string = string>({tabs, initial}: TabsProps<T>) {
    const [active, setActive] = useState<T>(initial ?? tabs[0]?.key);

    const current = tabs.find((tab) => tab.key === active) ?? tabs[0];

    return (
        <div className="tabs-container">
            <nav className="tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        className={tab.key === current?.key ? 'tab tab-active' : 'tab'}
                        onClick={() => setActive(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>
            <div className="tab-content" key={current?.key}>{current?.content}</div>
        </div>
    );
}
