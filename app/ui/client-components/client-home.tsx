import Link from "next/link";

interface Props {
  user: {
    user_id: string;
    user_email: string;
    user_fullname: string;
  };
  requests: Array<{
    request_id: number;
    request_head: string;
    request_descr: string;
    request_date: string;
    request_status: string;
  }>;
}

export function ClientHomePage({ user, requests }: Props) {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-xl rounded-xl">
      {/* Header Section */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-blue-700 leading-tight">
          Добро пожаловать, <span className="text-blue-500">{user.user_fullname}</span>!
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Мы рады видеть вас в вашем личном кабинете. Здесь вы можете управлять вашими заявками и отслеживать их статус.
        </p>
      </header>

      {/* Active Requests Section */}
      <section className="mb-10">
        <h2 className="text-3xl font-semibold text-blue-600">Ваши активные заявки:</h2>

        {requests.length > 0 ? (
          <ul className="space-y-8 mt-6">
            {requests.map((request) => (
              <li
                key={request.request_id}
                className="bg-blue-50 p-6 rounded-lg border border-blue-200 shadow-md hover:shadow-lg transition-all duration-300"
              >
                <h3 className="text-2xl font-semibold text-blue-800">{request.request_head}</h3>
                <p className="mt-2 text-lg text-gray-700">{request.request_descr}</p>
                <p className="mt-2 text-sm text-gray-500">
                  <span className="font-semibold">Дата:</span> {new Date(request.request_date).toLocaleDateString()}
                </p>
                <p
                  className={`mt-4 text-sm font-medium ${
                    request.request_status === "active"
                      ? "text-yellow-500"
                      : request.request_status === "in_process"
                      ? "text-blue-500"
                      : "text-red-500"
                  }`}
                >
                  <span className="font-semibold">Статус:</span> {request.request_status}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-8 text-center text-gray-600">
            <p className="text-lg font-semibold mb-4">У вас нет активных заявок.</p>
            <p>
              Мы рекомендуем вам{" "}
              <Link
                href="/dashboard/create-request"
                className="text-blue-600 hover:text-blue-700 font-medium underline transition-all duration-300"
              >
                создать заявку
              </Link>{" "}
              или{" "}
              <Link
                href="/dashboard/history-requests"
                className="text-blue-600 hover:text-blue-700 font-medium underline transition-all duration-300"
              >
                посмотреть историю заявок
              </Link>
              .
            </p>
          </div>
        )}
      </section>

      {/* Footer Section */}
      <footer className="text-center text-gray-500 mt-8">
        <p className="text-sm">
          Если у вас возникли вопросы или вам нужна помощь, не стесняйтесь обращаться в нашу{" "}
          <Link
            href="/dashboard/support"
            className="text-blue-600 hover:text-blue-700 font-medium underline transition-all duration-300"
          >
            службу поддержки
          </Link>
          .
        </p>
      </footer>
    </div>
  );
}
