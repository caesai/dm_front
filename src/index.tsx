import ReactDOM from 'react-dom/client';

import { Root } from '../public/Root.tsx';
import { EnvUnsupported } from '@/components/EnvUnsupported.tsx';
import { init } from '@/init.ts';

import '@telegram-apps/telegram-ui/dist/styles.css';
import './index.css';

/* Swiper CSS загружаем глобально, чтобы избежать потери стилей при code splitting.
   Banner, BookingReminder и другие компоненты используют Swiper; без этого при навигации
   порядок загрузки CSS меняется и баннеры «прыгают». */
import 'swiper/css';
import 'swiper/css/zoom';

const root = ReactDOM.createRoot(document.getElementById('root')!);

try {
    // Configure all application dependencies.
    init();

    root.render(<Root />);
} catch (e) {
    root.render(<EnvUnsupported />);
}
