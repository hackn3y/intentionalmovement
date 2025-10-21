import { useState, useEffect } from 'react';
import Modal from './Modal';
import toast from 'react-hot-toast';
import { adminService } from '../services/adminService';

function ProgramFormModal({ isOpen, onClose, onSubmit, initialData = null, onComplete = null }) {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    longDescription: '',
    instructorName: '',
    price: '',
    category: '',
    difficulty: 'beginner',
    duration: '',
    coverImage: '',
    tags: '',
    features: '',
    outcomes: ''
  });

  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Update form data when initialData changes (for editing)
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        slug: initialData.slug || '',
        description: initialData.description || '',
        longDescription: initialData.longDescription || '',
        instructorName: initialData.instructorName || '',
        price: initialData.price || '',
        category: initialData.category || '',
        difficulty: initialData.difficulty || 'beginner',
        duration: initialData.duration || '',
        coverImage: initialData.coverImage || '',
        tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : '',
        features: Array.isArray(initialData.features) ? initialData.features.join('\n') : '',
        outcomes: Array.isArray(initialData.outcomes) ? initialData.outcomes.join('\n') : ''
      });
      // Set image preview for existing cover image
      setImagePreview(initialData.coverImage || null);
      setSelectedImage(null);
    } else {
      // Reset form when creating new
      setFormData({
        title: '',
        slug: '',
        description: '',
        longDescription: '',
        instructorName: '',
        price: '',
        category: '',
        difficulty: 'beginner',
        duration: '',
        coverImage: '',
        tags: '',
        features: '',
        outcomes: ''
      });
      setImagePreview(null);
      setSelectedImage(null);
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // If changing title and no initial data (creating new), auto-generate slug
    if (name === 'title' && !initialData) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({
        ...prev,
        title: value,
        slug
      }));
    } else {
      // For all other cases (including manual slug edits), just update the field
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setSelectedImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(initialData?.coverImage || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title || !formData.slug || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.price && isNaN(parseFloat(formData.price))) {
      toast.error('Price must be a valid number');
      return;
    }

    setLoading(true);
    try {
      // Convert string fields to arrays
      const tags = formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
      const features = formData.features ? formData.features.split('\n').map(f => f.trim()).filter(Boolean) : [];
      const outcomes = formData.outcomes ? formData.outcomes.split('\n').map(o => o.trim()).filter(Boolean) : [];

      const programData = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : 0,
        duration: formData.duration ? parseInt(formData.duration) : null,
        tags,
        features,
        outcomes
      };

      // Create or update the program
      const result = await onSubmit(programData);

      // Upload image if one was selected
      if (selectedImage && result?.program?.id) {
        try {
          const uploadResult = await adminService.uploadProgramImage(result.program.id, selectedImage);
          console.log('Program image uploaded:', uploadResult);
          toast.success(initialData ? 'Program and image updated successfully' : 'Program created and image uploaded successfully');

          // Call onComplete callback to trigger parent refresh
          if (onComplete) {
            await onComplete();
          }
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          toast.error('Program saved but image upload failed: ' + (uploadError.response?.data?.error || uploadError.message));
        }
      } else {
        toast.success(initialData ? 'Program updated successfully' : 'Program created successfully');
      }

      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to save program');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Program' : 'Create New Program'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-100"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Slug *
          </label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-100"
            required
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            URL-friendly version of title (auto-generated)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description * (Short)
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-100"
            placeholder="Brief description for program listings"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Long Description
          </label>
          <textarea
            name="longDescription"
            value={formData.longDescription}
            onChange={handleChange}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-100"
            placeholder="Detailed description with bullet points (use • for bullets)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Instructor Name
          </label>
          <input
            type="text"
            name="instructorName"
            value={formData.instructorName}
            onChange={handleChange}
            placeholder="e.g., Intentional Movement"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-100"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Price ($)
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Duration (days)
            </label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="">Select a category</option>
              <option value="insurance">Insurance</option>
              <option value="real-estate">Real Estate</option>
              <option value="personal-development">Personal Development</option>
              <option value="all-levels">All Levels</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Difficulty
            </label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Cover Image
          </label>

          {/* Image Preview */}
          {imagePreview && (
            <div className="mb-3 relative">
              <img
                src={imagePreview}
                alt="Cover preview"
                className="w-full h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
              />
              {selectedImage && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                  title="Remove image"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* File Input */}
          <div className="flex items-center gap-3">
            <label className="flex-1 cursor-pointer">
              <div className="px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 dark:hover:border-primary-400 transition-colors text-center">
                <svg className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedImage ? selectedImage.name : 'Click to upload cover image'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  PNG, JPG, GIF or WebP (max 5MB)
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </label>
          </div>

          {/* Optional: Allow URL input as fallback */}
          <div className="mt-3">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Or enter image URL
            </label>
            <input
              type="url"
              name="coverImage"
              value={formData.coverImage}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="sales, insurance, real-estate, mindset"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-100"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Separate tags with commas
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Features (one per line)
          </label>
          <textarea
            name="features"
            value={formData.features}
            onChange={handleChange}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-100 font-mono text-sm"
            placeholder="12 comprehensive modules covering all aspects of sales&#10;Weekly live Q&A sessions with sales experts&#10;Private community access for networking and support"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Each line becomes a feature bullet point
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Expected Outcomes (one per line)
          </label>
          <textarea
            name="outcomes"
            value={formData.outcomes}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-100 font-mono text-sm"
            placeholder="Increased confidence in sales conversations&#10;Systematic approach to generating and closing leads&#10;Higher conversion rates and income"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Each line becomes an outcome bullet point
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Saving...' : (initialData ? 'Update Program' : 'Create Program')}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default ProgramFormModal;
