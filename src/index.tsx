import ReactDOM from 'react-dom/client';

import { Root } from '../public/Root.tsx';
import { EnvUnsupported } from '@/components/EnvUnsupported.tsx';
import { init } from '@/init.ts';

import '@telegram-apps/telegram-ui/dist/styles.css';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root')!);

try {
    // Configure all application dependencies.
    init();

    root.render(<Root />);
} catch (e) {
    root.render(<EnvUnsupported />);
}
