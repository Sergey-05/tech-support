

'use client';
import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { getUserId, getUserDetails } from '@/app/utils/supabase/user';
import { TailSpin } from 'react-loader-spinner';

import { ChatBubbleLeftRightIcon, PaperAirplaneIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/solid';

import { ChatMessage } from '@/app/ui/client-components/ChatMessage';

interface Attachment {
  attachment_id: string;
  attachment_name: string;
  attachment_path: string;
  attachment_uploaded_by: User; // user_id
  attachment_uploaded_at: string;
};

interface Comment {
  comment_id: string;
  comment_text: string;
  comment_time: string;
  comment_sent_by: User; // user_id
};

interface Request {
  request_id: string;
  request_head: string;
  request_descr: string;
  request_date: string;
  request_status: string;
  attachment: Attachment[];
  comment: Comment[];
};

interface User {
  user_id: string;
  user_fullname: string;
  // Добавьте другие поля, если необходимо
}



export default function RequestPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string>('');
  const [request, setRequest] = useState<Request | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [currentUserDetails, setCurrentUserDetails] = useState<any>(null);
  const [users, setUsers] = useState<{ [key: string]: { user_fullname: string } }>({});
  const [newComment, setNewComment] = useState<string>('');
  const [newFiles, setNewFiles] = useState<File[]>([]);

  const [isLoadingRequest, setIsLoadingRequest] = useState(false);
  const [isLoadingComment, setIsLoadingComment] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  useEffect(() => {
    (async () => {
      setIsLoadingRequest(true);
      try {
        const userId = await getUserId();
        setCurrentUserId(userId);
        const userDetails = await getUserDetails(userId);
        setCurrentUserDetails(userDetails);
        const { id } = await params;
        setId(id);
        const response = await fetch(`/api/requests/${id}`);
        if (response.ok) {
          const data = await response.json();
          setRequest(data.request);

          // Создаем Set для хранения уникальных user_id
          const userIdsSet = new Set<string>();

          // Добавляем user_id из вложений
          data.request.attachment.forEach((attachment: Attachment) => {
            userIdsSet.add(attachment.attachment_uploaded_by.user_id);
          });

          // Добавляем user_id из комментариев
          data.request.comment.forEach((comment: Comment) => {
            userIdsSet.add(comment.comment_sent_by.user_id);
          });

          // Преобразуем Set в массив уникальных user_id
          const uniqueUserIds = Array.from(userIdsSet);

          const usersData = await Promise.all(
            Array.from(uniqueUserIds).map((userId) => getUserDetails(userId))
          );
          const usersObj: { [key: string]: User } = {};
          usersData.forEach((user) => {
            usersObj[user.user_id] = { user_id: user.user_id, user_fullname: user.user_fullname };
          });
          setUsers(usersObj);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingRequest(false);
      }
    })();
  }, [params]);

  const handleCommentSubmit = async () => {
    setIsLoadingComment(true);
    try {
      const response = await fetch(`/api/requests/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment_text: newComment, comment_sent_by: currentUserId }),
      });
      if (response.ok) {
        const comment: Comment = await response.json();
        setRequest((prev) => {
          if (!prev) return null;
          return { ...prev, comment: [...(prev.comment || []), comment] };
        });
        setNewComment('');
      }
    } finally {
      setIsLoadingComment(false);
    }
  };

  const handleFileUpload = async () => {
    setIsLoadingFiles(true);
    try {
      const formData = new FormData();
      newFiles.forEach((file) => formData.append('files', file));
      formData.append('user_id', currentUserId);
      const response = await fetch(`/api/requests/${id}/attachments`, {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        setRequest((prev) => {
          if (!prev) return null;
          return { ...prev, attachment: [...(prev.attachment || []), ...data.attachments] };
        });
        setNewFiles([]);
      }
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => setNewFiles((prev) => [...prev, ...acceptedFiles]),
    multiple: true,
  });

  return (
    <div className="flex flex-col h-full">
      {isLoadingRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <TailSpin height="80" width="80" color="#4fa94d" />
        </div>
      )}
      <h1 className="text-3xl font-bold">{request?.request_head}</h1>
      <p>{request?.request_descr}</p>

      <h2 className="overflow-y-hidden text-2xl mt-6">Чат</h2>
      <div className="flex flex-col chat-container">
  {request?.comment?.map((comment) => (
    <ChatMessage
      key={comment.comment_id}
      message={{
        type: 'comment',
        content: comment.comment_text,
        timestamp: new Date(comment.comment_time).toLocaleString(),
        user_id: comment.comment_sent_by.user_id,
        url: undefined,
        fileType: undefined,
      }}
      currentUserId={currentUserId}
      users={users}
    />
  ))}
  {request?.attachment?.map((attachment) => (
    <ChatMessage
      key={attachment.attachment_id}
      message={{
        type: 'attachment',
        content: attachment.attachment_name,
        timestamp: new Date(attachment.attachment_uploaded_at).toLocaleString(),
        user_id: attachment.attachment_uploaded_by.user_id,
        url: `https://vkkedsgdpjzsjqjrbbfh.supabase.co/storage/v1/object/public/attachments/${attachment.attachment_path}`,
        fileType: 'image',
      }}
      currentUserId={currentUserId}
      users={users}
    />
  ))}
</div>



<div className="flex flex-col space-y-4 mt-4">
  {/* Блок комментариев */}
  <div className="flex flex-row sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
    <div className="relative flex-grow">
      <textarea
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Сообщение..."
        className="w-full content-center p-3 pl-12 border rounded-lg resize-none bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <ChatBubbleLeftRightIcon className="w-6 h-6 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
    </div>
    <button
      onClick={handleCommentSubmit}
      className="ml-3 flex items-center justify-center bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 disabled:opacity-50 sm:w-12 sm:h-12"
      disabled={isLoadingComment}
    >
      {isLoadingComment ? (
        <TailSpin height="20" width="20" color="#fff" />
      ) : (
        <PaperAirplaneIcon className="w-5 h-5" />
      )}
    </button>
  </div>

  {/* Блок загрузки файлов */}
  <div className="flex flex-row sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
    <div
      {...getRootProps()}
      className="flex-grow p-6 border-2 border-dashed border-blue-200 rounded-lg text-center cursor-pointer hover:bg-blue-50 transition-colors duration-200"
    >
      <input {...getInputProps()} />
      <div className="flex items-center justify-center space-x-2">
        <PlusIcon className="w-6 h-6 text-blue-500" />
        <p className="text-gray-600">Добавьте файлы для загрузки</p>
      </div>
    </div>
    <button
      onClick={handleFileUpload}
      className="ml-3 flex items-center justify-center bg-green-600 text-white p-3 rounded-full hover:bg-green-700 disabled:opacity-50 sm:w-12 sm:h-12"
      disabled={isLoadingFiles}
    >
      {isLoadingFiles ? (
        <TailSpin height="20" width="20" color="#fff" />
      ) : (
        <PlusIcon className="w-5 h-5" />
      )}
    </button>
  </div>

  {/* Отображение загруженных файлов */}
  {newFiles.length > 0 && (
    <div className="flex flex-row space-y-2">
      {newFiles.map((file, idx) => (
        <div key={idx} className="flex items-center space-x-2">
          <p className="text-sm text-gray-600">{file.name}</p>
          <button
            onClick={() => setNewFiles((prev) => prev.filter((f) => f.name !== file.name))}
            className="text-red-500 hover:text-red-700 focus:outline-none"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )}
</div>



    </div>
  );
}
