import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CertificatesSelector, ICertificatesSelectorProps } from '@/components/CertificatesSelector/CertificatesSelector.tsx';
import { certificatesListAtom } from '@/atoms/certificatesListAtom.ts';
import { certificatesListMock } from '@/__mocks__/certificates.mock.ts';
import { TestProvider } from '@/__mocks__/atom.mock.ts';
import { WritableAtom } from 'jotai';
import { ICertificate } from '@/types/certificates.types.ts';

// Mock the react-router-dom module to control navigation
const mockedUsedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...(jest.requireActual('react-router-dom') as any),
    useNavigate: () => mockedUsedNavigate,
}));

describe('CertificatesSelector', () => {
    const mockSetCertificateId = jest.fn();
    // Вспомогательная функция для рендера компонента
    const renderComponent = (props: Partial<ICertificatesSelectorProps> = {}) => {
        const initialProps: ICertificatesSelectorProps = {
            setCertificateId: mockSetCertificateId,
            isOpened: true,
            selectedCertificateId: 'SUGNS0AG',
        };

        return render(
            // Используем Provider и передаем наши специальные моки через initialValues
            <TestProvider initialValues={[[certificatesListAtom as WritableAtom<ICertificate[], [ICertificate[]], void>, certificatesListMock]]}>
                <CertificatesSelector {...initialProps} {...props} />
            </TestProvider>
        );
    };

    beforeEach(() => {
        // Очистка мок-функции перед каждым тестом
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('при переходе на страницу бронирования выбирать сертификат из списка', async () => {
        // Рендерим с изначально выбранным сертификатом ID 'random-id' и закрытым состоянием
        renderComponent({ isOpened: true, selectedCertificateId: 'SUGNS0AG' });

        // Ожидаем, что useEffect вызовет setCertificateId с правильным ID
        await waitFor(() => {
            expect(mockSetCertificateId).toHaveBeenCalledWith('SUGNS0AG');
        });
    })
});
