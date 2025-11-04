import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CertificatesCreateOnlinePage } from '@/pages/CertificatesCreatePage/stages/CertificatesCreateOnlinePage.tsx';

// Mock the react-router-dom module to control navigation
const mockedUsedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...(jest.requireActual('react-router-dom') as any),
    useNavigate: () => mockedUsedNavigate,
}));

// Create a spy function we can reference in the test
// export const mockNameChangeHandler = jest.fn();
// export const mockComplimentChangeHandler = jest.fn();
//
// jest.mock('@/components/TextInput/TextInput.tsx', () => ({
//     // Use a render prop pattern in the mock to capture the change handler
//     TextInput: (props: any) => (
//         <input
//             {...props}
//             data-testid={`input-${props.placeholder}`}
//             // We attach the parent's actual handler to a manual function here
//             onChange={(e) => {
//                 props.onChange(e.target.value);
//             }}
//         />
//     ),
// }));

describe('CertificatesCreateOnlinePage', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('renders correctly with initial state', () => {
        render(<CertificatesCreateOnlinePage />);

        // Check for initial placeholder text in the display area
        expect(screen.getByText('Добавьте приятных слов к подарку')).toBeInTheDocument();
        expect(screen.getByText('Имя')).toBeInTheDocument();
        expect(screen.getByText('Номинал')).toBeInTheDocument(); // Initial nominal should be empty or a specific placeholder

        // Check for input fields and button
        expect(screen.getByPlaceholderText('Имя получателя')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Ваше поздравление')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /далее/i })).toBeInTheDocument();
    });

    test('changes button positioning class on input focus and blur', async () => {
        render(<CertificatesCreateOnlinePage />);
        const nameInput = screen.getByPlaceholderText('Имя получателя');
        const buttonContainer = screen.getByTestId('button-container'); // You'll need to add a data-testid to the button container div in the component

        // Focus the input
        fireEvent.focus(nameInput);
        await waitFor(() => {
            expect(buttonContainer).toHaveClass('relativeBottom');
        });

        // Blur the input
        fireEvent.blur(nameInput);
        await waitFor(() => {
            expect(buttonContainer).not.toHaveClass('relativeBottom');
        });
    });
    //
    // test('enforces input length limits', async () => {
    //     render(<CertificatesCreateOnlinePage />);
    //
    //     const nameInput = screen.getByPlaceholderText('Имя получателя') as HTMLInputElement;
    //     const complimentInput = screen.getByPlaceholderText('Ваше поздравление') as HTMLInputElement;
    //
    //     // --- Test name input length limit (max 15 chars) ---
    //     const longName = 'A very long name that should be truncated';
    //     const expectedNameDisplayValue = longName.substring(0, 15);
    //
    //     fireEvent.change(nameInput, { target: { value: longName } });
    //
    //     // Use findByText to wait for the truncated text to appear in the DOM
    //     const displayedName = await screen.findByText(expectedNameDisplayValue);
    //     expect(displayedName).toBeInTheDocument();
    //
    //
    //     // --- Test compliment input length limit (max 30 chars) ---
    //     const longCompliment = 'A very very very long compliment that should be truncated';
    //     const expectedComplimentDisplayValue = longCompliment.substring(0, 30);
    //
    //     fireEvent.change(complimentInput, { target: { value: longCompliment } });
    //
    //     // Use findByText to wait for the truncated text to appear in the DOM
    //     const displayedCompliment = await screen.findByText(expectedComplimentDisplayValue);
    //     expect(displayedCompliment).toBeInTheDocument();
    // });
});
