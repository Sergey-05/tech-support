'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '../utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    fullName: formData.get('fullName') as string,
    phone: formData.get('phone') as string,
  };

  // Создание пользователя в Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: { data: { fullName: data.fullName, phone: data.phone } },
  });

  if (authError) {
    return { success: false, error: authError.message }; // Ошибка при создании пользователя
  }

  const userId = authData?.user?.id;

  if (!userId) {
    return { success: false, error: 'Не удалось получить ID пользователя из Auth.' };
  }

  // Вставка данных в таблицу user
  const { error: dbError } = await supabase.from('user').insert({
    user_uuid: userId, // Связываем с UUID из auth.users
    user_fullname: data.fullName,
    user_email: data.email,
    user_phone: data.phone,
    user_role: 'user',
  });

  if (dbError) {
    // Удаляем созданного пользователя из auth.users, если запись в user не удалась
    await supabase.auth.admin.deleteUser(userId);

    return { success: false, error: `Ошибка при сохранении данных: ${dbError.message}` };
  }

  return { success: true }; // Успех
}

  

export async function logout() {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()
    if (error) {
      redirect('/error') // Или другой маршрут для обработки ошибок
    }
    redirect('/login')
  }
  