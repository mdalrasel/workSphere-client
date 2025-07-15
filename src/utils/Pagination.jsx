import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Pagination = ({ currentPage, totalPages, onPageChange, itemsPerPage, totalItems }) => {
    const handlePrev = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    if (totalItems <= itemsPerPage && totalItems > 0) { 
        return null;
    }
    if (totalItems === 0) {
        return null; 
    }
    
    const isPrevDisabled = currentPage === 1;
    const isNextDisabled = currentPage === totalPages || totalItems <= itemsPerPage; 
    
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }


    return (
        <div className="flex justify-center items-center space-x-2 mt-6">
            <button
                onClick={handlePrev}
                disabled={isPrevDisabled}
                className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                    isPrevDisabled
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                } flex items-center`}
            >
                <FaChevronLeft className="mr-1" /> Previous
            </button>

            <span className="text-gray-700 dark:text-gray-300 px-3">
                Page {currentPage} of {totalPages}
            </span>

            <button
                onClick={handleNext}
                disabled={isNextDisabled}
                className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                    isNextDisabled
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                } flex items-center`}
            >
                Next <FaChevronRight className="ml-1" />
            </button>
        </div>
    );
};

export default Pagination;