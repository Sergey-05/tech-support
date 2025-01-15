'use client';

import "../../../.global.css";

import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import Modal from 'react-modal';
import { TailSpin } from 'react-loader-spinner';

type Request = {
  request_head: string;
  request_descr: string;
  request_date: string;
  attachment: { name: string; url: string }[];
  comment: { comment_id: string; comment_text: string; comment_time: Date }[];
};

export default function RequestPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string>('');
  const [request, setRequest] = useState<Request | null>(null);
  const [serverAttachments, setServerAttachments] = useState<
    { attachment_id: string; attachment_name: string; attachment_path: string }[]
  >([]);
  const [newComment, setNewComment] = useState('');
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);


  const [isLoadingRequest, setIsLoadingRequest] = useState(false);
const [isLoadingComment, setIsLoadingComment] = useState(false);
const [isLoadingFiles, setIsLoadingFiles] = useState(false);

useEffect(() => {
  Modal.setAppElement('body');
  (async () => {
    setIsLoadingRequest(true);
    try {
      const { id } = await params;
      setId(id);
      const response = await fetch(`/api/requests/${id}`);
      if (response.ok) {
        const data = await response.json();
        setRequest(data.request);
        setServerAttachments(data.request.attachment || []);
      }
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
      body: JSON.stringify({ comment_text: newComment }),
    });
    if (response.ok) {
      const comment = await response.json();
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
    const response = await fetch(`/api/requests/${id}/attachments`, {
      method: 'POST',
      body: formData,
    });
    if (response.ok) {
      const data = await response.json();
      setServerAttachments((prev) => [...prev, ...data.attachments]);
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

  const openImageModal = (url: string) => {
    setSelectedImage(url);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  return (
    <div className="container p-6">
      {isLoadingRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <TailSpin height="80" width="80" color="#4fa94d" />
        </div>
      )}
      <h1 className="text-3xl font-bold">{request?.request_head}</h1>
      <p>{request?.request_descr}</p>

      <h2 className="text-2xl mt-6">Комментарии</h2>
      {request?.comment?.map((comment) => (
  <div key={comment.comment_id} className="comment-card">
    <p className="comment-text">{comment.comment_text}</p>
    <span className="comment-date">
      {new Date(comment.comment_time).toLocaleString()}
    </span>
  </div>
))}


      <textarea
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Напишите комментарий"
        className="w-full p-2 border rounded mt-4"
      />
      <button
        onClick={handleCommentSubmit}
        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded flex items-center justify-center"
        disabled={isLoadingComment}
      >
        {isLoadingComment && <TailSpin height="20" width="20" color="#fff" />}
        {!isLoadingComment && 'Отправить'}
      </button>

      <h2 className="text-2xl mt-6">Вложения</h2>
      <div className="grid grid-cols-2 gap-4">
        {serverAttachments.map((attachment) => (
          <div key={attachment.attachment_id} className="relative group">
            <img
              src={`https://vkkedsgdpjzsjqjrbbfh.supabase.co/storage/v1/object/public/attachments/${attachment.attachment_path}`}
              alt={attachment.attachment_name}
              className="cursor-pointer rounded shadow"
              onClick={() =>
                openImageModal(
                  `https://vkkedsgdpjzsjqjrbbfh.supabase.co/storage/v1/object/public/attachments/${attachment.attachment_path}`
                )
              }
            />
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
        className="bg-white p-4 rounded shadow-md relative max-w-lg mx-auto"
      >
        {selectedImage && <img src={selectedImage} alt="Просмотр" className="w-full h-auto" />}
        <button
          onClick={closeModal}
          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2"
        >
          ×
        </button>
      </Modal>

      <div {...getRootProps()} className="mt-4 p-6 border-dashed border-2 border-gray-300 rounded text-center">
        <input {...getInputProps()} />
        <p>Перетащите файлы сюда или нажмите для выбора</p>
      </div>
      {newFiles.map((file, idx) => (
        <p key={idx} className="mt-2">
          {file.name}
        </p>
      ))}
      <button
        onClick={handleFileUpload}
        className="mt-4 bg-green-600 text-white px-4 py-2 rounded flex items-center justify-center"
        disabled={isLoadingFiles}
      >
        {isLoadingFiles && <TailSpin height="20" width="20" color="#fff" />}
        {!isLoadingFiles && 'Загрузить файлы'}
      </button>
    </div>
  );
}
