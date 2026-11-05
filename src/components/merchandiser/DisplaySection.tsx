import React, { useRef, useState } from 'react';
import type { DisplayCondition, StorePhoto } from '../../types';
import { compressImageFile } from '../../utils/imageCompressor';
import {
  Camera,
  Trash2,
  Sparkles,
  Eye,
  Image as ImageIcon,
  Check,
  X,
  Loader2
} from 'lucide-react';

interface DisplaySectionProps {
  displayCondition: DisplayCondition;
  isClean: boolean;
  photos: StorePhoto[];
  displayNotes: string;
  onConditionChange: (condition: DisplayCondition) => void;
  onCleanlinessChange: (isClean: boolean) => void;
  onPhotosChange: (photos: StorePhoto[]) => void;
  onNotesChange: (notes: string) => void;
}

export const DisplaySection: React.FC<DisplaySectionProps> = ({
  displayCondition,
  isClean,
  photos,
  displayNotes,
  onConditionChange,
  onCleanlinessChange,
  onPhotosChange,
  onNotesChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState<StorePhoto | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const DISPLAY_CONDITIONS: DisplayCondition[] = [
    'Excellent - Pristine & Front Faced',
    'Good - Minor Adjustments Needed',
    'Fair - Needs Restock / Re-facing',
    'Poor - Disorganized / Damaged',
  ];

  // Handle actual file upload with high-efficiency client-side downscaling (saves 99% egress)
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsCompressing(true);
    try {
      const fileList = Array.from(files);
      const compressedList: StorePhoto[] = [];

      for (const file of fileList) {
        const compressedDataUrl = await compressImageFile(file, {
          maxDimension: 1024,
          quality: 0.70,
        });

        compressedList.push({
          id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          dataUrl: compressedDataUrl,
          caption: file.name.replace(/\.[^/.]+$/, ''),
          takenAt: new Date().toISOString(),
        });
      }

      onPhotosChange([...photos, ...compressedList]);
    } catch (err) {
      console.error('Failed to compress store photo:', err);
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = (id: string) => {
    onPhotosChange(photos.filter((p) => p.id !== id));
  };

  return (
    <div className="rounded-2xl bg-white p-4 sm:p-5 border border-black/[0.06] shadow-2xs space-y-4">
      {/* Section Header */}
      <div>
        <div className="flex items-center space-x-1.5 text-[10px] font-semibold uppercase tracking-wider text-stone-400">
          <Camera className="w-3.5 h-3.5 text-stone-700" />
          <span className='text-black text-bold'>Step 4 • Display Condition & Photos</span>
        </div>
        <p className="text-xs text-stone-500 mt-1">
          Evaluate gondola appearance, cleanliness standards, and capture photo proof.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Display Condition Dropdown */}
        <div>
          <label className="block text-[11px] font-medium text-stone-600 mb-1.5">
            Display Condition Rating
          </label>
          <select
            value={displayCondition}
            onChange={(e) => onConditionChange(e.target.value as DisplayCondition)}
            className="w-full h-10 px-3 text-xs bg-stone-50/70 border border-black/[0.08] rounded-xl focus:outline-none focus:bg-white focus:border-stone-900/40 text-stone-900 font-medium transition cursor-pointer"
          >
            {DISPLAY_CONDITIONS.map((cond) => (
              <option key={cond} value={cond}>
                {cond}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-stone-400 mt-1">
            Standard: All products front-faced with readable barcodes & pricing tags.
          </p>
        </div>

        {/* Cleanliness Toggle: Yes / No */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-[11px] font-medium text-stone-600">
              Shelves & Area Cleanliness
            </label>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${isClean ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                }`}
            >
              {isClean ? 'Clean' : 'Needs attention'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-stone-100/80 rounded-xl border border-black/[0.04]">
            <button
              type="button"
              onClick={() => onCleanlinessChange(true)}
              className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${isClean
                  ? 'bg-white text-emerald-800 shadow-2xs border border-black/[0.06]'
                  : 'text-stone-600 hover:text-stone-900'
                }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${isClean ? 'text-emerald-600' : 'text-stone-400'}`} />
              <span>Clean & Dusted</span>
            </button>
            <button
              type="button"
              onClick={() => onCleanlinessChange(false)}
              className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${!isClean
                  ? 'bg-white text-rose-800 shadow-2xs border border-black/[0.06]'
                  : 'text-stone-600 hover:text-stone-900'
                }`}
            >
              <X className={`w-3.5 h-3.5 ${!isClean ? 'text-rose-600' : 'text-stone-400'}`} />
              <span>Needs Cleaning</span>
            </button>
          </div>
        </div>
      </div>

      {/* Photo Upload Area */}
      <div className="pt-3 border-t border-black/[0.05] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-stone-700 flex items-center">
            <ImageIcon className="w-3.5 h-3.5 mr-1 text-stone-600" />
            Store Display Photo Proof
          </span>
          <span className="text-[10px] text-stone-400 font-mono">Optional</span>
        </div>

        {/* Hidden native file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Drag/Click Upload Zone */}
        <div
          onClick={() => !isCompressing && fileInputRef.current?.click()}
          className={`w-full border border-dashed rounded-2xl p-5 text-center transition select-none ${
            isCompressing
              ? 'border-amber-300 bg-amber-50/50 cursor-wait'
              : 'border-stone-300 hover:border-stone-400 bg-stone-50/50 hover:bg-stone-50/80 cursor-pointer group'
          }`}
        >
          <div className="w-10 h-10 mx-auto rounded-full bg-white shadow-2xs border border-black/[0.06] text-stone-600 group-hover:text-stone-900 flex items-center justify-center transition-colors mb-2">
            {isCompressing ? (
              <Loader2 className="w-5 h-5 text-amber-600 animate-spin" />
            ) : (
              <Camera className="w-5 h-5 text-stone-700" />
            )}
          </div>
          <p className="text-xs font-semibold text-stone-800">
            {isCompressing ? 'Optimizing photo proof...' : 'Take photo or upload store proof'}
          </p>
          <p className="text-[10px] text-stone-400 mt-0.5 font-mono">
            {isCompressing
              ? 'Auto-compressed to save mobile data & egress'
              : 'Camera capture or gallery (Auto-compressed to ~70KB)'}
          </p>
        </div>

        {/* Photo Gallery Grid */}
        {photos.length > 0 && (
          <div className="mt-2 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-medium text-stone-500">
              <span>Attached Photos ({photos.length})</span>
              <span className="text-[10px] text-emerald-600 font-medium flex items-center">
                <Check className="w-3 h-3 mr-0.5" /> Attached
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {photos.map((photo, pIdx) => (
                <div
                  key={photo.id}
                  className="group relative rounded-xl overflow-hidden border border-black/[0.08] bg-stone-900 aspect-4/3 shadow-2xs"
                >
                  <img
                    src={photo.dataUrl}
                    alt={photo.caption || 'Store photo'}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  {/* Photo overlay actions */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-between p-2">
                    <div className="flex justify-between items-center">
                      <span className="px-1.5 py-0.5 rounded bg-black/60 text-white font-mono text-[9px]">
                        #{pIdx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemovePhoto(photo.id);
                        }}
                        className="w-5 h-5 rounded-full bg-rose-600/90 hover:bg-rose-600 text-white flex items-center justify-center shadow-xs transition"
                        title="Remove photo"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-stone-200 truncate pr-1">
                        {photo.caption || 'Store Display'}
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPhotoPreview(photo);
                        }}
                        className="text-stone-300 hover:text-white p-0.5"
                        title="View Full Size"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Display Observations Notes */}
        <div className="pt-1">
          <label className="text-[11px] font-medium text-stone-600 block mb-1">
            Display Observations / Merchandising Notes (Optional)
          </label>
          <textarea
            rows={2}
            value={displayNotes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="e.g. Planogram complied with; arranged baby pecan caramel on eye-level shelf."
            className="w-full px-3 py-2 text-xs bg-stone-50/70 border border-black/[0.08] rounded-xl focus:outline-none focus:bg-white focus:border-stone-900/40 text-stone-900 placeholder:text-stone-400 transition"
          />
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedPhotoPreview && (
        <div
          onClick={() => setSelectedPhotoPreview(null)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full bg-stone-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10"
          >
            <div className="p-3 bg-stone-950/80 backdrop-blur-md flex items-center justify-between text-white border-b border-white/10">
              <span className="text-xs font-medium text-stone-300">{selectedPhotoPreview.caption}</span>
              <button
                type="button"
                onClick={() => setSelectedPhotoPreview(null)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-hidden flex items-center justify-center p-3 bg-stone-950">
              <img
                src={selectedPhotoPreview.dataUrl}
                alt="Enlarged view"
                className="max-h-[65vh] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
