

'use client';

import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import Modal from 'react-modal';
import Image from 'next/image';

// Типы данных остаются неизменными
type Request = {
  request_head: string;
  request_descr: string;
  request_date: string;
  attachment: { name: string, url: string }[];
  comment: { comment_id: string, comment_text: string, comment_time: string }[];
};

export default function RequestPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [id, setId] = useState<string>('');
  const [request, setRequest] = useState<Request | null>(null);
  const [serverAttachments, setServerAttachments] = useState<{ attachment_id: string, attachment_name: string, attachment_path: string }[]>([]);  // Изменено на URL
  const [comments, setComments] = useState<{ comment_id: string, comment_text: string, comment_time: string }[]>([]);
  const [newComment, setNewComment] = useState('');
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    Modal.setAppElement('body');
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const { id } = await params;
      setId(id);
    };
    fetchData();
  }, [params]);

  useEffect(() => {
    if (id) {
      const fetchRequest = async () => {
        const response = await fetch(`/api/requests/${id}`);
        const data = await response.json();
        if (response.ok) {
          setRequest(data.request);
          setServerAttachments(data.request.attachment || []);
          setComments(data.request.comment || []);
        } else {
          console.error(data.error);
        }
      };
      fetchRequest();
    }
  }, [id]);

  const handleCommentSubmit = async () => {
    const response = await fetch(`/api/requests/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment_text: newComment }),
    });
    if (response.ok) {
      const comment = await response.json();
      setComments((prev) => [...prev, comment]);
      setNewComment('');
    }
  };

  const handleFileUpload = async () => {
    const formData = new FormData();
    newFiles.forEach((file) => formData.append('files', file));

    const response = await fetch(`/api/requests/${id}/attachments`, {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data.attachments)) {
        setServerAttachments((prev) => [...prev, ...data.attachments]);
      } else {
        console.error('Expected an array of attachments but received:', data.attachments);
      }
      setNewFiles([]);
    } else {
      console.error('Error uploading files');
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      setNewFiles(acceptedFiles);
    },
    multiple: true,
  });

  const handleFileClick = (url: string) => {
    setSelectedFile(url);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const isImageFile = (url: string) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
    const fileExtension = url.split('.').pop()?.toLowerCase();
    return imageExtensions.includes(fileExtension || '');
  };

  if (!request) return <p>Загрузка...</p>;

  return (
    <section className="p-4 max-w-screen-lg">
      <h2 className="text-3xl font-bold mb-6">{request.request_head}</h2>
      <p className="mb-4">{request.request_descr}</p>
      <p className="text-sm text-gray-500 mb-4">
        <strong>Дата:</strong> {new Date(request.request_date).toLocaleString()}
      </p>

      <h3 className="text-2xl font-bold mt-6">Комментарии</h3>
      <ul className="space-y-4">
        {comments.map((comment, index) => (
          <li key={index} className="border p-4 rounded-lg">
            <p>{comment.comment_text}</p>
            <p className="text-sm text-gray-500">
              {new Date(comment.comment_time).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>

      <textarea
        className="border p-2 w-full mt-4 rounded-lg"
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Добавьте комментарий"
      />
      <button className="mt-2 bg-blue-500 text-white p-2 rounded-lg" onClick={handleCommentSubmit}>
        Отправить
      </button>

      <h3 className="text-2xl font-bold mt-6">Вложения</h3>
      <ul className="space-y-2">
        {serverAttachments.length === 0 ? (
          <li>Загрузка файлов...</li>
        ) : (
          serverAttachments.map((attachment, index) => (
            <li key={index} className="flex items-center">
              {isImageFile(attachment.attachment_path) ? (
                <div className="w-16 h-16 mr-4">
                  <img
                    src={`https://vkkedsgdpjzsjqjrbbfh.supabase.co/storage/v1/object/public/attachments/${attachment.attachment_path}`}
                    alt={attachment.attachment_name}
                    width={64}
                    height={64}
                    className="object-cover"
                    onClick={() => handleFileClick(attachment.attachment_path)}
                  />
                </div>
              ) : (
                <a
                  href={`https://vkkedsgdpjzsjqjrbbfh.supabase.co/storage/v1/object/public/attachments/${attachment.attachment_path}`}
                  download
                  className="text-blue-500 underline"
                >
                  {attachment.attachment_name}
                </a>
              )}
            </li>
          ))
        )}
      </ul>

      {/* Модальное окно для предпросмотра изображения */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        className="modal"
        overlayClassName="overlay"
        style={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
          content: {
            background: 'white',
            padding: '20px',
          },
        }}
      >
        {selectedFile && (
          <div className="flex justify-center items-center">
            <img
              src={selectedFile}  // Используем ссылку на изображение
              alt="Предпросмотр файла"
              className="max-w-full max-h-screen"
            />
          </div>
        )}
        <button onClick={closeModal} className="absolute top-2 right-2 text-white">Закрыть</button>
      </Modal>

      <h4 className="text-xl font-bold mt-6">Загрузить новые файлы</h4>
      <div
        {...getRootProps({ className: 'dropzone mt-4 p-6 border-dashed border-2 border-gray-300 text-center' })}
      >
        <input {...getInputProps()} />
        <p>Перетащите файлы сюда или нажмите, чтобы выбрать файлы</p>
      </div>

      {/* Отображение файлов, загруженных пользователем */}
      <ul className="mt-4">
        {newFiles.length > 0 && (
          <>
            <h5 className="font-bold">Файлы, выбранные для загрузки:</h5>
            {newFiles.map((file, index) => (
              <li key={index} className="text-gray-700">{file.name}</li>
            ))}
          </>
        )}
      </ul>

      <button className="mt-2 bg-green-500 text-white p-2 rounded-lg" onClick={handleFileUpload}>
        Загрузить файлы
      </button>
    </section>
  );
}
