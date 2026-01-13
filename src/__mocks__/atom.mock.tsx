import { Provider } from 'jotai/index';
import React, { PropsWithChildren } from 'react';
import { useHydrateAtoms } from 'jotai/utils';

interface InitialProps extends PropsWithChildren {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialValues: Array<readonly [any, unknown]>
}
const HydrateAtoms: React.FC<InitialProps> = ({ initialValues, children }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useHydrateAtoms(initialValues as any)
    return children
}

export const TestProvider: React.FC<InitialProps> = ({ initialValues, children }) => (
    <Provider>
        <HydrateAtoms initialValues={initialValues}>{children}</HydrateAtoms>
    </Provider>
)
