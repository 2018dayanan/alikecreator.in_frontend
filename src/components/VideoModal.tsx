'use client';
import React from 'react';
import { Modal } from 'react-bootstrap';

interface VideoModalProps {
  show: boolean;
  onHide: () => void;
  videoUrl?: string | null;
  title?: string;
}

export const getEmbedVideoUrl = (url?: string | null): { embedUrl: string | null; isIframe: boolean } => {
  if (!url) return { embedUrl: null, isIframe: false };
  const trimmed = url.trim();

  // YouTube Shorts: https://youtube.com/shorts/VIDEO_ID or https://www.youtube.com/shorts/VIDEO_ID
  const shortsMatch = trimmed.match(/(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]+)/i);
  if (shortsMatch && shortsMatch[1]) {
    return {
      embedUrl: `https://www.youtube.com/embed/${shortsMatch[1]}?autoplay=1&rel=0&modestbranding=1`,
      isIframe: true
    };
  }

  // YouTube standard watch or share: https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID
  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return {
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0&modestbranding=1`,
      isIframe: true
    };
  }

  // Direct video file (mp4, webm, ogg)
  if (/\.(mp4|webm|ogg)($|\?)/i.test(trimmed)) {
    return {
      embedUrl: trimmed,
      isIframe: false
    };
  }

  // Fallback as iframe
  return {
    embedUrl: trimmed,
    isIframe: true
  };
};

const VideoModal: React.FC<VideoModalProps> = ({ show, onHide, videoUrl, title }) => {
  if (!videoUrl) return null;
  const { embedUrl, isIframe } = getEmbedVideoUrl(videoUrl);

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      className="video-popup-modal"
      contentClassName="bg-dark text-white border-0 shadow-lg"
      backdrop="static"
    >
      <Modal.Header closeButton closeVariant="white" className="border-secondary py-2 px-3">
        <Modal.Title className="fs-6 fw-bold text-truncate text-white d-flex align-items-center gap-2">
          <span className="badge bg-danger rounded-pill px-2 py-1" style={{ fontSize: '11px' }}>
            <i className="fa-brands fa-youtube me-1"></i> Video Showcase
          </span>
          {title || 'Product Video'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0 bg-black">
        {show && embedUrl ? (
          <div className="ratio ratio-16x9">
            {isIframe ? (
              <iframe
                src={embedUrl}
                title={title || 'Product Video'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-100 h-100 border-0"
              />
            ) : (
              <video
                src={embedUrl}
                controls
                autoPlay
                className="w-100 h-100"
                style={{ objectFit: 'contain' }}
              />
            )}
          </div>
        ) : null}
      </Modal.Body>
    </Modal>
  );
};

export default VideoModal;
