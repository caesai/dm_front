import { Provider, WritableAtom } from 'jotai/index';
import React, { PropsWithChildren } from 'react';
import { useHydrateAtoms } from 'jotai/utils';

export type AnyWritableAtom = WritableAtom<unknown, never[], unknown>
interface InitialProps extends PropsWithChildren {
    initialValues: Array<readonly [AnyWritableAtom, unknown]>
}
const HydrateAtoms: React.FC<InitialProps> = ({ initialValues, children }) => {
    useHydrateAtoms(initialValues as Array<readonly [AnyWritableAtom, never]>)
    return children
}

export const TestProvider: React.FC<InitialProps> = ({ initialValues, children }) => (
    <Provider>
        <HydrateAtoms initialValues={initialValues}>{children}</HydrateAtoms>
    </Provider>
)
