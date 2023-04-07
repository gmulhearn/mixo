import { useEffect } from 'react';
export const useConsoleLog = (state: any) => {
    useEffect(() => {
        console.log(state)
    }, [state])
}