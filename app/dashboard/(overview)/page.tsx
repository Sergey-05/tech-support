import { ClientHomePage } from '@/app/ui/client-components/client-home'
import { createClient } from '../../utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login') // Перенаправление на логин, если пользователь не авторизован
  }

  // After getting the user data from auth, fetch additional details from the user table
const { data: userDetails, error: userError } = await supabase
.from('user')
.select('*')
.eq('user_uuid', user.id)
.single(); // Assuming there's only one user record with the given id

if (userError) {
// Handle any errors when fetching user data
console.error('Error fetching user data:', userError);
}

  // Получение активных заявок
  const { data: requests, error } = await supabase
    .from('request')
    .select('*')
    .eq('user_id', userDetails.user_id)
    .in('request_status', ['active', 'in_process'])
    .order('request_date', { ascending: false })
    .limit(5)

  if (error) {
    console.error(error)
    return <div>Ошибка при загрузке данных</div>
  }

  // Преобразование данных в чистый объект
  const serializedRequests = JSON.parse(JSON.stringify(requests))

  return <ClientHomePage user={userDetails} requests={serializedRequests} />
}
