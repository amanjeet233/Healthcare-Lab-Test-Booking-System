import toast from 'react-hot-toast';

export const notify = {
    success: (message: string) => {
        toast.success(message, {
            style: {
                background: '#10B981', // Tailwind green-500
                color: '#fff',
            },
            iconTheme: {
                primary: '#fff',
                secondary: '#10B981',
            },
        });
    },
    error: (message: string) => {
        toast.error(message, {
            style: {
                background: '#EF4444', // Tailwind red-500
                color: '#fff',
            },
            iconTheme: {
                primary: '#fff',
                secondary: '#EF4444',
            },
        });
    },
    info: (message: string) => {
        toast(message, {
            icon: 'ℹ️',
            style: {
                background: '#3B82F6', // Tailwind blue-500
                color: '#fff',
            },
        });
    },
    warning: (message: string) => {
        toast(message, {
            icon: '⚠️',
            style: {
                background: '#F59E0B', // Tailwind amber-500
                color: '#fff',
            },
        });
    },
};
