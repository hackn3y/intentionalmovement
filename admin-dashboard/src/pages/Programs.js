import { useState, useEffect } from 'react';
import Card from '../components/Card';
import ProgramFormModal from '../components/ProgramFormModal';
import { adminService } from '../services/adminService';
import toast from 'react-hot-toast';

function Programs() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const data = await adminService.getPrograms();
      setPrograms(data.programs || data || []);
    } catch (error) {
      toast.error('Failed to load programs');
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleProgramStatus = async (id, currentStatus) => {
    try {
      await adminService.updateProgram(id, { isPublished: !currentStatus });
      toast.success(`Program ${!currentStatus ? 'published' : 'unpublished'} successfully`);
      fetchPrograms();
    } catch (error) {
      toast.error('Failed to update program');
    }
  };

  const handleCreateProgram = async (programData) => {
    const result = await adminService.createProgram(programData);
    setIsCreateModalOpen(false);
    // Refresh immediately to show new program, then again after potential image upload
    await fetchPrograms();
    return result; // Return result so modal can upload image if needed
  };

  const handleEditProgram = async (programData) => {
    const result = await adminService.updateProgram(selectedProgram.id, programData);
    setIsEditModalOpen(false);
    setSelectedProgram(null);
    // Refresh immediately, then again after potential image upload
    await fetchPrograms();
    return result; // Return result so modal can upload image if needed
  };

  const openEditModal = (program) => {
    setSelectedProgram(program);
    setIsEditModalOpen(true);
  };

  const deleteProgram = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await adminService.deleteProgram(id);
      toast.success('Program deleted successfully');
      fetchPrograms();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete program');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">Programs</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full md:w-auto px-6 py-3 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors font-medium shadow-sm mt-6 md:mt-0"
        >
          Add New Program
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {programs.map((program) => (
          <Card key={program.id}>
            <div className="mb-4">
              {program.coverImage ? (
                <img
                  src={`${program.coverImage}${program.coverImage.includes('?') ? '&' : '?'}t=${Date.now()}`}
                  alt={program.title}
                  className="w-full h-48 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className="w-full h-48 bg-gradient-to-br from-primary-400 to-primary-600 dark:from-primary-600 dark:to-primary-800 rounded-lg flex items-center justify-center"
                style={{ display: program.coverImage ? 'none' : 'flex' }}
              >
                <span className="text-4xl text-white opacity-50">📚</span>
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
              {program.title}
            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
              {program.description}
            </p>

            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                ${program.price}
              </span>
              <div className="flex gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    program.difficulty === 'beginner'
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300'
                      : program.difficulty === 'intermediate'
                      ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300'
                      : 'bg-red-100 dark:bg-pink-900 text-red-800 dark:text-pink-300'
                  }`}
                >
                  {program.difficulty}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    program.isPublished
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400'
                  }`}
                >
                  {program.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
              <span>⏱️ {program.duration} days</span>
              <span>📚 {program.category}</span>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(program)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                >
                  Edit
                </button>
                <button
                  onClick={() => toggleProgramStatus(program.id, program.isPublished)}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    program.isPublished
                      ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-800'
                      : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800'
                  }`}
                >
                  {program.isPublished ? 'Unpublish' : 'Publish'}
                </button>
              </div>
              <button
                onClick={() => deleteProgram(program.id, program.title)}
                className="w-full px-4 py-2 bg-red-100 dark:bg-pink-900/20 text-red-700 dark:text-pink-300 rounded-lg hover:bg-red-200 dark:hover:bg-pink-900/30 transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </Card>
        ))}
      </div>

      {programs.length === 0 && (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          <p className="text-lg mb-4">No programs yet</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-3 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
          >
            Create Your First Program
          </button>
        </div>
      )}

      {/* Create Program Modal */}
      <ProgramFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProgram}
        onComplete={fetchPrograms}
      />

      {/* Edit Program Modal */}
      <ProgramFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedProgram(null);
        }}
        onSubmit={handleEditProgram}
        initialData={selectedProgram}
        onComplete={fetchPrograms}
      />
    </div>
  );
}

export default Programs;
