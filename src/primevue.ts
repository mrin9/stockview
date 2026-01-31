import PrimeVue from 'primevue/config';
import Nora from '@primeuix/themes/nora';
import { definePreset } from '@primeuix/themes';

const AvalonPreset = definePreset(Nora, {
    semantic: {
        primary: {
            50: '{orange.50}',
            100: '{orange.100}',
            200: '{orange.200}',
            300: '{orange.300}',
            400: '{orange.400}',
            500: '{orange.500}',
            600: '{orange.600}',
            700: '{orange.700}',
            800: '{orange.800}',
            900: '{orange.900}',
            950: '{orange.950}'
        },
        colorScheme: {
            dark: {
                surface: {
                    0: '#ffffff',
                    50: '{slate.50}',
                    100: '{slate.100}',
                    200: '{slate.200}',
                    300: '{slate.300}',
                    400: '{slate.400}',
                    500: '{slate.500}',
                    600: '{slate.600}',
                    700: '{slate.700}',
                    800: '{slate.800}',
                    900: '{slate.900}',
                    950: '{slate.950}'
                }
            }
        }
    },
    components: {
        select: {
            root: {
                paddingX: '0.5rem',
                paddingY: '0.25rem'
            },
            option: {
                padding: '0.375rem 0.75rem'
            }
        },
        inputtext: {
            root: {
                paddingX: '0.5rem',
                paddingY: '0.25rem'
            }
        },
        button: {
            root: {
                paddingX: '0.75rem',
                paddingY: '0.375rem'
            }
        },
    }
});

import ToastService from 'primevue/toastservice';

export default (app: any) => {
    app.use(PrimeVue, {
        theme: {
            preset: AvalonPreset,
            options: {
                darkModeSelector: '.p-dark',
            }
        }
    });
    app.use(ToastService);
};
