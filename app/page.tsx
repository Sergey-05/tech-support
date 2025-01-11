'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../app/lib/supabase';

export default function HomePage() {
    const router = useRouter();

    useEffect(() => {
        const checkSession = async () => {
            const { data: session } = await supabase.auth.getSession();
            if (session) router.push('/dashboard');
        };

        checkSession();
    }, [router]);

    return (
        <main className="flex items-center justify-center h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                <h1 className="text-2xl font-bold mb-4 text-center text-blue-600">Добро пожаловать</h1>
                <p className="mb-6 text-gray-600 text-center">
                    Пожалуйста, войдите в систему или зарегистрируйтесь, чтобы продолжить.
                </p>
                <div className="flex flex-col gap-4">
                    <button
                        onClick={() => router.push('/login')}
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
                    >
                        Войти
                    </button>
                    <button
                        onClick={() => router.push('/register')}
                        className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition"
                    >
                        Регистрация
                    </button>
                </div>
            </div>
        </main>
    );
}
