import React from 'react';

interface ImageModalProps {
  imageUrl: string;
  altText: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, altText, onClose }) => {
  // Effect to handle Escape key press for closing the modal
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="image-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label={altText}>
      <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
        <img src={imageUrl} alt={altText} className="image-modal-image" />
        <button onClick={onClose} className="image-modal-close-button" aria-label="Close image view">
          &times;
        </button>
      </div>
    </div>
  );
};

export default ImageModal;
