import React, { useState, useEffect } from 'react';
import { ImageLightbox } from './ImageLightBox';
import ReactPlayer from 'react-player';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import './ChatMessage.css';
import { DocumentArrowDownIcon } from '@heroicons/react/24/solid';

type ChatMessageProps = {
  message: {
    type: 'comment' | 'attachment';
    content: string;
    timestamp: string;
    user_id: string;
    url?: string;
    fileType?: string;
  };
  currentUserId: string;
  users: { [key: string]: { user_fullname: string } }; // Без аватаров
};

const getInitials = (fullname: string): string => {
  if (typeof fullname !== 'string') return '?';
  const names = fullname.trim().split(' ');
  const firstNameInitial = names[0]?.charAt(0).toUpperCase() || '';
  const lastNameInitial = names[1]?.charAt(0).toUpperCase() || '';
  return `${firstNameInitial}${lastNameInitial}`;
};

// Определяем тип файла на основе расширения URL
const getAttachmentType = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'mp4':
      case 'mov':
      case 'avi':
        return 'video';
      case 'mp3':
      case 'wav':
      case 'ogg':
        return 'audio';
      case 'pdf':
      case 'doc':
      case 'docx':
      case 'xls':
      case 'xlsx':
        return 'document';
      default:
        return 'image'; // По умолчанию считаем, что это изображение
    }
  };

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, currentUserId, users }) => {
  const [userData, setUserData] = useState<{ user_fullname: string } | null>(null);
  const [attachmentUrl, setAttachmentUrl] = useState<string | undefined>(message.url);
  const [attachmentType, setAttachmentType] = useState<string | undefined>(message.fileType);

  useEffect(() => {
    if(message.user_id){
      console.log('useEffect triggered for message:', message);
    if (users && users[message.user_id]) {
      setUserData(users[message.user_id]);
      console.log('User data set:', users[message.user_id]);
    } else {
      console.warn(`User data for user_id ${message.user_id} not found`);
    }

    if (message.url) {
      setAttachmentUrl(message.url);
      console.log('Attachment URL set:', message.url);
    }

    if (message.fileType) {
      const attachmentType = getAttachmentType(message.fileType);
      setAttachmentType(attachmentType);
      console.log('Attachment type set:', attachmentType);
    }
    }
    
  }, [message, users]);

  if (!userData) {
    console.warn('User data is missing, returning null.');
    return null;
  }

  const isSender = message.user_id === currentUserId;
  const initials = getInitials(userData.user_fullname);
  console.log(`Rendering message from user ${message.user_id} (${initials})`);

  const renderAttachment = () => {
    if (!attachmentUrl) {
      console.warn('Attachment URL is missing.');
      return null;
    }

    const attachmentTypeFile = getAttachmentType(attachmentUrl);
    console.log('Rendering attachment type:', attachmentTypeFile);

    switch (attachmentTypeFile) {
      case 'video':
        console.log('Rendering video attachment');
        return (
          <div className="attachment-video">
            <ReactPlayer url={message.url} controls width="100%" />
          </div>
        );
      case 'audio':
        console.log('Rendering audio attachment');
        return (
          <div className="attachment-audio">
            <AudioPlayer src={message.url} />
          </div>
        );
      case 'document':
        console.log('Rendering document attachment');
        return (
          <div className="attachment-document">
            <a href={message.url} target="_blank" rel="noopener noreferrer">
              <DocumentArrowDownIcon className="w-20 h-20 object-cover" />
            </a>
            <p className="text-sm text-gray-600">{message.content}</p>
          </div>
        );
      default:
        console.log('Rendering image attachment');
        return <ImageLightbox url={message.url} alt={message.content} />;
    }
  };

  return (
    <div
      className={`flex ${isSender ? 'justify-end' : 'justify-start'} mb-4`}
    >
      {/* Аватар собеседника (используем инициалы) */}
      {!isSender && (
        <div className="flex-shrink-0 mr-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center bg-gray-300 text-black shadow-md`}
          >
            {initials}
          </div>
        </div>
      )}

      {/* Контейнер для текста и вложений */}
      <div
        className={`flex-1 flex flex-col ${isSender ? 'items-end' : 'items-start'}`}
      >
        <div
          className={`p-3 rounded-lg max-w-xs ${isSender ? 'bg-blue-100' : 'bg-gray-200'} shadow-md`}
        >
          <p className="text-gray-800 break-words">{message.content}</p>
        </div>

        {/* Вложения */}
        {message.type === 'attachment' && (
          <div className="mt-2">
            {renderAttachment()}
          </div>
        )}

        {/* Таймстэмп */}
        <div className="mt-1 text-xs text-gray-500">
          {message.timestamp}
        </div>
      </div>

      {/* Аватар отправителя (используем инициалы) */}
      {isSender && (
        <div className="flex-shrink-0 ml-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center bg-blue-500 text-white shadow-md`}
          >
            {initials}
          </div>
        </div>
      )}
    </div>
  );
};
