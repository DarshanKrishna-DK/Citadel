import React, { useState } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { X, Upload, FileText, Loader2, DollarSign, CheckCircle } from 'lucide-react';
import { moderatorStorage, type StoredModerator } from '../utils/moderatorStorage';

interface ListModeratorModalProps {
  onClose: () => void;
  onSuccess: (moderator: any) => void;
  onRedirectToDetail?: (moderatorId: string, moderatorData: any) => void;
}

interface ModeratorFormData {
  name: string;
  description: string;
  personality: string;
  category: 'Security' | 'Engagement' | 'Gaming' | 'General';
  hourlyPrice: number;
  monthlyPrice: number;
  buyoutPrice: number;
  documents: File[];
}

export const ListModeratorModal: React.FC<ListModeratorModalProps> = ({ onClose, onSuccess, onRedirectToDetail }) => {
  const { account, signAndSubmitTransaction } = useWallet();
  const [formData, setFormData] = useState<ModeratorFormData>({
    name: '',
    description: '',
    personality: '',
    category: 'Security',
    hourlyPrice: 4.99,
    monthlyPrice: 299.99,
    buyoutPrice: 1999.99,
    documents: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const aptosConfig = new AptosConfig({ network: Network.TESTNET });
  const aptos = new Aptos(aptosConfig);

  const creationFee = 0.1; // 0.1 APT fee to create a moderator

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!account) {
      alert('Please connect your wallet first');
      return;
    }

    if (!formData.name.trim() || !formData.description.trim() || !formData.personality.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    if (formData.hourlyPrice <= 0 || formData.monthlyPrice <= 0 || formData.buyoutPrice <= 0) {
      alert('All pricing fields must be greater than 0');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create the smart contract transaction using proper Aptos format
      const transaction = {
        data: {
          function: `0x239e3ad472a4451fb1729abbd956ee37bd23a40e0166c2a8823cf0e41a83b546::ai_moderator::mint_ai_moderator`,
          functionArguments: [
            formData.name,
            formData.description,
            formData.personality,
            Math.floor(formData.hourlyPrice * 100000000), // Convert to Octas
            Math.floor(formData.monthlyPrice * 100000000),
            Math.floor(formData.buyoutPrice * 100000000),
          ],
        },
      };

      const response = await signAndSubmitTransaction(transaction);
      console.log('Transaction successful:', response);
      
      setTransactionHash(response.hash);
      setShowSuccess(true);

      // Create the moderator object for storage and marketplace
      const newModerator: StoredModerator = {
        id: `mod_${Date.now()}`,
        name: formData.name,
        description: formData.description,
        personality: formData.personality,
        category: formData.category,
        creator: account.address.toString(),
        rating: 0,
        totalUsers: 0,
        hourlyPrice: formData.hourlyPrice,
        monthlyPrice: formData.monthlyPrice,
        buyoutPrice: formData.buyoutPrice,
        features: [
          `${formData.personality} personality`,
          `${formData.category} specialized`,
          'Custom training data',
          'Real-time moderation'
        ],
        isActive: true,
        createdAt: new Date().toISOString(),
        upvotes: 0,
        transactionHash: response.hash
      };

      // Save to localStorage
      moderatorStorage.add(newModerator);
      console.log('💾 Saved moderator to localStorage:', newModerator);

      // Notify parent component immediately so marketplace updates
      console.log('📢 Calling onSuccess with moderator:', newModerator);
      onSuccess(newModerator);

      // Close modal and redirect to detail page
      onClose();
      
      // Redirect to the moderator detail page if callback provided
      if (onRedirectToDetail) {
        console.log('🔄 Redirecting to detail page for moderator:', newModerator.id);
        onRedirectToDetail(newModerator.id, newModerator);
      }
      
    } catch (error) {
      console.error('Transaction failed:', error);
      alert('Transaction failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    const newFiles = Array.from(files).filter(file => {
      const allowedTypes = [
        'text/plain',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/markdown'
      ];
      return allowedTypes.includes(file.type) || file.name.endsWith('.md') || file.name.endsWith('.txt');
    });

    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...newFiles]
    }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        <div className="relative bg-citadel-black-light border border-citadel-orange/30 rounded-2xl p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Success!</h2>
          <p className="text-citadel-light-gray mb-4">
            Your moderator has been successfully created and listed in the marketplace.
          </p>
          <div className="bg-citadel-steel/20 rounded-lg p-3 mb-4">
            <p className="text-sm text-citadel-light-gray">Transaction Hash:</p>
            <p className="text-xs font-mono text-citadel-orange break-all">{transactionHash}</p>
          </div>
          <div className="w-8 h-8 border-4 border-citadel-orange border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-citadel-light-gray mt-2">Redirecting to marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-citadel-black-light border border-citadel-orange/30 rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-citadel-light-gray hover:text-white transition-colors"
          disabled={isSubmitting}
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold citadel-heading mb-2">List Moderator</h2>
          <p className="text-citadel-light-gray">
            Create and list your AI moderator on the Citadel marketplace
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white font-medium mb-2">
                Moderator Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., ToxicityShield Pro"
                className="w-full bg-citadel-black border border-citadel-steel/30 rounded-lg px-4 py-3 text-white placeholder-citadel-steel-light focus:border-citadel-orange focus:outline-none transition-colors"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                className="w-full bg-citadel-black border border-citadel-steel/30 rounded-lg px-4 py-3 text-white focus:border-citadel-orange focus:outline-none transition-colors"
                required
                disabled={isSubmitting}
              >
                <option value="Security">Security</option>
                <option value="Engagement">Engagement</option>
                <option value="Gaming">Gaming</option>
                <option value="General">General</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-white font-medium mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what your AI moderator does and its key features..."
              rows={3}
              className="w-full bg-citadel-black border border-citadel-steel/30 rounded-lg px-4 py-3 text-white placeholder-citadel-steel-light focus:border-citadel-orange focus:outline-none transition-colors resize-none"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Personality */}
          <div>
            <label className="block text-white font-medium mb-2">
              Personality *
            </label>
            <input
              type="text"
              value={formData.personality}
              onChange={(e) => setFormData(prev => ({ ...prev, personality: e.target.value }))}
              placeholder="e.g., Strict, Friendly, Professional, Casual"
              className="w-full bg-citadel-black border border-citadel-steel/30 rounded-lg px-4 py-3 text-white placeholder-citadel-steel-light focus:border-citadel-orange focus:outline-none transition-colors"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Pricing Section */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-citadel-orange" />
              Pricing Structure
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-white font-medium mb-2">
                  Hourly Rate (USD) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.hourlyPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, hourlyPrice: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-citadel-black border border-citadel-steel/30 rounded-lg px-4 py-3 text-white focus:border-citadel-orange focus:outline-none transition-colors"
                  required
                  disabled={isSubmitting}
                />
                <p className="text-xs text-citadel-steel-light mt-1">Pay-as-you-go pricing</p>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Monthly License (USD) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.monthlyPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, monthlyPrice: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-citadel-black border border-citadel-steel/30 rounded-lg px-4 py-3 text-white focus:border-citadel-orange focus:outline-none transition-colors"
                  required
                  disabled={isSubmitting}
                />
                <p className="text-xs text-citadel-steel-light mt-1">Unlimited monthly usage</p>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Buyout Price (USD) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.buyoutPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, buyoutPrice: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-citadel-black border border-citadel-steel/30 rounded-lg px-4 py-3 text-white focus:border-citadel-orange focus:outline-none transition-colors"
                  required
                  disabled={isSubmitting}
                />
                <p className="text-xs text-citadel-steel-light mt-1">Full ownership & resale rights</p>
              </div>
            </div>
          </div>

          {/* Document Upload */}
          <div>
            <label className="block text-white font-medium mb-2">
              Training Documents (Optional)
            </label>
            <p className="text-citadel-steel-light text-sm mb-4">
              Upload documents to help train your AI moderator. Accepted formats: PDF, DOC, DOCX, TXT, MD
            </p>
            
            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive 
                  ? 'border-citadel-orange bg-citadel-orange/5' 
                  : 'border-citadel-steel/30 hover:border-citadel-orange/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-8 h-8 text-citadel-orange mx-auto mb-2" />
              <p className="text-white font-medium mb-1">
                Drag and drop files here, or click to browse
              </p>
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.md"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
                id="file-upload"
                disabled={isSubmitting}
              />
              <label
                htmlFor="file-upload"
                className="citadel-btn-secondary cursor-pointer inline-block text-sm px-4 py-2"
              >
                Browse Files
              </label>
            </div>

            {/* Uploaded Files List */}
            {formData.documents.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-white font-medium text-sm">Uploaded Files:</h4>
                {formData.documents.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-citadel-black/50 rounded-lg border border-citadel-steel/20">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-citadel-orange" />
                      <div>
                        <div className="text-white text-sm">{file.name}</div>
                        <div className="text-citadel-steel-light text-xs">{formatFileSize(file.size)}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      disabled={isSubmitting}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Creation Fee Notice */}
          <div className="bg-citadel-orange/10 border border-citadel-orange/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-citadel-orange" />
              <h4 className="text-citadel-orange font-semibold">Creation Fee</h4>
            </div>
            <p className="text-citadel-light-gray text-sm">
              A small fee of <strong className="text-citadel-orange">{creationFee} APT</strong> is required to create and list your moderator on the blockchain. 
              This ensures quality and prevents spam listings.
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 citadel-btn-secondary py-3"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 citadel-btn-primary py-3 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Moderator...
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4" />
                  Pay {creationFee} APT & Create
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
