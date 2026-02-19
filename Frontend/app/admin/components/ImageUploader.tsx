"use client";

import { useState } from "react";

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  label?: string;
  maxImages?: number;
}

export default function ImageUploader({ images, onImagesChange, label = "Upload Images", maxImages = 10 }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    const oversizedFiles = files.filter(f => f.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError("Some files are larger than 10MB");
      return;
    }

    setError("");
    setUploading(true);

    try {
      const token = localStorage.getItem('admin_token');
      const uploadedPaths: string[] = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('/api/admin/image/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        const data = await response.json();
        
        if (data.success) {
          uploadedPaths.push(data.path);
        } else {
          console.error('Upload failed for file:', file.name);
        }
      }

      onImagesChange([...images, ...uploadedPaths]);
      
    } catch (err) {
      console.error('Upload error:', err);
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (index: number) => {
    const imagePath = images[index];
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);

    try {
      const token = localStorage.getItem('admin_token');
      await fetch('/api/admin/image/delete', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path: imagePath }),
      });
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [movedItem] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedItem);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-base font-semibold text-foreground">{label}</label>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          {images.length} / {maxImages}
        </span>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img, index) => (
            <div 
              key={index} 
              className="relative group aspect-square bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden border-2 border-border hover:border-accent transition-all"
            >
              {/* Image Preview */}
              <img 
                src={img} 
                alt={`Image ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Order Badge */}
              <div className="absolute top-2 left-2 bg-accent text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                #{index + 1}
              </div>

              {/* Main Thumbnail Badge */}
              {index === 0 && (
                <div className="absolute top-2 right-2 bg-primary text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-lg">
                  Main
                </div>
              )}

              {/* Action Buttons Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-3">
                
                {/* Move Buttons */}
                <div className="flex gap-2">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => moveImage(index, index - 1)}
                      className="bg-white/90 hover:bg-white text-black rounded-lg w-10 h-10 flex items-center justify-center font-bold shadow-lg transition-all hover:scale-110"
                      title="Move left"
                    >
                      ←
                    </button>
                  )}

                  {index < images.length - 1 && (
                    <button
                      type="button"
                      onClick={() => moveImage(index, index + 1)}
                      className="bg-white/90 hover:bg-white text-black rounded-lg w-10 h-10 flex items-center justify-center font-bold shadow-lg transition-all hover:scale-110"
                      title="Move right"
                    >
                      →
                    </button>
                  )}
                </div>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2 text-sm font-semibold shadow-lg transition-all hover:scale-110"
                  title="Remove"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {images.length < maxImages && (
        <div className="flex flex-col items-center">
          <label className="cursor-pointer w-full">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />
            <div className="border-2 border-dashed border-border hover:border-accent rounded-xl p-8 text-center bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all">
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                  <p className="text-sm font-medium text-foreground">Uploading...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-12 h-12 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <p className="text-base font-semibold text-foreground">Add Images</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Click to select or drag & drop
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500">
                    PNG, JPG, GIF, WEBP (max 10MB each)
                  </p>
                </div>
              )}
            </div>
          </label>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {images.length === 0 && (
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-2">
          No images uploaded yet
        </p>
      )}
    </div>
  );
}