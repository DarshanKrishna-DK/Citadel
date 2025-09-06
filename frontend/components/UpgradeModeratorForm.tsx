import React, { useState } from 'react';
import { AIModerator } from '../types';
import { X, Upload, ArrowUp } from 'lucide-react';

interface UpgradeModeratorFormProps {
  moderator: AIModerator;
  onClose: () => void;
  onUpgrade: (upgradeData: any) => void;
}

export const UpgradeModeratorForm: React.FC<UpgradeModeratorFormProps> = ({
  moderator,
  onClose,
  onUpgrade
}) => {
  const [formData, setFormData] = useState({
    changes: '',
    feedback: '',
    documents: [] as File[],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({ ...prev, documents: [...prev.documents, ...files] }));
  };

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpgrade({
      originalModeratorId: moderator.id,
      ...formData
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ArrowUp className="w-6 h-6 text-green-600" />
            Upgrade Moderator
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Original Moderator Info */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h3 className="font-semibold text-gray-900 mb-2">Upgrading: {moderator.name}</h3>
          <p className="text-sm text-gray-600">{moderator.description}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span>Creator: {moderator.creator}</span>
            <span>Licensed: {moderator.createdAt.toLocaleDateString()}</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What's new in this version?
            </label>
            <textarea
              name="changes"
              value={formData.changes}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Describe the improvements, new features, or changes you've made..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Provide feedback or new documentation
            </label>
            <textarea
              name="feedback"
              value={formData.feedback}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Share your experience with this moderator and any suggestions for improvement..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Updated Documentation
            </label>
            <p className="text-sm text-gray-600 mb-4">
              Upload any new training data, guidelines, or documentation for your upgraded version.
            </p>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <div className="text-sm text-gray-600 mb-4">
                <label className="cursor-pointer text-green-600 hover:text-green-700 font-medium">
                  Click to upload
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.json"
                  />
                </label>
                <span> or drag and drop</span>
              </div>
              <p className="text-xs text-gray-500">
                PDF, DOC, DOCX, TXT, JSON files up to 10MB each
              </p>
            </div>
          </div>

          {formData.documents.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Uploaded Documents</h4>
              <div className="space-y-2">
                {formData.documents.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeDocument(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Upgrade Process:</strong> Your upgraded version will be minted as a new moderator on the marketplace.
              Other users will be able to license your improved version alongside the original.
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end pt-6 border-t gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <ArrowUp className="w-4 h-4" />
              Submit Upgrade
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
