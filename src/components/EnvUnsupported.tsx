import { Placeholder, AppRoot } from '@telegram-apps/telegram-ui';
import { retrieveLaunchParams } from '@telegram-apps/sdk-react';
import { useMemo } from 'react';

export function EnvUnsupported() {
    const [platform, isDark] = useMemo(() => {
        let platform = 'base';
        const isDark = false;
        try {
            const lp = retrieveLaunchParams();
            platform = lp.tgWebAppPlatform;
        } catch {
            /* empty */
        }

        return [platform, isDark];
    }, []);

    return (
        <AppRoot
            appearance={isDark ? 'dark' : 'light'}
            platform={['macos', 'ios'].includes(platform) ? 'ios' : 'base'}
        >
            <Placeholder
                header="Неподдерживаемая платформа"
                description="Приложение было запущено из неподдерживаемой платформы, попробуйте обновить приложение Telegram"
            >
                <img
                    alt="Telegram sticker"
                    src="/icons/telegram.gif"
                    style={{
                        display: 'block',
                        width: '144px',
                        height: '144px',
                    }}
                />
            </Placeholder>
        </AppRoot>
    );
}
